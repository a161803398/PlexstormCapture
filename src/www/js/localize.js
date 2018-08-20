const osLocale = require('os-locale');

const langList = {
    "en_US": {
        name: "English(US)",       
        ui: {
            loadChatBtn: "Start Capturing",
            captureHint: "Please Wait...",
            donateTestHint: "Test donate popup:",
            donateTestBtn: "Test Donate",
            subscriptTestHint: "Test subscript popup:",
            subscriptTestBtn: "Test Subscript",
            playTimeHint1: "Donate 1PD for",
            playTimeHint2: "ms video playing time",
            musicDonateTestBtn: "Test YouTube Video",
            phFastDonateTestBtn: "Test Pornhub Video",
            stopBtn: "Terminate donate popup",
            showHideBtn: "Show/Hide donate Video",
            languageHint: "Language:",
            sfxVolumeHint: "SFX Volume:",
            voiceVolumeHint: "Voice Volume:",
            musicVolumeHint: "Video Volume:",
            readMsgChkHint: "Read Donate Message",
            playYTChkHint: "Play YouTube Video",
            playPHChkHint: "Play Pornhub Video",
            defaultShowVideoChkHint: "Show Video by default",
            logToFileChkHint: "Save chat records to files",
            chatUrlHint: "Chat Room: ",
            donateUrlHint: "Donation: ",
            subscriptUrlHint: "Subscription: ",
            topDonateUrlHint: "Top Donate: ",
            recordsHint: "Chat records save in chat_logs folder",
            donateLink: "Support development: www.patreon.com/a1618",
            alwaysOnTopChkHint: "Window always On Top",
            autoScrollChkHint: "Auto Scrolling",
            
        },
        msg:{
            system: "System",  
            inputStreamHint: "Please input your PlexStorm streaming url(Make sure that the streaming is started)",  
            captureError: "Cannot capture chat room, please make sure that the streaming is started!!",
            connectToChatRoom: "Connect to chat room.",
            donate: "Donate ",
            subscript: "Subscript this chanel.",
            testDonateMsg: "Test donate message from a161803398.",
            testSubscriptMsg: "Test subscript message from a161803398.",
            testYouTubeDonateMsg: "Test YouTube Video https://youtu.be/q0ygjD04vyU?t=21", 
            testPornHubDonateMsg: "Test Pornhub Video https://www.pornhub.com/view_video.php?viewkey=ph5927a4224b1bb", 
        }
    },  
    
    "zh_TW": {
        name: "中文(台灣)",       
        ui: {        
            loadChatBtn: "開始擷取",
            captureHint: "擷取中請稍後...",
            donateTestHint: "測試贊助圖:",
            donateTestBtn: "測試贊助",
            subscriptTestHint: "測試訂閱圖:",
            subscriptTestBtn: "測試訂閱",
            playTimeHint1: "每贊助1PD就播放",
            playTimeHint2: "ms的影片",
            musicDonateTestBtn: "測試YouTube點歌",
            phFastDonateTestBtn: "測試Pornhub影片",
            stopBtn: "停止目前贊助訊息",
            showHideBtn: "顯示/隱藏贊助影片",
            languageHint: "語言設定：",
            sfxVolumeHint: "特效音量：",
            voiceVolumeHint: "語音音量：",
            musicVolumeHint: "影片音量：",
            readMsgChkHint: "念出贊助或訂閱前留言",
            playYTChkHint: "播放YouTube點歌",
            playPHChkHint: "播放Pornhub影片",
            defaultShowVideoChkHint: "預設顯示贊助影片",
            logToFileChkHint: "儲存聊天室紀錄",
            chatUrlHint: "聊天室網址: ",
            donateUrlHint: "贊助圖網址: ",
            subscriptUrlHint: "訂閱圖網址: ",
            topDonateUrlHint: "贊助跑馬燈網址: ",
            recordsHint: "聊天室紀錄儲存於程式的chat_logs資料夾中",
            donateLink: "贊助本程式開發: www.patreon.com/a1618",
            alwaysOnTopChkHint: "最上層顯示視窗",
            autoScrollChkHint: "自動捲動下方訊息",
            
        },
        msg:{
            system: "系統",
            inputStreamHint: "請輸入PlexStorm的實況網址(請確定目前處於開台狀態)",  
            captureError: "無法擷取聊天室，請確定目前處於開台狀態！！", 
            donate: "贊助了",            
            subscript: "訂閱了本頻道",            
            connectToChatRoom: "已連線到聊天室。",
            testDonateMsg: "來自a161803398的測試贊助",
            testSubscriptMsg: "來自a161803398的測試訂閱",            
            testYouTubeDonateMsg: "贊助音樂測試https://youtu.be/q0ygjD04vyU?t=21",            
            testPornHubDonateMsg: "贊助Pornhub影片測試https://www.pornhub.com/view_video.php?viewkey=ph5927a4224b1bb",            
        }        
    },
    
};

function getDefaultLang(){
    const osLang = osLocale.sync();
    if(osLang in langList){
        return osLang;
    }else{
        return "en_US";
    }
}

let curLang = langList[getDefaultLang()];

function updateUiLang(){
    curLang = langList[setting.language];
    for(let elId in curLang.ui){
        const tarEl = document.getElementById(elId);
        if(tarEl !== null){
            tarEl.innerHTML = curLang.ui[elId];            
        }
    }    
}

function escapeHtml(str) {
   return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
