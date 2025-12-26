// 수동 주입 버튼
document.getElementById("uploadBtn").onclick = async () => {
  const imageUrl = document.getElementById("imageUrl").value.trim();

  if (!imageUrl) {
    alert("이미지 URL을 입력하세요");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // content script에 메시지 전송
  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "INJECT_IMAGE",
      imageUrl,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError);
        alert("❌ 메시지 전송 실패. Instagram 페이지에 있는지 확인하세요.");
        return;
      }

      if (response && response.success) {
        console.log("✅ Success:", response.message);
      } else if (response && response.error) {
        console.error("❌ Error:", response.error);
      }
    }
  );
};

// 자동 업로드 버튼 (새 게시물 버튼 클릭 포함)
document
  .getElementById("autoUploadBtn")
  ?.addEventListener("click", async () => {
    const imageUrl = document.getElementById("imageUrl").value.trim();

    if (!imageUrl) {
      alert("이미지 URL을 입력하세요");
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "AUTO_UPLOAD",
        imageUrl,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
          alert("❌ 메시지 전송 실패. Instagram 페이지에 있는지 확인하세요.");
          return;
        }

        if (response && response.success) {
          console.log("✅ Auto upload success:", response.message);
        } else if (response && response.error) {
          console.error("❌ Auto upload error:", response.error);
        }
      }
    );
  });

// 디버그 버튼
document.getElementById("debugBtn")?.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "DEBUG",
    },
    (response) => {
      console.log("Debug info sent to content script");
    }
  );
});
