var vpHeight = 300;
var vpWidth = "100%";

var planes = ["Class","Group","Individual"];
var numPlanes = planes.length;

var planeHeight = vpHeight/numPlanes;
var activityHeight = planeHeight * 0.3;
var activityWidth = activityHeight * 3;

var s = Snap("#graph");

// Define planes
for (var i = 0; i < numPlanes; i++){
    var y = planeHeight * i + planeHeight/2;
    var line = s.line(0, y, vpWidth, y);
    line.attr({
        stroke: "#aaa",
        strokeWidth: 2
    });
    s.text(10, y-5, planes[i]);			 
}

// Create activity factory
var a = s.rect(-1000, -1000, activityWidth, activityHeight, activityWidth*0.1);
a.attr({
    fill: "#bada55",
    stroke: "#333",
    strokeWidth: 2
});

var orig = {x: 0,y: 0};

function Activity () {
    this.link = null;
    this.title = null;
    this.block = a.clone();
    this.block.activity = this;
}
 
Activity.prototype.plane = function() {
    return Math.floor(parseInt(this.block.attr("y")) / planeHeight);
};

var activities = [];

linkActivities = function(a1,a2){
    edges.push({
        from: a1,
        to: a2,
        line: s.line(a1.block.x,a1.block.y,a2.block.x,a2.block.y)
    });
}

clearGraph = function()
{
    activities.forEach(function(a){
	a.block.remove();
    });
    edges.forEach(function(e){
	e.line.remove();
    });

    edges = [];
    activities = [];
}

addActivity = function(pos){
    var anew = new Activity();
    activities.push(anew);
    anew.block.drag(activityOnMove, activityOnStart, activityOnStop);
    anew.block.mouseover(activityOnMouseOver);
    anew.block.click(activityOnClick);
    anew.block.mouseout(activityOnMouseOut);
    anew.block.attr({x: pos.x - anew.block.attr("width")/2,
	       y: pos.y - anew.block.attr("height")/2});
    activitySnap(anew.block,pos.x - anew.block.attr("width")/2,pos.y - anew.block.attr("height")/2);
    return anew;
}

var edges = [];

updateEdges = function(){
    edges.forEach(function(e){
        var x1 = parseFloat(e.from.block.attr("x"));
        var x2 = parseFloat(e.to.block.attr("x"));
        var y1 = parseFloat(e.from.block.attr("y"));
        var y2 = parseFloat(e.to.block.attr("y"));

	var newy1 = y1 + activityHeight/2;		      
	var newy2 = y2 + activityHeight/2;		      

        if (x1 + activityWidth < x2){
	    x1 = x1 + activityWidth;
        }
        else if (x2 + activityWidth < x1){
	    x2 = x2 + activityWidth;
        }
        else if ((x1 <= (x2 + activityWidth) && x1 >= x2) || 
		 (x2 <= (x1 + activityWidth) && x2 >= x1)){
	    x1 = x1 + activityWidth/2;
	    x2 = x2 + activityWidth/2;
	    if (y1 < y2){
                newy1 = y1 + activityHeight;
                newy2 = y2;
            }
            else {
                newy1 = y1;
                newy2 = y2 + activityHeight;
            }
        }
	
	e.line.attr({
            x1: x1,
	    y1: newy1,
	    x2: x2,
	    y2: newy2
        });

        e.line.attr({
            stroke: "#333",
            strokeWidth: 4
        });
    });

}

var newEdge = 0; 
var activityMouseOver = null;
var activitySelected = null;
var currentMousePos = { x: -1, y: -1 };

activityOnMouseOver = function (dx, dy, x, y, e) {
    activityMouseOver = this;
    if (activitySelected == this.activity)
	return;
    this.attr({
	fill: "#D3E890"
    });
}

activityOnMouseOut = function (dx, dy, x, y, e) {
    if (activityMouseOver == this)
	activityMouseOver = null;
    if (activitySelected == this.activity)
	return;
    this.attr({
	fill: "#bada55"
    });
}

clearActivities = function (){
    activities.forEach(function(a){
	a.block.attr({
	    fill: "#bada55"
	});
    });
}

populateActivityForm = function (a){
    var link = a.link ? a.link : "-";
    $("#activity-choice").val(link);
}

activityOnClick = function () {
    console.log("activity.clicked");
    clearActivities();
    if (activitySelected != null && activitySelected.block == this){
	activitySelected = null;
	this.attr({
	    fill: "#D3E890"
	});
    }
    else {
	this.attr({
	    fill: "#8FBA09"
	});
	activitySelected = this.activity;
	populateActivityForm(this.activity);
    }
}

