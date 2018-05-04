const donateBuffer = [];

const donateDiv = document.getElementById("donateDiv");
const donateInfo = document.getElementById("donateInfo");
const donateImg = document.getElementById("donateImg");

function showDonate(userId, pdAmount, toShow){
    donateInfo.innerHTML = donateTemplate[toShow].text.replace('{USER_ID}', userId).replace('{PD_AMOUNT}', pdAmount);
    const donateSfx = new Audio();
    donateImg.src = "img/" + donateTemplate[toShow].img;
    donateSfx.src = "sound/" + donateTemplate[toShow].sound;

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

function pushDonate(userId, pdAmount, toShow){
    const donateInfo = [userId, pdAmount, toShow];
    donateBuffer.push(donateInfo);
    if(donateBuffer.length == 1){ //only 1
        showDonate.apply(this, donateInfo);
    } //else wait until pre-donation finished
}

setUpWs((jsonMsg)=>{
    if(jsonMsg.type == 'chat' && jsonMsg.msgType == 3){
        pushDonate(jsonMsg.userName, jsonMsg.pdAmount, jsonMsg.rndNum % donateTemplate.length);
    }
}, (e)=>{
    console.log("Connection lost.");
});