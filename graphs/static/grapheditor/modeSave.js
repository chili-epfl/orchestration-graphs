// Create or edit scenario in scenario line
function saveScenario() {
    $('#scenarioForm #id_raphaelJson').val(createRaphaelJson());
    $('#scenarioForm #id_json').val(createGraphJson());

    // Submit form to save changes
    document.getElementById('scenarioForm').submit();
}

// Create raphaelJson, serialized version of the Raphael graph
// Call toJSON in js/raphael.json.js with callback that allows to store custom attributes
function createRaphaelJson() {
    raphaelJson = graph.toJSON(function(el, data) {
        data.startingRect = el.startingRect; // attribute of line elements to reconstruct connection
        data.endingRect = el.endingRect; // attribute of line elements to reconstruct connection
        data.dbid = el.dbid; // attribute to find corresponding activity
        data.counter = el.counter;  // attribute to find corresponding activity
        data.description = el.description;
        return data;
    });

    console.log(JSON.stringify(raphaelJson));
    return JSON.stringify(raphaelJson);
}

// Create graphJson, minified version of the scenario
function createGraphJson() {
    graphJson = {};
    graphJson["activities"] = [];
    graphActivities.forEach(function(actSet) {
        graphJson["activities"].push({"id": actSet[0].dbid, "counter": actSet[0].counter});
    });
    graphJson["edges"] = [];
    connections.forEach(function(connection) {
        graphJson["edges"].push({
            "a1": { "id": connection.from.dbid, "counter": connection.from.counter }, 
            "a2": { "id": connection.to.dbid, "counter": connection.to.counter }
        });
    });
    graphJson["start"] = getStartActivityId();
    return JSON.stringify(graphJson);
}