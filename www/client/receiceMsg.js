"use strict";
window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    console.log('Error, browser doesn\'t support WebSockets.');
}

let connection = null;
let onReceive = null;
let onError = null;

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
            onReceive(JSON.parse(message.data));
        } catch (e) {
            console.log('Error: ', e);
        }
    };
    
    return connection;
}

function setUpWs(onMsgReceive, onConnectError){
    onReceive = onMsgReceive;
    onError = onConnectError;
    connection = connectWs();
    
    setInterval(()=> {
        if (connection.readyState !== 1) {
            onError();
            console.log('Error, unable to comminucate with the local WebSocket server. Retry...');
            connection = connectWs();
        }
    }, 3000);
}



