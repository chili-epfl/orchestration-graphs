function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.slice(1, txt.value.length-1);
}

function loadScenario(raphaelJson) {
    // Parse input as JSON
    var json = JSON.parse(decodeHtml(raphaelJson)).slice(6);

    console.log(json);
    counterMap = {};

    // Generate graph from JSON
    graph.fromJSON(json, function(el, data) {
        if (el.type == 'text') {
            // If text, then create new activity
            // (adapted from addActivity method)
            var activitySet = graph.set();
            var activityRect = graph.getById(el.id - 1);

            activitySet.push(activityRect, el);

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