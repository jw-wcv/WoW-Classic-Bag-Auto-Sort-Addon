document.getElementById('sortTabs').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "sortTabsNow"});
  });