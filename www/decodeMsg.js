function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
}

function getPDCount(str){
    let pd = 0;
    for(let i = 0; i < str.length; i++){
        const curCharCode = str.charCodeAt(i);
        if(curCharCode >= 48 && curCharCode <= 57){ //0 to 9
            pd *= 10;
            pd += curCharCode - 48;
        }
    }
    return pd;
}

function decodeMsg(tar){
    const decodeElement = createElementFromHTML(tar);
    console.log(decodeElement);
    const msgObj = {
        type: 'chat',
        msgType: 0, //normal
        userName: '', 
        userSex: 0, //male
        msgText: ''
    };
    
    const classList = decodeElement.classList;

    if(classList.contains('type-streamer')){
        msgObj.msgType = 1;
    }else if(classList.contains('type-moderator')){
        msgObj.msgType = 2;
    }else if(classList.contains('type-tip')){
        msgObj.msgType = 3;
    }else if(classList.contains('type-subscription')){
        msgObj.msgType = 4;
    }

    const userSpan = decodeElement.getElementsByClassName('username')[0];
    console.log();
    if(typeof userSpan != 'undefined'){
        msgObj.userName = userSpan.innerText.trim();
        
        const classList = userSpan.classList;
        if(classList.contains('color-female')){
            msgObj.userSex = 1;
        }else if(classList.contains('color-trans')){
            msgObj.userSex = 2;
        }
    }
    
    const msgP = decodeElement.getElementsByClassName('message-text')[0];
    
    if(typeof msgP != 'undefined'){
        msgObj.msgText = msgP.innerText.trim();
        if(msgObj.msgType == 3){
            msgObj['pdAmount'] = getPDCount(msgObj.msgText);
            msgObj['rndNum'] = Math.floor(999999999 * Math.random());
            msgObj.msgText = '贊助了' + msgObj['pdAmount'] + 'PD';
        }else if(msgObj.msgType == 4){
            msgObj.msgText = '訂閱了本頻道';
        }
        
    }    
    return msgObj;
}
