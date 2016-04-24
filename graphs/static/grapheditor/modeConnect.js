/**
 * Selects an existing activity set to create a connection
 *
 */
function selectActivity(activitySet) {
    // Select/Deselect the activity
    if (activitySet[0].selected == false) {
        activitySet.forEach(function(elem) {
            elem.selected = true;
            if (elem.type === 'rect') {
                elem.attr({fill: activitySelectFill});
                selectedActRect.push(elem);
            }
        });
    } else {
        deselectActivity(activitySet);
    }
    // When two activities are selected and not already connected, connect them
    if (selectedActRect.length == 2 && checkConnection) {
        connectActivities();
        deselectAllActivities();
    }
}

/**
 * Deselects a selected activity set
 *
 */
function deselectActivity(activitySet) {
    activitySet.forEach(function(elem) {
        elem.selected = false;
        if (elem.type === 'rect') {
            elem.attr({fill: activityFill});
            selectedActRect.exclude(elem);
        }
    });
}

/**
 * Checks if a connection between the two selected activities is valid
 *
 */
function checkConnection() {
    var existingConnections = 0;
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].from.id == selectedActRect[0].id && connections[i].to.id == selectedActRect[1].id) {
            existingConnections ++;
        }
    }
    return existingConnections == 0;
}

/**
 * Creates a new connection between the two selected activities
 *
 */
function connectActivities(description) {
    newConnection = graph.connection(selectedActRect[0], selectedActRect[1]);
    newConnection.line.attr({title: description});
    newConnection.line.startingRect = selectedActRect[0].id;
    newConnection.line.endingRect = selectedActRect[1].id;
    connections.push(newConnection);
    
    graphJson["edges"].push({
        "a1": {
            "id": selectedActRect[0].dbid,
            "counter": selectedActRect[0].counter
        }, 
        "a2": {
            "id": selectedActRect[1].dbid,
            "counter": selectedActRect[1].counter
        }
    });

    newConnection.line.click(function (event) {
        handleClickOnConnection(event, this);  // ERASE mode
    });
    changeMode('MOVE');
}

/**
 * Deselect all activities (called after a connection and when leaving 'connect' mode)
 *
 */
function deselectAllActivities() {
    activities.forEach(function(activitySet) {
        deselectActivity(activitySet);
    });
}

/**
 * Custom Raphael connection function, adapted from http://dmitrybaranovskiy.github.io/raphael/graffle.html
 *
 */
Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({"arrow-end": "classic-wide-long", stroke: color, "stroke-width": 3, fill: "none"}),
            from: obj1,
            to: obj2
        };
    }
};