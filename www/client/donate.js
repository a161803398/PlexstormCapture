const speakVoice = "Chinese Female";
const donateBuffer = [];

const donateDiv = document.getElementById("donateDiv");
const donateInfo = document.getElementById("donateInfo");
const donateImg = document.getElementById("donateImg");

const hasVoiceSupport = responsiveVoice.voiceSupport();

let curDonateSfx = null;

let sfxVolume = 100, voiceVolume = 100;

if(hasVoiceSupport){
    responsiveVoice.speak("", speakVoice);  //speak empty message first to reduce latency
}

function popDonate(){
    donateBuffer.shift();
    if(donateBuffer.length > 0){ //still has other donation
        showDonate.call(this, donateBuffer[0]);
    }       
}

onPlayEnd = popDonate; //set endYtVideo to call popDonate

function forceStopDonate(){
    donateDiv.style.display = 'none';
    
    if(curDonateSfx != null){
        curDonateSfx.pause();
        curDonateSfx = null;
    }
    
    if(responsiveVoice.isPlaying()) {  
        responsiveVoice.cancel();    
    }
    
    endYtVideo(); //will also call popDonate
    //popDonate();
}

function chkVideoPlay(jsonMsg){
    if(typeof jsonMsg.vid == "undefined" || jsonMsg.vid == null){
        fade(donateDiv, popDonate); 
        return;
    }
    fade(donateDiv); 
    playVideo(jsonMsg.vid, jsonMsg.playTime, jsonMsg.startTime);
}

function showDonate(jsonMsg){
    donateInfo.innerHTML = donateTemplate[jsonMsg.toShow].text.replace('{USER_ID}', jsonMsg.userName).replace('{PD_AMOUNT}', jsonMsg.pdAmount);
    curDonateSfx = new Audio();
    donateImg.src = "img/" + donateTemplate[jsonMsg.toShow].img;
    curDonateSfx.src = "sound/" + donateTemplate[jsonMsg.toShow].sound;
    curDonateSfx.volume = sfxVolume / 100;
    
    curDonateSfx.addEventListener('ended', ()=> {
        curDonateSfx = null;
        if(hasVoiceSupport && jsonMsg.preMsg != ""){            
            responsiveVoice.speak(jsonMsg.preMsg, speakVoice, {
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
    console.log(jsonMsg);
    if(donateBuffer.length == 1){ //only 1
        showDonate.call(this, jsonMsg);
    } //else wait until pre-donation finished
}



setUpWs((jsonMsg)=>{
    if(jsonMsg.type == 'chat' && jsonMsg.msgType == 3){
        pushDonate(jsonMsg);
    }else if(jsonMsg.type == 'action'){
        if(jsonMsg.toDo == 'stopCurDonate'){
            forceStopDonate();
        }else if(jsonMsg.toDo == 'setVolume'){
            sfxVolume = jsonMsg.sfxVolume;
            voiceVolume = jsonMsg.voiceVolume;
            
            if(curDonateSfx != null){
                curDonateSfx.volume = sfxVolume / 100;
            } 
            setYtVolume(jsonMsg.musicVolume);
        }
    }
}, (e)=>{
    console.log("Connection lost.");
});