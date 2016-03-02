/**
 * Class edge: everything related to the edges in the graph
 *@author Farzaneh
 */

 /*delete from DB. called on save-synch with DB*/
 function deleteEdgesFromDB(index){
 	if(index<deletedEdges.length){
 		if(deletedEdges[index].id==""){
 			deleteEdgesFromDB(index+1);
 			return;
 		}else{
		//ajax call
		$.ajax({
			dataType: "html",
			type: "POST",
			evalScripts: true,
			url: edgeDeleteUrl,
			data: {Edge:{
				id:deletedEdges[index].id, 
			}},
			success: function(data){
				deleteEdgesFromDB(index+1);
			}
		});
	}
}else{
	deletedEdges=Array();
}
}

function deleteSelectedEdge(selectedEdge){
fromAct=selectedEdge.from;
toAct=selectedEdge.to;
//delete from fromEdges
fromAct.detachFromEdge(selectedEdge);
//delete from to Edges
toAct.detachToEdge(selectedEdge);
//delete from edges
deleteEdge(selectedEdge);
//detach
ends=selectedEdge.shape.endpoints;
for(i=0;i<ends.length;i++){
	ends[i].detach(selectedEdge.shape);
}
}


function deleteEdge(theEdge){
//delete it from the edges array;
//push it into deleted edges array for the sake of the Database
for(var i=0;i<edges.length;i++){
	if(edges[i]==theEdge){
		edges.splice(i,1);
		break;
	}
}
if(theEdge.id!=""){
	deletedEdges.push(theEdge);
}
	//from and to activities
	theEdge.from.deleteFromEdge(theEdge); //I think not necessary, but when the head is not painful why should be bandage it?
	theEdge.to.deleteToEdge(theEdge);
}

function copyEdge(theEdge,newFrom,newTo){
	newEdge=new Edge(newFrom,newTo);
//copy all properties
newEdge.strength=theEdge.strength;
newEdge.operator = theEdge.operator;
newEdge.fiber=theEdge.fiber;
return newEdge;
}

function saveEdges(index){
	if(index<edges.length){
		edges[index].save(index);
	}else{
		allEdgesSaved=true;
		console.log("It was saved!");
		//TODO: make it a nice pop-up
		alert("Successfully Saved!");
	}
}

