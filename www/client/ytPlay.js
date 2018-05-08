let tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let ytApiLoaded = false;

let ytPlayer = null;
let ytPlayerFrame = null;
let playTime = 0;
let isPlaying = false;
let curTimeout = null;

let onPlayEnd = null;


function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('ytPlayer', {
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
    ytPlayerFrame = document.getElementById("ytPlayer");
    ytPlayerFrame.style.display = 'none';
    ytApiLoaded = true;     
}

function setYtVolume(val){
    if(ytApiLoaded){
        ytPlayer.setVolume(val);              
    }else{
        setTimeout(()=>{
            setYtVolume(val);
        }, 1000); //check if api ready after 1 second
    }          
}

function playVideo(vid, time, startTime){
    if(ytApiLoaded){
        ytPlayerFrame.style.display = '';
        playTime = time;
        ytPlayer.loadVideoById({videoId: vid, startSeconds: startTime});
        isPlaying = false;                
    }else{
        setTimeout(()=>{
            playVideo(vid, time, startTime);
        }, 1000); //check if api ready after 1 second
    }                
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !isPlaying) {
        curTimeout = setTimeout(endYtVideo, playTime);
        isPlaying = true;
    }
}

function endYtVideo() {
    ytPlayer.stopVideo();
    clearTimeout(curTimeout);
    curTimeout = null;
  
    ytPlayerFrame.style.display = 'none';
    isPlaying = false;
    onPlayEnd();
}