const userTypeList = ["type-normal", "type-streamer", "type-moderator", "type-tip", "type-subscription"];
const sexList = ["color-male", "color-female", "color-trans"];

window.addEventListener("load", ()=> {
    "use strict";
    const content = document.getElementById('content');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.innerHTML = '<div class="row">Sorry, but your browser doesn support WebSockets.</div>';
        return;
    }

    function removeOldMsg(){
        window.scrollBy(0,1000);
        /*
        while(content.offsetHeight > window.innerHeight){
            content.removeChild(content.firstChild);
        }      */  
    }
    
    function addMsg(msg, userName, sex, type){
        const newRow = document.createElement("div");
        newRow.classList.add("row");
        newRow.classList.add("type-normal");
        
        if(typeof userName == "undefined"){
            newRow.innerHTML = '<p>' + msg + '</p>'; //message only
        }else{
            newRow.classList.add(userTypeList[type]);
            newRow.innerHTML = '<div class="' + sexList[sex] + '">' + userName + '</div>' + '<p>: ' + msg + '</p>';
        }
        content.appendChild(newRow);
        
        
        removeOldMsg();
    }
    
    setUpWs((jsonMsg)=>{
        if(jsonMsg.type == 'systemMsg'){
            if(jsonMsg.msgText == 'success'){
                addMsg("Connected to local server.");
            }
        }else{
            addMsg(jsonMsg.msgText, jsonMsg.userName, jsonMsg.userSex, jsonMsg.msgType);
        }
    }, (e)=>{
        addMsg("Disconnected from local server!");
    });
    
    
    window.addEventListener("resize", removeOldMsg);    
});

