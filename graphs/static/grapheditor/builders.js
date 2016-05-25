function generateBuilders(graph) {
	var builders = {};

	/**
	 * Creates, edit or load Activity Object
	 * @param {Object} data - containing
	 *		  {dbid, x, y} if creating new activity
	 *		  {dbid, counter, raphael elements} if loading activity
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

		if (data.counter) {
			// Loading
			activity.loadCounter(data.dbid, data.counter);
		} else {
			// Creating
			activity.updateCounter(data.dbid);
		}
		
		// Assign Handlers
		activity.setCustomHandlers();
		inspectButton.setCustomHandlers();
		deleteButton.setCustomHandlers();

		return activity;
	}

	/**
	 * Creates or load Connection Object
	 * @param {Object} params - containing :
	 *		  {sId, sCount, eId, eCount} if creating new connection
	 *		  {sId, sCount, eId, eCount, raphael elements} if loading connection
	 * data also contains type, subtype, label and sublabel if operator is complex
	 */
	builders.newConnection = function(data) {
    	var connection, button;

    	connection = new Connection();
    	connection.initRaphaelElements(data);
	    graph.connections.push(connection);

		inspectButton = new InspectButton();
		inspectButton.initRaphaelElements("connection", data);
	    deleteButton = new DeleteButton(connection);
	    deleteButton.initRaphaelElements("connection", data);
	    connection.bindButtons(inspectButton, deleteButton);

	    connection.setAttributes(data);

	    connection.setCustomHandlers();
		inspectButton.setCustomHandlers();
		deleteButton.setCustomHandlers();

		return connection;
	};

	return builders;
}