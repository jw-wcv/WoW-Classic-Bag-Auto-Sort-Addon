chrome.alarms.create('dailySort', { periodInMinutes: 1440 }); // Daily trigger

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailySort') {
    sortTabs();
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "sortTabsNow") {
      sortTabs();
    }
  }
);

chrome.runtime.onInstalled.addListener(() => {
  // Set default rules if none exist
  chrome.storage.sync.get(['rules'], function(data) {
    if (!data.rules || data.rules.length === 0) {
      const defaultRules = [
        {name: "Group by Domain", pattern: ".*", enabled: true}
      ];
      chrome.storage.sync.set({rules: defaultRules});
    }
  });
});

function sortTabs() {
    chrome.storage.sync.get(['rules'], function(data) {
        const rules = data.rules || [];
        chrome.tabs.query({}, function(tabs) {
            const windows = {}; // Use an object to group tabs by criteria

            tabs.forEach(tab => {
                const criterion = determineCriterion(tab, rules);
                if (!windows[criterion]) {
                    windows[criterion] = [];
                }
                windows[criterion].push(tab.id); // Store tab IDs for grouping
            });

            Object.keys(windows).forEach(criterion => {
                // Check if there are tabs to move for this criterion
                if (windows[criterion].length > 0) {
                    // Create a new window with the first tab to initialize
                    chrome.windows.create({tabId: windows[criterion][0]}, newWindow => {
                        // If there are more tabs to move, move them to the new window
                        if (windows[criterion].length > 1) {
                            // Move the rest of the tabs to the new window
                            chrome.tabs.move(windows[criterion].slice(1), {windowId: newWindow.id, index: -1}, function() {
                                // Optional: further customization after moving the tabs
                            });
                        }
                    });
                }
            });
        });
    });
}


function determineCriterion(tab, rules) {
    // Example of default behavior: Group by domain
    let criterion = "Others"; // Default group
    const url = new URL(tab.url);
    const domain = url.hostname;

    // Apply user-defined rules
    for (let rule of rules) {
        if (rule.enabled) {
            if (rule.name === "Group by Domain") {
                return domain; // Use domain as criterion for grouping
            }
            // Extend this block to match other types of rules
        }
    }

    return criterion;
}
