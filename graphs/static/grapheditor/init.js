var graph, graphActivities;
var connections = [];
var selectedActRect;
var newActivityX, newActivityY;
var counterMap;
var form;

// Global design variables
var graphWidth = 2000;
var actHeight = 40;
var actWidth = 100;
var actRadius = 10;
var interPlanes = 50;
var nPlanes = 6;
var activityFill = "#FFFFFF";
var activitySelectFill = "#D4D4D4";
var activityTextColor = "#0080CF";
var activitySelectTextColor = "#26537A";
var possibleConnection = null;


/**
 * Executed on load:
 * - creates the graph with 6 planes
 * - initiates various handlers (click on buttons, graph, and export)
 */
window.onload = function () {
    // Creates a new graph
    graph = Raphael("graph", graphWidth, (nPlanes+1)*interPlanes);

    graphActivities = graph.set();

    preventActivityCreation = false;
    inspectedActivity = null;
    selectedActRect = graph.set();
    planes = [];
    for (var i = 0; i < nPlanes; i++) {
        planes.push(graph.path("M0 " + (i+1)*interPlanes + " L" + graphWidth + " " + (i+1)*interPlanes).attr({stroke:'#BBB'}));
    };

    cursor = graph.rect(0, 0, actWidth, actHeight).hide();
    $("#graph").mousemove(function(e) {
        // If move on graph
        if (graph.getElementByPoint(e.clientX, e.clientY) == null ||
            graph.getElementByPoint(e.clientX, e.clientY) == undefined ||
            graph.getElementByPoint(e.clientX, e.clientY).id < 7) {
            cursor.attr({x: e.offsetX-actWidth/2, y: e.offsetY-actHeight/2});
        // If move on activity
        } else {
            hoverActRect = graph.getElementByPoint(e.clientX, e.clientY);
            if (hoverActRect.activitySet && hoverActRect.activitySet[0]) {
                cursor.attr({x: hoverActRect.activitySet[0].attr("x"),
                             y: hoverActRect.activitySet[0].attr("y")});
            }
        }
        if (possibleConnection) {
            graph.connection(possibleConnection);
        }
    });

    // On click on the graph
    $("#graph").on('click', function (e) {
        if (preventActivityCreation == false &&
            (graph.getElementByPoint(e.clientX, e.clientY) == null ||
            graph.getElementByPoint(e.clientX, e.clientY).id < 7)) {
            // If connecting, delete possible connection
            if (possibleConnection) {
                deselectAllActivities();
                possibleConnection.line.remove();
                possibleConnection = null;
            // Else, create new activity
            } else {
                var parentPos = getPosition(e.currentTarget);
                newActivityChoice(e.clientX - parentPos.x, e.clientY - parentPos.y);
            }
        }
    });

    $(".mode-btn").on("click", function(e) {
        changeMode(e.target.id);
    });

    if (oldScenario != null) {
        loadScenario(oldScenario);
    } else {
        counterMap = {};
    }

    changeMode('ADD');
};

function changeMode(newMode) {
    deselectAllActivities();
};

function getStartActivityId() {
    leftActId = 0; // init, is the id of an activitySet in graphActivities
    leftActX = graphActivities[leftActId][0].attr("x"); // init to first activity's position
    graphActivities.forEach(function(actSet, actSetId) {
        if (actSet[0].attr("x") < leftActX) {
            // Another activity found on the left, update
            leftActId = actSetId;
            leftActX = actSet[0].attr("x")
        }
    });
    return {"id": graphActivities[leftActId][0].dbid, "counter": graphActivities[leftActId][0].counter};
}


/**
 * Handles click on an activity set (shape or text) according to the mode
 * 
 */
function handleClickOnActivity(event, actSet) {
    event.preventDefault();
    if (possibleConnection) {
        selectActivity(actSet);
    }
}

function handleClickOnConnection(event, line) {
    if (MODE == "ERASE") {
        for (var i = 0; i < connections.length; i++) {
            if (connections[i].line.id == line.id) {
                eraseConnection(connections[i], i);
            }
        }
    }
}

function submitActivityChoice() {
    if (inspectedActivity == null) {
        submitNewGraphActivity();
    } else {
        submitEditedGraphActivity();
    }
}

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
          
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function onContextMenuItemSelect (menuitem, target, href, pos) {
    var activitySet = graph.getById(target.get(0).getAttribute("raphael")).activitySet;
    var action = menuitem.attr("name");

    switch (action) {
        case 'edit': editActivityChoice(activitySet); break;
        case 'connect': 
            console.log(possibleConnection);
            if (possibleConnection == null) {
                selectActivity(activitySet);
            }
            break;
    }
}