activityOnMove = function (dx, dy, x, y, e) {
    if (e.button == 0 && !e.ctrlKey){
	var offset = $(".context-menu-one").offset();
	activitySnap(this, currentMousePos.x + offset.left, currentMousePos.y);
    }
    if (e.button == 0 && e.ctrlKey){
	newEdge.attr({x2:currentMousePos.x,y2:currentMousePos.y});
    }
}

activityOnStop = function (e) {
    if (e.button == 0 && e.ctrlKey &&
	activityMouseOver){
	var a;
	linkActivities(this.activity, activityMouseOver.activity);
    }
    if (newEdge){
	newEdge.remove();
	newEdge = 0;
    }
    updateEdges();
    orig.x = 0;
    orig.y = 0;
}

activitySnap = function(a, x, y){
//    var offset = $(".context-menu-one").offset();
    var ySnap = Snap.snapTo(planeHeight, y, 100000000);

    if (ySnap > planeHeight * (numPlanes - 1)) {
	ySnap = planeHeight * (numPlanes - 1);
    }
    if (ySnap < 0) ySnap = 0;
    var newX = x + orig.x;
    if (newX < 100) newX = 100; 
    a.attr({
	x: newX,
	y: ySnap + planeHeight/2 - activityHeight/2,
    });
    updateEdges()
}

activityOnStart = function (x, y, e) {
    if (e.button == 0 && !e.ctrlKey ){
	orig.x = e.target.getAttribute("x") - x;
    }
    if (e.button == 0 && e.ctrlKey ){
	var x = parseFloat(this.attr("x")) + parseFloat(this.attr("width"))/2;
	var y = parseFloat(this.attr("y")) + parseFloat(this.attr("height"))/2;
	newEdge = s.line(x,y,x,y);
        newEdge.attr({
            stroke: "#333",
            strokeWidth: 4
        });
    }
}

exportJson = function(){
    activities.sort(function(a,b){
	var ax = a.block.attr('x');
	var bx = b.block.attr('x');
	return ax - bx;
    });

    var actExport = [];
    var edgesExport = [];

    activities.forEach(function(activity) {
	actExport.push({
	    link: activity.link,
	    title: activity.title,
	    x: activity.block.attr('x'),
	    plane: activity.plane()
	});
    });

    edges.forEach(function(edge) {
	edgesExport.push({
	    a1: activities.indexOf(edge.from),
	    a2: activities.indexOf(edge.to)
	});
    });

    return JSON.stringify({activities: actExport, edges: edgesExport});
}

importJson = function(json){
    var parsed = JSON.parse(json);

    clearGraph();

    var actImport = parsed["activities"];
    var edgesImport = parsed["edges"];

    actImport.forEach(function(activity) {
	var pos = {};
	pos.x = activity.x;
	pos.y = activity.plane * planeHeight + planeHeight/2;

	activity.activity = addActivity(pos);
	activity.activity.link = activity.link;
	activity.activity.title = activity.title;
    });

    edgesImport.forEach(function(edge) {
	linkActivities(actImport[edge.a1].activity, actImport[edge.a2].activity);
    });
    updateEdges();

}

$(function(){
    $(document).mousemove(function(event) {
	var offset = $(".context-menu-one").offset();
        currentMousePos.x = event.pageX - offset.left;
        currentMousePos.y = event.pageY - offset.top;
    });

    $.contextMenu({
        selector: '.context-menu-one', 
        callback: function(key, options) {
            if (key == "add"){
		var offset = $(".context-menu-one").offset();
                opt = options;
		var pos = currentMousePos;
                addActivity(pos);
            }
        },
        items: {
            "add": {name: "Add", icon: "edit"},
            "edit": {name: "Edit", icon: "edit"},
            "delete": {name: "Delete", icon: "delete"},
        }
    });
    
    $( "#activity-choice" )
	.change(function () {
	    var link = null;
	    $( "#activity-choice option:selected" ).each(function() {
		link = $( this ).val();
		title = $( this ).text();
	    });
	    if (activitySelected != null){
		activitySelected.link = link;
		activitySelected.title = title;
	    }
	});

    $( "#scenario-form" ).submit(function( event ) {
	var json = exportJson();
	$( "#id_json" ).val(json);
	console.log("#id_json");
	return true;
    });
});

