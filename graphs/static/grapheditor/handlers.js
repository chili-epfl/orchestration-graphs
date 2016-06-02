var modalHandlers = {};

/**
 * Handles click on submit button of the Activity modal
 *
 */
modalHandlers.onActivityModalSubmit = function() {
	// Retrieve graph data and dbid of the selected activity from the list in the modal
	var value = $('input[name="chosenActivity"]:checked').val();
	if (value) {
		var dbid = parseInt(value);
		var data = graph.retrieveData();

		// Hide Activity modal, reset filter and radio buttons in the modal
		$('#activityChoice').modal('hide');
		$('#filterActivityModal').val('').keyup();
		$('input[name="chosenActivity"]:checked').prop('checked', false);
		
		// If data is an Activity object, edit it with the selected dbid
		if (data.rectangle) {
			data.edit(dbid);
		// Else, data contains the position clicked for a new Activity, build it with the selected dbid
		} else {
			data.dbid = dbid;
			graph.buildActivity(data);
		}
	}
}

/**
 * Handles selection of an operator type in the Operator modal
 *
 */
modalHandlers.onOperatorTypeSelect = function() {
	var value = $("#operatorTypeSelector").val();
	// If no type selected, hide the subtype selector
	if (value == 'choose') {
		$("#operatorSubtype").hide();
	// Else, fill the subtype selector with appropriate options and show it
	} else {
		var htmlContent = '<option value="choose" href="#">Choose a subtype...</option>';
		operatorTypes[value].forEach(function(key) {
			htmlContent += '<option value="' + key + '" href="#">' + key + '</option>';
		});
		$('#operatorSubtypeSelector').html(htmlContent);
		$("#operatorSubtype").show();
	}
}

/**
 * Handles selection of an operator label in the Operator modal
 *
 */
modalHandlers.onOperatorLabelSelect = function() {
	var value = $("#operatorLabelSelector").val();
	// If no label selected, hide the subtype selector
	if (value == 'choose') {
		$("#operatorSublabel").hide();
	// Else, fill the sublabel selector with appropriate options and show it
	} else {
		var htmlContent = '<option value="choose" href="#">Choose a sublabel...</option>';
		operatorLabels[value].forEach(function(key) {
			htmlContent += '<option value="' + key + '" href="#">' + key + '</option>';
		});
		$('#operatorSublabelSelector').html(htmlContent);
		$("#operatorSublabel").show();
	}
}

/**
 * Handles click on submit button of the Operator modal
 *
 */
modalHandlers.onOperatorModalSubmit = function() {
	// If subtype and sublabel specified, hide Operator modal
	// but DO NOT reset them
	var subtypeValue = $("#operatorSubtypeSelector").val();
	var sublabelValue = $("#operatorSublabelSelector").val();
	if (sublabelValue != 'choose' && subtypeValue != 'choose') {
		$('#operatorChoice').modal('hide');
	}
}

/**
 * Handles click on cancel button of the Operator Modal
 *
 */
modalHandlers.onOperatorModalCancel = function() {
	// Hide Operator modal and deselect the selected activity
	$('#operatorChoice').modal('hide');
	graph.deselectActivities();
}



/**************************************************/
/**************************************************/
var graphHandlers = {};

/**
 * Handles click on Graph
 * @param {Event} event - data contains nFixedElements
 *
 */
graphHandlers.onClick = function(event) {
	var raphElement = graph.paper.getElementByPoint(event.clientX, event.clientY);
	// If not blocking activity creation
	// If clicking on graph (or on a fixed element)
	if (!graph.blockActivityCreation &&
		(!raphElement || raphElement.id <= event.data.nFixedElements)) {
		// If in the middle of creating a connection, deselect the selected activity
		if (graph.selectedActivities.length == 1) {
			graph.deselectActivities();
		// Else, store the position clicked in graph data and show the Activity modal
		} else {
    		position = {};
			position.x = event.offsetX;
			position.y = event.offsetY;
			graph.storeData(position);
			$('#filterActivityModal').val('').keyup();
			$('input[name="chosenActivity"]:checked').prop('checked', false);
			$('#activityChoice').modal('show');
		}
	}
}

/**
 * Handles right click on Graph
 * @param $trigger
 * @param {Event} event -  data contains nFixedElements
 *
 */
