const donateBuffer = [];

const donateDiv = document.getElementById("donateDiv");
const donateInfo = document.getElementById("donateInfo");
const donateImg = document.getElementById("donateImg");
const connectHint = document.getElementById("connectHint");

const hasVoiceSupport = responsiveVoice.voiceSupport();
let curDonateSfx = null;

let sfxVolume = 100, voiceVolume = 100;

if(hasVoiceSupport){
    responsiveVoice.speak("", curLang.speakVoice);  //speak empty message first to reduce latency
}

function endDonate(){
    fade(donateDiv, ()=> {
        donateBuffer.shift();
        if(donateBuffer.length > 0){ //still has other donation
            showDonate.apply(this, donateBuffer[0]);
        }
    });            
}

function showDonate(userId, toShow, preMsg){
    donateInfo.innerHTML = subscriptTemplate[toShow].text.replace('{USER_ID}', userId);
    curDonateSfx = new Audio();
    
    donateImg.src = "img/" + subscriptTemplate[toShow].img;
    curDonateSfx.src = "sound/" + subscriptTemplate[toShow].sound;
    curDonateSfx.volume = sfxVolume / 100;
    
    
    curDonateSfx.addEventListener('ended', ()=> { 
        curDonateSfx = null;    
        if(hasVoiceSupport && preMsg != ""){                 
            responsiveVoice.speak(preMsg, curLang.speakVoice, {
            volume: voiceVolume / 100,    
            onend: ()=>{
                setTimeout(endDonate, 1000);            
            }});                
        }else{
            setTimeout(endDonate, 1000);   
        }
    });  
    
    curDonateSfx.addEventListener('canplay', ()=> {
        unfade(donateDiv, ()=>{
            curDonateSfx.play();
        });
    }); 
}

function pushDonate(userId, toShow, preMsg){
    const donateInfo = [userId, toShow, preMsg];
    donateBuffer.push(donateInfo);
    if(donateBuffer.length == 1){ //only 1
        showDonate.apply(this, donateInfo);
    } //else wait until pre-donation finished
}

function setVolume(jsonMsg){
    sfxVolume = jsonMsg.sfxVolume;
    voiceVolume = jsonMsg.voiceVolume;
    if(curDonateSfx != null){
        curDonateSfx.volume = sfxVolume / 100;
    }     
}

updateUiLang();

setUpWs((jsonMsg)=>{
    if(jsonMsg.type == 'chat'){
        if(jsonMsg.msgType == 4){
            pushDonate(jsonMsg.userName, jsonMsg.rndNum % subscriptTemplate.length, jsonMsg.preMsg);
        }
    }else if(jsonMsg.type == 'action'){
        if(jsonMsg.toDo == 'initialSet'){ //connect success
            connectHint.style.display = 'none';
            setLang(jsonMsg.lang);
            setVolume(jsonMsg);            
        }else if(jsonMsg.toDo == 'setLang'){
            setLang(jsonMsg.lang);
        }else if(jsonMsg.toDo == 'setVolume'){
            setVolume(jsonMsg);
        }
    }
}, (e)=>{
    connectHint.style.display = '';
    console.log("Connection lost.");
});

