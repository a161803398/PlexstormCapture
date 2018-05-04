let isMsgReady = false;

const toInject = ()=> {
    const form = document.getElementsByTagName('form')[0];
    if(typeof form != 'undefined'){
        form.submit();
    }
    
    const chatCol = document.getElementsByClassName('chat-column')[0];
    if(typeof chatCol != 'undefined'){
        
        document.removeChild(document.documentElement);
        const body = document.createElement("body");

        document.appendChild(body);

        body.appendChild(chatCol);
        
        const chatSection = document.getElementsByClassName('chat')[0];
        chatSection.style.height = "100%";
        
        const sending = document.getElementsByClassName('sending-area')[0];
        const ranking = document.getElementsByClassName('ranking')[0];
        sending.parentElement.removeChild(sending);
        ranking.parentElement.removeChild(ranking);

        
        const style = document.createElement("style");
        body.appendChild(style);
        style.sheet.insertRule("html, body {font-family: Microsoft JhengHei,helvetica,arial,sans-serif;overflow:hidden;background-color: #000000;font-weight: bold;}");
        style.sheet.insertRule("svg, .timestamp, .ps__scrollbar-x-rail, .ps__scrollbar-y-rail, .hint {display:none;}");
        style.sheet.insertRule(".row p, .row div {display:inline;}");
        style.sheet.insertRule(".row {color: #ffffff;font-size: 20px;}");
        style.sheet.insertRule(".row.type-tip {color: #ffff00;}");
        style.sheet.insertRule(".row.type-subscription {color: #ffff00;}");
        style.sheet.insertRule(".type-normal .color-male {color: #00ffff;}");
        style.sheet.insertRule(".type-normal .color-female {color: #ff69b4;}");
        style.sheet.insertRule(".type-normal .color-trans {color: #ff00ff;}");
        
        style.sheet.insertRule(".type-normal.type-moderator .color-male {color: #ffff00;}");
        style.sheet.insertRule(".type-normal.type-moderator .color-female {color: #ff4500;}");
        style.sheet.insertRule(".type-normal.type-moderator .color-trans {color: #ffa07a;}");

        style.sheet.insertRule(".type-normal.type-streamer .color-male {color: #ffff00;}");
        style.sheet.insertRule(".type-normal.type-streamer .color-female {color: #ff4500;}");
        style.sheet.insertRule(".type-normal.type-streamer .color-trans {color: #ffa07a;}");

        const msgArea = document.getElementsByClassName('message-area')[0];
        const placehold = document.createElement("div");
        placehold.classList.add("row");
        placehold.innerHTML = "Connect to chat room successfully!!";
        msgArea.appendChild(placehold);
        
        let messageSource, messageOrigin;
        addEventListener('message', function(e) {
            if (!messageSource) {
                if (e.data == "fromCapture") {
                    messageSource = e.source;
                    messageOrigin = e.origin;
                    messageSource.postMessage("success", messageOrigin);
                }
            }
        });
        
        const observer = new MutationObserver((records)=>{
            window.scrollBy(0,1000);
            records.map(function(record){
                console.log(record);
                let nodes = record.addedNodes;
                for(let i = 0; i < nodes.length; i++){
                    messageSource.postMessage(nodes[i].outerHTML, messageOrigin);
                }
            });
        });

        observer.observe(chatCol, {
            childList: true,
            subtree: true
        });
    }
};


const webview = document.createElement('webview');
document.body.appendChild(webview); 
const indicator = document.getElementById('indicator');

webview.addEventListener('loadstart', (e) => {
    indicator.style.display = '';
    indicator.innerText = 'Please Wait...';
});

webview.addEventListener('loadredirect', (e) => {
    if(e.newUrl === 'https://plexstorm.com/'){
        alert('Cannot capture chat room, please make sure that the streaming is started!!');
        control.style.display = '';
        indicator.style.display = 'none';
        webview.src = 'about:blank';
    }
});

//webview.addEventListener('loadstop', (e) => {
webview.addEventListener('loadcommit', (e) => {
    webview.executeScript({ code: '(' + toInject.toString() + ')();' , mainWorld: true});
  
    const checkConnect = setInterval(()=>{
        if(isMsgReady){
            indicator.style.display = 'none';
            clearInterval(checkConnect);
        }else{
            webview.contentWindow.postMessage('fromCapture', webview.src);
        }
  }, 1000);
});


const control = document.getElementById('control');
const loadChatBtn = document.getElementById('loadChatBtn');
const donateTestBtn = document.getElementById('donateTestBtn');
const donateSelect = document.getElementById('donateSelect');

const subscriptTestBtn = document.getElementById('subscriptTestBtn');
const subscriptSelect = document.getElementById('subscriptSelect');

loadChatBtn.addEventListener('click', (e)=>{
    const val = prompt("Please input your PlexStorm streaming url(Make sure that the streaming is started)", "https://plexstorm.com/stream/hornydragon");
    if(val !== null){
        control.style.display = 'none';
        loadChatBtn.style.display = 'none';
        webview.src = val;
    }
});

donateTestBtn.addEventListener('click', (e)=>{
    sendMsg({
        type: 'chat',
        msgType: 3, //type-tip
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: 'Donate 9999PD.',
        pdAmount: 9999,
        rndNum: parseInt(donateSelect.value)
    });
});

subscriptTestBtn.addEventListener('click', (e)=>{
    sendMsg({
        type: 'chat',
        msgType: 4, //type-subscription
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: 'Subscript this chanel.',
        rndNum: parseInt(subscriptSelect.value)
    });
});

addEventListener('message', function(e) { 
    if(e.data == 'success'){
        isMsgReady = true;
        sendMsg({
            type: 'chat',
            msgType: 2, 
            userName: 'System', 
            userSex: 0,
            msgText: 'Connect to chat room.'
        });
    }else{ //chat message
        sendMsg(decodeMsg(e.data));
    }
});