function Edge(from, to) {
	this.id="";
	//activity
	this.from = from;
	//activity
	this.to = to;
	this.strength = 1;
	//operator on the edge
	this.operator = "";
	this.fiber="";
	//graphical representation of the edge
	this.shape = null;

	edges.push(this);

	this.save=function(index){
		savingEdge=this;
		$.ajax({
			dataType: "html",
			type: "POST",
			evalScripts: true,
			url: edgeUrl,
			data: {Edge:{
				id:this.id, 
				from_id: this.from.id, 
				to_id: this.to.id, 
				strength: this.strength, 
				operator: this.operator,
				fiber: this.fiber,
			}},
			success: function(data){
            	savingEdge.id=data;
            	saveEdges(index+1);
            }
        });
	}


	this.draw = function() {
		if( this.from != null && this.to != null){
			if (this.shape == null ) {
				this.shape=connect(this.from,this.to);
			}

			this.shape.setHoverPaintStyle({
				strokeStyle : "#42a62c"

			});
			this.shape.setPaintStyle({
				lineWidth: 2*this.strength,
				'stroke-dasharray': ["5","5"],
				strokeStyle : "black"
			});
		this.shape.edge=this; //used for click funciton
		this.shape.addOverlay([ "Arrow", {
			location:0.99,
			id:"arrow",
			length:14,
			foldback:0.8,
		} ]);
		if(this.operator!=""){
			this.shape.addOverlay([ "Custom", { create:function(){
				var elem=document.createElement("img");
elem.setAttribute("src",webRoot+"img/"+this.component.edge.operator+".png");				
console.log(this.component.edge.operator);
				return elem;
			}, location: 0.5} ]);
		}
		this.shape.bind("click", function(c) {
			selected="edge";
			chosenEdge = c.edge;
			loadEdgeProperties(chosenEdge);

		}); 
	}
}
}
/*
 * Draws a line with an arrow in the middle : NOT USED
 * @return the shape
 */
 function drawSimpleArrow(startX, startY, endX, endY, paper) {
	//for drawing the arrows
	var alpha = Math.atan2(startY - endY, startX - endX);
	var beta = Math.PI / 4;
	var left_angle = alpha - beta;
	var right_angle = Math.PI / 2 - alpha - beta;
	var length = 20;
	if (startY >= endY && startX < endX) {//nahiyeye aval
		var newX = (endX + startX) / 2 + Math.cos(left_angle) * length;
		var newY = (endY + startY) / 2 + Math.sin(left_angle) * length;
		var newerX = (endX + startX) / 2 + Math.sin(right_angle) * length;
		var newerY = (endY + startY) / 2 + Math.cos(right_angle) * length;
	} else if (startY > endY && startX >= endX) {//nahiye 2
		var newX = (endX + startX) / 2 + Math.cos(left_angle) * length;
		var newY = (endY + startY) / 2 + Math.sin(left_angle) * length;
		var newerX = (endX + startX) / 2 + Math.sin(right_angle) * length;
		var newerY = (endY + startY) / 2 + Math.cos(right_angle) * length;
	} else if (startY <= endY && startX > endX) {//nahiye 3
		var newX = (endX + startX) / 2 + Math.cos(left_angle) * length;
		var newY = (endY + startY) / 2 + Math.sin(left_angle) * length;
		var newerX = (endX + startX) / 2 + Math.sin(right_angle) * length;
		var newerY = (endY + startY) / 2 + Math.cos(right_angle) * length;
	} else if (startY < endY && startX <= endX) {//nahiye 4
		var newX = (endX + startX) / 2 + Math.cos(left_angle) * length;
		var newY = (endY + startY) / 2 + Math.sin(left_angle) * length;
		var newerX = (endX + startX) / 2 + Math.sin(right_angle) * length;
		var newerY = (endY + startY) / 2 + Math.cos(right_angle) * length;
	}
	var set = paper.set();
	set.push(paper.path("M" + startX + " " + startY + "L" + endX + " " + endY + "M" + parseFloat((startX + endX)) / 2 + " " + parseFloat((startY + endY)) / 2 + "L" + newX + " " + newY + "M" + parseFloat((startX + endX)) / 2 + " " + parseFloat((startY + endY)) / 2 + "L" + newerX + " " + newerY));
	return set;
}

/*
 *Draws a single simple line- NOT USED
 */
 function drawLine(startX, startY, endX, endY, paper) {
 	return paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
 }

/*
 * Draws the triangle- NOT USED
 */
 function drawTriangle(centerX, centerY, height, width, rotateAngle, paper) {
 	var peakX = centerX;
 	var peakY = centerY - (height / 2);
 	var leftX = peakX - (width / 2);
 	var leftY = peakY + height;
 	var rightX = peakX + (width / 2);
 	var rightY = peakY + height;
 	var result = paper.path("M" + peakX + "," + peakY + "," + leftX + "," + leftY + "," + rightX + "," + rightY + "z");
 	result.transform("...r" + rotateAngle);
 	result.attr({
 		fill: 'black',
 		'stroke-linejoin': 'round',
 		'stroke-linecap': 'round'

 	});
 	return result;
 }

/*
 * returns the set containing triangle- NOT USED
 */
 function drawAggregation(middleX, middleY, rotateAngle, paper) {
 	var set = paper.set();
 	set.push(drawTriangle(middleX, middleY, 15, 15, rotateAngle, paper));
 	return set;

 }

