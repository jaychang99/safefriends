// ==================== State Management ====================
const state = {
  currentScreen: "home",
  selectedFile: null,
  imageUuid: null,
  detections: [],
  selectedFilter: "BLUR",
  editedImageUrl: null,
  editedImageBlob: null,
};

const API_BASE_URL = "http://192.168.68.196:8080";

// ==================== Screen Management ====================
function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(screenId + "Screen").classList.add("active");

  const backBtn = document.getElementById("backBtn");
  if (screenId === "home" || screenId === "processing") {
    backBtn.classList.remove("visible");
  } else {
    backBtn.classList.add("visible");
  }

  state.currentScreen = screenId;
}

// ==================== API Functions ====================
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/images/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");
  return await response.json();
}

async function requestDetect(imageUuid, detectTargets) {
  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUuid, detectTargets }),
  });

  if (!response.ok) throw new Error("Detection failed");
  return await response.json();
}

async function requestEdit(imageUuid, regions, filter) {
  const response = await fetch(`${API_BASE_URL}/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUuid,
      memberId: 1, // Default member ID
      regions,
      filter,
    }),
  });

  if (!response.ok) throw new Error("Edit failed");
  return await response.json();
}

async function fetchEditedImage(imageUuid) {
  const response = await fetch(`${API_BASE_URL}/edited/${imageUuid}.jpg`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch image error:", response.status, errorText);
    throw new Error(
      `Failed to fetch edited image: ${response.status} - ${errorText}`
    );
  }
  return await response.blob();
}

// ==================== Event Handlers ====================

// Header
document.getElementById("websiteBtn").onclick = () => {
  chrome.tabs.create({ url: "http://192.168.68.194:8080/" });
};

// Home Screen
document.getElementById("startBtn").onclick = () => {
  showScreen("upload");
};

// Upload Screen
const fileInput = document.getElementById("fileInput");
const fileDropZone = document.getElementById("fileDropZone");
const previewImage = document.getElementById("previewImage");
const nextToDetectBtn = document.getElementById("nextToDetectBtn");

fileDropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    state.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewImage.style.display = "block";
      fileDropZone.style.display = "none";
      document.getElementById("reuploadBtn").style.display = "block";
      nextToDetectBtn.disabled = false;
      nextToDetectBtn.style.opacity = "1";
    };
    reader.readAsDataURL(file);
  }
};

// Reupload Button
document.getElementById("reuploadBtn").onclick = () => {
  fileInput.value = "";
  previewImage.style.display = "none";
  previewImage.src = "";
  fileDropZone.style.display = "flex";
  document.getElementById("reuploadBtn").style.display = "none";
  nextToDetectBtn.disabled = true;
  nextToDetectBtn.style.opacity = "0.5";
  state.selectedFile = null;
};

nextToDetectBtn.onclick = async () => {
  try {
    showScreen("processing");
    document.getElementById("processingText").textContent =
      "이미지 업로드 중...";

    const result = await uploadImage(state.selectedFile);
    state.imageUuid = result.imageUuid;

    // Update detect screen preview
    document.getElementById("detectPreviewImage").src = previewImage.src;

    showScreen("detect");
  } catch (error) {
    console.error("Upload error:", error);
    const errorDiv = document.getElementById("uploadError");

    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("CORS")
    ) {
      errorDiv.textContent =
        "❌ 서버 연결 실패: API 서버(http://192.168.68.196:8080)가 실행 중인지 확인하세요";
    } else {
      errorDiv.textContent = "❌ 업로드 실패: " + error.message;
    }

    errorDiv.classList.add("show");
    showScreen("upload");
  }
};

// Detect Screen
const detectCheckboxes = document.querySelectorAll(".checkbox-item");
detectCheckboxes.forEach((item) => {
  item.onclick = () => {
    const checkbox = item.querySelector("input");
    checkbox.checked = !checkbox.checked;
    item.classList.toggle("selected", checkbox.checked);
  };
});

document.getElementById("detectBtn").onclick = async () => {
  try {
    const selectedTargets = Array.from(
      document.querySelectorAll(".checkbox-item input:checked")
    ).map((cb) => cb.value);

    if (selectedTargets.length === 0) {
      alert("최소 하나의 감지 항목을 선택해주세요");
      return;
    }

    showScreen("processing");
    document.getElementById("processingText").textContent =
      "AI가 개인정보를 감지하는 중...";

    const result = await requestDetect(state.imageUuid, selectedTargets);
    state.detections = result.detections;

    // Update results screen
    document.getElementById("resultsPreviewImage").src = previewImage.src;
    displayDetectionResults(result.detections);

    showScreen("results");
  } catch (error) {
    console.error("Detection error:", error);
    const errorDiv = document.getElementById("detectError");
    errorDiv.textContent = "❌ 감지 실패: " + error.message;
    errorDiv.classList.add("show");
    showScreen("detect");
  }
};

function displayDetectionResults(detections) {
  const listDiv = document.getElementById("detectionList");

  if (detections.length === 0) {
    listDiv.innerHTML =
      '<div class="empty-state">감지된 개인정보가 없습니다 ✨</div>';
    return;
  }

  // Group by category
  const grouped = {};
  detections.forEach((d) => {
    grouped[d.category] = (grouped[d.category] || 0) + 1;
  });

  const categoryNames = {
    FACE: "😊 얼굴",
    QRBARCODE: "📱 QR/바코드",
    TEXT: "📝 텍스트",
    LOCATION: "📍 위치정보",
  };

  listDiv.innerHTML = Object.entries(grouped)
    .map(
      ([cat, count]) => `
      <div class="detection-item">
        <div class="detection-category">${categoryNames[cat] || cat}</div>
        <div class="detection-count">${count}개 발견</div>
      </div>
    `
    )
    .join("");
}

// Results Screen - Filter Selection
const filterOptions = document.querySelectorAll(".filter-option");
filterOptions.forEach((option) => {
  option.onclick = () => {
    filterOptions.forEach((o) => o.classList.remove("selected"));
    option.classList.add("selected");
    const radio = option.querySelector("input");
    radio.checked = true;
    state.selectedFilter = radio.value;
  };
});

document.getElementById("applyFilterBtn").onclick = async () => {
  try {
    if (state.detections.length === 0) {
      // No detections, skip to complete with original image
      document.getElementById("finalPreviewImage").src = previewImage.src;
      state.editedImageBlob = state.selectedFile;
      showScreen("complete");
      return;
    }

    showScreen("processing");
    document.getElementById("processingText").textContent =
      "필터를 적용하는 중...";

    const result = await requestEdit(
      state.imageUuid,
      state.detections,
      state.selectedFilter
    );

    console.log("Edit result:", result);

    // Use the newUrl from the response
    const imageUrl =
      result.newUrl || `${API_BASE_URL}/edited/${result.newUuid}.jpg`;

    // Fetch the image as blob for Instagram upload
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch edited image");
    const blob = await response.blob();

    state.editedImageBlob = blob;
    state.editedImageUrl = imageUrl;

    document.getElementById("finalPreviewImage").src = imageUrl;
    showScreen("complete");
  } catch (error) {
    console.error("Edit error:", error);
    const errorDiv = document.getElementById("editError");

    if (error.message.includes("Failed to fetch")) {
      errorDiv.textContent =
        "❌ 서버 연결 실패: API 서버(http://192.168.68.196:8080)가 실행 중인지 확인하세요";
    } else {
      errorDiv.textContent = "❌ 편집 실패: " + error.message;
    }

    errorDiv.classList.add("show");
    showScreen("results");
  }
};

// Complete Screen
document.getElementById("uploadToInstagramBtn").onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url || !tab.url.includes("instagram.com")) {
      alert(
        "❌ Instagram 페이지를 먼저 열어주세요\n\n" +
          "1. Instagram.com으로 이동\n" +
          "2. 좌측의 '만들기' 버튼 클릭\n" +
          "3. 모달이 열리면 다시 시도하세요"
      );
      return;
    }

    // Convert blob to base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "INJECT_SAFELENS_IMAGE",
          imageDataUrl: reader.result,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome runtime error:", chrome.runtime.lastError);
            alert(
              "❌ Instagram 업로드 모달이 열려있는지 확인하세요\n\n" +
                "1. Instagram 좌측의 '만들기' 버튼 클릭\n" +
                "2. 모달이 열린 상태에서 다시 시도"
            );
            return;
          }
          if (response && response.success) {
            alert("✅ Instagram에 업로드되었습니다!");
            // 성공 후 재시작
            setTimeout(() => {
              document.getElementById("restartBtn").click();
            }, 1000);
          } else {
            alert("❌ 업로드 실패: " + (response?.error || "알 수 없는 오류"));
          }
        }
      );
    };

    if (state.editedImageBlob) {
      reader.readAsDataURL(state.editedImageBlob);
    } else {
      // Fallback: use original image
      reader.readAsDataURL(state.selectedFile);
    }
  } catch (error) {
    console.error("Instagram upload error:", error);
    alert("❌ 업로드 실패: " + error.message);
  }
};

document.getElementById("restartBtn").onclick = () => {
  // Reset state
  state.selectedFile = null;
  state.imageUuid = null;
  state.detections = [];
  state.selectedFilter = "BLUR";
  state.editedImageUrl = null;
  state.editedImageBlob = null;

  fileInput.value = "";
  previewImage.style.display = "none";
  nextToDetectBtn.disabled = true;
  nextToDetectBtn.style.opacity = "0.5";

  // Hide all errors
  document
    .querySelectorAll(".error-box")
    .forEach((el) => el.classList.remove("show"));

  showScreen("home");
};

// Back Button
document.getElementById("backBtn").onclick = () => {
  const screenFlow = {
    upload: "home",
    detect: "upload",
    results: "detect",
    complete: "results",
  };

  const prevScreen = screenFlow[state.currentScreen];
  if (prevScreen) {
    showScreen(prevScreen);
  }
};

// Initialize
console.log("🛡️ Safelens Extension Loaded");
showScreen("home");
