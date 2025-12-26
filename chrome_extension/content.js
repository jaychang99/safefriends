// Instagram Auto Uploader 클래스 임포트
// (instagram-uploader.js가 먼저 로드되어야 함)

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "INJECT_IMAGE") {
    handleImageInjection(msg.imageUrl).then(sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  }

  if (msg.type === "AUTO_UPLOAD") {
    handleAutoUpload(msg.imageUrl).then(sendResponse);
    return true;
  }
});

/**
 * 이미지 주입 핸들러 (기존 방식)
 */
async function handleImageInjection(imageUrl) {
  try {
    const input = await waitForInstagramCreateInput();
    if (!input) {
      console.error("❌ Instagram create modal input not found");
      alert(
        "❌ Instagram 업로드 화면이 열려있지 않습니다. 먼저 '만들기' 버튼을 클릭하세요."
      );
      return { success: false, error: "Input not found" };
    }

    // 이미지 fetch → Blob
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    const file = new File([blob], "upload.jpg", {
      type: blob.type || "image/jpeg",
      lastModified: Date.now(),
    });

    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;

    // 🔥 React 대응 이벤트
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

    console.log("✅ Image injected into Instagram create modal");
    return { success: true, message: "Image injected successfully" };
  } catch (error) {
    console.error("❌ Failed to inject image:", error);
    alert("❌ 이미지 업로드에 실패했습니다: " + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 자동 업로드 핸들러 (새로운 방식 - MCP 스타일)
 */
async function handleAutoUpload(imageUrl) {
  try {
    // Instagram Auto Uploader 인스턴스 사용
    if (typeof window.instagramUploader !== "undefined") {
      const success = await window.instagramUploader.uploadImage(imageUrl);
      return {
        success,
        message: success ? "Auto upload completed" : "Auto upload failed",
      };
    } else {
      // 폴백: 기존 방식 사용
      return await handleImageInjection(imageUrl);
    }
  } catch (error) {
    console.error("❌ Auto upload failed:", error);
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

/**
 * MCP 스타일의 요소 탐색 헬퍼
 */
function findElementsByMCP(searchTerms) {
  const results = [];

  for (const term of searchTerms) {
    // aria-label로 검색
    const byAriaLabel = document.querySelectorAll(`[aria-label*="${term}" i]`);
    byAriaLabel.forEach((elem) => {
      results.push({
        element: elem,
        foundBy: "aria-label",
        term: term,
      });
    });

    // 텍스트 내용으로 검색
    const allElements = document.querySelectorAll("*");
    allElements.forEach((elem) => {
      if (
        elem.textContent &&
        elem.textContent.toLowerCase().includes(term.toLowerCase())
      ) {
        if (elem.children.length === 0 || elem.textContent.length < 100) {
          results.push({
            element: elem,
            foundBy: "textContent",
            term: term,
          });
        }
      }
    });
  }

  return results;
}

/**
 * 디버깅: 현재 페이지의 파일 입력 요소들을 로깅
 */
function debugFileInputs() {
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
}

// 페이지 로드 시 디버그 정보 출력
if (window.location.hostname.includes("instagram.com")) {
  console.log("🔧 Instagram Auto Uploader Content Script Loaded");
  console.log("💡 Use debugFileInputs() to see available file inputs");

  // 전역으로 노출
  window.debugFileInputs = debugFileInputs;
}
