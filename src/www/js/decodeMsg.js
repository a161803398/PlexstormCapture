function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
}

function getPDCount(str){
    return parseInt(str.match(/has tipped (\d+)/)[1]);
}

const userMap = new Map();
userMap.set('a161803398', {preMsg: null, ucid: userMap.size}); 

// const preUserMsgMap = {};

function decodeDonateMsg(rawUserMsg){
    const urlMatch = rawUserMsg.match(/https?:\/\//);    
    let userMsg = rawUserMsg;
    let vid = null;
    let startTime = 0;
    let videoType = null;
    
    if(urlMatch !== null){
        userMsg = rawUserMsg.substring(0, urlMatch.index).trim();
        
        try {         
            const rawUrl = rawUserMsg.substring(urlMatch.index).trim();
            if(setting.playYT && rawUrl.match(/youtube\.com|youtu\.be\//) != null){ //check if it is YouTube Video
                const ytVideoId = rawUrl.match(/(?<=watch\?v=|\/videos\/|embed\/|youtu\.be\/)[^#\&\?]*/);
                const rawStartTime = rawUrl.match(/(?<=\?t=|\&t=)[^#\&\?]*/);
                if(ytVideoId !== null){
                    vid = ytVideoId[0];
                    videoType = 'YouTube';                    
                    if(rawStartTime !== null){
                        startTime = parseInt(rawStartTime[0]);
                    }
                }                
            }else if(setting.playPH && rawUrl.match(/pornhub\.com/) != null){ //check if it is PornHub Video
                const phVideoId = rawUrl.match(/(?<=viewkey=|embed\/)[^#\&\?]*/);
                const rawStartTime = rawUrl.match(/(?<=\?t=|\&t=)[^#\&\?]*/);
                if(phVideoId !== null){
                    vid = phVideoId[0];
                    videoType = 'PornHub';                    
                    if(rawStartTime !== null){
                        startTime = parseInt(rawStartTime[0]);
                    }
                }                
            }
        } catch (e) {
            vid = null;
        }
    }
    return { userMsg: userMsg, vid: vid, startTime: startTime, videoType: videoType}; 
}

function decodeMsg(tar){
    const decodeElement = createElementFromHTML(tar).children[0];
    if (!decodeElement) {
        return;
    }
    console.log(decodeElement);
    const msgObj = {
        type: 'chat',
        msgType: 0, //normal
        userName: '', 
        userSex: 0, //male
        msgText: ''
    };
    
    if (decodeElement.classList.contains('highlight-message')) {
        msgObj.msgType = 3;

        const msgP = decodeElement.children[0];

        const userSpan = msgP.children[0];
        if (userSpan) {
            msgObj.userName = userSpan.innerText.trim();
        }

        if (msgP) {
            msgObj.msgText = msgP.innerText.trim();
        }
    } else {
        const userSpanWrapper = decodeElement.children[0];
        const userSpan = userSpanWrapper.children[0]

        if (userSpan) {
            msgObj.userName = userSpan.innerText.trim();
        }else{
            msgObj.userName = userSpanWrapper.innerText.trim();
        }
        
        const msgP = decodeElement.children[1];
        
        if (msgP) {
            msgObj.msgText = msgP.innerText.trim();
        }
    }

    let userObj = null;
    if(userMap.has(msgObj.userName)){ //old user
        userObj = userMap.get(msgObj.userName); //retrieve userObj
    }else{
        userObj = {preMsg: null, ucid: userMap.size};
        userMap.set(msgObj.userName, userObj); //put userObj to map and increase map size
    }
    msgObj.ucid = userObj.ucid; //set ucid
    
    if(msgObj.msgType == 3 || msgObj.msgType == 4){
        if(msgObj.msgType == 3){
            msgObj['pdAmount'] = getPDCount(msgObj.msgText);
        }else {
            msgObj.msgText = curLang.msg['subscript'];
        }
        
        msgObj['rndNum'] = Math.floor(999999999 * Math.random());
                               
        if(userObj.preMsg != null){
            msgObj['preMsg'] = userObj.preMsg;
            
            if(msgObj.msgType == 3){ //for donate only
                const preMsgObj = decodeDonateMsg(msgObj['preMsg']);
                msgObj['preMsg'] = preMsgObj.userMsg;
                if(preMsgObj.vid != null){
                    msgObj['vid'] = preMsgObj.vid;
                    msgObj['startTime'] = preMsgObj.startTime;
                    msgObj['playTime'] = setting.playTimeUnit * msgObj['pdAmount'];
                    msgObj['videoType'] = preMsgObj.videoType;
                }
            }
            
            if(!setting.readMsg){
                msgObj['preMsg'] = "";
            }
        }else{
            msgObj['preMsg'] = ""; 
        }
    }else{
        userObj.preMsg = msgObj.msgText; //record pre-message
    }
    return msgObj;
}
