const http = require("http");
const url = require("url");
const fs = require('fs');
const got = require('got');

let curTopDonateMsg = "";

//MIME types
const contentMap = {
    //web
    "htm":  "text/html",
    "html": "text/html",
    "txt":  "text/plain",       
    "xml":  "application/xml",
    "dtd":  "application/xml-dtd",    
    "js":   "application/javascript",
    "json": "application/json",
    "css":  "text/css",
    
    //image
    "ico":  "image/x-icon",
    "png":  "image/png",
    "jpg":  "image/jpg",
    "jpe":  "image/jpg",
    "jpeg": "image/jpg",    
    "gif":  "image/gif",
    "bmp":  "image/bmp",
    "svg":  "image/svg+xml",
    "tif":  "image/tiff",
    "tiff":  "image/tiff",
    
    //audio
    "mp3":  "audio/mpeg3",
    "wav":  "audio/wav",
    "ogg":  "audio/ogg",
    "oga":  "audio/ogg",
    "spx":  "audio/ogg",
    "mp4a": "audio/mp4",
    "mid":  "audio/midi",
    "midi": "audio/midi",
    "aac":  "audio/x-aac",
    "aif":  "audio/x-aiff",
    "aiff": "audio/x-aiff",
    "aifc": "audio/x-aiff",
    
}

http.createServer(function(req, response) {
    let pathname = url.parse(req.url).pathname.substr(1); //remove left '/'
    
    if(pathname == ""){
        pathname = "index.html";
    }    

    if(pathname.startsWith("pornhub/")){
        const vid = pathname.substr(8);
        const x = got.stream('https://www.pornhub.com/embed/' + vid);
        req.pipe(x);
        x.pipe(response);
        
        return;
    }
    
    if(pathname.endsWith("/")){
        const newUrl = req.url.substr(0, req.url.length - 1);
        response.statusCode = 301;
        response.setHeader('Content-Type', 'text/plain');
        response.setHeader('Location', newUrl);
        response.end('Redirecting to ' + newUrl);
        return;
    }    
    
    let tarPath = "./www/client/";

    if(pathname.startsWith("popup/")){
        tarPath = "../";
    }    
        
    let splitPath = pathname.split(".");
    if(splitPath.length <= 1){
        pathname += '.html';
        splitPath.push('html');
    }
    
    tarPath += pathname;
    
    let contentName = splitPath[splitPath.length - 1];

    let contentType = contentMap[contentName];
    
    if(typeof contentType == 'undefined'){
        contentType = "text/plain";
    }
    
    fs.readFile(tarPath, "binary", function(error, file) {
        if(error) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            //response.write("Page Not Found.\n");
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
    if(setting.logToFile){
        if (!fs.existsSync('../chat_logs')) {
            fs.mkdirSync('../chat_logs');
        }        
        fs.appendFile("../chat_logs/" + getCurDateStr() + ".log", 
        "[" + getCurTimeStr() + "] <" + user + "> " + msg + "\r\n", (err) => {
            if(err) {                
                return console.log(err);
            }
        });        
    }
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
    
    clients.push(connection);
    
    console.log((new Date()) + ' Connection accepted.');
    //console.log(clients);

    connection.sendUTF(JSON.stringify({
        type:'action',
        toDo: "initialSet",
        lang: setting.language,
        sfxVolume: setting.sfxVolume,
        voiceVolume: setting.voiceVolume,
        musicVolume: setting.musicVolume,
        topDonateMsg: curTopDonateMsg, 
        defaultShowVideo: setting.defaultShowVideo
    })); //send welcome message         
    
    
    /* 
    //no need to receive message anymore
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
    */
    
    // user disconnected
    connection.on('close', function(e) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        
        // remove user from the list of connected clients
        const index = clients.indexOf(connection);
        if(index > -1){
            clients.splice(index, 1);
        }
        
    });
});

function broadcastMsg(jsonObj){
    if(jsonObj.type == 'chat'){
        logToFile(jsonObj.userName, jsonObj.msgText);
    }
    for (let i = 0; i < clients.length; i++) {
        clients[i].sendUTF(JSON.stringify(jsonObj));      
    }
}