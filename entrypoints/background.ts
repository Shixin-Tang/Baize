export default defineBackground(() => {
  // Open Side Panel on action click
  // @ts-ignore
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});
