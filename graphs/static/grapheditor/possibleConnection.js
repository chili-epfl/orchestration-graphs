/**
 * Possible Connection class
 * 
 */
var PossibleConnection = function() {

	// Instance to return (inheritance from Connection)
	var possibleConnection = Connection.apply(possibleConnection);

	// Private variables
	var paper = SingletonGraph.getInstance().paper;
	var set = paper.set();


	// Public variables and functions

	// Initialize the possible connection by creating the path
	possibleConnection.initRaphaelElements = function() {
		possibleConnection.path = paper.path();
		set.push(possibleConnection.path);
	};
	// Hide path
	possibleConnection.hide = function() {
		possibleConnection.path.hide();
	};
	// Show path and set style
	possibleConnection.show = function() {
		possibleConnection.path.show();
		possibleConnection.path.style('base', 'possibleConnection');
	};
	
	return possibleConnection;
};
