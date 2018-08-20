function fade(element, callback) {
    var op = 1;  // initial opacity
    var timer = setInterval(()=> {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
            if(typeof callback == "function"){
                callback();
            }
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 30);
}
function unfade(element, callback) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(()=> {
        if (op >= 1){
            clearInterval(timer);
            if(typeof callback == "function"){
                callback();
            }
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 20);
}