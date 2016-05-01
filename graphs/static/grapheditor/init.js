var graph, MODE, graphActivities;
var connections = [];
var selectedActRect;
var newActivityX, newActivityY;
var counterMap;
var form;

// Global design variables
var activityFill = "#428BCA";
var activitySelectFill = "#23527B";

/**
 * Executed on load:
 * - creates the graph with 6 planes
 * - initiates various handlers (click on buttons, graph, and export)
 */
window.onload = function () {
    // Creates a new graph
    graph = Raphael("graph", 1000, 525); // creates graph with x=1000

    graphActivities = graph.set();
    selectedActRect = graph.set();
    planes = [  graph.path("M0 425 L1000 425"),
                graph.path("M0 350 L1000 350"),
                graph.path("M0 275 L1000 275"),
                graph.path("M0 200 L1000 200"),
                graph.path("M0 125 L1000 125"),
                graph.path("M0  50 L1000  50") ];

    // On click on the graph in ADD mode, display activity creation form
    $("#graph").on('click', function (e) {
        switch(MODE) {
            case 'ADD':
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
    $(".btn-default").removeClass('active');
    if (newMode !== MODE) {
        $("#" + newMode).addClass('active');
        MODE = newMode;
    } else if (MODE !== 'MOVE') {
        changeMode('MOVE');
    }
    deselectAllActivities();

    switch(MODE) {
        case 'ADD':
            $('#graph').css({cursor: 'cell'});
            graphActivities.forEach(function(activity) { activity.attr({cursor: 'not-allowed'}); });
            break;
        case 'MOVE':
            $('#graph').css({cursor: 'default'});
            graphActivities.forEach(function(activity) { activity.attr({cursor: 'move'}); });
            break;
        case 'CONNECT':
            $('#graph').css({cursor: 'default'});
            graphActivities.forEach(function(activity) { activity.attr({cursor: 'e-resize'}); });
            break;
        case 'ERASE':
            $('#graph').css({cursor: 'default'});
            graphActivities.forEach(function(activity) { activity.attr({cursor: 'pointer'}); });
            break;
        case 'EDIT':
            $('#graph').css({cursor: 'default'});
            graphActivities.forEach(function(activity) { activity.attr({cursor: 'pointer'}); });
            break;
    }
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
    switch(MODE) {
        case 'CONNECT': selectActivity(actSet); break;
        case 'ERASE':   eraseActivity(actSet); break;
        case 'EDIT': editActivityChoice(actSet); break;
        default:        break;
    }
}

function handleClickOnConnection(event, line) {
    if (MODE == "ERASE") {
        for (var i = 0; i < connections.length; i++) {
            if (connections[i].line.id == this.id) {
                eraseConnection(connections[i], i);
            }
        }
    }
}

function submitActivityChoice() {
    switch(MODE) {
        case 'ADD': submitNewGraphActivity(); break;
        case 'EDIT': submitEditedGraphActivity(); break;
        default:        break;
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