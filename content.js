let groupChatIdentifier = '/groupchat/'
let kinLogPrefix = 'KinLog_';
let kinLogSigsSuffix = '_Sigs';

function getCurrentChatId() {
    if (window.location.href === 'https://kindroid.ai/home'){
        // Solo chat
        return localStorage.getItem('currentAI');
    } else if (window.location.href.indexOf(`https://kindroid.ai${groupChatIdentifier}`) === 0) {
        // Group chat
        return window.location.href.substring(window.location.href.indexOf(groupChatIdentifier) + groupChatIdentifier.length);
    }
    return undefined;
}

function getCurrentChatName() {
    if (window.location.href === 'https://kindroid.ai/home'){
        return [...document.querySelectorAll('img[alt="play"]')].slice(-1)[0].previousElementSibling.innerText;
    } else if (window.location.href.indexOf(`https://kindroid.ai${groupChatIdentifier}`) === 0) {
        return document.getElementsByClassName('chatScrollParent ')[0].childNodes[0].childNodes[0].innerText;
    }
    return undefined;
}

function getCurrentChatSize() {
    let chat = localStorage.getItem(`${kinLogPrefix}${getCurrentChatId()}`);
    if (chat === null) {
        return '0 kb';
    }
    return `${(chat.length / 1024).toFixed(2)} KB`;
}

function setSpeechSignatures(signatures) {
    localStorage.setItem(`${kinLogPrefix}${getCurrentChatId()}${kinLogSigsSuffix}`, JSON.stringify(signatures));
}

function getConversation() {
    let conversation = JSON.parse(localStorage.getItem(`${kinLogPrefix}${getCurrentChatId()}`));
    if (!conversation) {
        conversation = [];
    }
    return conversation;
}

function setConversation(conversation) {
    localStorage.setItem(`${kinLogPrefix}${getCurrentChatId()}`, JSON.stringify(conversation));
}

function createSignature(convo) {
    return `${convo[0]}_${convo[1]}`;
}

function addSignature(convo) {
    let speechSignatures = getSpeechSignatures();
    if (speechSignatures.length > 10) {
        speechSignatures.shift();
    }
    speechSignatures.push(createSignature(convo));
    setSpeechSignatures(speechSignatures);
}

function getNameAndSpeechFromBubble(bubble) {
    let name = bubble.querySelectorAll('.chakra-text')[0].textContent;
    let speech = bubble.querySelectorAll('.chakra-text')[1].innerHTML.replace(/<\/?span.*?>/gi, '*');
    if (name && speech) {
        return [name, speech];
    }
    return undefined;
}

function getSpeechSignatures() {
    let signatures = JSON.parse(localStorage.getItem(`${kinLogPrefix}${getCurrentChatId()}${kinLogSigsSuffix}`));
    if (!signatures) {
        signatures = [];
    }
    return signatures;
}

function signatureExists(convo) {
    let speechSignatures = getSpeechSignatures();
    return speechSignatures.includes(createSignature(convo));
}

function checkSpeech() {
    // Get last 10 images
    let images = [...document.querySelectorAll('img[alt="edit"],img[alt="play"]')].slice(-10);

    for (let i = 0; i < images.length; i++) {
        // Return to speech bubble
        let bubble = images[i].parentElement.parentElement.parentElement;
        let convo = getNameAndSpeechFromBubble(bubble);

        if (convo && !signatureExists(convo)) {
            addSignature(convo);
            let conversation = getConversation();
            conversation.push(convo);
            setConversation(conversation);
        }
    }
}

function getTimestamp() {
    return new Date().toISOString().replace(/[-T:]/g, '').substring(0, 14);
}

function download(extension, text) {
    let filename = `${getCurrentChatName()}_${getTimestamp()}.${extension}`;

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function downloadHeader() {
    let header = [`Kindroid chat log downloaded with KinLog v${chrome.runtime.getManifest().version} Chrome Extension.`];
    header.push('KinLog is a third-party extension and is not affiliated with Kindroid.ai in any way. Please use at your own risk.');
    return header;
}

function downloadTxt() {
    let convo = getConversation();
    let txt = '';
    let header = downloadHeader();
    for (let i = 0; i < header.length; i++) {
        txt += `${header[i]}\r\n`;
    }
    txt += '\r\n';
    for (let i = 0; i < convo.length; i++) {
        txt += `${convo[i][0]}\r\n`;
        txt += `${convo[i][1]}\r\n\r\n`;
    }
    download('txt', txt);
}

function downloadHtml() {
    let convo = getConversation();
    let html = '<html><head><style>h2 {margin-bottom:0px;} .header{ margin-top:0px; font-style: italic; font-weight: bold; }</style></head><body>';
    let header = downloadHeader();
    let first = true;
    for (let i = 0; i < header.length; i++) {
        let element1 = first ? '<h2>' : '<p class="header">';
        let element2 = first ? '</h2>' : '</p>';
        html += `${element1}${header[i]}${element2}`;
        first = false;
    }
    for (let i = 0; i < convo.length; i++) {
        html += `<p><strong>${convo[i][0]}</strong><br />`;
        html += `${convo[i][1]}</p>`;
    }
    html += '</html></body>';
    download('html', html);
}

function downloadJson() {
    let meta = { 'source': chrome.runtime.getManifest().name, 'version': chrome.runtime.getManifest().version, 'author': chrome.runtime.getManifest().author, url: 'https://github.com/JWHorner/KinLog' };
    let json = { 'about': downloadHeader(), 'meta': meta, 'chat': getConversation() };
    download('json', JSON.stringify(json));
}

setInterval(() => {
    checkSpeech();
}, 5000);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request["type"] == 'requestConversationData') {

            sendResponse(JSON.stringify([ 
                getCurrentChatName(), 
                getCurrentChatId(), 
                getCurrentChatSize()
            ]));

        } else if (request['type'] == 'downloadConversation') {

            if (request['fileType'] == 'txt') {
                downloadTxt();
            } else if (request['fileType'] == 'html') {
                downloadHtml();
            } else if (request['fileType'] == 'json') {
                downloadJson();
            }

        } else if (request['type'] == 'deleteConversation') {
            setConversation([]);
            sendResponse(true);
        }

        return true;
    }
);