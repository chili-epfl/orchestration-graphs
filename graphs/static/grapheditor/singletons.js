/**
 * Singleton pattern for Graph class
 */
var SingletonGraph = (function() {
	var instance;
	
	return {
	getInstance: function(value) {
		if (!instance) {
			instance = new Graph(value);
			// If first instance, initialize the Graph object
			instance.init();
		}
		return instance;
	}
	};
})();

/**
 * Singleton pattern for Graph class
 */
var SingletonPossibleConnection = (function() {
	var instance;
	
	return {
	getInstance: function(value) {
		if (!instance) {
			instance = new PossibleConnection(value);
		}
		return instance;
	}
	};
})();