graphHandlers.onContextMenu = function($trigger, event) {
	var raphElement = graph.paper.getElementByPoint(event.clientX, event.clientY);
	// If clicking on graph (or on a fixed element), return the graph context menu
	if (!raphElement || raphElement.id <= event.data.nFixedElements) {
		return graphHandlers.getContextMenu();
	// Else, if clicking on an activity, return the context menu for this activity
	} else {
		var activity = graph.getActivityFromDbid(raphElement.dbid, raphElement.counter);
		if (activity) {
			return activityHandlers.getContextMenu(activity);
		} else {
			return false;
		}
	}
}

/**
 * Get the graph context menu
 * @return {Object} - context menu object (containing items and callback)
 *
 */
graphHandlers.getContextMenu = function() {
	return {
		callback: function(key, options) {
			switch (key) {
				// If clear is clicked, clear the graph
				case "clear": graph.clear(); break;
			}
		},
		items: {
			"clear": { name: "Clear graph" }
		}
	}
}

/**
 * Handles mouse move on Graph
 *
 */
graphHandlers.onMouseMove = function(event) {
	var raphElement = graph.paper.getElementByPoint(event.clientX, event.clientY);
	// If moving on graph (or on a fixed element), move raphaelJS cursor next to the cursor
	if (!raphElement || raphElement.id <= event.data.nFixedElements) {
		cursor.attr({x: event.offsetX-1, y: event.offsetY-1});
	}
	// If in the middle of creating a connection, update the possible connection to the cursor
	if (graph.selectedActivities.length == 1) {
		SingletonPossibleConnection.getInstance().update();
	}
}

/**
 * Handles click on save button
 *
 */
graphHandlers.onSaveButtonClick = function() {
	// If scenario has no name or no activity, prevent save
	if (!$('#scenarioForm #id_name').val()) {
		document.getElementById('saveMessage').innerHTML = 'Impposible to save: please set a name to your scenario.';
		document.getElementById('confirmSaveModal').disabled = true;
	} else if (graph.activities.length == 0) {
		document.getElementById('saveMessage').innerHTML = 'Impposible to save: please add at least one activity to your scenario.';
		document.getElementById('confirmSaveModal').disabled = true;
	// Else, ask for confirmation
	} else {
		document.getElementById('saveMessage').innerHTML = 'Are you sure that you want to save this scenario?';
		if (window.location.href.indexOf('editor') > -1) {
			document.getElementById('saveMessage').innerHTML += ' Previous version will be lost.';
		}
		document.getElementById('confirmSaveModal').disabled = false;
	}
	// Show the confirmation modal that, when submitted, saves the graph
	$('#saveError').modal('show');
}



/**************************************************/
/**************************************************/
var activityHandlers = {};

/**
 * Handles hover in an Activity
 * Show Activity buttons, set possible connection destination to the Activity rectangle
 * this contains the Activity object
 *
 */
activityHandlers.hoverIn = function(event) {
	this.activity.inspectButton.show();
	this.activity.deleteButton.show();
	SingletonPossibleConnection.getInstance().setTo(this.activity.rectangle);
}

/**
 * Handles hover out of an Activity
 * Hide Activity buttons, set possible connection destination to the cursor RaphaelJS element
 * this contains the Activity object
 *
 */
activityHandlers.hoverOut = function(event) {
	this.activity.inspectButton.hide();
	this.activity.deleteButton.hide();
	SingletonPossibleConnection.getInstance().setTo(graph.getCursor());
}

/**
 * Handles click on an Activity
 * If in the middle of creating a connection, select the Activity
 * @param {Event} event - data contains the Activity object 
 *
 */
activityHandlers.onClick = function(event) {
	event.preventDefault();
	if (graph.selectedActivities.length == 1) {
		event.data.activity.select();
	}
}

/**
 * Get the graph context menu
 * @param {Activity} - activity for which we need the context menu
 * @return {Object} - context menu object (containing items and callback)
 *
 */
