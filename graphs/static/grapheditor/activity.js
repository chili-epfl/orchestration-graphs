/**
 * Activity class
 * @return {Object} - Activity instance
 * 
 */
var Activity = function() {
	// Instance to return
	var activity = {};
	
	// Private variables
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;
	var height = 40;
	var width = 100;
	var radius = 5;
	
	/**
	 * Create raphaelJS rectangle element
	 *
	 */
	function drawRectangle() {
	    activity.rectangle = paper
	    .rect(activity.x - width/2, activity.y - height/2, width, height, radius)
	    .style('base', 'default');
	}

	/**
	 * Create raphaelJS text element
	 *
	 */
	function drawText() {
	    activity.text = paper
	    .text(activity.x, activity.y)
	    .style('base', 'activity');
	}

	/**
	 * Set the content of the raphaelJS text element
	 * @param {string} str - content of the text element to set
	 */
	function setText(str) {
	    var words = str.split(" ");
	    var temp = "";
	    var numLines = 1;

	    // New line when text width is bigger than rectangle width
	    for (var i=0; i<words.length; i++) {
	        activity.text.attr("text", temp + " " + words[i]);
	        if (activity.text.getBBox().width > width) {
	            temp += "\n" + words[i];
	            numLines++;
	        } else {
	            temp += " " + words[i];
	        }
	    }
	    activity.text.attr("text", temp.substring(1));

	    // If more than two lines of text, increment rectangle size and call again
	    if (numLines >2){
	    	width = width + 20;
	    	activity.rectangle.attr("width", width);
	    	activity.x = activity.x+10;
	    	activity.text.attr("x", activity.x);
	    	activity.inspectButton.setPosition({x : activity.x-width/2, y : activity.y-height/2});
			activity.deleteButton.setPosition({x : activity.x+width/2, y : activity.y-height/2});
	    	setText(str);
	    }
	    	
	}

	// Public variables

	// Raphael elements
	activity.rectangle = null;
	activity.text = null;
	activity.set = paper.set();
	activity.inspectSet = paper.set(); // set of elements that will change style when inspected

	// Buttons
	activity.inspectButton = null;
	activity.deleteButton = null;

	// Dbid & Counter
	activity.dbid = null;
	activity.counter = null;

	// Center position
	activity.x = 0;
	activity.y = 0;
	activity.Ox = 0;
	activity.Oy = 0;

	/**
	 * Bind Raphael elements to the activity
	 * Called by the Activity builder
	 * @param {Object} params - containing:
	 *		  {dbid, x, y}				if creating new activity
	 *		  {dbid, raphael elements}	if loading activity
	 */
	activity.initRaphaelElements = function(params) {
		// Initialize elements from params
		if (params.x && params.y) {
			activity.x = params.x;
			activity.y = graph.getNewY(params.y);
			drawRectangle();
			drawText();
		} else if (params.rectangle && params.text) {
			activity.rectangle = params.rectangle;
			activity.text = params.text;
			activity.x = activity.rectangle.attr("x") + width/2;
			activity.y = activity.rectangle.attr("y") + height/2;
		} else {
			throw new Error('Impossible to create activity.');
		}
    	activity.rectangle.description = "activityRectangle";
    	activity.text.description = "activityText";

    	// Initialize sets
		activity.set.push(activity.rectangle, activity.text);
		activity.inspectSet.push(activity.rectangle);
	};

	/**
	 * Binds buttons to this activity,
	 * @param {InspectButton} inspectButton
	 * @param {DeleteButton} deleteButton
	 *
	 */
	activity.bindButtons = function(inspectButton, deleteButton) {
		activity.inspectButton = inspectButton;
		activity.deleteButton = deleteButton;
		activity.set.push(activity.inspectButton.circle, activity.inspectButton.text,
						  activity.deleteButton.circle, activity.deleteButton.text);
		activity.inspectButton.bindTarget(this, {x : activity.x-width/2, y : activity.y-height/2});
		activity.deleteButton.bindTarget(this, {x : activity.x+width/2, y : activity.y-height/2});
	};

	/**
	 * Set custom handlers related to this activity
	 * Give them context data if needed (see activityHandlers)
	 *
	 */
	activity.setCustomHandlers = function() {
		// Drag & drop to move the Activity
		activity.set.drag(activityHandlers.move, activityHandlers.dragger, activityHandlers.up,
			{activity: activity, width: width, height: height}, {activity}, {activity: activity, height: height});
		
		// Show buttons when hovering the activity
		activity.set.hover(activityHandlers.hoverIn, activityHandlers.hoverOut, {activity}, {activity});
		
		// Select the activity if creating a connection
		$([activity.rectangle.node, activity.text.node,
			activity.inspectButton.circle.node, activity.inspectButton.text.node,
			activity.deleteButton.circle.node, activity.deleteButton.text.node])
		.on('click', {activity: activity}, activityHandlers.onClick);
	};

	/**
	 * Set Activity dbid, counter, and Raphael elements custom attributes
	 * Called after loading or updating the counter (loading, adding or editing an Activity)
	 * @param {int} newDbid
	 * @param {int} newCounter
	 *
	 */
	activity.setAttributes = function(newDbid, newCounter) {
		activity.dbid = newDbid;
		activity.counter = newCounter;

		setText(dbActivities[activity.dbid].name);
	    activity.set.forEach(function(elem) {
	    	elem.dbid = activity.dbid;
	    	elem.counter = activity.counter;
	        elem.set = activity.set; // allows the drag method to apply on the whole set
	    });
	};

	/**
	 * Delete this instance from the graph and remove Raphael elements
	 * Also deletes all associated connections
	 *
	 */
	activity.delete = function() {
	    var connections = graph.connections;
	    for (var j = connections.length-1; j >= 0; j--) {
	        if (connections[j].from == activity.rectangle ||
	        	connections[j].to == activity.rectangle) {
				connections[j].delete();
	        }
	    }
	    activity.set.forEach(function(element) {
	    	element.remove();
	    });
	    graph.deleteActivity(activity);
	    activity.updateCounter(null, activity.dbid, activity.counter);
	    activity = null;   
	};

	/**
	 * Select the Activity to build a connection
	 * Called when clicking on a connect option in the Activity context menu
	 * Called when clicking on the Activity while creating a Connection
	 * Shows the possible connection
	 *
	 */
	activity.select = function() {
		// If the Activity is not selected yet, select it and update the possible connection
	    if (graph.selectedActivities.indexOf(activity) == -1) {
	    	graph.selectActivity(activity);
			var possibleConnection = SingletonPossibleConnection.getInstance();
			possibleConnection.setFrom(activity.rectangle);
			possibleConnection.setTo(graph.getCursor());
			possibleConnection.update();
		    possibleConnection.show();
		// Else, cancel (prevent self-connection)
	    } else {
	    	graph.deselectActivities();
	    }
	    // If two activities are selected and not already connected
	    if (graph.selectedActivities.length == 2) {
	    	if (graph.isConnectionValid()) {
	    		// Build the Connection with parameters containing
	    		// - Identifiers for from and to
	    		// - Information from Operator modal if available
	    		graph.buildConnection({
	    	 		sId: graph.selectedActivities[0].dbid,
	    	 		sCount: graph.selectedActivities[0].counter,
	    	 		eId: graph.selectedActivities[1].dbid,
	    	 		eCount: graph.selectedActivities[1].counter,
	    	 		type: $('#operatorTypeSelector').val() != 'choose' ? $('#operatorTypeSelector').val() : undefined,
	    	 		subtype: $('#operatorSubtypeSelector').val() != 'choose' ? $('#operatorSubtypeSelector').val() : undefined,
	    	 		label: $('#operatorLabelSelector').val() != 'choose' ? $('#operatorLabelSelector').val() : undefined,
	    	 		sublabel: $('#operatorSublabelSelector').val() != 'choose' ? $('#operatorSublabelSelector').val() : undefined,
	    	 	});
	    	}
	    	// Reset selected activities
	    	graph.deselectActivities();
	    } 
	};

	/**
	 * Update counter for this activity and refresh inspector panel
	 * Called when submitting the Activity modal when editing Activity
	 * @param {int} newDbid
	 *
	 */
	activity.edit = function(newDbid) {
		var oldDbid = activity.dbid;
	    var newCounter = activity.updateCounter(newDbid, oldDbid, activity.counter);
	    if (graph.getInspectedObject()) {
	    	graph.getInspectedObject().inspect();
	    }
	};

	/**
	 * Fill the inspector panel with information about the Activity
	 * Set the inspected object to this Activity
	 *
	 */
	activity.inspect = function() {
		$('#inspectContainer .panel-heading #inspectTitle').html('Activity');
		var htmlContent =
			'<div class="form-group"><label class="col-md-2 text-right">Name</label>' + dbActivities[activity.dbid].name + '</div>' +
			'<div class="form-group"><label class="col-md-2 text-right">Type</label>' + dbActivities[activity.dbid].type + '</div>' +
			'<div class="form-group"><label class="col-md-2 text-right">Average time</label>' + dbActivities[activity.dbid].avg_time + '</div>';
		if (dbActivities[activity.dbid].description) {
			htmlContent += '<div class="form-group"><label class="col-md-2 text-right">Description</label>' + dbActivities[activity.dbid].description + '</div>';
		}
		$('#inspectContainer .panel-body')
		.html(htmlContent);

		graph.setInspectedObject(activity);
	};

	/**
	 * Update the counter of activities and the counterMap
	 * Called from the Activity builder when creating an Activity
	 * Called from delete when deleting activity
	 * Called from edit when editing activity
	 * @param {int} newDbid (Optional) - New dbid of Activity
	 * @param {int} oldDbid (Optional) - Current dbid of Activity
	 * @param {int} oldCounter (Optional) - Current counter of Activity
	 */
	activity.updateCounter = function(newDbid, oldDbid, oldCounter) {
		// If adding or editing the activity
		if (newDbid) {
			// Increment the counterMap for newDbid and update attributes
			graph.counterMap[newDbid] = graph.counterMap[newDbid] + 1 || 1;
			activity.setAttributes(newDbid, graph.counterMap[newDbid]);
		}
		// If editing or deleting the activity
		if (oldDbid && oldCounter) {
			// Update attributes of Activities with same dbid and higher counter
			graph.activities.forEach(function(act) {
				if (act.dbid == oldDbid && act.counter > oldCounter) {
					decrementedCounter = act.counter-1;
					act.setAttributes(oldDbid, decrementedCounter);
				}
			});
			// Update raphael custom attributes of Connections
			graph.connections.forEach(function(connection) {
				connection.setAttributes();
			});
			// Decrement the counterMap for oldDbid
			graph.counterMap[oldDbid] = graph.counterMap[oldDbid] - 1;
		}
	};

	/**
	 * Set the counter of activities and the counterMap
	 * Called from the Activity builder when loading an Activity
	 * @param {int} dbid
	 * @param {int} counter
	 *
	 */
	activity.loadCounter = function(dbid, counter) {
		activity.setAttributes(dbid, counter);
		graph.counterMap[dbid] = Math.max(graph.counterMap[dbid], counter);
	}

	/**
	 * Called in activityHandlers.move
	 * @return {int} width
	 */
	activity.getWidth = function() { return width; };

	return activity;
};
