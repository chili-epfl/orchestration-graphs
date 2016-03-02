/**
everything for opening a graph
@author Farzaneh
*/
function openGraph(id){
	if(openWindow!=null){
		openWindow.close();
	}
	//clear the editor and get ready for loading the new one
	jsPlumb.deleteEveryEndpoint();
		editor.remove();
		initialize_editor();
		$.ajax({
			dataType: "json",
			type: "GET",
			evalScripts: true,
			url: loadGraphUrl+"/"+id,
			beforeSend: function(x) {
				if(x && x.overrideMimeType) {
					x.overrideMimeType("application/json;charset=UTF-8");
				}
			},
			success: function(data){
				resetVars();
				graphId=data.Graph.id;
				graphName=data.Graph.name; 
				$("#graphName").val(graphName);
				theActs=data.Activity;
            	for(var i=0;i<theActs.length;i++){
            		var theAct=theActs[i];
            		recreateActivity(theAct);            		
            	}
//set parent child relationShips
setParents();
//here you should redraw every thing;
redrawActivities();

theEdges=data.Edge;
for(var i=0;i<theEdges.length;i++){
	var theEdge=theEdges[i];
	recreateEdge(theEdge);
}

theLoops=data.Loop;
for(var i=0;i<theLoops.length;i++){
	var theLoop=theLoops[i];
	recreateLoop(theLoop);
}

if(!owner){
	graphId="";
	console.log(graphId);
	for(i=0;i<activities.length;i++){
		activities[i].id="";	
	}
	for(i=0;i<edges.length;i++){
		edges[i].id="";	
	}
	for(i=0;i<loops.length;i++){
		loops[i].id="";	
	}
}
}
});



}

function redrawActivities(){
	for(i=0;i<activities.length;i++){
		if(activities[i].parentActivity==null){
			activities[i].draw();
		}
	}
}

function setParents(){

	for(i=0;i<activities.length;i++){
		if(activities[i].parentId!=null){
			parentActivity=findActivityById(activities[i].parentId);
			activities[i].parentActivity=parentActivity;
			parentActivity.subgroups.push(activities[i]);
		}
	}

}
function resetVars(){
	activities=Array();
	edges=Array();
	loops=Array();
	graphId="";
	tmax=0;
}

function recreateEdge(jsonEdge){
	var fiber=jsonEdge.fiber;
	var fromId=jsonEdge.from_id;
	var toId=jsonEdge.to_id;
	var operator=jsonEdge.operator;
	var strength=jsonEdge.strength;
	var id=jsonEdge.id;
	var fromAct=findActivityById(fromId);
	var toAct=findActivityById(toId);
	var newEdge=new Edge(fromAct,toAct);
	newEdge.fiber=fiber;
	newEdge.operator=operator;
	newEdge.strength=strength;
	newEdge.id=id;

	fromAct.fromEdges.push(newEdge);
	toAct.toEdges.push(newEdge);
	newEdge.draw();
}

function recreateLoop(jsonLoop){
	var startId=jsonLoop.start_id;
	var endId=jsonLoop.end_id;
	var id=jsonLoop.id;
	var repeat=jsonLoop.repeat;
	var startAct=findActivityById(startId);
	var endAct=findActivityById(endId);
	var newLoop=new Loop(startAct,endAct);
	newLoop.repeat=repeat;
	newLoop.id=id;

	newLoop.draw();
	loops.push(newLoop);
}



function findActivityById(id){
	for(var i=0;i<activities.length;i++){
		if(activities[i].id==id){
			return activities[i];
		}
	}
	return null;
}

function recreateActivity(jsonActivity){
	var betha=jsonActivity.betha;
	var duration=jsonActivity.duration;
	var id=jsonActivity.id;
	var name=jsonActivity.name;
	var type=jsonActivity.type;
	if(id>nextId+1){
		nextId=id+1;
	}
	//TODO
	var parentId=jsonActivity.parent_id;
	var x=jsonActivity.x;
	var y=jsonActivity.y;
	var plane=findNearestPlane(y);
	var parallel=jsonActivity.parallel;
	var upper=jsonActivity.upper;
	var newActivity=new Activity(name,plane,duration,x,null);
	newActivity.id=id;
	newActivity.type=type;
	newActivity.color=betha;
	newActivity.parallel=parallel;
	newActivity.upper=upper;

	newActivity.parentId=parentId;
	if(newActivity.parentId!=null){
		tmax-=parseFloat(duration)

	}
//newActivity.draw();
activities[activities.length] = newActivity; 
}


function fixOrder(){
	//sort the activities
	for(var i=0;i<activities.length;i++){
		for(var j=0;j<activities.length-1;j++){
			if(activities[j].startTime > activities[j+1].startTime){
				var tmp=activities[j];
				activities[j]=activities[j+1];
				activities[j+1]=tmp;
			}
		}
	}
	if(activities.length>0){
		activities[0].prevActivity=null;
		activities[activities.length-1].nextActivity=null;
	}
	for(var i=1;i<activities.length;i++){
		activities[i-1].nextActivity=activities[i];
		activities[i].prevActivity=activities[i-1];
	}

}

function drawActivities(){
	for(var i=0;i<activities.length;i++){
		activities[i].draw();
	}	
}
//open pop up
function openPopUp(){
	openWindow = window.open(openUrl, '_blank', 
		'toolbar=0,scrollbars=1,location=0,status=1,menubar=0,resizable=1,width=500,height=500');  

}
