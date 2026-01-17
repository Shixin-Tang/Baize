export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("Baize content script loaded");

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "read_content") {
        const content = document.body.innerText || document.body.textContent;
        sendResponse({ content });
      } else if (request.action === "click_element") {
        const element = document.querySelector(request.selector);
        if (element) {
          (element as HTMLElement).click();
          sendResponse({
            success: true,
            message: `Clicked element ${request.selector}`,
          });
        } else {
          sendResponse({
            success: false,
            message: `Element ${request.selector} not found`,
          });
        }
      } else if (request.action === "input_text") {
        const element = document.querySelector(request.selector);
        if (element) {
          (element as HTMLInputElement).value = request.text;
          (element as HTMLInputElement).dispatchEvent(
            new Event("input", { bubbles: true }),
          );
          (element as HTMLInputElement).dispatchEvent(
            new Event("change", { bubbles: true }),
          );
          sendResponse({
            success: true,
            message: `Input text into ${request.selector}`,
          });
        } else {
          sendResponse({
            success: false,
            message: `Element ${request.selector} not found`,
          });
        }
      } else if (request.action === "get_html") {
        // Optional: Get full HTML if needed
        sendResponse({ content: document.documentElement.outerHTML });
      }
      return true; // Keep channel open for async response
    });
  },
});
