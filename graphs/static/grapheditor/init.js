var graph, MODE, activities;
var connections = [];
var selectedActRect;
var newActivityX, newActivityY;
var all_activities = {};
var all_scenarios = {};

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
    graph = Raphael("graph", 640, 525);
    graphJson = {};
    graphJson["activities"] = [];
    graphJson["edges"] = [];
    graphJson["start"] = -1;

    $('#activitySelector').on('change', function() {
        activityId = this.value;
        if (activityId === "choose" || activityId === "other") {
            $('#newActivityForm').css('display', 'block');
            $('#newActivityName')[0].value = '';
            $('#newActivityType')[0].value = '';
            $('#newActivityUrl')[0].value = '';
        } else {
            $('#newActivityForm').css('display', 'none');
            activitytmp = all_activities[activityId];
            $('#newActivityName')[0].value = activitytmp[0];
            $('#newActivityType')[0].value = activitytmp[1];
            $('#newActivityUrl')[0].value = '/' + activitytmp[2];
        }
    });

    activities = graph.set();
    selectedActRect = graph.set();
    planes = [  graph.path("M0 425 L640 425"),
                graph.path("M0 350 L640 350"),
                graph.path("M0 275 L640 275"),
                graph.path("M0 200 L640 200"),
                graph.path("M0 125 L640 125"),
                graph.path("M0  50 L640  50") ];

    // On click on the graph in ADD mode, display activity creation form
    $("#graph").on('click', function (e) {
        switch(MODE) {
            case 'ADD':
                var parentPos = getPosition(e.currentTarget);
                newActivityForm(e.clientX - parentPos.x, e.clientY - parentPos.y);
        }
    });

    $(".mode-btn").on("click", function(e) {
        changeMode(e.target.id);
    });

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
            activities.forEach(function(activity) { activity.attr({cursor: 'not-allowed'}); });
            break;
        case 'MOVE':
            $('#graph').css({cursor: 'default'});
            activities.forEach(function(activity) { activity.attr({cursor: 'move'}); });
            break;
        case 'CONNECT':
            $('#graph').css({cursor: 'default'});
            activities.forEach(function(activity) { activity.attr({cursor: 'e-resize'}); });
            break;
        case 'ERASE':
            $('#graph').css({cursor: 'default'});
            activities.forEach(function(activity) { activity.attr({cursor: 'pointer'}); });
            break;
        case 'INSPECT':
            $('#graph').css({cursor: 'default'});
            activities.forEach(function(activity) { activity.attr({cursor: 'pointer'}); });
            break;
    }
};


/**
 * Handles click on an activity set (shape or text) according to the mode
 * 
 */
function handleClickOnActivity(event, actSet) {
    event.preventDefault();
    switch(MODE) {
        case 'CONNECT': selectActivity(actSet); break;
        case 'ERASE':   eraseActivity(actSet); break;
        case 'INSPECT': editActivityForm(actSet); break;
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

function submitActivityForm() {
    switch(MODE) {
        case 'ADD': submitNewActivityForm(); break;
        case 'INSPECT': submitEditedActivityForm(); break;
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