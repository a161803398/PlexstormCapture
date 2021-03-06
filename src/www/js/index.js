let isMsgReady = false;

const gui = require('nw.gui');
const curWin = gui.Window.get();

const readMsgChk = document.getElementById("readMsgChk");
const playYTChk = document.getElementById("playYTChk");
const playPHChk = document.getElementById("playPHChk");
const defaultShowVideoChk = document.getElementById("defaultShowVideoChk");
const logToFileChk = document.getElementById("logToFileChk");

const autoScrollChk = document.getElementById('autoScrollChk');
const alwaysOnTopChk = document.getElementById("alwaysOnTopChk");

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
const showHideBtn = document.getElementById('showHideBtn');

const content = document.getElementById('content');
const donateLink = document.getElementById('donateLink');

const languageSelect = document.getElementById('languageSelect');

donateLink.addEventListener("click", ()=>{
    gui.Shell.openExternal("https://www.patreon.com/a1618");
});

function updateSetting(){
    setting.readMsg = readMsgChk.checked;
    setting.playYT = playYTChk.checked;
    setting.playPH = false; // FIXME
    setting.defaultShowVideo = defaultShowVideoChk.checked;    
    setting.logToFile = logToFileChk.checked;    
    
    setting.alwaysOnTop = alwaysOnTopChk.checked;
    setting.autoScroll = autoScrollChk.checked;
    
    setting.playTimeUnit = parseInt(playTimeSelect.value);
    setting.sfxVolume = parseInt(sfxVolumeRange.value);
    setting.voiceVolume = parseInt(voiceVolumeRange.value);
    setting.musicVolume = parseInt(musicVolumeRange.value);
    setting.language = languageSelect.value;
    
    curWin.setAlwaysOnTop(setting.alwaysOnTop);
    saveSetting();
}

readMsgChk.addEventListener("click", updateSetting);
playYTChk.addEventListener("click", updateSetting);
playPHChk.addEventListener("click", updateSetting);
logToFileChk.addEventListener("click", updateSetting);

autoScrollChk.addEventListener("click", updateSetting);
alwaysOnTopChk.addEventListener("click", updateSetting);

playTimeSelect.addEventListener("change", updateSetting);

defaultShowVideoChk.addEventListener("click", ()=>{
    updateSetting();    
    broadcastMsg({
        type: 'action', 
        toDo: 'setDefaultShowVideo', 
        defaultShowVideo: setting.defaultShowVideo
    });     
});

function updateState(){
    loadSetting();
    readMsgChk.checked = setting.readMsg;
    playYTChk.checked = setting.playYT;
    playPHChk.checked = false; // FIXME
    defaultShowVideoChk.checked = setting.defaultShowVideo;
    logToFileChk.checked = setting.logToFile;
    
    alwaysOnTopChk.checked = setting.alwaysOnTop;
    autoScrollChk.checked = setting.autoScroll;
    
    playTimeSelect.value = setting.playTimeUnit;
    sfxVolumeRange.value = setting.sfxVolume;
    voiceVolumeRange.value = setting.voiceVolume;
    musicVolumeRange.value = setting.musicVolume;
    
    curWin.setAlwaysOnTop(setting.alwaysOnTop);
}

updateState();

