/**
 * Constructs a new activity set and adds it to the current graph
 * x, y                     position of the new activity on the graph
 * name, type, url, dbid    of the activity defined in the activity form
 * 
 */
function activity(x, y, name, type, url, dbid) {
    // Creates a set containing a new Raphael rectangle and a new Raphael text
    var activitySet = graph.set();
    var activityRect = graph.rect(x - 30, reposition(y - 20), 60, 40);
    activityRect.attr({
        fill: activityFill,
        "stroke-width": 0,
        title: type,
        href: url
    });

    var activityText = graph.text(x, reposition(y - 20) + 20, correctTextSize(name));
    activityText.attr({fill: "#FFF"});
    activitySet.push(activityRect, activityText);

    // Add custom attributes to Raphael elements
    counterMap[dbid] = counterMap[dbid] + 1 || 1;
    activitySet.forEach(function(elem) {
        elem.dbid = dbid;
        elem.counter = counterMap[dbid];
        elem.activitySet = activitySet; // allows the drag method to apply on the whole set
        elem.selected = false;          // allows to (de)select an activity
    });

    // Initiates the handlers on the new activity set (drag&drop, click)
    activitySet.drag(move, dragger, up);            // MOVE mode
    activitySet.click(function(event) {
        handleClickOnActivity(event, activitySet);  // SELECT/ERASE mode
    });

    // Adds the new set to the global set of activities
    graphActivities.push(activitySet);

    // Default return to MOVE mode
    changeMode("MOVE");
}


/**
 * Initiates the creation of a new activity
 * x, y     position of the new activity on the graph
 *
 */
function newActivityChoice(x, y) {
    newActivityX = x;
    newActivityY = y;
    $('#activityChoice').modal('show');
}

/**
 * Processes information about a new activity from the activity form
 *
 */
function submitNewGraphActivity() {
    if ($('#activitySelector').val() !== 'choose') {  
        chosenActivity = dbActivities[$('#activitySelector').val()]

        $('#activityChoice').modal('hide');
        activity(newActivityX, newActivityY,    // position
            chosenActivity[0],                        // name
            chosenActivity[1],                        // type
            chosenActivity[2],                        // source
            parseInt($('#activitySelector').val()));      // dbid
        $('#activitySelector').val('choose');
    }
}

/**
 * Format activity title size
 *
 */
function correctTextSize(text) {
    var midTextSize = (text.length - text.length%2)/2;
    var thirdTextSize = (text.length - text.length%3)/3
    
    if (text.length <10) {
        return text;
    } else if (text.length < 20) {
        return text.substring(0,midTextSize).concat("\n").concat(text.substring(midTextSize,text.length));
    } else {
        return text.substring(0,thirdTextSize).concat("\n").concat(text.substring(thirdTextSize,thirdTextSize*2)).concat("\n").concat(text.substring(thirdTextSize*2,text.length));
    }
    
}
