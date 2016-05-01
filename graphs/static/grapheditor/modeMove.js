// Adapted from http://dmitrybaranovskiy.github.io/raphael/graffle.html

//Start drag function
function dragger() {
    if (MODE == 'MOVE') {
    this.activitySet.forEach(function(elem) {
        switch(elem.type) {
        case 'rect': this.rectox = elem.attr("x"); this.rectoy = elem.attr("y"); break;
        case 'text': this.textox = elem.attr("x") + actWidth/2; this.textoy = elem.attr("y") + actHeight/2; break;
        }
    });}
}

//Drag function
function move(dx, dy) {
    if (MODE == 'MOVE') {
    this.activitySet.forEach(function(elem) {
        switch(elem.type) {
        case 'rect': elem.attr({x: this.rectox + dx, y: this.rectoy + dy}); break;
        case 'text': elem.attr({x: this.textox + dx - actWidth/2, y: this.textoy + dy - actHeight/2}); break;
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
        case 'text': this.textoy = elem.attr('y'); elem.attr({y: reposition(this.textoy - actHeight/2) + actHeight/2});; break;
        }
    });
    for (var i = connections.length; i--;) {
        graph.connection(connections[i]);
    }}
}

//reposition Y 
function reposition(oldy) {
    for (var i = nPlanes; i > 0; i--) {
        if (oldy < i*interPlanes + interPlanes/2 - actHeight/2) {
            newy = i*interPlanes - actHeight/2;
        }
    };
    return newy;
}
