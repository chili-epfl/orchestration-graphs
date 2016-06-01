/**
 * Delete button class
 * 
 */
var DeleteButton = function() {

	// Instance to return (inheritance from Button)
	var deleteButton = Button.apply(deleteButton);

	// Private variables
	var x, y;
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;

	// Private functions

	function drawCircle() {
		deleteButton.circle = paper
		.circle(x, y, 7)
	 	.style('base', 'deleteButton');
    }

	function drawText() {
	    deleteButton.text = paper
	    .text(x, y, 'X')
	 	.style('base', 'button');
	}

	// Public variables and functions

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
	 * Custom handlers related to this delete button
	 * - Click on circle/text => delete the target
	 *
	 */
	deleteButton.setCustomHandlers = function() {
		var nodes = [deleteButton.circle.node, deleteButton.text.node];
		$(nodes).on('click', {target: deleteButton.getTarget()}, deleteButtonHandlers.onClick);
	};

	return deleteButton;
};
