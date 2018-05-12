let isMsgReady = false;

const userTypeList = ["type-normal", "type-streamer", "type-moderator", "type-tip", "type-subscription"];
const sexList = ["color-male", "color-female", "color-trans"];

const gui = require('nw.gui');
const curWin = gui.Window.get();

const alwaysOnTopChk = document.getElementById("alwaysOnTopChk");
const readMsgChk = document.getElementById("readMsgChk");
const playYTChk = document.getElementById("playYTChk");
const playPHChk = document.getElementById("playPHChk");

const hideOnCaptures = document.getElementsByClassName('hideOnCapture');

const control = document.getElementById('control');
const loadChatBtn = document.getElementById('loadChatBtn');
const musicDonateTestBtn = document.getElementById('musicDonateTestBtn');
const phFastDonateTestBtn = document.getElementById('phFastDonateTestBtn');

const donateTestBtn = document.getElementById('donateTestBtn');
const donateSelect = document.getElementById('donateSelect');

const playTimeSelect = document.getElementById('playTimeSelect');

const subscriptTestBtn = document.getElementById('subscriptTestBtn');
const subscriptSelect = document.getElementById('subscriptSelect');

const sfxVolumeRange = document.getElementById('sfxVolumeRange');
const voiceVolumeRange = document.getElementById('voiceVolumeRange');
const musicVolumeRange = document.getElementById('musicVolumeRange');

const stopBtn = document.getElementById('stopBtn');

const autoScrollChk = document.getElementById('autoScrollChk');
const content = document.getElementById('content');
const donateLink = document.getElementById('donateLink');

const languageSelect = document.getElementById('languageSelect');


donateLink.addEventListener("click", ()=>{
    gui.Shell.openExternal("https://www.patreon.com/a1618");
});

function updateSetting(){
    setting.alwaysOnTop = alwaysOnTopChk.checked;
    setting.readMsg = readMsgChk.checked;
    setting.playYT = playYTChk.checked;
    setting.playPH = playPHChk.checked;
    setting.playTimeUnit = parseInt(playTimeSelect.value);
    setting.autoScroll = autoScrollChk.checked;
    setting.sfxVolume = parseInt(sfxVolumeRange.value);
    setting.voiceVolume = parseInt(voiceVolumeRange.value);
    setting.musicVolume = parseInt(musicVolumeRange.value);
    setting.language = languageSelect.value;
    
    curWin.setAlwaysOnTop(setting.alwaysOnTop);
    saveSetting();
}

alwaysOnTopChk.addEventListener("click", updateSetting);
readMsgChk.addEventListener("click", updateSetting);
playYTChk.addEventListener("click", updateSetting);
playPHChk.addEventListener("click", updateSetting);
playTimeSelect.addEventListener("change", updateSetting);


function updateState(){
    loadSetting();
    alwaysOnTopChk.checked = setting.alwaysOnTop;
    readMsgChk.checked = setting.readMsg;
    playYTChk.checked = setting.playYT;
    playPHChk.checked = setting.playPH;
    playTimeSelect.value = setting.playTimeUnit;
    autoScrollChk.checked = setting.autoScroll;
    sfxVolumeRange.value = setting.sfxVolume;
    voiceVolumeRange.value = setting.voiceVolume;
    musicVolumeRange.value = setting.musicVolume;
    
    curWin.setAlwaysOnTop(setting.alwaysOnTop);
}

updateState();

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
        const msgArea = document.getElementById('message-area');
        
        const observer = new MutationObserver((records)=>{
            window.scrollBy(0, 1000);
            records.map(function(record){
                //console.log(record);
                let nodes = record.addedNodes;
                for(let i = 0; i < nodes.length; i++){
                    messageSource.postMessage(nodes[i].outerHTML, messageOrigin);
                }
            });
        });

        observer.observe(msgArea, {
            childList: true,
            subtree: true
        });
    }
};


function hideHideOnCapture(){
    for(let i = 0; i < hideOnCaptures.length; i++){
        hideOnCaptures[i].style.display = 'none';
    }
}
function showHideOnCapture(){
    for(let i = 0; i < hideOnCaptures.length; i++){
        hideOnCaptures[i].style.display = '';
    }
}

const webview = document.createElement('webview');
document.body.appendChild(webview); 
const indicator = document.getElementById('indicator');

//webview.addEventListener('loadstart', (e) => {});

webview.addEventListener('loadredirect', (e) => {
    if(e.newUrl === 'https://plexstorm.com/'){
        alert(curLang.msg['captureError']);
        showHideOnCapture();
        indicator.style.display = 'none';
        webview.src = 'about:blank';
    }
});

