chrome.runtime.onInstalled.addListener(() => {
  console.log("Eligibility Scanner background service ready");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "saveJob") {
    return false;
  }

  fetch("http://127.0.0.1:3000/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request.job)
  })
    .then(async response => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save job");
      }

      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error("Save job failed:", error);
      sendResponse({ success: false, error: error.message });
    });

  return true;
});