const toInject = () => {
    if (window.CAPTURE_INJECTED === true){
        return;
    }
    window.CAPTURE_INJECTED = true;

    let msgArea = null;
    function init() {
        console.log('Init!!!');
        let messageSource = null, messageOrigin;
        window.addEventListener('message', e => {
            if (messageSource == null) {
                console.log(e);
                if (e.data == "fromCapture") {
                    messageSource = e.source;
                    messageOrigin = e.origin;
                    messageSource.postMessage("success", messageOrigin);
                }
            }
        });
        
        function sendMsg(jsonObj){
            console.log(jsonObj);
            if(messageSource != null){ //message ready
                messageSource.postMessage(JSON.stringify(jsonObj), messageOrigin);
            }else{
                setTimeout(()=>{sendMsg(jsonObj);}, 1000); //wait 1 second and try again
            }
        }

        const observer = new MutationObserver((records)=>{
            //We hide the webview in current version and no need to scroll window
            //window.scrollBy(0, 1000);
            records.map(function(record){
                // console.log(record);
                let nodes = record.addedNodes;
                for(let i = 0; i < nodes.length; i++){
                    sendMsg({type: 'chat', info: nodes[i].outerHTML});
                }
            });
        });

        observer.observe(msgArea, {
            childList: true,
            subtree: true
        });
        
        const rankingWrapper = document.getElementsByClassName('ranking-wrapper')[0];
        
        function sendRankingInfo(){
            let rankingInfoText = "";
            const rankingMsg = rankingWrapper.getElementsByTagName('div');

            //just concat everything into single string
            for(let i = 0; i < rankingMsg.length; i++){
                try{
                    const username = rankingMsg[i].querySelector('.username').innerText;
                    const tipValue = rankingMsg[i].querySelector('.tip-value').innerText;  
                    rankingInfoText += username + ': <span class="hightlight">' + tipValue + '</span> ';
                }catch(e){
                    //not ranking row
                }
            }
                        
            sendMsg({type: 'ranking', info: rankingInfoText});
        }
      
        if(typeof rankingWrapper != 'undefined'){
            const rankingObserver = new MutationObserver(sendRankingInfo);
            rankingObserver.observe(rankingWrapper, {
                childList: true,
                subtree: true
            });    
            sendRankingInfo(); //first send it
        }
    }
    function checkReady() {
        msgArea = document.querySelector('.overflow-hidden.py-4.pb-0.flex-1.scrolling-touch.vb-content');
        if (msgArea) {
            init();
        } else {
            setTimeout(checkReady, 1000);
        }
    }
    checkReady();
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
// webview.style.display = 'none';

webview.setAudioMuted(true); // prevent donate sound
const indicator = document.getElementById('indicator');

//webview.addEventListener('loadstart', (e) => {});

webview.addEventListener('loadredirect', (e) => {
    if(e.newUrl.startsWith('https://plexstorm.com/?user=')){
        alert(curLang.msg['captureError']);
        showHideOnCapture();
        indicator.style.display = 'none';
        webview.src = 'about:blank';
        setContentHeight();
    }
});

//webview.addEventListener('loadstop', (e) => {
webview.addEventListener('loadcommit', (e) => {
    webview.executeScript({ code: '(' + toInject.toString() + ')();', mainWorld: true});
  
    const checkConnect = setInterval(()=>{
        if(isMsgReady){
            indicator.style.display = 'none';
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
        webview.showDevTools(true);
    }
});

function setContentHeight(){
    content.style.height= (window.innerHeight - content.offsetTop) + "px";
    if(autoScrollChk.checked){        
        content.scrollBy(0,1000);
    }  
}
window.addEventListener("resize", setContentHeight);

function printMsg(jsonMsg){
    broadcastMsg(jsonMsg);       
    addMsg(jsonMsg, 'client/assets/');
    if(autoScrollChk.checked){        
        content.scrollBy(0,1000);
    }    
}

musicDonateTestBtn.addEventListener('click', (e)=>{
    const msgObj = {
        type: 'chat',
        msgType: 3, //type-tip
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: curLang.msg['donate'] + '17PD',
        pdAmount: 17,
        rndNum: parseInt(donateSelect.value),
        ucid: 0
    };

    const preMsgObj = decodeDonateMsg(setting.readMsg ? curLang.msg['testYouTubeDonateMsg'] : "");
    msgObj['preMsg'] = preMsgObj.userMsg;
    if(preMsgObj.vid != null){
        msgObj['vid'] = preMsgObj.vid;
        msgObj['startTime'] = preMsgObj.startTime;
        msgObj['playTime'] = setting.playTimeUnit * msgObj['pdAmount'];
        msgObj['videoType'] = preMsgObj.videoType;
    }
    printMsg(msgObj);
});

phFastDonateTestBtn.addEventListener('click', (e)=>{
    const msgObj = {
        type: 'chat',
        msgType: 3, //type-tip
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: curLang.msg['donate'] + '17PD',
        pdAmount: 17,
        rndNum: parseInt(donateSelect.value),
        ucid: 0
    };

    const preMsgObj = decodeDonateMsg(setting.readMsg ? curLang.msg['testPornHubDonateMsg'] : "");
    msgObj['preMsg'] = preMsgObj.userMsg;
    if(preMsgObj.vid != null){
        msgObj['vid'] = preMsgObj.vid;
        msgObj['startTime'] = preMsgObj.startTime;
        msgObj['playTime'] = setting.playTimeUnit * msgObj['pdAmount'];
        msgObj['videoType'] = preMsgObj.videoType;
    }
    printMsg(msgObj);
});


function updateTopDonate(newText){
    curTopDonateMsg = newText;
    broadcastMsg({
        type: 'action', 
        toDo: 'setTopDonate',        
        topDonateMsg: curTopDonateMsg
    });    
}

donateTestBtn.addEventListener('click', (e)=>{
    printMsg({
        type: 'chat',
        msgType: 3, //type-tip
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: curLang.msg['donate'] + '9999PD',
        pdAmount: 9999,
        preMsg: setting.readMsg ? curLang.msg['testDonateMsg'] : "",
        rndNum: parseInt(donateSelect.value),
        ucid: 0
    });
    if(curTopDonateMsg == ""){
        //put some dummy message
        updateTopDonate('a161803398: <span class="hightlight">Test Donate</span>');        
    }
});

subscriptTestBtn.addEventListener('click', (e)=>{
    printMsg({
        type: 'chat',
        msgType: 4, //type-subscription
        userName: 'a161803398', 
        userSex: 0,//male
        msgText: curLang.msg['subscript'],
        preMsg: setting.readMsg ? curLang.msg['testSubscriptMsg'] : "",
        rndNum: parseInt(subscriptSelect.value),
        ucid: 0
    });    
});

stopBtn.addEventListener('click', (e)=>{ 
    broadcastMsg({type: 'action', toDo: 'stopCurDonate'});   
});

showHideBtn.addEventListener('click', (e)=>{
    broadcastMsg({type: 'action', toDo: 'toggleVideoDisplay'});   
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
        const jsonObj = JSON.parse(e.data);
        if(jsonObj.type == 'chat'){
            printMsg(decodeMsg(jsonObj.info));            
        }else if (jsonObj.type == 'ranking'){
            updateTopDonate(jsonObj.info);
            console.log(jsonObj.info);       
        }
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
//onLangChange();
setContentHeight();

document.getElementById('loadingOverlay').style.display = 'none'; //hide loading message