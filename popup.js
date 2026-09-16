const button = document.getElementById("scan");
const result = document.getElementById("result");

button.addEventListener("click", async () => {

  result.innerText =
    "Scanning jobs...\n\nPlease wait...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(
    tab.id,
    {
      action: "scanAllJobs"
    },
    response => {

      if (chrome.runtime.lastError) {

        result.innerText =
          "ERROR:\n" +
          chrome.runtime.lastError.message;

        return;
      }

      if (!response) {
        result.innerText = "No result.";
        return;
      }

      if (response.error) {
        result.innerText =
          "ERROR:\n" +
          response.error;

        return;
      }

      result.innerText =
        `Finished\n\n` +
        `🟢 Clear: ${response.clear}\n` +
        `🟡 Review: ${response.review}\n` +
        `🔴 Restricted: ${response.restricted}\n` +
        `⚪ Failed: ${response.failed}\n\n` +
        `Total: ${response.total}`;
    }
  );

});