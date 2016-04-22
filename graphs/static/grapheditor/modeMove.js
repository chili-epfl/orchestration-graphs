// Adapted from http://dmitrybaranovskiy.github.io/raphael/graffle.html

//Start drag function
function dragger() {
    if (MODE == 'MOVE') {
    this.activitySet.forEach(function(elem) {
        switch(elem.type) {
        case 'rect': this.rectox = elem.attr("x"); this.rectoy = elem.attr("y"); break;
        case 'text': this.textox = elem.attr("x") + 30; this.textoy = elem.attr("y") + 20; break;
        }
    });}
}

//Drag function
function move(dx, dy) {
    if (MODE == 'MOVE') {
    this.activitySet.forEach(function(elem) {
        switch(elem.type) {
        case 'rect': elem.attr({x: this.rectox + dx, y: this.rectoy + dy}); break;
        case 'text': elem.attr({x: this.textox + dx - 30, y: this.textoy + dy - 20}); break;
        }
    });
    for (var i = connections.length; i--;) {
        graph.connection(connections[i]);
    }
    //r.safari();
    }
}

//End drag function
function up() {
    if (MODE == 'MOVE') {
    this.activitySet.forEach(function(elem) {
        switch(elem.type) {
        case 'rect': this.rectoy = elem.attr('y'); elem.attr({y: reposition(this.rectoy)}); break;
        case 'text': this.textoy = elem.attr('y'); elem.attr({y: reposition(this.textoy - 20) + 20});; break;
        }
    });
    for (var i = connections.length; i--;) {
        graph.connection(connections[i]);
    }}
}

//reposition Y 
function reposition(oldy) {
    if (oldy < 67)          return 30;
    else if (oldy < 142)    return 105;
    else if (oldy < 217)    return 180;
    else if (oldy < 292)    return 255;
    else if (oldy < 367)    return 330;
    else                    return 405;
}
