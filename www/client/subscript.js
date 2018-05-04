const donateBuffer = [];

const donateDiv = document.getElementById("donateDiv");
const donateInfo = document.getElementById("donateInfo");
const donateImg = document.getElementById("donateImg");

function showDonate(userId, toShow){
    donateInfo.innerHTML = subscriptTemplate[toShow].text.replace('{USER_ID}', userId);
    const donateSfx = new Audio();
    donateImg.src = "img/" + subscriptTemplate[toShow].img;
    donateSfx.src = "sound/" + subscriptTemplate[toShow].sound;

    donateSfx.addEventListener('ended', ()=> {
        setTimeout(()=>{
            fade(donateDiv, ()=> {
                donateBuffer.shift();
                if(donateBuffer.length > 0){ //still has other donation
                    showDonate.apply(this, donateBuffer[0]);
                }
            });
        }, 1000);
    });
    
    donateSfx.addEventListener('canplay', ()=> {
        unfade(donateDiv, ()=>{
            donateSfx.play();
        });
    }); 
}

function pushDonate(userId, toShow){
    const donateInfo = [userId, toShow];
    donateBuffer.push(donateInfo);
    if(donateBuffer.length == 1){ //only 1
        showDonate.apply(this, donateInfo);
    } //else wait until pre-donation finished
}

setUpWs((jsonMsg)=>{
    if(jsonMsg.type == 'chat' && jsonMsg.msgType == 4){
        pushDonate(jsonMsg.userName, jsonMsg.rndNum % subscriptTemplate.length);
    }
}, (e)=>{
    console.log("Connection lost.");
});