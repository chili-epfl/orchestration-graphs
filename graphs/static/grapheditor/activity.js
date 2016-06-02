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
	
	function drawRectangle() {
	    activity.rectangle = paper
	    .rect(activity.x - width/2, activity.y - height/2, width, height, radius)
	    .style('base', 'default');
	}
	function drawText() {
	    activity.text = paper
	    .text(activity.x, activity.y)
	    .style('base', 'activity');
	}

	/**
	 * Set the content of the text element
	 * @param {string} str - content of the text element to set
	 */
	function setText(str) {
	    var words = str.split(" ");
	    var temp = "";
	    var numLines=1;
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
	    if (numLines >2){
	    	width = width + 20;
	    	activity.rectangle.attr("width", width);
	    	activity.x = activity.x+10;
	    	activity.text.attr("x", activity.x);
	    	setText(str);
	    	activity.inspectButton.setPosition({x : activity.x-width/2, y : activity.y-height/2});
			activity.deleteButton.setPosition({x : activity.x+width/2, y : activity.y-height/2});
	    }
	    	
	}

	activity.rectangle = null;
	activity.text = null;
	activity.inspectButton = null;
	activity.deleteButton = null;
	activity.inspectSet = paper.set(); // set of elements that will change style when inspected

	activity.set = paper.set();
	activity.dbid = null;
	activity.counter = null;
	activity.x = 0;
	activity.y = 0;
	activity.Ox = 0;
	activity.Oy = 0;

	activity.getWidth = function() { return width; };
	/**
	 * Bind Raphael elements to the activity
	 * @param {Object} data - containing:
	 *		  {dbid, x, y} if creating new activity
	 *		  {dbid, raphael elements} if loading activity
	 */
	activity.initRaphaelElements = function(params) {
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
	 */
	activity.setCustomHandlers = function() {
		var nodes = [activity.rectangle.node, activity.text.node,
			activity.inspectButton.circle.node, activity.inspectButton.text.node,
			activity.deleteButton.circle.node, activity.deleteButton.text.node];
		var possibleConnection = SingletonPossibleConnection.getInstance();
		
		activity.set.drag(activityHandlers.move, activityHandlers.dragger, activityHandlers.up,
			{activity: activity, width: width, height: height}, {activity}, {activity: activity, height: height});
		
		activity.set.hover(activityHandlers.hoverIn, activityHandlers.hoverOut,
			{activity}, {activity});
		
		$(nodes).on('click', {activity: activity}, activityHandlers.onClick);
	};

	/**
	 * Set Activity dbid and counter
	 * Set Activity Raphael elements custom attributes
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
	 * Handles activity selection for connection building
	 * (Called via context menu or when clicking on activity is one is already selected)
	 * Also updates possible connection (shows or hides it)
	 */
	activity.select = function() {
		// Adds activity to selectedActivities
		// if selectedActivities does not already contains it
		var possibleConnection = SingletonPossibleConnection.getInstance();
	    if (graph.selectedActivities.indexOf(activity) == -1) {
	    	graph.selectActivity(activity);
			possibleConnection.setFrom(activity.rectangle);
			possibleConnection.setTo(graph.getCursor());
			possibleConnection.update();
		    possibleConnection.show();
	    } else {
	    	//Prevents connection to self
	    	graph.deselectActivities();
	    }
	    // When two activities are selected and not already connected,
	    if (graph.selectedActivities.length == 2) {
	    	// Builds connection if valid
	    	if (graph.isConnectionValid()) {
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
	    	graph.deselectActivities();
	    } 
	};

	/**
	 * Called when editing activity: updates graph counterMap before updating attributes
	 * @param {int} newDbid
	 *
	 */
	activity.edit = function(newDbid) {
		var oldDbid = activity.dbid;
	    var newCounter = activity.updateCounter(newDbid, oldDbid, activity.counter);
	    // Update inspector (inspected activity/operator may have changed)
	    if (graph.getInspectedObject()) {
	    	graph.getInspectedObject().inspect();
	    }
	};

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
	 * Update counterMap 
	 * @param {int} dbid (Optional) - Current Dbid of Activity object
	 * @param {int} oldDbid (Optional) - Previous Dbid of Activity object 
	 * @param {int} oldCounter (Optional) - Previous counter of Activity object
	 */
	activity.updateCounter = function(newDbid, oldDbid, oldCounter) {
		if (newDbid) {
			// Add and edit
			graph.counterMap[newDbid] = graph.counterMap[newDbid] + 1 || 1;
			activity.setAttributes(newDbid, graph.counterMap[newDbid]);
		}
		if (oldDbid && oldCounter) {
			// Edit and delete
			graph.activities.forEach(function(act) {
				if (act.dbid == oldDbid && act.counter > oldCounter) {
					decrementedCounter = act.counter-1;
					act.setAttributes(oldDbid, decrementedCounter);
				}
			});
			// Update informations in connections (from and to dbid and counter)
			graph.connections.forEach(function(connection) {
				connection.setAttributes();
			});
			// Decrement counter for oldDbid
			graph.counterMap[oldDbid] = graph.counterMap[oldDbid] - 1;
		}
	};

	activity.loadCounter = function(dbid, counter) {
		activity.setAttributes(dbid, counter);
		graph.counterMap[dbid] = Math.max(graph.counterMap[dbid], counter);
	}

	return activity;
};
