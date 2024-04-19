function returnToPopup() {
    chrome.action.setPopup({ popup: "popup.html" });
    location.href = 'popup.html'
}

chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    if (tabs[0].url.indexOf('https://kindroid.ai/') !== 0) {
        returnToPopup();
    }
});

// Version
document.getElementById('version').innerText = `v${chrome.runtime.getManifest().version_name}`;

// Buttons
document.getElementById('cancel').addEventListener('click', returnToPopup);

function view(id, kinOrGroup) {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "moveToChat", id: id, kinOrGroup: kinOrGroup }, function (response) { });
    });
    chrome.action.setPopup({ popup: "popup.html" });
    window.close();
}

function deleteChat(id, name) {
    location.href = `deleteConfirmation.html?id=${id}&name=${encodeURIComponent(name)}&referrer=manage.html`;
}

function createButton(image, event, tooltip) {
    div = document.createElement('div');
    div.className = 'tooltip'
    img = document.createElement('img');
    img.setAttribute('src', image)
    img.className = 'tableButton';
    div.addEventListener('click', () => {
        event();
    });
    div.appendChild(img)
    span = document.createElement('span');
    span.className = 'tooltiptext';
    span.innerText = tooltip;
    div.appendChild(span)
    return div;
}

function download(id, fileType, name) {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "downloadConversation", fileType: fileType, id: id, name: name }, function (response) { });
    });
}

chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "getConversationsMeta" }, function (response) {

        if (response) {

            // id, name, date, getChatSize(id), kinOrGroup

            const body = document.body,
                tbl = document.createElement('table');
            tbl.className = 'manageTable';

            const tr = tbl.insertRow();
            let td = tr.insertCell();
            td.className = 'manageHeaderCell';
            td.appendChild(document.createTextNode('Chat'));
            td = tr.insertCell();
            td.className = 'manageHeaderCell';
            td.appendChild(document.createTextNode('Started'));
            td = tr.insertCell();
            td.className = 'manageHeaderCell';
            td.appendChild(document.createTextNode('Size'));
            td = tr.insertCell();


            for (let i = 0; i < response.length; i++) {
                const tr = tbl.insertRow();
                let td = tr.insertCell();
                // Name
                td.className = 'cellPadRight';
                td.appendChild(document.createTextNode(response[i][1]));
                td = tr.insertCell();
                // Date
                td.className = 'cellPadRight';
                td.appendChild(document.createTextNode(response[i][2] ? new Date(response[i][2]).toLocaleDateString() : ''));
                td = tr.insertCell();
                // Size
                td.className = 'cellPadRight';
                td.appendChild(document.createTextNode(response[i][3]));
                td = tr.insertCell();

                // View
                let evnt = function () { view(response[i][0], response[i][4]) };
                td.appendChild(createButton('images/view.png', evnt, 'Switch chat'));

                // Download text
                evnt = function () { 
                    download(response[i][0], 'txt', response[i][1]);
                 };
                td.appendChild(createButton('images/text.png', evnt, 'Download plain text'));

                // Download HTML
                evnt = function () { 
                    download(response[i][0], 'html', response[i][1]);
                };
                td.appendChild(createButton('images/html.png', evnt, 'Download HTML'));

                // Download JSON
                evnt = function () { 
                    download(response[i][0], 'json', response[i][1]);
                };
                td.appendChild(createButton('images/json.png', evnt, 'Download JSON'));

                // Delete
                evnt = function () { 
                    deleteChat(response[i][0], response[i][1]) 
                };
                td.appendChild(createButton('images/delete.png', evnt, 'Delete chat log'));
            }

            document.getElementById('table').appendChild(tbl);

        }

    });
});

