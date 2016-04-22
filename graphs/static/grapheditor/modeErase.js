/**
 * Deletes an existing activity set from the current graph
 *
 */
function eraseActivity(activitySet) {
    activitySet.forEach(function(elem) {
        if (elem.type === 'rect') {
            // Delete all connections related to the activity
            for (var j = connections.length-1; j >= 0; j--) {
            if (connections[j].from.id == elem.id || connections[j].to.id == elem.id) {
                eraseConnection(connections[j], j);
            }}
        }
        // Delete activitySet elements (rectangle and text)
        elem.remove();
    });
    // Delete activitySet
    activities.exclude(activitySet);

    // TODO: update graphJson !
}

/**
 * Deletes an existing connection from the graph
 * connection   the connection object to delete
 * index        of the connection to delete in the connections array
 *
 */
function eraseConnection(connection, index) {
    connection.line.remove();
    connections.splice(index, 1);

    // TODO: update graphJson !
}