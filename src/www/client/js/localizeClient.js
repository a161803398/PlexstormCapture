const langList = {
    "en_US": {        
        speakVoice: "US English Female",
        ui: {        
            loadingVideoHint: "Loading video...",
            connectText: "Connecting to local server...",
            
        },
        msg:{
            system: "System",
            connectToLoaclServer: "Connected to local server.",
            disconnectFromLoaclServer: "Disconnected from local server!",
        }         
    },  
    
    "zh_TW": {
        speakVoice: "Chinese Female",
        ui: {        
            loadingVideoHint: "正在載入影片...",
            connectText: "嘗試連線到本機伺服器...",
            
        },
        msg:{
            system: "系統",
            connectToLoaclServer: "已連線到本機伺服器。",
            disconnectFromLoaclServer: "已斷開與本機伺服器間連線！",        
        }          
    },
    
};

function getDefaultLang(){
    const browserLang = navigator.language || navigator.userLanguage;
    if(browserLang in langList){
        return browserLang;
    }else{
        return "en_US";
    }
}

let curLang = langList[getDefaultLang()];

function updateUiLang(){
    for(let elId in curLang.ui){
        const tarEl = document.getElementById(elId);
        if(tarEl !== null){
            tarEl.innerHTML = curLang.ui[elId];            
        }
    }    
}

function setLang(lang){
    curLang = langList[lang];
    updateUiLang();
}

function escapeHtml(str) {
   return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

