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

		activity.updateCounter(data.dbid);
		
		// Assign Handlers
		activity.setCustomHandlers();
		inspectButton.setCustomHandlers();
		deleteButton.setCustomHandlers();

		return activity;
	}

	/**
	 * Creates or load Connection Object
	 * @param {Object} data - containing:
	 *		  {startRaphId, endRaphId} if creating new connection
	 *		  {startRaphId, endRaphId, raphael elements} if loading connection
	 *
	 */
	builders.newConnection = function(data) {
    	var connection, button;

    	connection = new Connection();
    	connection.initRaphaelElements(data);
	    graph.connections.push(connection);

	    button = new DeleteButton(connection);
	    button.initRaphaelElements("connection", data);
	    connection.bindButton(button);

	    connection.setAttributes();

	    connection.setCustomHandlers();
		button.setCustomHandlers();

		return connection;
	};

	return builders;
}