var graphHandlers = {
   	/**
	 * Handles Click on Graph
	 * - Deletes possible connection 
	 * OR
	 * - Show activity creation modal
	 * event.data contains nFixedElements
	 */
	onClick: function(event) {
		if (!graph.blockActivityCreation &&
			(!graph.paper.getElementByPoint(event.clientX, event.clientY) ||
			graph.paper.getElementByPoint(event.clientX, event.clientY).id <= event.data.nFixedElements)) {
			// If on graph (not on existing activity)
			if (graph.selectedActivities.length == 1) {
				// If connecting, delete possible connection
	    		graph.deselectActivities();
	    		SingletonPossibleConnection.getInstance().hide();
			} else {
				// If on graph, create activity
	    		position = {};
				position.x = event.offsetX;
				position.y = event.offsetY;
				graph.storeData(position);
				$('#activityChoice').modal('show');
			}
		}
	},

   	/**
	 * Handles Submit on Activity Modal
	 */
	onActivityModalSubmit: function(e) {
		$('#activityChoice').modal('hide');
		var data = graph.retrieveData();
		var dbid = parseInt($('#activitySelector').val());
		$('#activitySelector').val('choose');
		
		if (data.rectangle) {
			// Data is the Activity object to edit
			data.edit(dbid);
		} else {
			// Data contains {dbid, x, y}
			data.dbid = dbid;
			graph.buildActivity(data);
		}
	},

	/**
	 * Handles mouse move on graph
	 * Update cursor position & possibleConnection
	 * event.data contains nFixedElements
	 */
	onMouseMove: function(event) {
    	if (!graph.paper.getElementByPoint(event.clientX, event.clientY) ||
			graph.paper.getElementByPoint(event.clientX, event.clientY).id <= event.data.nFixedElements) {
			cursor.attr({x: event.offsetX-1, y: event.offsetY-1});
		}
		if (graph.selectedActivities.length == 1) {
			SingletonPossibleConnection.getInstance().update();
		}
	}	   
}

var activityHandlers = {
	// Hover handlers
	// this contains the Activity object
	hoverIn: function(event) {
		this.activity.deleteButton.show();
		SingletonPossibleConnection.getInstance().setTo(this.activity.rectangle);
	},
	hoverOut: function(event) {
		this.activity.deleteButton.hide();
		SingletonPossibleConnection.getInstance().setTo(graph.getCursor());
	},

	// Select the activity if one is already selected
	// event.data contains the Activity object
	onClick: function(event) {
		event.preventDefault();
		if (graph.selectedActivities.length == 1) {
			event.data.activity.select();
		}
	},

	// If edit: stores the edited activity and shows modal
	// If connect: selects activity
	// this contains the Activity object
	onContextMenuItemSelect: function(menuitem, target, href, pos) {
		switch (menuitem.attr("name")) {
			case 'edit':
	        	$('#activitySelector').val(this.activity.get().dbid);
	        	graph.storeData(this.activity.get());
				$('#activityChoice').modal('show');
				break;
			case 'connect':
				if (graph.selectedActivities.length == 0) {
	            	this.activity.select();
	            }
	            break;
	    }
	},

	// Stores origin position
	dragger: function() {
		this.activity.Ox = this.activity.x;
		this.activity.Oy = this.activity.y;
	},
	// Reposition the activity on origin + dx/dy
	move: function(dx, dy) {
		var x = this.activity.Ox + dx;
		var y = this.activity.Oy + dy;
	    this.activity.x = x;
	    this.activity.y = y;
	    this.activity.rectangle.attr({x: x - this.width/2, y: y - this.height/2});
	    this.activity.text.attr({x: x, y: y});
	    this.activity.deleteButton.setPosition({x: x+this.width/2, y: y-this.height/2});
	    graph.updateConnections();
	    //r.safari();
	},
	// Reposition the activity on the nearest social plane
	up: function() {
		var y = graph.getNewY(this.activity.y);
		this.activity.y = y;
	    this.activity.rectangle.attr({y: y - this.height/2});
	    this.activity.text.attr({y: y});
	    this.activity.deleteButton.setPosition({y: y-this.height/2});
	    graph.updateConnections();
	    
	    // Prevent the click handler on $('#graph') to create a new activity immediately after the drop
	    graph.blockActivityCreation = true;
	    setTimeout(function(){graph.blockActivityCreation = false;}, 0);
	}
}

var connectionHandlers = {
	// Shows button when near connection (on BBox)
	// Event.data contains the connection
	onMouseMove: function(event) {
		var box = event.data.connection.getBBox();
		if (event.offsetX > box.x && event.offsetX < box.x+box.width &&
			event.offsetY > box.y && event.offsetY < box.y+box.height) {
			event.data.connection.deleteButton.show();
		} else {
			event.data.connection.deleteButton.hide();
		}
	}
}


var deleteButtonHandlers = {
	// Erase the target of the button
	// Event.data contains the target
	onClick: function(event) {
		// Prevent the click handler on $('#graph') to create a new activity immediately after the drop
		graph.blockActivityCreation = true;
		setTimeout(function(){ graph.blockActivityCreation = false; }, 0);
	    event.data.target.delete();
	}
}


