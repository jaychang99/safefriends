/**
 * Instagram Auto Uploader using Chrome MCP
 * Instagram의 새 게시물 생성 화면에서 자동으로 사진을 업로드합니다.
 */

class InstagramAutoUploader {
  constructor() {
    this.chromeMCP = null;
    this.uploadInputSelector = 'input[type="file"][accept*="image"]';
  }

  /**
   * Instagram 페이지에서 새 게시물 생성 버튼을 찾습니다
   */
  async findCreatePostButton() {
    // Instagram의 새 게시물 버튼은 보통 다음과 같은 속성을 가집니다:
    // - SVG 아이콘 (+ 모양)
    // - "만들기" 또는 "Create" 텍스트
    // - aria-label="새로 만들기" 또는 "Create"

    const selectors = [
      'a[href="#"][aria-label*="만들기"]',
      'a[href="#"][aria-label*="Create"]',
      'a[href*="/create/"][aria-label*="Create"]',
      'svg[aria-label*="새로 만들기"]',
      'div[role="menuitem"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const elem of elements) {
        const text = elem.textContent?.toLowerCase() || "";
        const ariaLabel = elem.getAttribute("aria-label")?.toLowerCase() || "";

        if (
          text.includes("만들기") ||
          text.includes("create") ||
          ariaLabel.includes("만들기") ||
          ariaLabel.includes("create")
        ) {
          return elem;
        }
      }
    }

    return null;
  }

  /**
   * 생성 모달 내부의 파일 입력 요소를 찾습니다
   */
  async findFileInputInModal(timeout = 10000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        // 1. role="dialog"인 모달 찾기
        const modal = document.querySelector('[role="dialog"]');

        if (modal) {
          // 2. 모달 내부의 파일 입력 찾기
          const inputs = modal.querySelectorAll(this.uploadInputSelector);

          for (const input of inputs) {
            // 3. 이미지 업로드 가능한 input인지 확인
            const accept = input.getAttribute("accept") || "";
            if (accept.includes("image")) {
              clearInterval(checkInterval);
              resolve(input);
              return;
            }
          }
        }

        // 타임아웃 체크
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 200);
    });
  }

  /**
   * 이미지 URL을 Blob으로 변환하여 파일 입력에 주입합니다
   */
  async injectImage(input, imageUrl) {
    try {
      // 1. 이미지 fetch
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // 2. Blob 생성
      const blob = await response.blob();

      // 3. File 객체 생성
      const fileName = this.getFileNameFromUrl(imageUrl);
      const file = new File([blob], fileName, {
        type: blob.type || "image/jpeg",
        lastModified: Date.now(),
      });

      // 4. DataTransfer를 사용하여 파일 할당
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      // 5. React/Vue 등의 프레임워크 대응 이벤트 발생
      this.triggerInputEvents(input);

      console.log("✅ Image successfully injected:", fileName);
      return true;
    } catch (error) {
      console.error("❌ Failed to inject image:", error);
      return false;
    }
  }

  /**
   * 로컬 파일을 파일 입력에 주입합니다
   */
  async injectLocalFile(input, file) {
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      this.triggerInputEvents(input);

      console.log("✅ Local file successfully injected:", file.name);
      return true;
    } catch (error) {
      console.error("❌ Failed to inject local file:", error);
      return false;
    }
  }

  /**
   * 입력 요소에 변경 이벤트를 발생시킵니다
   */
  triggerInputEvents(input) {
    // Input 이벤트
    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    input.dispatchEvent(inputEvent);

    // Change 이벤트
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    input.dispatchEvent(changeEvent);

    // Focus 이벤트 (일부 사이트에서 필요)
    input.focus();
    input.blur();
  }

  /**
   * URL에서 파일명을 추출합니다
   */
  getFileNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.substring(pathname.lastIndexOf("/") + 1);

      if (fileName && fileName.includes(".")) {
        return fileName;
      }

      return "upload.jpg";
    } catch (error) {
      return "upload.jpg";
    }
  }

  /**
   * 전체 업로드 프로세스를 실행합니다
   */
  async uploadImage(imageUrl) {
    console.log("🚀 Starting Instagram auto upload...");

    // 1. 새 게시물 버튼 찾기
    const createButton = await this.findCreatePostButton();
    if (!createButton) {
      console.error("❌ Create post button not found");
      alert(
        "❌ 새 게시물 만들기 버튼을 찾을 수 없습니다. Instagram 메인 페이지에 있는지 확인하세요."
      );
      return false;
    }

    console.log("✅ Create button found, clicking...");
    createButton.click();

    // 2. 모달이 열릴 때까지 대기
    await this.sleep(1000);

    // 3. 파일 입력 찾기
    const fileInput = await this.findFileInputInModal();
    if (!fileInput) {
      console.error("❌ File input not found in modal");
      alert(
        "❌ 파일 업로드 입력을 찾을 수 없습니다. 모달이 제대로 열렸는지 확인하세요."
      );
      return false;
    }

    console.log("✅ File input found, injecting image...");

    // 4. 이미지 주입
    const success = await this.injectImage(fileInput, imageUrl);

    if (success) {
      console.log("🎉 Upload process completed successfully!");
      alert("✅ 이미지가 성공적으로 업로드되었습니다!");
    } else {
      alert("❌ 이미지 업로드에 실패했습니다.");
    }

    return success;
  }

  /**
   * 드래그 앤 드롭 영역을 찾아서 시뮬레이션합니다
   */
  async simulateDragAndDrop(imageUrl) {
    try {
      // 드래그 앤 드롭 영역 찾기
      const dropZones = document.querySelectorAll(
        '[role="dialog"] [role="button"]'
      );

      for (const zone of dropZones) {
        const text = zone.textContent?.toLowerCase() || "";
        if (
          text.includes("drag") ||
          text.includes("끌어") ||
          text.includes("선택")
        ) {
          // 이미지 fetch
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], this.getFileNameFromUrl(imageUrl), {
            type: blob.type || "image/jpeg",
          });

          // 드롭 이벤트 시뮬레이션
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const dropEvent = new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: dataTransfer,
          });

          zone.dispatchEvent(dropEvent);

          console.log("✅ Drag and drop simulated");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("❌ Failed to simulate drag and drop:", error);
      return false;
    }
  }

  /**
   * 유틸리티: sleep 함수
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Chrome MCP를 사용한 고급 요소 탐색
   * (Chrome Extension의 content script에서 실행될 때)
   */
  async findElementWithMCP(snapshot) {
    // MCP 스냅샷에서 파일 입력 요소 찾기
    const lines = snapshot.split("\n");
    const fileInputs = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes("input") &&
        line.includes("file") &&
        line.includes("image")
      ) {
        // uid 추출
        const uidMatch = line.match(/uid=([^\s]+)/);
        if (uidMatch) {
          fileInputs.push({
            uid: uidMatch[1],
            line: line,
          });
        }
      }
    }

    return fileInputs;
  }
}

// 전역 인스턴스 생성
window.instagramUploader = new InstagramAutoUploader();

// 사용 예시:
// window.instagramUploader.uploadImage('https://example.com/image.jpg');