//webview.addEventListener('loadstop', (e) => {
webview.addEventListener('loadcommit', (e) => {
    webview.executeScript({ code: '(' + toInject.toString() + ')();', mainWorld: true});
  
    const checkConnect = setInterval(()=>{
        if(isMsgReady){
            indicator.style.display = 'none';
            webview.style.display = 'none';
            setContentHeight();
            clearInterval(checkConnect);
        }else{
            webview.contentWindow.postMessage('fromCapture', webview.src);
        }
  }, 1000);
});


loadChatBtn.addEventListener('click', (e)=>{
    const val = prompt(curLang.msg['inputStreamHint'], setting.defaultUrl);
    if(val !== null){
        hideHideOnCapture();
        loadChatBtn.style.display = 'none';
        webview.src = val;
        indicator.style.display = '';
        setContentHeight();
        
        setting.defaultUrl = val;
        updateSetting();
    }
});

function setContentHeight(){
    content.style.height= (window.innerHeight - content.offsetTop) + "px";
    if(autoScrollChk.checked){        
        content.scrollBy(0,1000);
    }  
}
window.addEventListener("resize", setContentHeight);


function addMsg(jsonMsg){
    if(jsonMsg.type != 'chat') return;
    
    const newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.classList.add("type-normal");
    
    if(typeof jsonMsg.userName == "undefined"){
        newRow.innerHTML = '<p>' + jsonMsg.msgText + '</p>'; //message only
    }else{
        newRow.classList.add(userTypeList[jsonMsg.msgType]);
        newRow.innerHTML = '<div class="' + sexList[jsonMsg.userSex] + '">' + jsonMsg.userName + ': </div>' + '<p>' + jsonMsg.msgText + '</p>';
    }
    content.appendChild(newRow);
}

function printMsg(jsonMsg){
    broadcastMsg(jsonMsg);       
    addMsg(jsonMsg);
    if(autoScrollChk.checked){        
        content.scrollBy(0,1000);
    }    
}

musicDonateTestBtn.addEventListener('click', (e)=>{    
    printMsg(decodeMsg('<div class="row message flex items-center type-normal type-normal"><div class="user flex items-center"><i aria-hidden="true" class="far mr-1 fa-venus"></i> <span class="username color-male">a161803398</span><span class="placeholder mx1">·</span></div> <span class="timestamp grey mr1"><time datetime="Thu May 03 2018 12:51:11 GMT+0800 (台北標準時間)" title="5/3/2018, 12:51:11 PM">2 minutes ago</time></span><p class="my-4 message-text white">' + curLang.msg['testYouTubeDonateMsg'] + '</p></div>'));
    printMsg(decodeMsg('<div class="row message flex items-center type-normal type-tip"><div class="flex justify-center mx-auto"><div class="user flex items-center mr1"><i aria-hidden="true" class="far mr-2 fa-mars"></i> <span class="username color-male">a161803398</span></div><p class="my-4 message-text">has tipped<span class="white ml1">17 PD</span></p></div></div>'));
    
});

phFastDonateTestBtn.addEventListener('click', (e)=>{    
    printMsg(decodeMsg('<div class="row message flex items-center type-normal type-normal"><div class="user flex items-center"><i aria-hidden="true" class="far mr-1 fa-venus"></i> <span class="username color-male">a161803398</span><span class="placeholder mx1">·</span></div> <span class="timestamp grey mr1"><time datetime="Thu May 03 2018 12:51:11 GMT+0800 (台北標準時間)" title="5/3/2018, 12:51:11 PM">2 minutes ago</time></span><p class="my-4 message-text white">' + curLang.msg['testPornHubDonateMsg'] + '</p></div>'));
    printMsg(decodeMsg('<div class="row message flex items-center type-normal type-tip"><div class="flex justify-center mx-auto"><div class="user flex items-center mr1"><i aria-hidden="true" class="far mr-2 fa-mars"></i> <span class="username color-male">a161803398</span></div><p class="my-4 message-text">has tipped<span class="white ml1">10 PD</span></p></div></div>'));    
});


