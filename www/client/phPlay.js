const pFrame = document.getElementById('pFrame');
pFrame.style.display = 'none';

const phInfo = {
    volume: 1.0,
    onPlayEnd: null,
    curTimeout: null,
    player: null
};

function stopPhVideo() {
    pFrame.src = "about:blank";
    clearTimeout(phInfo.curTimeout);
    phInfo.curTimeout = null;
    phInfo.player = null;
    videoLoadHint.style.display = 'none';
    pFrame.style.display = 'none';
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
    pFrame.src = "http://localhost:1069/pornhub/" + vid; //There is a redirection in local server to work around the Same-origin policy(Sort of).
    videoLoadHint.style.display = '';
    pFrame.onload = ()=>{
        pFrame.onload = null;        
        const tarVideo = pFrame.contentDocument.getElementsByTagName("video")[0];        
        if(typeof tarVideo == 'undefined'){ //cannot load website
            endPhVideo();
        }else{
            phInfo.player = tarVideo;            
            tarVideo.currentTime = startTime;
            phInfo.player.volume = phInfo.volume;
            tarVideo.play();            
            tarVideo.oncanplay = function() {
                pFrame.style.display = '';
                videoLoadHint.style.display = 'none';
                console.log("video can play!!");
                tarVideo.oncanplay = null;
                phInfo.curTimeout = setTimeout(endPhVideo, playTime);        
            };
            
        }        
    };
}