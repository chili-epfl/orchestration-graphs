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
	var fill = "#FFFFFF";
	var textColor = "#0080CF";
	var name, type, url;
	
	function drawRectangle() {
	    activity.rectangle = paper
	    .rect(activity.x - width/2, activity.y - height/2, width, height, radius)
	    .attr({ fill: fill, stroke: "#BBB", "stroke-width": 2 });
	}
	function drawText() {
	    activity.text = paper
	    .text(activity.x, activity.y)
	    .attr({ "font-size": "13px", fill: textColor });
	}

	/**
	 * Set the content of the text element
	 * @param {string} str - content of the text element to set
	 */
	function setText(str) {
	    var words = str.split(" ");
	    var temp = "";
	    for (var i=0; i<words.length; i++) {
	        activity.text.attr("text", temp + " " + words[i]);
	        if (activity.text.getBBox().width > width) {
	            temp += "\n" + words[i];
	        } else {
	            temp += " " + words[i];
	        }
	    }
	    activity.text.attr("text", temp.substring(1));
	}


	activity.rectangle = null;
	activity.text = null;
	activity.deleteButton = null;
	activity.set = paper.set();
	activity.dbid = null;
	activity.counter = null;
	activity.x = 0;
	activity.y = 0;
	activity.Ox = 0;
	activity.Oy = 0;

	activity.get = function() { return activity; };

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
	};

	/**
	 * Bind a delete button to this activity,
	 * @param {DeleteButton} button
	 *
	 */
	activity.bindButton = function(button) {
		activity.deleteButton = button;
		activity.set.push(activity.deleteButton.circle, activity.deleteButton.text);
		activity.deleteButton.bindTarget(this, {x : activity.x+width/2, y : activity.y-height/2});
	};

	/**
	 * Set custom handlers related to this activity
	 * Give them context data if needed (see activityHandlers)
	 */
	activity.setCustomHandlers = function() {
		var nodes = [activity.rectangle.node, activity.text.node,
			activity.deleteButton.circle.node, activity.deleteButton.text.node];
		var possibleConnection = SingletonPossibleConnection.getInstance();
		
		activity.set.drag(activityHandlers.move, activityHandlers.dragger, activityHandlers.up,
			{activity: activity, width: width, height: height}, {activity}, {activity: activity, height: height});
		
		activity.set.hover(activityHandlers.hoverIn, activityHandlers.hoverOut,
			{activity}, {activity});
		
		$(nodes).on('click', {activity: activity}, activityHandlers.onClick);
		$(nodes).contextMenu({menu: 'menuContext', activity: activity, onSelect: activityHandlers.onContextMenuItemSelect});
	};

	/**
	 * Set Activity dbid and counter
	 * Set Activity Raphael elements custom attributes
	 * @param {int} newDbid
	 * @param {int} newCounter
	 *
	 */
	activity.setAttributes = function(newDbid, newCounter) {
		console.log('setAttr dbid = ' + newDbid);
		activity.dbid = newDbid;
		activity.counter = newCounter;

		console.log('setText to = ' + dbActivities[activity.dbid][0]);
		setText(dbActivities[activity.dbid][0]);
	    activity.set.forEach(function(elem) {
	    	elem.dbid = activity.dbid;
	    	elem.counter = activity.counter;
	        elem.set = activity.set; // allows the drag method to apply on the whole set
	    });
		activity.set.attr("cursor", "pointer");
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
	    graph.updateCounter(null, activity.dbid, activity.counter);
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
	    	possibleConnection.hide();
	    }
	    // When two activities are selected and not already connected,
	    if (graph.selectedActivities.length == 2) {
	    	// Builds connection if valid
	    	if (graph.isConnectionValid()) {
	    	 	graph.buildConnection({
	    	 		sId: graph.selectedActivities[0].dbid,
	    	 		sCount: graph.selectedActivities[0].counter,
	    	 		eId: graph.selectedActivities[1].dbid,
	    	 		eCount: graph.selectedActivities[1].counter
	    	 	});
	    	}
	    	graph.deselectActivities();
	    	possibleConnection.hide();
	    } 
	};

	/**
	 * Called when editing activity: updates graph counterMap before updating attributes
	 * @param {int} newDbid
	 *
	 */
	activity.edit = function(newDbid) {
		var oldDbid = activity.dbid;
	    var newCounter = graph.updateCounter(newDbid, oldDbid, activity.counter);
	    activity.setAttributes(newDbid, newCounter);
	};

	return activity;
};