donateTestBtn.addEventListener('click', (e)=>{
    printMsg({
        type: 'chat',
        msgType: 3, //type-tip
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: curLang.msg['donate'] +'9999PD',
        pdAmount: 9999,
        preMsg: setting.readMsg ? curLang.msg['testDonateMsg'] : "",
        rndNum: parseInt(donateSelect.value)
    });
    
    //printMsg(decodeMsg('<div class="row message flex items-center type-normal type-normal"><div class="user flex items-center"><i aria-hidden="true" class="far mr-1 fa-venus"></i> <span class="username color-male">a161803398</span><span class="placeholder mx1">·</span></div> <span class="timestamp grey mr1"><time datetime="Thu May 03 2018 12:51:11 GMT+0800 (台北標準時間)" title="5/3/2018, 12:51:11 PM">2 minutes ago</time></span><p class="my-4 message-text white">來自a161803398的測試贊助</p></div>'));
    //printMsg(decodeMsg('<div class="row message flex items-center type-normal type-tip"><div class="flex justify-center mx-auto"><div class="user flex items-center mr1"><i aria-hidden="true" class="far mr-2 fa-mars"></i> <span class="username color-male">a161803398</span></div><p class="my-4 message-text">has tipped<span class="white ml1">9999 PD</span></p></div></div>'));    
});

subscriptTestBtn.addEventListener('click', (e)=>{
    printMsg({
        type: 'chat',
        msgType: 4, //type-subscription
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: curLang.msg['subscript'],
        preMsg: setting.readMsg ? curLang.msg['testSubscriptMsg'] : "",
        rndNum: parseInt(subscriptSelect.value)
    });    
    //printMsg(decodeMsg('<div class="row message flex items-center type-normal type-normal"><div class="user flex items-center"><i aria-hidden="true" class="far mr-1 fa-venus"></i> <span class="username color-male">a161803398</span><span class="placeholder mx1">·</span></div> <span class="timestamp grey mr1"><time datetime="Thu May 03 2018 12:51:11 GMT+0800 (台北標準時間)" title="5/3/2018, 12:51:11 PM">2 minutes ago</time></span><p class="my-4 message-text white">來自a161803398的測試訂閱</p></div>'));
    
    //printMsg(decodeMsg('<div class="row message flex items-center type-normal type-subscription"><!----> <!----> <div class="flex justify-center mx-auto"><div class="user flex items-center mr1"><svg aria-hidden="true" class="svg-inline--fa fa-mars fa-w-12 mr-1" data-prefix="far" data-icon="mars" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg=""><path fill="currentColor" d="M372 64h-63c-10.7 0-16 12.9-8.5 20.5L315 99l-87.6 87.6C203.9 169.9 175.1 160 144 160 64.5 160 0 224.5 0 304s64.5 144 144 144 144-64.5 144-144c0-31.1-9.9-59.9-26.6-83.4L349 133l14.5 14.5c7.6 7.6 20.5 2.2 20.5-8.5V76c0-6.6-5.4-12-12-12zM144 400c-52.9 0-96-43.1-96-96s43.1-96 96-96 96 43.1 96 96-43.1 96-96 96z"></path></svg><!-- <i aria-hidden="true" class="far mr-1 fa-mars"></i> --> <span class="username color-male">a161803398</span></div> <p class="my-4 message-text">just subscribed</p></div> <!----> <!----> <!----> <!----></div>'));
});

stopBtn.addEventListener('click', (e)=>{
    printMsg({type: 'action', toDo: 'stopCurDonate'});   
});


addEventListener('message', (e)=> {     
    if(e.data == 'success'){
        isMsgReady = true;        
        printMsg({
            type: 'chat',
            msgType: 2, 
            userName: curLang.msg['system'], 
            userSex: 0,
            msgText: curLang.msg['connectToChatRoom']
        });
    }else{ //chat message
        printMsg(decodeMsg(e.data));
    }
});

function onVolumeChange(){
    updateSetting();
    broadcastMsg({
        type: 'action', 
        toDo: 'setVolume', 
        sfxVolume: setting.sfxVolume,
        voiceVolume: setting.voiceVolume,
        musicVolume: setting.musicVolume
    });    
}

function createLangOptions(){
    for(let key in langList){
        const langObj = langList[key];
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = langObj.name;
        languageSelect.appendChild(opt);
    }
    
    languageSelect.value = setting.language;
}

function onLangChange(){
    updateSetting();    
    updateUiLang();
     broadcastMsg({
        type: 'action', 
        toDo: 'setLang', 
        lang: setting.language
    });  
}

sfxVolumeRange.addEventListener("change", onVolumeChange);
voiceVolumeRange.addEventListener("change", onVolumeChange);
musicVolumeRange.addEventListener("change", onVolumeChange);

languageSelect.addEventListener("change", onLangChange);

createLangOptions();
updateUiLang();
onLangChange();
setContentHeight();
