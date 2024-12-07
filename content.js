// Enhanced content.js script for logging messages on Kindroid.ai
// Includes optimizations, security improvements, and better user experience

// Constants and Configurations
const STORAGE_KEY = "kindroidLogs";
const MAX_LOG_SIZE_MB = 10; // Maximum size per log file
const ENABLE_DEBUG = true; // Toggle for debug logs

// Utility function for debugging
function debugLog(message, ...args) {
    if (ENABLE_DEBUG) {
        console.log("[Kindroid Logger]", message, ...args);
    }
}

// Utility to create SHA-256 signature for conversation
async function createSha256Signature(convo) {
    const data = new TextEncoder().encode(`${convo[0]}_${convo[1]}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Function to store logs securely
function storeLog(log) {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
        const logs = data[STORAGE_KEY] || [];
        logs.push(log);

        chrome.storage.local.set({ [STORAGE_KEY]: logs }, () => {
            debugLog("Log stored successfully", log);
        });
    });
}

// Function to retrieve all stored logs
function retrieveLogs(callback) {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
        const logs = data[STORAGE_KEY] || [];
        callback(logs);
    });
}

// Function to monitor new messages using MutationObserver
function monitorMessages() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(async (mutation) => {
            mutation.addedNodes.forEach(async (node) => {
                if (node.nodeType === 1 && node.matches(".message-bubble")) {
                    const [username, content] = getNameAndSpeechFromBubble(node);
                    const timestamp = new Date().toISOString();

                    if (username && content) {
                        const signature = await createSha256Signature([username, content]);
                        const log = { username, content, timestamp, signature };

                        debugLog("New message detected", log);
                        storeLog(log);
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    debugLog("Message monitoring started.");
}

// Function to extract username and message content from a chat bubble
function getNameAndSpeechFromBubble(bubble) {
    try {
        const username = bubble.querySelector(".username")?.textContent.trim();
        const content = bubble.querySelector(".message-content")?.textContent.trim();
        return [username, content];
    } catch (error) {
        debugLog("Error extracting data from bubble", error);
        return [null, null];
    }
}

// Function to check storage size and notify the user if it exceeds limits
function checkStorageSize() {
    chrome.storage.local.getBytesInUse(STORAGE_KEY, (bytes) => {
        const sizeMB = (bytes / (1024 * 1024)).toFixed(2);
        if (sizeMB > MAX_LOG_SIZE_MB) {
            alert(
                `Kindroid logs have exceeded ${MAX_LOG_SIZE_MB} MB. Please back up and clear logs to continue logging.`
            );
        }
    });
}

// Add user consent dialog for logging
function requestUserConsent() {
    const consentKey = "userConsentGranted";

    chrome.storage.local.get(consentKey, (data) => {
        if (!data[consentKey]) {
            const consent = confirm(
                "Do you consent to logging your Kindroid conversations for personal use? Logs will be stored locally and not shared."
            );
            chrome.storage.local.set({ [consentKey]: consent }, () => {
                if (consent) {
                    debugLog("User consent granted.");
                    monitorMessages();
                } else {
                    debugLog("User consent denied.");
                }
            });
        } else {
            debugLog("User consent already granted.");
            monitorMessages();
        }
    });
}

// Start the script
(function init() {
    debugLog("Initializing Kindroid logger...");
    requestUserConsent();

    // Periodically check storage size
    setInterval(checkStorageSize, 60000); // Check every minute
})();
