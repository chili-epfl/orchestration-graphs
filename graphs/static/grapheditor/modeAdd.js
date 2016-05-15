/**
 * Construct a new activity set and add it to the current graph
 * x, y                     position of the new activity on the graph
 * name, type, url, dbid    of the activity defined in the activity form
 * 
 */
function activity(x, y, name, type, url, dbid) {
    // Create a set containing the elements for the activity
    var activitySet = graph.set();
    
    // Create activity rectangle
    var activityRect = graph.rect(x - actWidth/2, reposition(y - actHeight/2), actWidth, actHeight, actRadius)
                            .attr({ fill: activityFill, stroke: "#BBB", "stroke-width": 2, title: type, href: url });
    activityRect.description = "actRect";

    // Create text containing activity name
    var activityText = graph.text(x, reposition(y - actHeight/2) + actHeight/2)
                            .attr({ fill: activityTextColor });
    activityText.description = "actText";
    correctTextSize(activityText, name);

    // Create the delete button
    var activityDelCircle = graph.circle(x + actWidth/2, reposition(y - actHeight/2), 7)
                                 .attr({fill: "#FF4E53", "stroke-width": 0, cursor: "pointer"});
    activityDelCircle.description = "actDelCircle";
    var activityDelText = graph.text(x + actWidth/2, reposition(y - actHeight/2), "X")
                                 .attr({fill: "#FFFFFF", cursor: "pointer"});
    activityDelText.description = "actDelText";
    graph.set().push(activityDelCircle, activityDelText).hide();
    graph.set().push(activityDelCircle, activityDelText).click(function(event) {
        eraseActivity(activitySet);
    });
    
    activitySet.push(activityRect, activityText, activityDelCircle, activityDelText);

    activitySet.hover(
        function() { activityDelCircle.show(); activityDelText.show(); },
        function() { activityDelCircle.hide(); activityDelText.hide(); }
    );

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
}

function createDeleteButton(activitySet, x, y) {
    var activityDelCircle = graph.circle(x + actWidth/2, reposition(y - actHeight/2), 7).attr({fill: "#FF4E53", "stroke-width": 0});
    activityDelCircle.description = "actDelButton";
    activitySet.push(activityDelCircle);
    
    var activityDelText = graph.text(x + actWidth/2, reposition(y - actHeight/2), "X").attr("fill", "#FFFFFF");
    activityDelText.description = "actDelText";
    activitySet.push(activityDelText);
    
    res = graph.set().push(activityDelCircle, activityDelText);
    res.attr("cursor", "pointer").hide();

    return res;
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
