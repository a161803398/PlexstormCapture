const phInfo = {
    volume: 1.0,
    onPlayEnd: null,
    curTimeout: null,
    player: null,
    playerFrame: document.getElementById('pFrame')
};

phInfo.playerFrame.style.display = 'none';

function stopPhVideo() {
    phInfo.playerFrame.src = "about:blank";
    clearTimeout(phInfo.curTimeout);
    phInfo.curTimeout = null;
    phInfo.player = null;
    videoLoadHint.style.display = 'none';
    phInfo.playerFrame.style.display = 'none';
}

function setPhVisible(toShow){
    if(toShow && phInfo.player != null){
        phInfo.playerFrame.style.display = '';
    }else{
        phInfo.playerFrame.style.display = 'none';
    }
}

function togglePhDisplay(){
    if(phInfo.player != null && nextShowVideo){
        phInfo.playerFrame.style.display = '';
    }else{
        phInfo.playerFrame.style.display = 'none';
    } 
}

function endPhVideo() {
    stopPhVideo();
    phInfo.onPlayEnd();
}

function setPhVolume(val){
    phInfo.volume = val / 100;
    if(phInfo.player != null){
        phInfo.player.volume = phInfo.volume;
    }
}

function loadPhVideo(vid, playTime, startTime){
    phInfo.playerFrame.src = "http://localhost:1069/pornhub/" + vid; //There is a redirection in local server to work around the Same-origin policy(Sort of).
    videoLoadHint.style.display = '';
    phInfo.playerFrame.onload = ()=>{
        phInfo.playerFrame.onload = null;        
        const tarVideo = phInfo.playerFrame.contentDocument.getElementsByTagName("video")[0];        
        if(typeof tarVideo == 'undefined'){ //cannot load website
            endPhVideo();
        }else{
            phInfo.player = tarVideo;            
            tarVideo.currentTime = startTime;
            phInfo.player.volume = phInfo.volume;
            tarVideo.play();            
            tarVideo.oncanplay = function() {
                if(nextShowVideo){
                    phInfo.playerFrame.style.display = '';                    
                }
                
                videoLoadHint.style.display = 'none';
                console.log("video can play!!");
                tarVideo.oncanplay = null;
                phInfo.curTimeout = setTimeout(endPhVideo, playTime);        
            };
            
        }        
    };
}