/*
 * draws a check box- NOT USED
 */
 function drawCheckBox(centerX, centerY, width, height, rotateAngle, paper) {
 	var rect = paper.rect(centerX - (width / 2), centerY - (height / 2), width, height).attr({
 		fill: 'black'
 	});
 	var checkMark = paper.path("M" + (centerX - (width / 2) + 2) + "," + centerY + "L" + (centerX - (width / 2) + 2) + "," + (centerY + (height / 2) - 2) + "L" + (centerX + width / 2 - 2) + "," + (centerY - height / 2 + 2));
 	checkMark.attr({
 		stroke: 'white',
 		'stroke-width': 3
 	})
 	var result = paper.set();
 	result.push(rect);
 	result.push(checkMark);
 	result.transform("...r" + rotateAngle);
 	return result;
 }

 /**NOT USED**/
 function drawEdge(startX, startY, endX, endY, operator, paper) {
 	middleX = (startX + endX) / 2;
 	middleY = (startY + endY) / 2;
	//Draw the line from start to middle:
	var firstHalf = drawLine(startX, startY, middleX, middleY, paper);
	var angle = Math.atan((startX - endX) / (endY - startY));
	angle = angle * (180 / Math.PI);
	var operatorShape;
	switch(operator) {
		case "aggregation":
		operatorShape = drawAggregation(middleX, middleY, angle, editor);
		break;
		case "distribution":
		operatorShape = drawDistribution(middleX, middleY, angle, editor);
		break;
		case "decision":
		operatorShape = drawDecision(middleX, middleY, angle, editor);
		break;
		case "group":
		operatorShape = drawGroup(middleX, middleY, angle, editor);
		break;
		case "rotation":
		operatorShape = drawRotation(middleX, middleY, angle, editor);
		break;
		case "evaluation":
		operatorShape = drawEvaluation(middleX, middleY, angle, editor);
		break;
		default:
		operatorShape = editor.set();
			//drawSimpleArrow(middleX, middleY,angle, editor);
			break;
		}
		var secondHalf = drawLine(middleX, middleY, endX, endY, paper);
		var set = paper.set();
		set.push(firstHalf);
	//for each operator piece
	operatorShape.forEach(function(e) {
		e.operator = true;
		set.push(e);

	}, this);
	set.push(secondHalf);
	return set;
}
/*NOT USED*/
function drawEvaluation(middleX, middleY, angle, paper) {
	return drawCheckBox(middleX, middleY, 20, 20, angle, paper);

}
/*NOT USED*/
function drawRotation(middleX, middleY, angle, paper) {

	//Draw the operator
	var op1 = paper.circle(middleX - 16, middleY, 4).attr({
		fill : "black"
	});
	var op2 = paper.circle(middleX + 16, middleY, 4).attr({
		fill : "black"
	});
	//quarter of the circle
	var op3 = paper.path("M" + (middleX - 16) + "," + (middleY - 4) + "A16,16 0 0 1 " + (middleX) + "," + (middleY - 20)).attr({
		"arrow-end" : "classic-wide-long"
	});
	var op4 = paper.path("M" + (middleX) + "," + (middleY - 20) + "," + "A16,16 0 0 1 " + (middleX + 16) + "," + (middleY - 4));

	var op5 = paper.path("M" + (middleX + 16) + "," + (middleY + 4) + "A16,16 0 0 1 " + (middleX) + "," + (middleY + 20)).attr({
		"arrow-end" : "classic-wide-long"
	});
	var op6 = paper.path("M" + (middleX) + "," + (middleY + 20) + "," + "A16,16 0 0 1 " + (middleX - 16) + "," + (middleY + 4));

	var operator = paper.set();
	operator.push(op1);
	operator.push(op2);
	operator.push(op3);
	operator.push(op4);
	operator.push(op5);
	operator.push(op6);

	operator.transform("...r" + angle);
	return operator;
}
/*NOT USED*/
function drawGroup(middleX, middleY, angle, paper) {

	//Draw the operator
	var op1 = paper.circle(middleX - 5, middleY - 5, 5);
	var op2 = paper.circle(middleX + 5, middleY - 5, 5);
	var op3 = paper.circle(middleX, middleY + 5, 5);
	var operator = paper.set();
	operator.push(op1);
	operator.push(op2);
	operator.push(op3);
	operator.attr({
		fill : 'black'
	});

	operator.transform("...r" + angle);
	return operator;
}
/*NOT USED*/
function drawDiamond(middleX, middleY, width, height, angle, paper) {
	var peakX = middleX;
	var peakY = middleY - (height / 2);
	var leftX = peakX - (width / 2);
	var leftY = middleY;
	var bottomX = middleX;
	var bottomY = middleY + (height / 2);
	var rightX = peakX + (width / 2);
	var rightY = middleY;
	var shape = paper.path("M" + peakX + "," + peakY + "," + leftX + "," + leftY + "," + bottomX + "," + bottomY + "," + rightX + "," + rightY + "z");
	shape.transform("...r" + angle);
	return shape;
}
/*NOT USED*/
function drawDecision(middleX, middleY, angle, paper) {

	var operator = drawDiamond(middleX, middleY, 20, 20, angle, paper).attr({
		fill: 'black'
	});

	var set = paper.set();
	set.push(operator);
	return set;
}
/*NOT USED*/
function drawDistribution(middleX, middleY, angle, paper) {

	var operator = drawTriangle(middleX, middleY, 15, 15, (180 + angle), paper);
	var set = paper.set();
	set.push(operator);
	return set;

}

