/**
 * Delete button class
 * 
 */
var DeleteButton = function() {

	// Instance to return
	var deleteButton = {};

	// Private variables
	var x, y;
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;
	var target;
	var circleColor = "#FF4E53";
	var textColor = "#FFFFFF";

	// Private functions

	function drawCircle() {
		deleteButton.circle = paper
		.circle(x, y, 7)
		.attr({fill: circleColor, "stroke-width": 0});
    }

	function drawText() {
	    deleteButton.text = paper
	    .text(x, y, 'X')
	    .attr({ fill: textColor });
	}

	// Public variables and functions

	deleteButton.circle = null;
	deleteButton.text = null;

	/**
	 * Initialize the delete button by setting circle and text
	 *
	 */
	deleteButton.initRaphaelElements = function(type, params) {
		if (params.deleteCircle && params.deleteText){
			deleteButton.circle = params.deleteCircle;
			deleteButton.text = params.deleteText;
		} else {
			drawCircle();
			drawText();
		}
		deleteButton.circle.description = type + "DeleteCircle";
	    deleteButton.text.description = type + "DeleteText";
	    deleteButton.hide();
	};

	/**
	 * Bind a target to this delete button,
	 * @param {Object} instance - to bind (Activity or Connection)
	 * @param {Object} position - containing x and y
	 *
	 */
	deleteButton.bindTarget = function(instance, position) {
		target = instance;
		deleteButton.setPosition(position);
	};

	/**
	 * Custom handlers related to this delete button
	 * - Click on circle/text => delete the target
	 *
	 */
	deleteButton.setCustomHandlers = function() {
		var nodes = [deleteButton.circle.node, deleteButton.text.node];
		$(nodes).on('click', {target: target}, deleteButtonHandlers.onClick);
	};

	/**
	 * Update the position of the button
	 * @params {Object} position - containing x and y
	 *
	 */
	deleteButton.setPosition = function(position) {
		deleteButton.circle.attr("cx", position.x);
		deleteButton.circle.attr("cy", position.y);
		deleteButton.text.attr("x", position.x);
		deleteButton.text.attr("y", position.y);
	};

	deleteButton.show = function() {
		deleteButton.circle.show();
		deleteButton.text.show();
	};
	deleteButton.hide = function() {
		deleteButton.circle.hide();
		deleteButton.text.hide();
	};
	
	return deleteButton;
};
