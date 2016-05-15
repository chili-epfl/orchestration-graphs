// Adapted from http://dmitrybaranovskiy.github.io/raphael/graffle.html

//Start drag function
function dragger() {
    this.activitySet.forEach(function(elem) {
        switch(elem.description) {
        case 'actDelCircle': elem.Ox = elem.attr("cx"); elem.Oy = elem.attr("cy"); break;
        default: elem.Ox = elem.attr("x"); elem.Oy = elem.attr("y"); break;
        }
    });
}

//Drag function
function move(dx, dy) {
    this.activitySet.forEach(function(elem) {
        switch(elem.description) {
        case 'actDelCircle': elem.attr({cx: elem.Ox + dx, cy: elem.Oy + dy}); break;
        default: elem.attr({x: elem.Ox + dx, y: elem.Oy + dy}); break;
        }
    });
    for (var i = connections.length; i--;) {
        graph.connection(connections[i]);
    }
    //r.safari();
}

//End drag function
function up() {
    this.activitySet.forEach(function(elem) {
        switch(elem.description) {
        case 'actText': elem.attr({y: reposition(elem.attr('y') - actHeight/2) + actHeight/2}); break;
        case 'actDelCircle': elem.attr({cy: reposition(elem.attr('cy'))}); break;
        default: elem.attr({y: reposition(elem.attr('y'))}); break;
        }
    });
    for (var i = connections.length; i--;) {
        graph.connection(connections[i]);
    }
    
    // Prevent the click handler on $('#graph') to create a new activity immediately after the drop
    preventActivityCreation = true;
    setTimeout(function(){preventActivityCreation = false;}, 0);
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
