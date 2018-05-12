const userTypeList = ["type-normal", "type-streamer", "type-moderator", "type-tip", "type-subscription"];
const sexList = ["color-male", "color-female", "color-trans"];

const content = document.getElementById('content');

//if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

//if browser doesn't support WebSocket, just show some notification and exit
if (!window.WebSocket) {
    content.innerHTML = '<div class="row">Error: Browser doesn\'t support WebSockets.</div>';
}

function remove1Word(str){        
    const firstMatch = str.match(/[^\x00-\xff]|\s/); //Fullwidth character or space
    if(firstMatch === null){
        return "";            
    }else{
        return str.substr(firstMatch.index + 1).trim();
    }
}

function removeOldMsg(){
    //window.scrollBy(0,1000);
    
    //remove untill only one message is cropped
    while((content.offsetTop + content.offsetHeight - content.firstChild.offsetHeight) > window.innerHeight){            
        content.removeChild(content.firstChild);            
    }
    
    if((content.offsetTop + content.offsetHeight) > window.innerHeight){//need to handle the cropped message
        const tarRow = content.firstChild;
        const userNameDiv = tarRow.getElementsByTagName("div")[0];
        const msgText = tarRow.getElementsByTagName("p")[0];
        
        if(typeof userNameDiv !== 'undefined'){
            //console.log(userNameDiv);
            tarRow.removeChild(userNameDiv); //remove user name            
        }
        
        //if still not enough
        while((content.offsetTop + content.offsetHeight) > window.innerHeight){
            const newMsgText = remove1Word(msgText.innerHTML);
            //console.log(newMsgText);
            if(newMsgText != ""){
                msgText.innerHTML = newMsgText;
            }else{ //nothing here, just remove whole message row
                content.removeChild(tarRow);
                break;
            }
        }
    }
}

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
    removeOldMsg();
}

setUpWs((jsonMsg)=>{        
    if(jsonMsg.type == 'action'){
        if(jsonMsg.toDo == 'initialSet'){ //connect success
            setLang(jsonMsg.lang);
            addMsg({
                type: 'chat',
                msgType: 2, 
                userName: curLang.msg["system"], 
                userSex: 0,
                msgText: curLang.msg["connectToLoaclServer"]
            });            
        }else if(jsonMsg.toDo == 'setLang'){
            setLang(jsonMsg.lang);
        }
    }else {            
        addMsg(jsonMsg);
    }
}, (e)=>{
    addMsg({
        type: 'chat',
        msgType: 2, 
        userName: curLang.msg["system"], 
        userSex: 0,
        msgText: curLang.msg["disconnectFromLoaclServer"]
    });
});

window.addEventListener("resize", removeOldMsg);    


