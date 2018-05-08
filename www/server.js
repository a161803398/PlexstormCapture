let http = require("http");
let url = require("url");
let fs = require('fs');

let setting = {
    alwaysOnTop: false,
    readMsg: true,
    playYT: true,
    playTimeUnit: 500,
    autoScroll: true,
    sfxVolume: 100,
    voiceVolume: 100,
    musicVolume: 100
};

function loadSetting(){
    if(typeof localStorage !== 'undefined' && typeof localStorage['setting'] !== 'undefined'){
        const prevSetting = JSON.parse(localStorage['setting']);
        for(let key in prevSetting){
            setting[key] = prevSetting[key];
        }
    }        
}

const contentMap = {
    "htm": "text/html",
    "html": "text/html",
    "txt": "text/plain",
    "png": "image/png",
    "jpg": "image/jpg",
    "jpeg": "image/jpg",
    "gif": "image/gif",
    "jpg": "image/jpg",
    "mp3": "audio/mpeg3",
    "wav": "audio/wav",
    "js": "application/javascript",
    "json": "application/json",
    "css": "text/css"
}

http.createServer(function(request, response) {
    let pathname = url.parse(request.url).pathname.substr(1); //remove left '/'
    
    if(pathname == ""){
        pathname = "index.html";
    }    

    let splitPath = pathname.split(".");
    if(splitPath.length <= 1){
        pathname += '.html';
        splitPath.push('html');
    }
    
    let contentName = splitPath[splitPath.length - 1];

    let contentType = contentMap[contentName];
    
    if(typeof contentType == 'undefined'){
        contentType = "text/plain";
    }
    
    fs.readFile("./www/client/" + pathname, "binary", function(error, file) {
        if(error) {
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(error + "\n");
          response.end();
        } else {
          response.writeHead(200, {"Content-Type": contentType});
          response.write(file, "binary");
          response.end();
        }
    });
    
}).listen(1069);

function digit2(num){
    if(num < 10){
        return '0' + num;
    }else{
        return num;
    }
}
function getCurDateStr(){
    const m = new Date();
    return m.getFullYear() + "_" + digit2(m.getMonth() + 1) + digit2(m.getDate());
}
function getCurTimeStr(){
    const m = new Date();
    return digit2(m.getHours()) + ":" + digit2(m.getMinutes()) + ":" + digit2(m.getSeconds());
}

function logToFile(user, msg){
    fs.appendFile("./chat_logs/" + getCurDateStr() + ".log", 
    "[" + getCurTimeStr() + "] <" + user + "> " + msg + "\n", (err) => {
        if(err) {
            return console.log(err);
        }
    });
}

// Port where we'll run the websocket server
let webSocketsServerPort = 1337;

// websocket servers
let webSocketServer = require('websocket').server;

// list of currently connected clients (users)
let clients = [];


/**
 * HTTP server
 */
let server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

loadSetting(); //try to loadSetting

/**
 * WebSocket server
 */
let wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    let connection = request.accept(null, request.origin); //Same origin policy
    let index = clients.push(connection) - 1; //current client index

    console.log((new Date()) + ' Connection accepted.');

    clients[index].sendUTF(JSON.stringify({ type:'systemMsg', msgText: 'success'})); //send welcome message
    
    loadSetting(); //update volume info
    
    clients[index].sendUTF(JSON.stringify({ //send volume info to client
        type: 'action', 
        toDo: 'setVolume', 
        sfxVolume: setting.sfxVolume,
        voiceVolume: setting.voiceVolume,
        musicVolume: setting.musicVolume
    }));   
    
    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            console.log((new Date()) + ' Received Message: ' + message.utf8Data);
            
            // broadcast message to all connected clients
            for (let i = 0; i < clients.length; i++) {
                clients[i].sendUTF(message.utf8Data);
            }
            try {
                const jsonObj = JSON.parse(message.utf8Data);
                if(jsonObj.type == 'chat'){
                    logToFile(jsonObj.userName, jsonObj.msgText);
                }
            } catch (e) {
                logToFile('System Error ', e);
            }                
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        // remove user from the list of connected clients
        clients.splice(index, 1);
    });

});
