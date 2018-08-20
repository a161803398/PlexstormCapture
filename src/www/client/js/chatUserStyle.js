const userTypeList = ["type-normal", "type-streamer", "type-moderator", "type-tip", "type-subscription"];
const sexList = ["color-male", "color-female", "color-trans"];

const userNameColors = [
    '#20B2AA',
    '#228B22',
    '#DAA520',
    '#1E90FF',
    '#9932CC',
    '#DC143C',
    '#40C4FF',
    '#F05252',
    '#FFD740',
    '#536DFE',	
    '#00E676',
    '#A9A9A9',
    '#E040FB',	
    '#FFAB40',	
    '#7FFF00',
    '#FFC0CB',
    '#FF0000',	
    '#CDCDFF',
    '#F4FF81',		
    '#00FFFF',	
    '#A1887F',
    '#AFFFA4',
    '#E23FB2',	
    '#00FF00',	
    '#7C4DFF',	
    '#FFFFCA',
    '#FF0081',
    '#B2FF59',	
    '#448AFF',		
    '#FFB259',
    '#69FFAE',	
    '#FF00FF',	
    '#64F0DA',	
    '#FF3D00',	
    '#65FF65',
    '#D2B48C',
];

const systemColor = '#FFFF00';

function getChatColor(ucid){
    if(ucid >= 0){
        return userNameColors[(ucid % userNameColors.length)];        
    }else{
        return systemColor;
    }    
}

function addMsg(jsonMsg, path2Img){
    if(jsonMsg.type != 'chat') return;
    
    let preImgName = null;
    
    let imgName = 'star'; //default image for system message
    if(typeof jsonMsg.ucid == "undefined"){
        jsonMsg.ucid = -1; //use default color and image
    }else{
        
        if(jsonMsg.msgType == 1){ //streamer
            preImgName = 'recorder';
        }else if(jsonMsg.msgType == 2){ //moderator
            preImgName = 'sword';
        }
        
        if(jsonMsg.userSex == 0){
            imgName = 'male';
        }else if(jsonMsg.userSex == 1){
            imgName = 'female';   
        }else{        
            imgName = 'bisex';                 
        }
    }
    
    const newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.classList.add("type-normal");
    
    if(typeof jsonMsg.userName == "undefined"){
        newRow.innerHTML = '<p>' + escapeHtml(jsonMsg.msgText) + '</p>'; //message only
    }else{
        newRow.classList.add(userTypeList[jsonMsg.msgType]);
        
        newRow.innerHTML = '<div class="' + sexList[jsonMsg.userSex] + '" style="color:' + getChatColor(jsonMsg.ucid) + '">' + 
            (preImgName != null ? '<img src="' + path2Img + imgName +'.png"></img>' : '') +
            '<img src="' + path2Img + imgName +'.png"></img>' +            
            escapeHtml(jsonMsg.userName) + ': </div>' +
            '<p>' + escapeHtml(jsonMsg.msgText) + '</p>';
    }   
    content.appendChild(newRow);    
}