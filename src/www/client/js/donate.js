const donateBuffer = [];

const donateDiv = document.getElementById("donateDiv");
const donateInfo = document.getElementById("donateInfo");
const donateImg = document.getElementById("donateImg");
const videoLoadHint = document.getElementById("videoLoadHint");
const connectHint = document.getElementById("connectHint");

const hasVoiceSupport = responsiveVoice.voiceSupport();
let defaultShowVideo = true;
let nextShowVideo = true;

let curDonateSfx = null;
let sfxVolume = 100, voiceVolume = 100;

if(hasVoiceSupport){
    responsiveVoice.speak("", curLang.speakVoice);  //speak empty message first to reduce latency
}

function popDonate(){
    console.log(donateBuffer);
    donateBuffer.shift();
    if(donateBuffer.length > 0){ //still has other donation
        showDonate(donateBuffer[0]);
    }       
}
phInfo.onPlayEnd = popDonate;
ytInfo.onPlayEnd = popDonate; //set endYtVideo to call popDonate

function forceStopDonate(){
    donateDiv.style.display = 'none';
    
    if(curDonateSfx != null){
        curDonateSfx.pause();
        curDonateSfx = null;
    }
    
    if(responsiveVoice.isPlaying()) {  
        responsiveVoice.cancel();    
    }    
    videoLoadHint.style.display = 'none';
    stopYtVideo();
    stopPhVideo();
    popDonate();
}

function chkVideoPlay(jsonMsg){
    console.log(jsonMsg);
    if(typeof jsonMsg.vid == "undefined" || jsonMsg.vid == null){
        fade(donateDiv, popDonate); 
        return;
    }
    fade(donateDiv); 
    if(jsonMsg.videoType =="YouTube"){
        loadYtVideo(jsonMsg.vid, jsonMsg.playTime, jsonMsg.startTime);
    }else if(jsonMsg.videoType =="PornHub"){
        loadPhVideo(jsonMsg.vid, jsonMsg.playTime, jsonMsg.startTime);
    }
}

function showDonate(jsonMsg){
    nextShowVideo = defaultShowVideo;
    donateInfo.innerHTML = donateTemplate[jsonMsg.toShow].text.replace('{USER_ID}', '<span class="hightlight">' + escapeHtml(jsonMsg.userName) + '</span>').replace('{PD_AMOUNT}', '<span class="hightlight">' + jsonMsg.pdAmount + 'PD</span>');
    curDonateSfx = new Audio();
    donateImg.src = ""; //reset donate image
    donateImg.src = "/popup/img/" + donateTemplate[jsonMsg.toShow].img;
    curDonateSfx.src = "/popup/sound/" + donateTemplate[jsonMsg.toShow].sound;
    curDonateSfx.volume = sfxVolume / 100;
    
    curDonateSfx.addEventListener('ended', ()=> {
        curDonateSfx = null;
        if(hasVoiceSupport && jsonMsg.preMsg != ""){            
            responsiveVoice.speak(jsonMsg.preMsg, curLang.speakVoice, {
                volume: voiceVolume / 100,
                onend: ()=>{
                    chkVideoPlay(jsonMsg);      
                }
            });                 
        }else{                 
            chkVideoPlay(jsonMsg);  
        }
    });  
    
    curDonateSfx.addEventListener('canplay', ()=> {
        unfade(donateDiv, ()=>{
            curDonateSfx.play();
        });
    }); 
}

function pushDonate(jsonMsg){   
    jsonMsg.toShow = jsonMsg.rndNum % donateTemplate.length;
    donateBuffer.push(jsonMsg);
    //console.log(jsonMsg);
    if(donateBuffer.length == 1){ //only 1
        showDonate.call(this, jsonMsg);
    } //else wait until pre-donation finished
}


function setVolume(jsonMsg){
    sfxVolume = jsonMsg.sfxVolume;
    voiceVolume = jsonMsg.voiceVolume;
    
    if(curDonateSfx != null){
        curDonateSfx.volume = sfxVolume / 100;
    } 
    setYtVolume(jsonMsg.musicVolume);
    setPhVolume(jsonMsg.musicVolume);    
}

updateUiLang();

setUpWs((jsonMsg)=>{
    if(jsonMsg.type == 'chat'){
        if(jsonMsg.msgType == 3){
            pushDonate(jsonMsg);
        }
    }else if(jsonMsg.type == 'action'){
        if(jsonMsg.toDo == 'initialSet'){ //connect success
            connectHint.style.display = 'none';
            defaultShowVideo = jsonMsg.defaultShowVideo;
            setLang(jsonMsg.lang);
            setVolume(jsonMsg);            
        }else if(jsonMsg.toDo == 'setLang'){
            setLang(jsonMsg.lang);
        }else if(jsonMsg.toDo == 'stopCurDonate'){
            forceStopDonate();
        }else if(jsonMsg.toDo == 'setVolume'){
            setVolume(jsonMsg);
        }else if(jsonMsg.toDo == 'setDefaultShowVideo'){
            defaultShowVideo = jsonMsg.defaultShowVideo;
        }else if(jsonMsg.toDo == 'toggleVideoDisplay'){
            nextShowVideo = !nextShowVideo;
            toggleYtDisplay();
            togglePhDisplay();
        }
    }
}, (e)=>{
    console.log("Connection lost.");
    connectHint.style.display = '';
});