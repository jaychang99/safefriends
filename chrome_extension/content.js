// Safelens Instagram Content Script
console.log("🛡️ Safelens Content Script Loaded");

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "INJECT_SAFELENS_IMAGE") {
    handleSafelensImageInjection(msg.imageDataUrl).then(sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  }
});

/**
 * Safelens에서 처리된 이미지를 Instagram에 주입
 * data URL을 Blob으로 변환하여 주입
 */
async function handleSafelensImageInjection(dataUrl) {
  try {
    const input = await waitForInstagramCreateInput();
    if (!input) {
      console.error("❌ Instagram create modal input not found");
      alert(
        "❌ Instagram 업로드 화면이 열려있지 않습니다. 먼저 '만들기' 버튼을 클릭하세요."
      );
      return { success: false, error: "Input not found" };
    }

    // data URL을 Blob으로 변환
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const file = new File([blob], "safelens-protected.jpg", {
      type: blob.type || "image/jpeg",
      lastModified: Date.now(),
    });

    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;

    // React 대응 이벤트
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

    console.log("✅ Safelens protected image injected into Instagram");
    return { success: true, message: "Safelens image injected successfully" };
  } catch (error) {
    console.error("❌ Failed to inject Safelens image:", error);
    alert("❌ 이미지 업로드에 실패했습니다: " + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Instagram 생성 모달의 파일 입력을 찾습니다
 */
function waitForInstagramCreateInput(timeout = 10000) {
  return new Promise((resolve) => {
    const start = Date.now();

    const timer = setInterval(() => {
      // 1. role="dialog"인 모달 찾기
      const modal = document.querySelector('[role="dialog"]');

      if (modal) {
        // 2. 모달 내부의 파일 입력 찾기
        const inputs = [...modal.querySelectorAll('input[type="file"]')];

        // 3. 이미지를 받는 input 찾기
        const target = inputs.find((i) => {
          const accept = i.getAttribute("accept") || "";
          return accept.includes("image");
        });

        if (target) {
          clearInterval(timer);
          resolve(target);
          return;
        }
      }

      // 타임아웃 체크
      if (Date.now() - start > timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, 200);
  });
}

// 페이지 로드 시 디버그 정보 출력
if (window.location.hostname.includes("instagram.com")) {
  console.log("✅ Safelens content script ready");

  // 전역 디버그 함수
  window.debugFileInputs = function () {
    const inputs = document.querySelectorAll('input[type="file"]');
    console.log("📊 Found file inputs:", inputs.length);

    inputs.forEach((input, index) => {
      console.log(`  [${index}]`, {
        accept: input.accept,
        name: input.name,
        id: input.id,
        className: input.className,
        inModal: !!input.closest('[role="dialog"]'),
        visible: input.offsetParent !== null,
      });
    });
  };
}
