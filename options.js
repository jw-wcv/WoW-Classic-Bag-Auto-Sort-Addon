document.addEventListener('DOMContentLoaded', loadRules);
document.getElementById('add-rule').addEventListener('click', addNewRule);

function loadRules() {
    // Fetch and display the existing rules from chrome.storage
    chrome.storage.sync.get(['rules'], function(data) {
        const rulesList = document.getElementById('rules-list');
        rulesList.innerHTML = ''; // Clear current list
        (data.rules || []).forEach(rule => {
            const li = document.createElement('li');
            li.textContent = `Name: ${rule.name}, Pattern: ${rule.pattern}`;
            rulesList.appendChild(li);
        });
    });
}

function addNewRule() {
    const nameInput = document.getElementById('rule-name');
    const patternInput = document.getElementById('rule-pattern');
    const rule = { name: nameInput.value, pattern: patternInput.value };

    // Save the new rule into chrome.storage
    chrome.storage.sync.get(['rules'], function(data) {
        const rules = data.rules || [];
        rules.push(rule);
        chrome.storage.sync.set({rules: rules}, function() {
            // Clear input fields after saving
            nameInput.value = '';
            patternInput.value = '';
            loadRules(); // Refresh the list of rules
        });
    });
}
