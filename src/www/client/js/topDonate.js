const marqueeText = document.getElementById("marqueeText");
const marqueeText2 = document.getElementById("marqueeText2");

function setText(val){
    marqueeText.innerHTML = val + "&nbsp;";
    marqueeText2.innerHTML = val + "&nbsp;";
    checkScrolling();       
}

function checkScrolling(){
    if(marqueeText.offsetWidth > window.innerWidth){
        marqueeText.classList.add('runAnim');    
        marqueeText2.style.display = '';            
    }else{
        marqueeText.classList.remove('runAnim');        
        marqueeText2.style.display = 'none';    
    }
}

setUpWs((jsonMsg)=>{
    if(jsonMsg.type == 'action'){
        if(jsonMsg.toDo == 'initialSet' || jsonMsg.toDo == 'setTopDonate'){
            setText(jsonMsg.topDonateMsg);
        }
    }
}, (e)=>{
    marqueeText.innerHTML = curLang.msg["disconnectFromLoaclServer"];
    console.log("Connection lost.");
});

checkScrolling();
window.addEventListener("resize", checkScrolling);
