/**
 * Graph class
 * @param {string} divId - HTML id of the div containing the Raphael paper
 * @return {Object} - Graph instance
 */
var Graph = function(divId) {
	
	// Instance to return
	var graph = {};

	var raphaelJson, graphJson;
	var nPlanes = 6;
	var interPlanes = 50; // space between two planes in px
	var nFixedElements = 0;
	var height = (nPlanes+1)*interPlanes; // total height of the paper in px
	var width = 2000; //px
	var possibleConnection = null;
	// When creating new activity, stores x and y before showing the modal
	// When editing an activity, stores the Activity object before showing the modal
	var storedData = null;

	/**
	 * Custom handlers related to the graph
	 */
	function setCustomHandlers() {
    	$("#"+divId).on('mousemove', {nFixedElements: nFixedElements}, graphHandlers.onMouseMove);
    	$("#"+divId).on('click', {nFixedElements: nFixedElements}, graphHandlers.onClick);
    	$("#"+divId).contextMenu({
    		selector: "*",
    		nFixedElements: nFixedElements,
    		build: graphHandlers.onContextMenu,
    	});
    	$("#saveButton").on('click', graphHandlers.onSaveButtonClick);
    	$("#confirmSaveModal").on('click', saveToDatabase);

    	$("#confirmActivityModal").on('click', graphHandlers.onActivityModalSubmit);

    	$("#operatorTypeSelector").on('change', graphHandlers.onOperatorTypeSelect);
    	$("#operatorLabelSelector").on('change', graphHandlers.onOperatorLabelSelect);
    	$("#confirmOperatorModal").on('click', graphHandlers.onOperatorModalSubmit);
    	$("#cancelOperatorModal").on('click', graphHandlers.onOperatorModalCancel);

    	$('#inspectContainer .close').on('click', inspectPanelHandlers.onClear);
    }


	/**
	 * Builds activities and connections from json
	 * @param {string} json - RaphaelJson from database
	 */
	function loadScenario(json) {
	    // Generate graph from JSON
	    graph.paper.fromJSON(nFixedElements, json, function(el, data) {
	      	if (data.description == 'activityDeleteText') {
	    		// Creates new Activity
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
			} else if (data.description == 'connectionDeleteText') {
	        	// Creates new Connection
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
	 * Submits Django form
	 *
	 */
   	function saveToDatabase() {
   		$('#scenarioForm #id_raphaelJson').val(makeRaphaelJson());
   		$('#scenarioForm #id_json').val(makeGraphJson());

   		// Submit form to save changes
   		document.getElementById('scenarioForm').submit();
   	};
 
	/**
	 * Generates JSON containing all raphael elements (using plugin)
	 * ignores fixed elements (planes, cursors, etc.)
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
	 * Generates JSON containing scenario
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
	 * Generates start object for GraphJson
	 * @return {Object} - id & counter 
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

	graph.connections = [];
	graph.activities = [];
	graph.paper = Raphael(divId, width, height);
	graph.id = divId;
	graph.blockActivityCreation = false;
	graph.selectedActivities = [];
	graph.counterMap = {};
	// Element for the inspected panel
	graph.inspectedElement = null;

	/**
	 * Called on instantiation of the Singleton
	 * Initialize fixed elements (planes, possibleConnection, cursor)
	 * If editing existing scenario, loadScenario
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
	 * Compute new y such that the activity is on the nearest plane
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
	 * Calls update function (path and BBox) for each connection
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
		if (graph.inspectedElement == activity) {
			$('#inspectContainer').hide();
		}
		var index = graph.activities.indexOf(activity);
		if (index > -1) {
			graph.activities.splice(index, 1);
		} else {
			throw new Error("Activity not found");
		}
   	};

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
		if (graph.inspectedElement == connection) {
			$('#inspectContainer').hide();
		}
		var index = graph.connections.indexOf(connection);
		if (index > -1) {
			graph.connections.splice(index, 1);
		} else {
			throw new Error("Connection not found");
		}
	};
	
    /**
     * Return true if selectedActivities are not already connected
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

	graph.clearInspector = function() {
		graph.inspectedElement = null;
		graph.activities.forEach(function(activity) {
			activity.rectangle.attr('stroke', activity.getStroke());
		});
		graph.connections.forEach(function(connection) {
			connection.path.attr('stroke', connection.getStroke());
		});
	}

    /**
     * Allows to store data to distinguish activity creation and edition
     * Retrieved by onActivityModalSubmit handler
     * @param {Object} data - position of the new activity (ADD)
     * 						  Activity object to edit (EDIT)
     * 						  Raphael elements to load (LOAD)
     */
	graph.storeData = function (data) { storedData = data; }
	graph.retrieveData = function () { return storedData; }
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

