"use strict";

let isWsReady = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    console.log('Error, browser doesn\'t support WebSockets.');
}

let onReceive = null;
let onError = null;
let connection = null;

function connectWs(){
    const connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        console.log('Connect to local server');
    };

    connection.onerror = (error)=> {
        console.log('Error, there\'s some problem with connection or the server is down.');
        onError(error);
    };

    connection.onmessage = (message)=> {        
        try {
            const jsonMsg = JSON.parse(message.data);
            if(jsonMsg.type == 'systemMsg' && jsonMsg.msgText == 'success'){
                isWsReady = true;
                console.log('Connect to local WebSocket serever.');
            }
            onReceive(jsonMsg);       
        } catch (e) {
            console.log('Error: ', e);
        }
    };
    
    return connection;
}

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

function setUpWs(onMsgReceive, onConnectError){
    onReceive = onMsgReceive;
    onError = onConnectError;
    connection = connectWs();
    
    setInterval(()=> {
        if (connection.readyState !== 1) {
            onError();
            console.log('Error, unable to comminucate with the local WebSocket server. Retry...');
            isWsReady = false;
            connection = connectWs();
        }
    }, 3000);
}



