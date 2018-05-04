"use strict";

let isWsReady = false;

// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

// if browser doesn't support WebSocket, just show some notification and exit
if (!window.WebSocket) {
    console.log('Error, browser doesn\'t support WebSockets.');
}

function connectWs(){
    const connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        console.log('Connect to local server');
    };

    connection.onerror = (error)=> {
        // just in there were some problems with conenction...
        console.log('Error, there\'s some problem with connection or the server is down.');
    };

    connection.onmessage = (message)=> {
        try {
            var jsonMsg = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        
        if(jsonMsg.type == 'systemMsg' && jsonMsg.msgText == 'success'){
            isWsReady = true;
            console.log('Connect to local WebSocket serever.');
        }
    };
    
    return connection;
}

let connection = null;
const msgBuffer = [];

function sendMsg(msgObj){
    if(isWsReady){
        if(msgBuffer.length > 0){
            msgBuffer.push(JSON.stringify(msgObj));
            
            while(msgBuffer.length > 0 && isWsReady){
                const toSend = msgBuffer.shift();
                connection.send(toSend);
                console.log(toSend);
            }
        }else{
            connection.send(JSON.stringify(msgObj));
        }
    }else{
        msgBuffer.push(JSON.stringify(msgObj));
        console.log(JSON.stringify(msgObj));
    }
}

connection = connectWs();


setInterval(()=> {
    if (connection.readyState !== 1) {
        console.log('Error, Unable to comminucate with the local WebSocket server. Retry...');
        isWsReady = false;
        connection = connectWs();
    }
}, 3000);