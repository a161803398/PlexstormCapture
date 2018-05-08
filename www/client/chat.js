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
        while((content.offsetTop + content.offsetHeight) > window.innerHeight){            
            content.removeChild(content.firstChild);
        }*/
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
            newRow.innerHTML = '<div class="' + sexList[jsonMsg.userSex] + '">' + jsonMsg.userName + '</div>' + '<p>: ' + jsonMsg.msgText + '</p>';
        }
        content.appendChild(newRow);
        removeOldMsg();
    }
    
    setUpWs((jsonMsg)=>{
        if(jsonMsg.type == 'systemMsg'){
            if(jsonMsg.msgText == 'success'){
                addMsg({
                    type: 'chat',
                    msgType: 2, 
                    userName: '系統', 
                    userSex: 0,
                    msgText: '已連線到本機伺服器。'
                });
            }
        }else{            
            addMsg(jsonMsg);
        }
    }, (e)=>{
        addMsg({
            type: 'chat',
            msgType: 2, 
            userName: '系統', 
            userSex: 0,
            msgText: '已斷開與本機伺服器間連線。'
        });
    });
    
    
    window.addEventListener("resize", removeOldMsg);    
});

