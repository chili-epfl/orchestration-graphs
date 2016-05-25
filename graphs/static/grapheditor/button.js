/**
 * Button class
 * 
 */
var Button = function() {

	// Instance to return
	var button = {};
	var target = null;

	// Private variables
	var x, y;
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;
	//var circleColor = "#FF4E53";
	var textColor = "#FFFFFF";

	// Public variables and functions

	button.circle = null;
	button.text = null;

	/**
	 * Bind a target to this delete button,
	 * @param {Object} instance - to bind (Activity or Connection)
	 * @param {Object} position - containing x and y
	 *
	 */
	button.bindTarget = function(instance, position) {
		target = instance;
		button.setPosition(position);
	};

	/**
	 * Update the position of the button
	 * @params {Object} position - containing x and y
	 *
	 */
	button.setPosition = function(position) {
		button.circle.attr("cx", position.x);
		button.circle.attr("cy", position.y);
		button.text.attr("x", position.x);
		button.text.attr("y", position.y);
	};

	button.getTarget = function() { return target; };

	button.show = function() {
		button.circle.show();
		button.text.show();
	};
	button.hide = function() {
		button.circle.hide();
		button.text.hide();
	};
	
	return button;
};
