/**
 * Graph class
 * @param {string} divId - HTML id of the div containing the Raphael paper
 * @return {Object} - Graph instance
 */
var Graph = function(divId) {
	
	// Private varuabkes
	var graph = {};

	var raphaelJson, graphJson;
	var nPlanes = 6;
	var interPlanes = 50; // space between two planes in px
	var nFixedElements = 0;
	var height = (nPlanes+1)*interPlanes; // total height of the paper in px
	var width = 2000; //px
	var possibleConnection = null;
	
	// When creating new activity, storedData contains the new position
	// When editing an activity, storedData contains the Activity object
	var storedData = null;
	var inspectedObject = null;

	/**
	 * Custom handlers related to the graph
	 *
	 */
	function setCustomHandlers() {
		// Update RaphaelJS cursor element and possible connection on mouse move
    	$("#"+divId).on('mousemove', {nFixedElements: nFixedElements}, graphHandlers.onMouseMove);
    	// Cancel Connection creation or init Activity creation on click
    	$("#"+divId).on('click', {nFixedElements: nFixedElements}, graphHandlers.onClick);
    	// Build a context menu on right click
    	$("#"+divId).contextMenu({ selector: "*", nFixedElements: nFixedElements,
    		build: graphHandlers.onContextMenu,
    	});
    	// Display save modal when clicking save button
    	$("#saveButton").on('click', graphHandlers.onSaveButtonClick);
    	// Clear the inspector panel when clicking on the close button
    	$('#inspectContainer .close').on('click', inspectPanelHandlers.onClear);
    	// Save the scenario when confirming the save modal
    	$("#confirmSaveModal").on('click', saveToDatabase);
    }


	/**
	 * Builds activities and connections from raphaelJson
	 * @param {string} json - RaphaelJson from database
	 *
	 */
	function loadScenario(json) {
	    // Generate graph from JSON
	    graph.paper.fromJSON(nFixedElements, json, function(el, data) {
	    	// If last RaphaelJS element of an activity is found
	      	if (data.description == 'activityDeleteText') {
	    		// Build a new Activity
	    		var activity = graph.buildActivity({
	          		dbid : data.dbid,
	          		counter : data.counter,
	          		rectangle : graph.paper.getById(el.id - 5),
	            	text : graph.paper.getById(el.id - 4),
	            	inspectCircle : graph.paper.getById(el.id - 3),
	            	inspectText : graph.paper.getById(el.id - 2),
	            	deleteCircle : graph.paper.getById(el.id - 1),
	            	deleteText : el
	            });
	        // If last RaphaelJS element of a connection is found
			} else if (data.description == 'connectionDeleteText') {
	    		// Build a new Connection
	            graph.buildConnection({
	            	sId: data.startId,
	            	sCount: data.startCount,
	            	eId: data.endId,
	            	eCount: data.endCount,
	            	type: data.type,
	            	subtype: data.subtype,
	            	label: data.label,
	            	sublabel: data.sublabel,
	                path: graph.paper.getById(el.id - 4),
	                inspectCircle: graph.paper.getById(el.id - 3),
	                inspectText: graph.paper.getById(el.id - 2),
	                deleteCircle: graph.paper.getById(el.id - 1),
	                deleteText: el
	            });
	        }
	        return el;
	    });
	}

	/**
	 * Generates Jsons using private functions
	 * Submits form that saves the scenario in database
	 *
	 */
   	function saveToDatabase() {
   		$('#scenarioForm #id_raphaelJson').val(makeRaphaelJson());
   		$('#scenarioForm #id_json').val(makeGraphJson());

   		// Submit form to save changes
   		document.getElementById('scenarioForm').submit();
   	};
 
	/**
	 * Serialize the graph for future edition (ignores fixed elements)
	 * Save custom attributes of Raphael elements in the json output
	 * @return {String} 
	 *
	 */
	function makeRaphaelJson() {
	    raphaelJson = graph.paper.toJSON(nFixedElements, function(el, data) {
			data.startId = el.startId;
	        data.startCount = el.startCount;
	        data.endId = el.endId;
	        data.endCount = el.endCount;
	        data.type = el.optype;
	        data.subtype = el.subtype;
	        data.label = el.label;
	        data.sublabel = el.sublabel;
	        data.dbid = el.dbid; // attribute to find corresponding activity
	        data.counter = el.counter; // attribute to find corresponding activity
	        data.description = el.description;
	        return data;
	    });
	    return JSON.stringify(raphaelJson);
	}

	/**
	 * Serialize the graph for path generation
	 * Activity (and start) format: { 'id': dbid, 'counter': counter }
	 * Connection format : { 'a1': { 'id': dbid, 'counter': counter }, 'a2': { 'id': dbid, 'counter': counter }, }
	 * @return {String} 
	 *
	 */
	function makeGraphJson() {
	    graphJson = {};
	    graphJson["activities"] = [];
	    graph.activities.forEach(function(activity) {
	        graphJson["activities"].push({ "id": activity.dbid, "counter": activity.counter });
	    });
	    graphJson["edges"] = [];
	    graph.connections.forEach(function(connection) {
	    	graphJson["edges"].push({
	    		"a1": { "id": connection.from.dbid, "counter": connection.from.counter },
	    		"a2": { "id": connection.to.dbid, "counter": connection.to.counter }
	    	});
	    });
	    graphJson["start"] = getStartActivity();
	    return JSON.stringify(graphJson);
	}

	/**
	 * Generates start object for GraphJson: find the leftest activity in the graph
	 * @return {Object} - Activity in the graphJson format
	 *
	 */
	function getStartActivity() {
	    leftActId = 0; // init, is the id of an activitySet in graphActivities
	    leftActX = graph.activities[leftActId].rectangle.attr("x");
	    graph.activities.forEach(function(activity, id) {
	        if (activity.rectangle.attr("x") < leftActX) {
	            // Another activity found on the left, update
	            leftActId = id;
	            leftActX = activity.rectangle.attr("x");
	        }
	    });
	    return {
	    	"id": graph.activities[leftActId].dbid,
	    	"counter": graph.activities[leftActId].counter
	    };
	}


	// Public variables and functions

	graph.paper = Raphael(divId, width, height);
	graph.id = divId;
	// List of all activities and connections objects in the graph
	graph.connections = [];
	graph.activities = [];

	graph.selectedActivities = [];
	graph.blockActivityCreation = false;
	graph.counterMap = {};

	/**
	 * Called on instantiation of the Singleton graph
	 * Initialize fixed elements (planes, possibleConnection, cursor, ...)
	 * If editing an existing scenario, load it
	 *
	 */
    graph.init = function() {
    	// Create social planes
    	planes = [];
    	for (var y=interPlanes; y<height; y=y+interPlanes) {
   			planes.push(graph.paper
   						.path("M0 " + y + " L" + width + " " + y)
   						.attr({stroke:'#BBB'}));
		};
		
		cursor = graph.paper.rect(0, 0, 1, 1).hide();
		
		possibleConnection = SingletonPossibleConnection.getInstance();
		possibleConnection.initRaphaelElements();
		possibleConnection.hide();

		nFixedElements = graph.paper.top.id;
		setCustomHandlers();

		builders = generateBuilders(graph);
		graph.buildActivity = builders.newActivity;
		graph.buildConnection = builders.newConnection;

		if (oldScenario) {
			loadScenario(oldScenario);
		}
	};

	/**
	 * Get the Activity object in the graph from its dbid and counter
	 * Called in Connection initRaphaelElements when creating or loading (to get the from and to Raphael elements)
	 * Called in the graphHandlers on context menu to find on which activity the right click was
	 * @param {int} dbid
	 * @param {int} counter
	 *
	 */
	graph.getActivityFromDbid = function(dbid, counter) {
		var res = null;
		graph.activities.forEach(function(activity) {
			if (activity.dbid == dbid && activity.counter == counter) {
				res = activity;
			}
		});
		return res;
	};

	/**
	 * Find the y coordinate of the nearest plane from an oldy position
	 * Called from Activity initRaphaelElements when creating or loading
	 * Called from the up function in the activityHandlers (end of drag and drop)
	 * @param {int} oldy - current y position of the activity
	 * @return {int} - new y position of the activity
	 */
	graph.getNewY = function(oldy) {
		var newy = nPlanes*interPlanes;
	    for (var i = nPlanes; i > 0; i--) {
	    	if (oldy < i*interPlanes + interPlanes/2) {
	            newy = i*interPlanes;
	        }
	    };
	    return newy;
	};

	/**
	 * Update path and BBox for each connection
	 * Called in the move and up functions of the activityHandlers (drag and drop)
	 *
	 */
	graph.updateConnections = function() {
		for (var i = graph.connections.length; i--;) {
	        graph.connections[i].update();
	    }
	};

   	/**
   	 * Removes Activity from array of activities
	 * @param {Activity} activity - to delete
	 *
	 */
	graph.deleteActivity = function(activity) {
		if (graph.getInspectedObject() == activity) {
			$('#inspectClose').click();
		}
		var index = graph.activities.indexOf(activity);
		if (index > -1) {
			graph.activities.splice(index, 1);
		} else {
			throw new Error("Activity not found");
		}
   	};

   	/**
   	 * Delete all activities (and connections) from the graph
   	 *
   	 */
   	graph.clear = function() {
   		for (var i = graph.activities.length-1; i >= 0; i--) {
   			graph.activities[i].delete();
   		}
   	};

	/**
   	 * Removes Connection from array of connections
	 * @param {Connection} connection - to delete
	 *
	 */
	graph.deleteConnection = function(connection) {
		if (graph.getInspectedObject() == connection) {
			$('#inspectClose').click();
		}
		var index = graph.connections.indexOf(connection);
		if (index > -1) {
			graph.connections.splice(index, 1);
		} else {
			throw new Error("Connection not found");
		}
	};
	
    /**
     * @return {boolean} - true if selectedActivities are not already connected
     *
     */
	graph.isConnectionValid = function() {
		var existingConnections = 0;
	    for (var i=0; i<graph.connections.length; i++) {
	   		if ((graph.connections[i].from == graph.selectedActivities[0].rectangle &&
		        graph.connections[i].to == graph.selectedActivities[1].rectangle)  ||
		       	(graph.connections[i].to == graph.selectedActivities[0].rectangle &&
		       	graph.connections[i].from == graph.selectedActivities[1].rectangle)) {
		       	return false;
			}
		}
    	return true;
	};

    graph.storeData = function (data) { storedData = data; }
	graph.retrieveData = function () { return storedData; }
	graph.setInspectedObject = function (object) {
		if (inspectedObject) {
			inspectedObject.inspectSet.style('base', 'default', {duration: 300, easing: 'linear'});
		}
		if (object) {
			inspectedObject = object;
			object.inspectSet.style('base', 'inspected', {duration: 300, easing: 'linear'});
		} else {
			inspectedObject = null;
		}
	}
	graph.getInspectedObject = function () { return inspectedObject; }
	graph.selectActivity = function(activity) { graph.selectedActivities.push(activity); };
	graph.deselectActivities = function() {
		graph.selectedActivities = [];
		// Connection finished, reset modal values
		$('#operatorTypeSelector').val('choose');
		$('#operatorSubtypeSelector').val('choose');
		$('#operatorLabelSelector').val('choose');
		$('#operatorSublabelSelector').val('choose');
		possibleConnection.hide();
	}
	graph.getCursor = function() { return cursor; };
	graph.getInterPlanes = function() { return interPlanes; };

	return graph;
};

