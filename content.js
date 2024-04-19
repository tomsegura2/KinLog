let groupChatIdentifier = '/groupchat/'
let kinLogPrefix = 'KinLog_';
let kinLogSigsSuffix = '_Sigs';
let kinLogSettingsSuffix = '_Set';
let host = 'https://kindroid.ai';
let kinUrl = `${host}/home`;
let signaturesSize = 10;

function getKinOrGroup() {
    if (window.location.href === kinUrl) {
        // Solo chat
        return 'k';
    } else if (window.location.href.indexOf(`${host}${groupChatIdentifier}`) === 0) {
        // Group chat
        return 'g';
    }
    return undefined;
}

function getCurrentChatId() {
    if (window.location.href === kinUrl) {
        // Solo chat
        return localStorage.getItem('currentAI');
    } else if (window.location.href.indexOf(`${host}${groupChatIdentifier}`) === 0) {
        // Group chat
        return window.location.href.substring(window.location.href.indexOf(groupChatIdentifier) + groupChatIdentifier.length);
    }
    return undefined;
}

function getCurrentChatName() {
    if (window.location.href === kinUrl) {
        return [...document.querySelectorAll('img[alt="play"]')].slice(-1)[0].previousElementSibling.innerText;
    } else if (window.location.href.indexOf(`${host}${groupChatIdentifier}`) === 0) {
        return document.getElementsByClassName('chatScrollParent ')[0].childNodes[0].childNodes[0].innerText;
    }
    return undefined;
}

function getChatSize(id) {
    id = id || getCurrentChatId();
    let chat = localStorage.getItem(`${kinLogPrefix}${id}`);
    if (!chat) {
        return '0.00 KB';
    }
    let kb = (chat.length / 1024);
    let size = kb < 1024 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
    return size
}

function setSpeechSignatures(signatures) {
    localStorage.setItem(`${kinLogPrefix}${getCurrentChatId()}${kinLogSigsSuffix}`, JSON.stringify(signatures));
}

function getConversation(id) {
    id = id ?? getCurrentChatId();
    let conversation = JSON.parse(localStorage.getItem(`${kinLogPrefix}${id}`));
    if (!conversation) {
        conversation = [];
    }
    return conversation;
}

function getConversationSettings(id) {
    id = id || getCurrentChatId();
    return JSON.parse(localStorage.getItem(`${kinLogPrefix}${id}${kinLogSettingsSuffix}`));
}

function setConversationSettings(len) {
    localStorage.setItem(`${kinLogPrefix}${getCurrentChatId()}${kinLogSettingsSuffix}`, JSON.stringify([
        getCurrentChatName(),
        getKinOrGroup(),
        len < signaturesSize ? new Date().toISOString() : ''
    ]));
}

function deleteConversation(id) {
    localStorage.removeItem(`${kinLogPrefix}${id}`);
    localStorage.removeItem(`${kinLogPrefix}${id}${kinLogSettingsSuffix}`);
}

function setConversation(conversation) {
    localStorage.setItem(`${kinLogPrefix}${getCurrentChatId()}`, JSON.stringify(conversation));
    if (!getConversationSettings()) {
        setConversationSettings(conversation.length);
    }
}

function createSignature(convo) {
    return `${convo[0]}_${convo[1]}`;
}

function createMd5Signature(convo) {
    return MD5.generate(`${convo[0]}_${convo[1]}`);
}

function addSignature(convo) {
    let speechSignatures = getSpeechSignatures();
    if (speechSignatures.length > (signaturesSize + 1)) {
        speechSignatures.shift();
    }
    speechSignatures.push(createMd5Signature(convo));
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
    return speechSignatures.includes(createSignature(convo))
        || speechSignatures.includes(createMd5Signature(convo));
}

function checkSpeech() {
    // Get last x images
    let images = [...document.querySelectorAll('img[alt="edit"],img[alt="play"]')].slice(-signaturesSize);

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

function download(extension, text, name) {
    name = name ?? getCurrentChatName();
    let filename = `${name}_${getTimestamp()}.${extension}`;

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function downloadHeader() {
    return [`Kindroid chat log downloaded with KinLog v${chrome.runtime.getManifest().version_name} Chrome extension.`,
        'KinLog is a third-party extension and is not affiliated with Kindroid.ai in any way. Please use at your own risk.']
}

function downloadTxt(id, name) {
    let convo = getConversation(id);
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
    download('txt', txt, name);
}

function downloadHtml(id, name) {
    let convo = getConversation(id);
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
        html += `${convo[i][1].replace(/(\*.+?\*)/g, '<i>$1</i>')}</p>`;
    }
    html += '</html></body>';
    download('html', html, name);
}

function downloadJson(id, name) {
    let meta = {
        'source': chrome.runtime.getManifest().name,
        'version': chrome.runtime.getManifest().version_name,
        'author': chrome.runtime.getManifest().author,
        'url': chrome.runtime.getManifest().homepage_url
    };
    let json = { 'about': downloadHeader(), 'meta': meta, 'chat': getConversation(id) };
    download('json', JSON.stringify(json), name);
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
                getChatSize()
            ]));

        } else if (request['type'] == 'downloadConversation') {

            let id = !request['id'] ? getCurrentChatId() : request['id'];
            let name = !request['name'] ? getCurrentChatName() : request['name'];
            if (request['fileType'] == 'txt') {
                downloadTxt(id, name);
            } else if (request['fileType'] == 'html') {
                downloadHtml(id, name);
            } else if (request['fileType'] == 'json') {
                downloadJson(id, name);
            }

        } else if (request['type'] == 'deleteConversation') {

            deleteConversation(!request['id'] ? getCurrentChatId() : request['id']);
            sendResponse(true);

        } else if (request['type'] == 'getConversationsMeta') {

            let items = Object.keys(localStorage);
            let meta = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].match(/KinLog_[^_]+$/)) {
                    let id = items[i].substring(7);
                    let settings = getConversationSettings(id);
                    let name = settings ? settings[0] : id;
                    let kinOrGroup = settings ? settings[1] : undefined;
                    let date = settings ? settings[2] : undefined;
                    meta.push([
                        id,
                        name,
                        date,
                        getChatSize(id),
                        kinOrGroup
                    ]);
                }
            }
            sendResponse(meta);

        } else if (request['type'] == 'moveToChat') {

            let url = '';
            if (request.kinOrGroup === 'k') {
                localStorage.setItem('currentAI', request.id);
                url = kinUrl;
            } else {
                url = `${host}${groupChatIdentifier}${request.id}`;
            }
            location.href = url;

        } else if (request['type'] === 'urlIsKindroid') {
            return window.location.href.indexOf(host) === 0;
        }

        return true;
    }
);