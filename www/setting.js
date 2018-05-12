let setting = {
    alwaysOnTop: false,
    readMsg: true,
    playYT: true,
    playPH: true,
    playTimeUnit: 1000,
    autoScroll: true,
    sfxVolume: 100,
    voiceVolume: 100,
    musicVolume: 100,
    defaultUrl: "https://plexstorm.com/stream/hornydragon",
    language: getDefaultLang()
};

function loadSetting(){
    if(typeof localStorage['setting'] !== 'undefined'){
        const prevSetting = JSON.parse(localStorage['setting']);
        for(let key in prevSetting){
            setting[key] = prevSetting[key];
        }
    }
}
function saveSetting(){
    localStorage['setting'] = JSON.stringify(setting);
}
