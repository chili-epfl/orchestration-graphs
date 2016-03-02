/*
* This is supposed to contain the initialization functions.
*@author Farzaneh
*/


/*
 * initializes the pallet. NOT USED! I decided to have images instead
 */

 function initialize_pallet() {
 	var container = $("#pallet");
 	pallet = Raphael(container[0], 200, 186);

 	var activity = pallet.rect(15, 15, 50, 50).attr({
 		fill : "0000FF",
 		title : "Click to add an activity!",
 		cursor : "pointer"
 	});
	var dummy = pallet.rect(120, 60, 1, 1).attr({
		title : "Click to add a loop!" //TODO
	});
	dummy.node.id = "loop-rect";
	drawLoopIcon();
	/*
	 *upon click on the activity, add a new activity
	 */
	activity.click(function() {//I want to add a new activity
		var lastActivity = getLastActivity();
		var newActivity = new Activity(("a" + nextId), socialPlanes[0], initialDuration, tmax, lastActivity);
		nextId++;
		if (lastActivity != null) {
			lastActivity.nextActivity = newActivity;
		}
		newActivity.draw();
		chosenActivity = newActivity;
		loadProperties(newActivity);
		activities[activities.length] = newActivity; 
	});
}
/*creates a new loop- called when clicked on the loop icon*/
function newLoop(){
	loopMode=true;
	theLoop=new Loop();
	loops.push(theLoop);
	setFlash("loop");
}
/*creates a new upper level activity- called when clicked on the upper activity icon*/
function newHierarchy(){
	hierarchyMode=true;
	theUpperActivity=new upperActivity();
	upperActivities.push(theUpperActivity);
	setFlash("hierarchy");
}
/*creates a new  activity- called when clicked on the activity icon*/
function newAct(){
	var lastActivity = getLastActivity();
	var newActivity = new Activity(("a" + nextId), socialPlanes[0], initialDuration, tmax, lastActivity);
	nextId++;
		if (lastActivity != null) {
			lastActivity.nextActivity = newActivity;
		}
		newActivity.draw();
		chosenActivity = newActivity;
		loadProperties(newActivity);
		activities[activities.length] = newActivity; 
	}

	function addActivityToEnd(plane) {
		var lastActivity = getLastActivity();
		var newActivity = new Activity(("a" + activities.length), plane, initialDuration, tmax, lastActivity);
	if (lastActivity != null) {
		lastActivity.nextActivity = newActivity;
	}
	newActivity.draw();
	chosenActivity = newActivity;
	loadProperties(newActivity);
	activities[activities.length] = newActivity;
	return newActivity;
}

/*
 * initializes the editor
 * tabs
 * svg
 * planes
 */
function initialize_editor() {
	//create the svg
	//draw the axis
	var editorL = 800;
	var editorW = 1000;
	var container = $("#editor");
	editor = Raphael(container[0], "1200", "500");
	//I want to set an id for this svg
	arr=document.getElementsByTagName('svg');
	//console.log(arr.length);
	myPaper=arr[arr.length-1];
	myPaper.id="editor-svg";
	
	//why? 80%? to prevent the scrollbar from appearing!  TODO depends on command+ +
	//console.log(container.width() + "  " + container.height());
	//var editorL= container.width()
	//var editorW=container.height();
	//axis
	base = new point(5, container.height() - 10);
	//TODO

	axisY = base.y - 10;
	//	var axisX=parseInt(base.y)*2; //TODO: what? try to get the final size of the container
	var axisX = container.width();
	var hLine = "H" + axisX;
	var vLine = "V" + (parseInt(base.y) - parseInt(axisY));

	//draw the axis
	editor.path("M" + base.x + "," + base.y + hLine).attr({
		stroke : "#666666",
		"stroke-width" : 1,
	});
	editor.path("M" + base.x + "," + base.y + vLine).attr({
		stroke : "#666666",
		"stroke-width" : 1,
	});
	editor.renderfix()
	//	console.log(base.y+" "+axisY+" "+parseFloat(base.y-axisY-10));
	editor.text(parseFloat(base.x + axisX + 10), base.y, "t").attr({
		"font-size" : 16
	});
	editor.text(parseFloat(base.x + 10), parseFloat(base.y - axisY), "Pi").attr({
		"font-size" : 16
	});
	//draw the 6 horizontal lines
	for (var i = 0; i < planeNames.length; i = i + 1) {
		thickness = 2;
		if (i < 3) {
			thickness = 5;
		}
		var y = (parseFloat(base.y) - ((parseFloat(axisY) / 7) * (parseInt(i) + 1)));
		var nPlane = new SocialPlane(planeNames[i], y);
		socialPlanes[socialPlanes.length] = nPlane;
		nPlane.draw(editor, base.x, axisX, thickness);
		//	editor.path("M"+base.x+","+y+hLine)
		//   .attr({stroke: "black"});
		//	socialPlanes[socialPlanes.length]=y;
	}
}
/*loads the properties for the selected activity*/
function loadProperties(activity) {
	$('#east-panel').layout().open('south');
	//open the tab
	removeAllTabs("#prop-list");
	$("#activity-prop-tab").css("display", "list-item");
	$("#prop-tabs").tabs();
	$("#prop-tabs").tabs("select", 0);
	$("#activityName").val(activity.name);
	$("#activityType").msDropDown().data("dd").set("value", activity.type);
	var splt;
	if(activity.parentActivity!=null){
		splt=activity.parentActivity.subgroups.length;
	}else if(activity.subgroups.length==0){
		splt=1;
	}else{
		splt=activity.subgroups.length;
	}
	$("#activitySplit").msDropDown().data("dd").set("value", splt);
	$(".colorPicker-picker").css("background-color", $.fn.colorPicker.toHex(activity.color));
}
