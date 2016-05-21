function generateBuilders(graph) {
	var builders = {};

	/**
	 * Creates, edit or load Activity Object
	 * @param {Object} data - containing
	 *		  {dbid, x, y} if creating new activity
	 *		  {dbid, raphael elements} if loading activity
	 *
	 */
	builders.newActivity = function(data) {
		var activity, button, dbid;

		// Create new Activity Object
		activity = new Activity();
		activity.initRaphaelElements(data);
		
		// Adds to list of activities
    	graph.activities.push(activity);
    	
    	// Create and binds new button object
		button = new DeleteButton();
		button.initRaphaelElements("activity", data);
		activity.bindButton(button);

		var dbid = data.dbid;
	    var counter = graph.updateCounter(dbid);
	    activity.setAttributes(dbid, counter);
		
		// Assign Handlers
		activity.setCustomHandlers();
		button.setCustomHandlers();
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
	};

	return builders;
}