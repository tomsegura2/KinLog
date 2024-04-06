// Global
let deletionWarnings = [ 'Clear Chat', 'Really?', 'You\'re 100% sure?' ];
let deletionIndex = 0;

// Version
document.getElementById('version').innerText = `v${chrome.runtime.getManifest().version_name}`;

// Delete button
document.getElementById('delete').innerText = deletionWarnings[0];

function triggerDownload(fileType) {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "downloadConversation", fileType: fileType }, function (response) { });
    });
}

function downloadText() {
    triggerDownload('txt');
}

function downloadHtml() {
    triggerDownload('html');
}

function downloadJson() {
    triggerDownload('json');
}

function deleteClicked() {
    let btn = document.getElementById('delete');
    if (deletionIndex === deletionWarnings.length - 1) {
        
        //alert('TODO: Clear chat log');
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "deleteConversation" }, function (response) {
                document.getElementById('currentchatSize').innerText = '0.00 KB';
                document.getElementById('buttons').style.display = 'none';
             });
        });

        deletionIndex = 0;
        btn.innerText = deletionWarnings[0];
    } else {
        btn.innerText = deletionWarnings[++deletionIndex];
    }
}

// Button events
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('textDownload').addEventListener('click', downloadText);
    document.getElementById('htmlDownload').addEventListener('click', downloadHtml);
    document.getElementById('jsonDownload').addEventListener('click', downloadJson);
    document.getElementById('delete').addEventListener('click', deleteClicked);
});

chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {

    // Hide data for non Kindroid.ai URL's
    if (tabs[0].url.indexOf('https://kindroid.ai/') !== 0) {
        document.getElementById('chatmain').style.display = "none";
    } else {

        // Current chat
        chrome.tabs.sendMessage(tabs[0].id, { type: "requestConversationData" }, function (response) {

            // response = [ "Chat Name", "Chat ID", "Log Size" ]

            //console.log(`response: ${response}`);
            if (response !== undefined) {
                let res = JSON.parse(response);
                document.getElementById('currentchat').innerText = res[0];
                document.getElementById('currentchatSize').innerText = res[2];
                if (res[2] === '0.00 KB') {
                    document.getElementById('buttons').style.display = 'none';
                }
            } else {
                document.getElementById('chatmain').style.display = "none";
                document.getElementById('noresponse').style.display = "block";
            }

        })

    }

});