function loadEdgeProperties(theEdge) {

	//show the edge tab
	$('#east-panel').layout().open('south');
	//open the tab
	removeAllTabs("#prop-list");
	$("#edge-prop-tab").css("display", "list-item");
	$("#prop-tabs").tabs("select", 1);
	$("#edge-strength").msDropDown().data("dd").set("value", theEdge.strength);
	$("#edge-operator").msDropDown().data("dd").set("value", theEdge.operator);
	$("#edge-fiber").msDropDown().data("dd").set("value", theEdge.fiber);
}

/*For nice visualization of the edge when it's still hanging!*/
function smartEdge(obj1, obj2,operator, line, bg) {
	if (obj1.line && obj1.from && obj1.to) {
		line = obj1;
		obj1 = line.from;
		obj2 = line.to;
	}
	var bb1 = obj1.getBBox(),
	bb2 = obj2.getBBox(),
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
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) { //todo: I don't really understand what it does
            	dis.push(dx + dy);
            d[dis[dis.length - 1]] = [i, j];
        }
    }
}
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
var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

/****TEST*****/
var pathShape=editor.path(path);
var pt = pathShape.getPointAtLength(pathShape.getTotalLength()/2);
var middleX=pt.x;
var middleY=pt.y;

var angle = Math.atan((middleX) / (middleY));
angle = angle * (180 / Math.PI);

switch(operator) {
	case "aggregation":
	operatorShape = drawAggregation(middleX, middleY, angle, editor);
	break;
	case "distribution":
	operatorShape = drawDistribution(middleX, middleY, angle, editor);
	break;
	case "decision":
	operatorShape = drawDecision(middleX, middleY, 0, editor);
	break;
	case "group":
	operatorShape = drawGroup(middleX, middleY, 0, editor);
	break;
	case "rotation":
	operatorShape = drawRotation(middleX, middleY, 0, editor);
	break;
	case "evaluation":
	operatorShape = drawEvaluation(middleX, middleY, 0, editor);
	break;
	default:
	operatorShape = editor.set();
			//drawSimpleArrow(middleX, middleY,angle, editor);
			break;
		}
		var set = editor.set();
		set.push(pathShape);
	//for each operator piece
	operatorShape.forEach(function(e) {
		e.operator = true;
		set.push(e);

	}, this);
	return set;
}
/*NOT USED*/

function createCustom(){
	var elem=document.createElement("img");
	elem.setAttribute("src","../img/aggregation.png");
	console.log(this.edge);
	return elem;
}








