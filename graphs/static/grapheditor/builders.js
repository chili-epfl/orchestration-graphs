/**
 * @return {Object} builders - functions building elements on the graph
 */
function generateBuilders(graph) {
	var builders = {};

	/**
	 * Build an Activity object
	 * @param {Object} data - containing:
	 *		  {dbid, x, y}				if creating new activity
	 *		  {dbid, raphael elements}	if loading activity
	 *
	 */
	builders.newActivity = function(data) {
		var activity, deleteButton, inspectButton, dbid;

		// Create new Activity Object
		activity = new Activity();
		activity.initRaphaelElements(data);

		// Adds to list of activities
    	graph.activities.push(activity);
    	
    	// Create and binds new buttons object
		inspectButton = new InspectButton();
		inspectButton.initRaphaelElements("activity", data);
		deleteButton = new DeleteButton();
		deleteButton.initRaphaelElements("activity", data);
		
		activity.bindButtons(inspectButton, deleteButton);

		// Load or update counter for the Activity
		if (data.counter) {
			activity.loadCounter(data.dbid, data.counter);
		} else {
			activity.updateCounter(data.dbid);
		}
		
		// Assign Handlers
		activity.setCustomHandlers();
		inspectButton.setCustomHandlers();
		deleteButton.setCustomHandlers();

		return activity;
	}

	/**
	 * Build a Connection object
	 * @param {Object} data - containing :
	 *		  {sId, sCount, eId, eCount}					if creating new connection
	 *		  {sId, sCount, eId, eCount, raphael elements}	if loading connection
	 * data also contains type, subtype, label and sublabel if operator is complex
	 *
	 */
	builders.newConnection = function(data) {
    	var connection, button;

    	// Create new Connection object
    	connection = new Connection();
    	connection.initRaphaelElements(data);

    	// Add to list of connections
	    graph.connections.push(connection);

    	// Create and binds new buttons object
		inspectButton = new InspectButton();
		inspectButton.initRaphaelElements("connection", data);
	    deleteButton = new DeleteButton(connection);
	    deleteButton.initRaphaelElements("connection", data);
	    connection.bindButtons(inspectButton, deleteButton);

	    // Set custom attributes and default style
	    connection.setAttributes(data);
    	connection.path.style('base', 'default');

    	// Assign handlers
	    connection.setCustomHandlers();
		inspectButton.setCustomHandlers();
		deleteButton.setCustomHandlers();

		return connection;
	};

	return builders;
}