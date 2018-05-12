let ytApiScript = document.createElement('script');
ytApiScript.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(ytApiScript, firstScriptTag);

const ytInfo = {
    apiLoaded: false,
    player: null,
    playerFrame: null,
    playTime: 0,
    isPlaying: false,
    curTimeout: null,
    onPlayEnd: null
};

function onYouTubeIframeAPIReady() {
    ytInfo.player = new YT.Player('ytPlayer', {
        height: '100%',
        width: '100%',
        playerVars: { 'autoplay': 1, 'controls': 0 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': endYtVideo
        }
    });
}

function onPlayerReady(event) {
    ytInfo.playerFrame = document.getElementById("ytPlayer");
    ytInfo.playerFrame.style.display = 'none';
    ytInfo.apiLoaded = true;     
}

function setYtVolume(val){
    if(ytInfo.apiLoaded){
        ytInfo.player.setVolume(val);              
    }else{
        setTimeout(()=>{
            setYtVolume(val);
        }, 1000); //check if api ready after 1 second
    }          
}

function loadYtVideo(vid, time, startTime){
    if(ytInfo.apiLoaded){
        ytInfo.playerFrame.style.display = '';
        ytInfo.playTime = time;
        ytInfo.player.loadVideoById({videoId: vid, startSeconds: startTime});
        ytInfo.isPlaying = false;                
    }else{
        setTimeout(()=>{
            loadYtVideo(vid, time, startTime);
        }, 1000); //check if api ready after 1 second
    }                
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !ytInfo.isPlaying) {
        ytInfo.curTimeout = setTimeout(endYtVideo, ytInfo.playTime);
        ytInfo.isPlaying = true;
    }
}

function stopYtVideo() {
    ytInfo.player.stopVideo();
    clearTimeout(ytInfo.curTimeout);
    ytInfo.curTimeout = null;
  
    ytInfo.playerFrame.style.display = 'none';
    ytInfo.isPlaying = false;
}

function endYtVideo() {
    stopYtVideo();
    ytInfo.onPlayEnd();
}