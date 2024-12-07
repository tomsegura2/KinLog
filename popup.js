// popup.js: Enhanced script for the Kindroid.ai popup UI

// Utility function for debugging
function debugLog(message, ...args) {
    console.log("[Kindroid Popup]", message, ...args);
}

// Function to handle clearing all logs
function clearLogs() {
    chrome.runtime.sendMessage({ action: "clearLogs" }, (response) => {
        if (response.success) {
            alert("All logs cleared successfully.");
            refreshLogStats();
        } else {
            alert("Failed to clear logs.");
        }
    });
}

// Function to handle exporting logs
function exportLogs() {
    chrome.runtime.sendMessage({ action: "exportLogs" }, (response) => {
        if (response.success) {
            alert("Logs exported successfully.");
        } else {
            alert("Failed to export logs.");
        }
    });
}

// Function to refresh log statistics
function refreshLogStats() {
    chrome.runtime.sendMessage({ action: "getLogStats" }, (response) => {
        if (response.success) {
            const logCountElement = document.getElementById("logCount");
            const logSizeElement = document.getElementById("logSize");

            logCountElement.textContent = response.stats.logCount;
            logSizeElement.textContent = response.stats.logSize;
        } else {
            alert("Failed to retrieve log statistics.");
        }
    });
}

// Event Listeners for Popup Buttons
document.addEventListener("DOMContentLoaded", () => {
    const clearLogsButton = document.getElementById("clearLogsButton");
    const exportLogsButton = document.getElementById("exportLogsButton");

    clearLogsButton?.addEventListener("click", clearLogs);
    exportLogsButton?.addEventListener("click", exportLogs);

    // Refresh log statistics on popup load
    refreshLogStats();
});