activityHandlers.getContextMenu = function(activity) {
	return {
	    callback: function(key, options) {
	    	switch (key) {
	    		// If edit is clicked, store the edited Activity, set radio button in the Activity modal and show it
	    		case "edit":
		        	graph.storeData(activity);
	    			$('input[value="'+activity.dbid+'"]').prop('checked', true);
					$('#activityChoice').modal('show');
					break;
				// If connect is clicked and no activity is selected yet, select the Activity
	    		case "connect":
					if (graph.selectedActivities.length == 0) {
		            	activity.select();
		            }
		            break;
		        // If complex connect is clicked and no activity is selected yet, show the Operator modal and select the Activity
	    		case "complexConnect":
					$('#operatorChoice').modal('show');
					if (graph.selectedActivities.length == 0) {
		            	activity.select();
		            }
		            break;
	    	}
	    },
		items: {
			"edit": {name: "Edit"},
			"connect": {name: "Add simple operator"},
			"complexConnect": {name: "Add complex operator"},
		}
	}
}

/**
 * Handles drag on Activity
 * Save the original position
 *
 */
activityHandlers.dragger = function() {
	this.activity.Ox = this.activity.x;
	this.activity.Oy = this.activity.y;
}

/**
 * Handles move when dragging an Activity
 * @param {int} dx - variation of x from original position
 * @param {int} dy - variation of y from original position
 * Update raphaelJS elements positions
 *
 */
activityHandlers.move = function(dx, dy) {
	var x = Math.max(this.activity.Ox + dx, this.activity.getWidth()/2);
	var y = this.activity.Oy + dy;
    this.activity.x = x;
    this.activity.y = y;
    this.activity.rectangle.attr({x: x - this.activity.getWidth()/2, y: y - this.height/2});
    this.activity.text.attr({x: x, y: y});
    this.activity.inspectButton.setPosition({x: x-this.activity.getWidth()/2, y: y-this.height/2});
    this.activity.deleteButton.setPosition({x: x+this.activity.getWidth()/2, y: y-this.height/2});
    graph.updateConnections();
    //r.safari();
}

/**
 * Handles drop of an Activity
 * Reposition the raphaelJS elements on the nearest plane
 *
 */
activityHandlers.up = function() {
	var y = graph.getNewY(this.activity.y);
	this.activity.y = y;
    this.activity.rectangle.attr({y: y - this.height/2});
    this.activity.text.attr({y: y});
    this.activity.inspectButton.setPosition({y: y-this.height/2});
    this.activity.deleteButton.setPosition({y: y-this.height/2});
    graph.updateConnections();
    
    // Prevent the click handler on $('#graph') to create a new activity immediately after the drop
    graph.blockActivityCreation = true;
    setTimeout(function(){graph.blockActivityCreation = false;}, 0);
}



/**************************************************/
/**************************************************/
var connectionHandlers = {};

/**
 * Handles mouve move on the graph (particularly on a Connection)
 * @param {Event} event - data contains the Connection object
 *
 */
connectionHandlers.onMouseMove = function(event) {
	var box = event.data.connection.getBBox();
	// If move on the BBox of a Connection path, show the buttons
	if (event.offsetX > box.x && event.offsetX < box.x+box.width &&
		event.offsetY > box.y && event.offsetY < box.y+box.height) {
		event.data.connection.inspectButton.show();
		event.data.connection.deleteButton.show();
	// Else, hide the buttons
	} else {
		event.data.connection.inspectButton.hide();
		event.data.connection.deleteButton.hide();
	}
}



/**************************************************/
/**************************************************/
var deleteButtonHandlers = {};

/**
 * Handles click on a deleteButton
 * @param {Event} event - data contains the target of the button
 * Calls the delete function of the target of the button
 *
 */
deleteButtonHandlers.onClick = function(event) {
	// Prevent the click handler on $('#graph') to create a new activity
	graph.blockActivityCreation = true;
	setTimeout(function(){ graph.blockActivityCreation = false; }, 0);
    event.data.target.delete();
}



/**************************************************/
/**************************************************/
var inspectButtonHandlers = {};

/**
 * Handles click on an inspectButton
 * @param {Event} event - data contains the target of the button
 * Calls the inspect function of the target of the button, shows the inspector panel
 *
 */
inspectButtonHandlers.onClick = function(event) {
	event.data.target.inspect();
	$('#inspectContainer').show();
}



/**************************************************/
/**************************************************/
var inspectPanelHandlers = {};

/**
 * Handles click on the clear button of the inspector panel
 * Hides the panel
 *
 */
inspectPanelHandlers.onClear = function() {
	$('#inspectContainer').hide();
}
