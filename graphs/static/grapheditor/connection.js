/**
 * Connection class
 * @return {Object} - Connection instance
 */
var Connection = function() {

	// Instance to return
	var connection = {};

	// Private variables
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;
	var set = paper.set();
	var BBox;

	// Private functions

	/**
	 * Update the Raphael path of the connection
	 * such that it links connection.from and connection.to
	 *
	 */
	function updatePath() {
		// adapted from http://dmitrybaranovskiy.github.io/raphael/graffle.html
	    var bb1 = connection.from.getBBox(),
	        bb2 = connection.to.getBBox(),
	        // Attach points for each objects (top, bottom, left, right)
	        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
	        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
	        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
	        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
	        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
	        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
	        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
	        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
	        d = {}, dis = [];
	    for (var i = 0; i < 4; i++) {
	        for (var j = 4; j < 8; j++) {
	            var dx = Math.abs(p[i].x - p[j].x),
	                dy = Math.abs(p[i].y - p[j].y);
	            if ((i == j - 4) ||
	                (((i != 3 && j != 6) || p[i].x < p[j].x) &&
	                 ((i != 2 && j != 7) || p[i].x > p[j].x) && 
	                 ((i != 0 && j != 5) || p[i].y > p[j].y) && 
	                 ((i != 1 && j != 4) || p[i].y < p[j].y))) {
	                dis.push(dx + dy);
	                d[dis[dis.length - 1]] = [i, j];
	            }
	        }
	    }
	    // Compute path from attach points
	    if (dis.length == 0) {
	        var res = [0, 4];
	    } else {
	        res = d[Math.min.apply(Math, dis)];
	    }
	    var x1 = p[res[0]].x,
	        y1 = p[res[0]].y,
	        x4 = p[res[1]].x,
	        y4 = p[res[1]].y;
	    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
	    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
	    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
	        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
	        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
	        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
	    
	    // Update path and delete button
	    connection.path.attr({path: ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",")});
		
		if (connection.deleteButton) {
			connection.deleteButton.setPosition(
				connection.path.getPointAtLength(
					connection.path.getTotalLength()/2));
		}
	}

	/**
	 * Update the BBox object
	 * BBox is the BBox of the path (enlarged if too small)
	 *
	 */
	function updateBBox() {
		BBox = connection.path.getBBox();
		if (BBox.height < 10) {
		 	BBox.y = connection.path.getBBox().y - 5;
		 	BBox.height = connection.path.getBBox().height + 10;
		}
		if (BBox.width < 10) {
		 	BBox.x = connection.path.getBBox().x - 5;
		 	BBox.width = connection.path.getBBox().width + 10;
		}
	}

	// Public variables and functions

	// Raphael rectangles
	connection.from = null;
	connection.to = null;

	connection.path = paper.path();
	connection.deleteButton = null;

	/**
	 * Initialize the connection by setting from, to and path
	 * @param {Object} params - containing :
	 *		  {startRaphId, endRaphId} if creating new connection
	 *		  {startRaphId, endRaphId, raphael elements} if loading connection
	 */
	connection.initRaphaelElements = function(params) {
		console.log(params);
		if (params.sId && params.sCount && params.eId && params.eCount) {
			console.log(graph.getActivityFromDbid(params.sId, params.sCount));
			console.log(graph.getActivityFromDbid(params.eId, params.eCount));
			connection.from = graph.getActivityFromDbid(params.sId, params.sCount).rectangle;
			connection.to = graph.getActivityFromDbid(params.eId, params.eCount).rectangle;
			
			if (params.path) {
				connection.path = params.path;
			}
		} else {
			throw new Error('Impossible to create connection.');
		}
		connection.update();
		set.push(connection.path);
	};

	/**
	 * Update Raphael path and BBox
	 *
	 */
	connection.update = function() {
		updatePath();
		updateBBox();
	};

	/**
	 * Set Raphael elements custom attributes
	 *
	 */
	connection.setAttributes = function() {
		set.forEach(function(elem) {
			elem.startId = connection.from.dbid;
			elem.startCount = connection.from.counter;
			elem.endId = connection.to.dbid;
			elem.endCount = connection.to.counter;
    	});
    	connection.path.attr({
			stroke: "#BBB",
			"stroke-width": 3,
			"arrow-end": "classic-wide-long",
			fill: "none"
		});
	};

	/**
	 * Delete this instance from the graph and remove Raphael elements
	 *
	 */
	connection.delete = function() {
		graph.deleteConnection(this);
	    set.forEach(function(element) {
	    	element.remove();
	    });
		connection = null;
	};

	/**
	 * Bind a delete button to this connection,
	 * @param {DeleteButton} button
	 *
	 */
	connection.bindButton = function(button) {
		connection.deleteButton = button;
		set.push(connection.deleteButton.circle, connection.deleteButton.text);
		connection.deleteButton.bindTarget(
			connection,
			connection.path.getPointAtLength(connection.path.getTotalLength()/2)
		);
	};

	/**
	 * Custom handlers related to this connection
	 * Give them context data if needed (see connectionHandlers)
	 *
	 */
	connection.setCustomHandlers = function() {
		$("#"+graph.id).on('mousemove', {connection: connection}, connectionHandlers.onMouseMove);
	};

	/**
	 * Getter and setters for private variables
	 *
	 */
	connection.setFrom = function(rectangle) { connection.from = rectangle; };
	connection.setTo = function(rectangle) { connection.to = rectangle; };
	connection.setPath = function(path) { connection.path = path; };
	connection.getBBox = function() { return BBox; };
	
	return connection;
};
