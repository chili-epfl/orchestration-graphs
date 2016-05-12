/**
 * Constructs a new activity set and adds it to the current graph
 * x, y                     position of the new activity on the graph
 * name, type, url, dbid    of the activity defined in the activity form
 * 
 */
function activity(x, y, name, type, url, dbid) {
    // Creates a set containing a new Raphael rectangle and a new Raphael text
    var activitySet = graph.set();
    var activityRect = graph.rect(x - actWidth/2, reposition(y - actHeight/2), actWidth, actHeight, actRadius);
    activityRect.attr({
        fill: activityFill,
        stroke: "#BBB",
        "stroke-width": 2,
        title: type,
        href: url
    });

    var activityText = graph.text(x, reposition(y - actHeight/2) + actHeight/2)
    activityText.attr({
        fill: activityTextColor,
    });
    correctTextSize(activityText, name);
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
    activitySet.hover(
        function(e) { focusActivity(activitySet) },
        function(e) { unfocusActivity(activitySet)},
        activityRect, activityRect);

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
function correctTextSize(t, text) {
    var words = text.split(" ");
    var tempText = "";
    for (var i=0; i<words.length; i++) {
        t.attr("text", tempText + " " + words[i]);
        if (t.getBBox().width > actWidth) {
            tempText += "\n" + words[i];
        } else {
            tempText += " " + words[i];
        }
    }
    t.attr("text", tempText.substring(1));
}
