const params = new URLSearchParams(window.location.search);
const id = params.get('id').trim();
const name = params.get('name').trim();
const referrer = params.get('referrer').trim();
let seconds = 3;

// Version
document.getElementById('version').innerText = `v${chrome.runtime.getManifest().version_name}`;

document.getElementById('warning').innerText = `Permanently delete chat log for\r\n${name}?`;

function deleteConversation() {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "deleteConversation", id: id }, function (response) {
            location.href = referrer;
        });
    });
}

// Buttons
document.getElementById('cancel').addEventListener('click', function(){
    location.href = referrer;
});
document.getElementById('delete').addEventListener('click', function(){
    deleteConversation();
});
document.getElementById('delete').innerText = seconds;

let timer = setInterval(function(){
    document.getElementById('delete').innerText = --seconds;
    if (seconds === 0) {
        document.getElementById('delete').innerText = 'Confirm';
        document.getElementById('delete').attributes.removeNamedItem('disabled');
        clearInterval(timer);
    }
}, 1000)