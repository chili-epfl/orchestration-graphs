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

    // On click on the graph, display activity creation form
    $("#graph").on('click', function (e) {
        if (preventActivityCreation == false &&
            (graph.getElementByPoint(e.clientX, e.clientY) == null ||
            graph.getElementByPoint(e.clientX, e.clientY).id < 6)) {
            var parentPos = getPosition(e.currentTarget);
            newActivityChoice(e.clientX - parentPos.x, e.clientY - parentPos.y);
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

