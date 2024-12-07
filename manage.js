// manage.js: Enhanced log management for Kindroid.ai
const STORAGE_KEY = "kindroidLogs";
const MAX_LOG_SIZE_MB = 10; // Maximum size for all logs
const ENABLE_DEBUG = true; // Toggle for debug logs

// Utility function for debugging
function debugLog(message, ...args) {
    if (ENABLE_DEBUG) {
        console.log("[Kindroid Log Manager]", message, ...args);
    }
}

// Utility to format log size in MB
function formatSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Function to retrieve logs from chrome.storage
function retrieveLogs(callback) {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
        const logs = data[STORAGE_KEY] || [];
        callback(logs);
    });
}

// Function to clear all logs
function clearLogs() {
    chrome.storage.local.remove(STORAGE_KEY, () => {
        debugLog("All logs cleared.");
        alert("All Kindroid logs have been cleared.");
        refreshLogView();
    });
}

// Function to delete selected logs
function deleteSelectedLogs(selectedIndices) {
    retrieveLogs((logs) => {
        const filteredLogs = logs.filter((_, index) => !selectedIndices.includes(index));
        chrome.storage.local.set({ [STORAGE_KEY]: filteredLogs }, () => {
            debugLog("Selected logs deleted.", selectedIndices);
            alert("Selected logs have been deleted.");
            refreshLogView();
        });
    });
}

// Function to export logs to a file
function exportLogs() {
    retrieveLogs((logs) => {
        const logBlob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(logBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `KindroidLogs_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        debugLog("Logs exported.");
        alert("Logs have been exported.");
    });
}

// Function to refresh the log view in the UI
function refreshLogView() {
    const logContainer = document.getElementById("logContainer");
    if (!logContainer) return;

    retrieveLogs((logs) => {
        logContainer.innerHTML = ""; // Clear existing logs
        logs.forEach((log, index) => {
            const logEntry = document.createElement("div");
            logEntry.className = "log-entry";

            const logText = document.createElement("pre");
            logText.textContent = JSON.stringify(log, null, 2);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "log-checkbox";
            checkbox.dataset.index = index;

            logEntry.appendChild(checkbox);
            logEntry.appendChild(logText);
            logContainer.appendChild(logEntry);
        });

        debugLog("Log view refreshed.", logs);
    });
}

// Function to check storage usage and alert if nearing limits
function checkStorageUsage() {
    chrome.storage.local.getBytesInUse(STORAGE_KEY, (bytes) => {
        const sizeMB = formatSize(bytes);
        if (bytes > MAX_LOG_SIZE_MB * 1024 * 1024) {
            alert(`Warning: Log storage exceeds ${MAX_LOG_SIZE_MB} MB. Please export or clear logs.`);
        }
        debugLog("Current log storage size:", sizeMB);
    });
}

// Event Listeners for UI Buttons
document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clearLogs");
    const exportButton = document.getElementById("exportLogs");
    const deleteSelectedButton = document.getElementById("deleteSelectedLogs");

    clearButton?.addEventListener("click", clearLogs);
    exportButton?.addEventListener("click", exportLogs);
    deleteSelectedButton?.addEventListener("click", () => {
        const selectedCheckboxes = Array.from(document.querySelectorAll(".log-checkbox:checked"));
        const selectedIndices = selectedCheckboxes.map((checkbox) => parseInt(checkbox.dataset.index, 10));
        deleteSelectedLogs(selectedIndices);
    });

    // Refresh logs on page load
    refreshLogView();

    // Check storage usage periodically
    setInterval(checkStorageUsage, 60000); // Check every minute
});

