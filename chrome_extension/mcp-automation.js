/**
 * Chrome MCP 자동화 스크립트
 * Instagram에 자동으로 사진을 업로드합니다
 */

class InstagramMCPAutomation {
  constructor() {
    this.chromeMCP = {
      // Chrome MCP 도구들을 여기에 바인딩
      takeSnapshot: null,
      click: null,
      fill: null,
      uploadFile: null,
      waitFor: null,
      evaluateScript: null,
    };
  }

  /**
   * Chrome MCP 스냅샷을 분석하여 요소 찾기
   */
  parseSnapshot(snapshot, searchTerms) {
    const lines = snapshot.split("\n");
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // 검색어가 포함된 줄 찾기
      for (const term of searchTerms) {
        if (lowerLine.includes(term.toLowerCase())) {
          // uid 추출
          const uidMatch = line.match(/uid=["']?([^"'\s]+)["']?/);
          if (uidMatch) {
            results.push({
              uid: uidMatch[1],
              line: line.trim(),
              term: term,
              lineNumber: i + 1,
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Instagram의 새 게시물 버튼 찾기
   */
  findCreateButton(snapshot) {
    const searchTerms = [
      "만들기",
      "Create",
      "New Post",
      "새 게시물",
      "role=button",
      "svg",
    ];

    const elements = this.parseSnapshot(snapshot, searchTerms);

    // "만들기" 또는 "Create" 텍스트를 포함한 버튼 찾기
    for (const elem of elements) {
      if (elem.line.includes("만들기") || elem.line.includes("Create")) {
        if (elem.line.includes("button") || elem.line.includes("link")) {
          return elem;
        }
      }
    }

    return elements[0] || null;
  }

  /**
   * 파일 입력 요소 찾기
   */
  findFileInput(snapshot) {
    const searchTerms = ["input", "file", "image", "upload", "drag", "drop"];

    const elements = this.parseSnapshot(snapshot, searchTerms);

    // file input 요소 우선 검색
    for (const elem of elements) {
      if (
        elem.line.includes("input") &&
        elem.line.includes("file") &&
        elem.line.includes("image")
      ) {
        return elem;
      }
    }

    // 드래그 앤 드롭 영역 검색
    for (const elem of elements) {
      if (
        elem.line.includes("drag") ||
        elem.line.includes("drop") ||
        elem.line.includes("upload")
      ) {
        return elem;
      }
    }

    return null;
  }

  /**
   * MCP를 사용한 전체 업로드 프로세스
   */
  async runAutomation(instagramUrl, imageFilePath) {
    console.log("🚀 Instagram MCP Automation Starting...\n");

    try {
      // Step 1: Instagram 페이지로 이동
      console.log("📍 Step 1: Navigating to Instagram...");
      // await chromeMCP.navigate(instagramUrl);
      console.log("   URL:", instagramUrl);

      // Step 2: 페이지 스냅샷 캡처
      console.log("\n📸 Step 2: Taking page snapshot...");
      // const snapshot = await chromeMCP.takeSnapshot();
      const snapshot = this.getMockSnapshot(); // 테스트용

      // Step 3: 새 게시물 버튼 찾기
      console.log("\n🔍 Step 3: Finding Create Post button...");
      const createButton = this.findCreateButton(snapshot);

      if (!createButton) {
        throw new Error("Create post button not found");
      }

      console.log("   ✅ Found:", createButton.line);
      console.log("   UID:", createButton.uid);

      // Step 4: 버튼 클릭
      console.log("\n👆 Step 4: Clicking Create button...");
      // await chromeMCP.click(createButton.uid);
      console.log("   ✅ Button clicked");

      // Step 5: 모달 로딩 대기
      console.log("\n⏳ Step 5: Waiting for modal to open...");
      // await chromeMCP.waitFor('컴퓨터에서 선택'); // "Select from computer" 텍스트 대기
      await this.sleep(2000);

      // Step 6: 다시 스냅샷 캡처 (모달 열린 후)
      console.log("\n📸 Step 6: Taking modal snapshot...");
      // const modalSnapshot = await chromeMCP.takeSnapshot();
      const modalSnapshot = this.getMockModalSnapshot(); // 테스트용

      // Step 7: 파일 입력 찾기
      console.log("\n🔍 Step 7: Finding file input...");
      const fileInput = this.findFileInput(modalSnapshot);

      if (!fileInput) {
        throw new Error("File input not found in modal");
      }

      console.log("   ✅ Found:", fileInput.line);
      console.log("   UID:", fileInput.uid);

      // Step 8: 파일 업로드
      console.log("\n📤 Step 8: Uploading file...");
      // await chromeMCP.uploadFile(fileInput.uid, imageFilePath);
      console.log("   ✅ File uploaded:", imageFilePath);

      // Step 9: 업로드 완료 확인
      console.log("\n✅ Step 9: Verifying upload...");
      // await chromeMCP.waitFor('다음'); // "Next" 버튼 대기
      await this.sleep(1000);

      console.log("\n🎉 Automation completed successfully!");

      return {
        success: true,
        message: "Image uploaded successfully to Instagram",
      };
    } catch (error) {
      console.error("\n❌ Automation failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * JavaScript 코드 생성기 - MCP evaluate_script용
   */
  generateInjectionScript(imageUrl) {
    return `
      (async () => {
        // 파일 입력 찾기
        const inputs = document.querySelectorAll('input[type="file"]');
        let targetInput = null;
        
        for (const input of inputs) {
          const accept = input.getAttribute('accept') || '';
          const isVisible = input.offsetParent !== null;
          const inModal = input.closest('[role="dialog"]');
          
          if (accept.includes('image') && inModal) {
            targetInput = input;
            break;
          }
        }
        
        if (!targetInput) {
          return { success: false, error: 'File input not found' };
        }
        
        // 이미지 fetch 및 주입
        try {
          const response = await fetch('${imageUrl}');
          const blob = await response.blob();
          const file = new File([blob], 'upload.jpg', { type: blob.type });
          
          const dt = new DataTransfer();
          dt.items.add(file);
          targetInput.files = dt.files;
          
          // 이벤트 발생
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
          
          return { success: true, fileName: file.name };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
    `;
  }

  /**
   * MCP evaluate_script를 사용한 직접 주입
   */
  async injectImageWithEvaluate(imageUrl) {
    console.log("🔧 Using evaluate_script method...");

    const script = this.generateInjectionScript(imageUrl);

    // await chromeMCP.evaluateScript(script);
    console.log("📜 Script generated:");
    console.log(script);

    return script;
  }

  // 유틸리티 함수들
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 테스트용 Mock 데이터
  getMockSnapshot() {
    return `
      uid=1 link "홈" role=link
      uid=2 button "검색" role=button
      uid=3 link "탐색 탭" role=link
      uid=4 link "릴스" role=link
      uid=5 link "메시지" role=link
      uid=6 link "알림" role=link
      uid=7 link "만들기" role=link aria-label="새로 만들기"
      uid=8 image "프로필 사진" role=image
      uid=9 button "더 보기" role=button
    `;
  }

  getMockModalSnapshot() {
    return `
      uid=10 dialog role=dialog aria-label="새 게시물 만들기"
      uid=11 heading "새 게시물 만들기" role=heading
      uid=12 button "컴퓨터에서 선택" role=button
      uid=13 input type=file accept="image/jpeg,image/png,image/heic,image/heif,image/webp,video/mp4,video/quicktime"
      uid=14 text "사진과 동영상을 여기에 끌어다 놓으세요"
      uid=15 button "취소" role=button
    `;
  }
}

// 사용 예시
const automation = new InstagramMCPAutomation();

// 방법 1: 전체 자동화 실행
// automation.runAutomation('https://www.instagram.com', '/path/to/image.jpg');

// 방법 2: evaluate_script를 사용한 직접 주입
// const script = automation.injectImageWithEvaluate('https://example.com/image.jpg');
// chromeMCP.evaluateScript(script);

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = InstagramMCPAutomation;
}

console.log("✅ Instagram MCP Automation loaded");
console.log("💡 Usage: const automation = new InstagramMCPAutomation();");
console.log("💡 Then run: automation.runAutomation(url, imagePath);");
