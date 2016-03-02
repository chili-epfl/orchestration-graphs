/*
 *Loops
 *@author Farzaneh
 */

 /*Synch with database. delete the deleted loops from database*/
 function deleteLoopsFromDB(index){
 	if(index<deletedLoops.length){
 		if(deletedLoops[index].id==""){
 			deleteLoopsFromDB(index+1);
 			return;
 		}else{
		//ajax call
		$.ajax({
			dataType: "html",
			type: "POST",
			evalScripts: true,
			url: loopDeleteUrl,
			data: {Loop:{
				id:deletedLoops[index].id, 
			}},
			success: function(data){
				deleteLoopsFromDB(index+1);
			}
		});
	}
}else{
	deletedLoops=Array();
}
}

function saveLoops(index){
	if(index<loops.length){
		loops[index].save(index);
	}else{
		allLoopsSaved=true;
	}
}
/**
delete selected loop: removes the loop first and then fixes the left and right bar
*/
function deleteSelectedLoop(theLoop){
	theLoop.remove();
	theLoop.start.leftBar.removeLoop(theLoop);
	theLoop.end.rightBar.removeLoop(theLoop);
	deleteLoop(theLoop);
}

function deleteLoop(theLoop){
	for(var i=0;i<loops.length;i++){
		if(loops[i]==theLoop){
			loops.splice(i,1);
			break;
		}
	}
	if(theLoop.id!=""){
		deletedLoops.push(theLoop);
	}
}
/**THIS is just the horizental line you see for loops*/
function LoopBar(activity,type="start"){
	this.activity=activity;
	this.type=type;//start or end / leftbar or rightbar
	this.capacity=5;
	this.shape=null;
	this.connections=Array();
	this.startX=0;
	this.startY=0;
	this.height=100;
	this.removeLoop= function(theLoop){
		for(i=0;i<this.connections.length;i++){
			if(this.connections[i]==theLoop){
				this.connections.splice(i,1);
				break;
			}
		}
		if(this.connections.length==0){
			this.shape.remove();
			this.remove();
		}
	}
this.remove=function(){

	for(i=0;i<this.connections.length;i++){
	deleteSelectedLoop(this.connections[i]);
}
//removing all conections
this.connections=Array();
this.shape=null;
if(type=="start"){
	this.activity.leftBar=null;
}else{
	this.activity.rightBar=null;
}
}
this.draw=function(){
		//draw a vertical line
		//startX , startY: how to get them
		if(this.type=="start"){
			this.startX=this.activity.startTime;
		}else{
			this.startX=parseInt(this.activity.startTime) + parseInt(this.activity.getTotalDuration());
		}
		if(this.shape!=null){
			this.shape.remove();
		}
		this.shape=editor.path("M"+this.startX+","+this.startY+"V"+this.height).attr({
			'stroke-dasharray': ['.']
		}
		);
};
}
/* Loop Loop I'm in a loop*/
function Loop(start=null,end=null) {
	this.id="";
	this.start = start;
	//starting activity
	this.end = end;
	// ending activity
	this.repeat = 1;
	//IT IS STUPID IF YOU HAVE LOOPS IN THE OTHER DIRECTION!!
	this.shape = null;
	this.save=function(index){
		savingLoop=this;
		$.ajax({
			dataType: "html",
			type: "POST",
			evalScripts: true,
			url: loopUrl,
			data: {Loop:{
				id:this.id, 
				start_id: this.start.id, 
				end_id: this.end.id,
				repeat: this.repeat 
			}},
			success: function(data){
				savingLoop.id=data;
				saveLoops(index+1);
			}
		});
	}
	this.remove=function(){
		if(this.shape!=null){
			this.shape.remove();
		}
		this.shape=null;
	}
	this.draw = function() {
		if(this.start==null || this.end==null){
			return;
		}
		if(this.start.leftBar==null || this.start.leftBar.shape==null){
			this.start.leftBar=new LoopBar(this.start,"start");
			this.start.leftBar.draw();
		}
		if(this.end.rightBar==null || this.end.rightBar.shape==null){
			this.end.rightBar=new LoopBar(this.end,"end");	
			this.end.rightBar.draw();
		}
		if(this.shape==null){
			this.start.leftBar.connections.push(this);
			this.end.rightBar.connections.push(this);
		}else{
			this.shape.remove();
		}
		if(this.start.startTime>this.end.startTime){
			console.log("va loope bareax?!!");
			deleteSelectedLoop(this);
			return;
		}
		var length1=this.start.leftBar.connections.length;
		var length2=this.end.rightBar.connections.length;
		var max=length1;
		if(length2>max){
			max=length2;
		}
		var idx=(max+1)/2;
		var sign=1;
		if(max%2==0){
			sign=-1;
		};
		var y=Math.floor(idx)*20*sign+50;
		//a path from this line to that line
		var path=editor.path("M"+this.end.rightBar.startX+","+y+"L"+this.start.leftBar.startX+","+y).attr({
			"stroke-width":5,
			"stroke": "blue",
			'arrow-end':'block-wide-long',
			'stroke-dasharray': ['-'],
		});
		this.shape=path;
		path.loop=this;
		path.mouseover(function(){
			this.attr({'stroke':'green'});
		});
		path.mouseout(function(){
			this.attr({'stroke':'blue'});
		});
		path.click(function(){
			selected="loop";
			chosenLoop=this.loop;
			loadLoopProperties(chosenLoop);
        }
        );    
}
}
function loadLoopProperties(theLoop) {

	//show the tab
	$('#east-panel').layout().open('south');
	//open the tab
	removeAllTabs("#prop-list");
	$("#loop-prop-tab").css("display", "list-item");
	$("#prop-tabs").tabs("select", 2);
	$("#loop-repeat").val(theLoop.repeat);
}
function redrawAllLoops(){
	for(i=0;i<loops.length;i++){
		loops[i].draw();
	}
}

function drawLoopIcon(){
	var e1 = jsPlumb.addEndpoint("loop-rect", {
		endpoint : "Dot",
		anchor : "BottomRight",
		container : "pallet",
		maxConnections : 2
	});
	var loopConnection=jsPlumb.connect({
		source : e1,
		target : e1,
		connector : ["StateMachine"],
		paintStyle : {
			lineWidth : 2,
			strokeStyle : 'black'
		},
		container : "pallet",
		overlays : [["Arrow", {
			location : 1,
			length : 14,
			foldback : 0.8
		}]]
	});
	loopConnection.bind('click',function(c){
		loopMode=true;
		theLoop=new Loop();
		loops.push(theLoop);
	});
}

