function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.slice(1, txt.value.length-1);
}

function loadScenario(raphaelJson) {
    // Parse input as JSON
    var json = JSON.parse(decodeHtml(raphaelJson)).slice(6);

    counterMap = {};

    // Generate graph from JSON
    graph.fromJSON(json, function(el, data) {

        // If delete button text, then create new activity
        // (adapted from addActivity method)
        if (data.description == 'actDelText') {
            var activitySet = graph.set();
            var activityRect = graph.getById(el.id - 3);
            activityRect.description = "actRect";

            var activityText = graph.getById(el.id - 2);
            activityText.description = "actText";

            var activityDelCircle = graph.getById(el.id - 1);
            activityDelCircle.description = "actDelCircle";
            var activityDelText = el;
            graph.set().push(activityDelCircle, activityDelText).hide();
            graph.set().push(activityDelCircle, activityDelText).click(function(event) {
                eraseActivity(activitySet);
            });

            activitySet.push(activityRect, activityText, activityDelCircle, activityDelText);

        activitySet.hover(
            function() { activityDelCircle.show(); activityDelText.show(); },
            function() { activityDelCircle.hide(); activityDelText.hide(); }
        );

            counterMap[data.dbid] = counterMap[data.dbid] + 1 || 1;
            activitySet.forEach(function(elem) {
                elem.dbid = data.dbid;
                elem.counter = counterMap[data.dbid];
                elem.activitySet = activitySet;
                elem.selected = false;
            });
            activitySet.drag(move, dragger, up);
            activitySet.click(function(event) {
                handleClickOnActivity(event, activitySet);
            });
            graphActivities.push(activitySet);
        }

        if (el.type == 'path') {
            // If connection, then create new connection
            // (adapted from connectActivities method)
            el.startingRect = data.startingRect;
            el.endingRect = data.endingRect;
            newConnection = {
                line: el,
                from: graph.getById(el.startingRect),
                to: graph.getById(el.endingRect)
            };
            graph.connection(newConnection);
            connections.push(newConnection);
            newConnection.line.click(function (event) {
                handleClickOnConnection(event, this);
            });
        }

        return el;
    });
}