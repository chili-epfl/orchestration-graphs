/*
* Contains everything related to the activity
* @author Farzaneh
*/

/*called when delete key is pressed on an activity*/
function deleteActivity(theActivity,shiftRest,deleteParent=true){
//deleting an activity that is the result of a split action
if(theActivity.parentActivity!=null){
	//call delete on all the peers and the parent as well.
	parentActivity=theActivity.parentActivity;
	if(deleteParent==true){
		deleteActivity(theActivity.parentActivity,true);
	}
	for(var i=0;i<parentActivity.subgroups.length;i++){
		parentActivity.subgroups[i].parentActivity=null;
		deleteActivity(parentActivity.subgroups[i],false);
	}
	return;
}
//EDGES
if(theActivity.fromEdges.length!=0 || theActivity.toEdges.length!=0){
	//delete all the edges!
	for(var i=0;i<theActivity.fromEdges.length;i++){
		deleteSelectedEdge(theActivity.fromEdges[i]);
	}
	for(var i=0;i<theActivity.toEdges.length;i++){
		deleteSelectedEdge(theActivity.toEdges[i]);
	}
}

//LOOOPS
if(theActivity.leftBar!=null){
	theActivity.leftBar.remove();
	theActivity.leftBar=null;
}
if(theActivity.rightBar!=null){
	theActivity.rightBar.remove();
	theActivity.rightBar=null;
}

//finally delete the activity itself! 
for(var i=0;i<activities.length;i++){
	if(activities[i]==theActivity){
		activities.splice(i,1);
		theActivity.remove(shiftRest);
		break;
	}
}
}

/*Deleting the activities from dataase(synching with DB). called when save is pressed!*/
function deleteActivities(index){
	if(index<deletedActivities.length){
		//delete the activity
		if(deletedActivities[index].id==""){
			deleteActivities(index+1);
			return;
		}else{
		//ajax call
		$.ajax({
			dataType: "html",
			type: "POST",
			evalScripts: true,
			url: activityDeleteUrl,
			data: {Activity:{
				id:deletedActivities[index].id, 
			}},
			success: function(data){
				deleteActivities(index+1);
			}
		});
	}
}else{
	//c'est finis!
	deletedActivities=Array();
}
}
/*called when save is pressed. activities one by one!*/
function saveActivities(index){
	if(index<activities.length){
		activities[index].save(index);
	}else{
		allActivitiesSaved=true;
		//After all the activities are saved, save the loops. Loops and edges can be saved in parallel. 
		saveLoops(0);
		saveEdges(0);
	}
}

/* class representing the activities that are in an upper level and are in parallel. page: of Pierre's book*/
function upperActivity(){
	this.leftActivity=null;
	this.rightActivity=null;
	this.activity=null;
	this.shape=null;
	this.draw=function(){
		var duration=this.rightActivity.startTime+this.rightActivity.getTotalDuration()-this.leftActivity.startTime;
		if(this.activity==null){
			var name=('a' + nextId);

			this.activity=new Activity(name,socialPlanes[2],duration,this.leftActivity.startTime,this.leftActivity.prevActivity);
		//!!err
		tmax-=duration;
		this.activity.upper=true;
		nextId++;
		this.activity.draw();
		activities.push(this.activity);
	}else{
		this.activity.setDuration(duration);
		this.activity.startTime=this.leftActivity.startTime;
		this.activity.draw();
	}
}
}
/*
 * ACTIVITY class
THis is the problem now. I am trying to understand how to do a zoom in!
I think it's like that usually!

*/
function Activity(name=('a' + nextId), socialPlane=socialPlanes[0], duration=initialDuration, startTime=tmax, prevActivity=getLastActivity) {
	//in case of using upperActivities on this one
	this.upper=0;
	this.upperShape=null;
	//if splitted into morethan 4
	this.parallel=0;
	this.shadow1=null;
	this.shadow2=null;
	//for splitted activities	
	this.parentId=null;
	this.subgroups = Array();
	this.parentActivity = null;
	//database ID
	this.id="";
	tmax += parseFloat(duration);
	this.name = name;
	this.type = "reproduction";
	//forLoops
	this.leftRect = null;
	this.rightRect = null;
	this.leftBar=null;
	this.rightBar=null;

	this.startTime = parseFloat(startTime);
	this.socialPlane = socialPlane;
	//default color/beta
	this.color = "0000FF";

	this.nextActivity = null;
	this.prevActivity = prevActivity;
	//an array of all edges
	this.fromEdges = new Array();
	this.toEdges = new Array();
	//private element
	var duration = parseFloat(duration);
	//TODO: maybe these could be set to another object graphical representation
	//I have no idea what this is for!?
	this.edgeToNext = null;
	var shape = null;
	var representation = null;

	//remove the activity graphically and also from the array
	this.remove=function(shiftRest){
	if(this.shape!=null){
		this.shape.sizer.remove();
		this.shape.text.remove();
		this.shape.remove();
		this.shape=null;
		if(this.shadow1!=null){
			this.shadow1.remove();
		}
		if(this.shadow2!=null){
			this.shadow2.remove();
		}
		if(this.upperShape!=null){
			this.upperShape.remove();
		}	
	}
	//for all the activities after this one and tmax as well
	if(shiftRest==true){
		for(var i=0;i<activities.length;i++){
			if(activities[i].startTime>this.startTime && activities[i].parentActivity==null){
				activities[i].startTime-=this.getTotalDuration();
				activities[i].draw();
		}
	}
	jsPlumb.repaintEverything();
	tmax-=this.getTotalDuration();
}
	deletedActivities.push(this);

}
/*removes the edge from its fromEdges. probably called when an edge is deleted.*/
this.detachFromEdge=function (theEdge){
	for(var i=0;i<this.fromEdges;i++){
		if(this.fromEdges[i]==theEdge){
			this.fromEdges.splice(i,1);
			break;
		}
	}
}

/*removes the edge from its toEdges. probably called when an edge is deleted.*/
this.detachToEdge=function (theEdge){
	for(var i=0;i<this.toEdges;i++){
		if(this.toEdges[i]==theEdge){
			this.toEdges.splice(i,1);
			break;
		}
	}
}


/*
* saves this activity in database
*/
this.save=function(index){
	savingActivity=this;
	//some complications if this is splitted
	parentId=null;
	if(this.parentActivity!=null){
		parentId=this.parentActivity.id;
	}
	var duration=this.getDuration();
	if(this.subgroups.length!=0){
		duration=this.getTotalDuration();
	}
	//stupidly enough true and false doesn't work for db saving!
	if(this.parallel){
		this.parallel=1;
	}else{
		this.parallel=0;
	}
	if(this.upper){
		this.upper=1;
	}else{
		this.upper=0;
	}
	$.ajax({
		dataType: "html",
		type: "POST",
		evalScripts: true,
		url: activityUrl,
		data: {Activity:{
			id:this.id, 
			name: this.name, 
			type: this.type, 
			betha: this.color,
			x: this.startTime,
			y: this.socialPlane.yPosition,
			duration: duration,
			plane: this.socialPlane.name,
			parent_id: parentId,
			parallel: this.parallel,
			upper:this.upper,
		}},
		success: function(data){
            	savingActivity.id=data;
            	saveActivities(index+1);
            }
        });
}
/*
* Useful if there are splitter activities
*/
this.getTotalDuration = function() {
		//fingers crossed :D
		if(this.parentActivity!=null){
			return this.parentActivity.getTotalDuration();
		}
		if (this.subgroups.length == 0) {
			return this.getDuration();
		}
		var max = 0;
		for (var i = 0; i < this.subgroups.length; i++) {
			var dur = this.subgroups[i].getDuration();
			if (dur > max) {
				max = dur;
			}
		}
		return max;
	}

	/*
	 * Setter for the nextActivity which is private.
	 * redraws the edges
	 * @param new next activity
	 */
	 this.setNextActivity = function(theActivity) {
	 	this.nextActivity = theActivity;
	 };
	/*
	 * Sets the new duration and updates the tmax
	 * @param new duration
	 */
	 this.setDuration = function(newDuration) {
	 	d = newDuration - duration;
	 	duration = newDuration;
	 	if(this.parentActivity==null){
	 		tmax = tmax + d;
	 	}
	};
	/*
	 * Getter for the duration
	 * @return the duration of the activity
	 */
	 this.getDuration = function() {
	 	return duration;
	 };
	 /*huh! redundancy. am I stupid? this is the same as detachFromEdge*/
	 this.deleteFromEdge= function(theEdge){
	 	for(var i=0;i<this.fromEdges.length;i++){
	 		if(this.fromEdges[i]==theEdge){
	 			this.fromEdges.splice(i,1);
	 			return;
	 		}
	 	}
	 }
	/*huh! redundancy. am I stupid? this is the same as detachToEdge*/
	 this.deleteToEdge= function(theEdge){

	 	for(var i=0;i<this.toEdges.length;i++){
	 		if(this.toEdges[i]==theEdge){
	 			this.toEdges.splice(i,1);
	 			return;
	 		}
	 	}

	 }


	/*Puts this activity after the target activity, so
	 *shifts all the activities that are in between(including the target activity) to the amount of -thisactivity duration
	 *@param targetActivity the target activity
	 */
	 this.moveForward = function(targetActivity) {

		//remove from previous position
		if (this.prevActivity != null) {
			this.prevActivity.nextActivity = this.nextActivity;

		};
		if (this.nextActivity != null) {
			this.nextActivity.prevActivity = this.prevActivity;
		};
		//fix this one pointers
		this.prevActivity = targetActivity;
		this.nextActivity = targetActivity.nextActivity;
		//merge
		targetActivity.nextActivity = this;
		if (this.nextActivity != null) {
			this.nextActivity.prevActivity = this;
		};
		targetTime = targetActivity.startTime;
		newStartTime = parseFloat(targetActivity.startTime - duration + targetActivity.getDuration());
		if(!this.upper){
			for ( i = 0; i < activities.length; i++) {
				theActivity = activities[i];
				if (theActivity.startTime > this.startTime && theActivity.startTime <= targetTime && 
			theActivity.parentActivity==null) {//activities in between
					theActivity.startTime -= duration;
				theActivity.draw();

			}
		}

	}
	this.startTime = newStartTime;
		//setting the nextActivity
		this.draw();
	};
	/*
	 * Puts this activity before the target activity, so
	 *shifts all the activities that are in between(including the target activity) to the amount of +thisactivity duration
	 *@param targetActivity the target activity
	 *
	 */
	 this.moveBackward = function(targetActivity) {

		//remove from previous position
		if (this.prevActivity != null) {
			this.prevActivity.nextActivity = this.nextActivity;
		};
		if (this.nextActivity != null) {
			this.nextActivity.prevActivity = this.prevActivity;
		};
		//fix this one pointers
		this.prevActivity = targetActivity.prevActivity;
		this.nextActivity = targetActivity;
		//merge
		targetActivity.prevActivity = this;
		if (this.prevActivity != null) {
			this.prevActivity.nextActivity = this;
		};
		targetTime = targetActivity.startTime;
		newStartTime = targetActivity.startTime;
		if(!this.upper){
			for ( i = 0; i < activities.length; i++) {
				theActivity = activities[i];
			if (theActivity.startTime < this.startTime && theActivity.startTime >= targetTime &&theActivity.parentActivity==null) {//in between
				theActivity.startTime += duration;
				theActivity.draw();

			}
		}
	}
	this.startTime = newStartTime;
	this.draw();
};

	/*
	 * ******Important function***** draws the 1- activity (rect, sizer, name) and the edges.
	 */
	 this.draw = function() {
	 	var lastTarget = null;
		/*
		 * Called when the rectangle is moved
		 * @param dx the amount of horizental move
		 * @param dy the amount of vertical move
		 * 
		 */
		 move = function(dx, dy) {
		 	this.xShift = dx;
		 	newY = this.oy + dy;
		 	newX = this.ox + dx;
			//todo: what? lastTarget? what is it?
			if(lastTarget != null && lastTarget.shape!=null){

				lastTarget.shape.attr({
					fill : lastTarget.color
				});
				lastTarget.shape.sizer.attr({
					fill : lastTarget.color
				});
			}

			lastTarget = findActivityByTime(newX);

			if(lastTarget.shape!=null){

				lastTarget.shape.attr({
					fill : "FBCEB1"
				});
			//make it black
			lastTarget.shape.sizer.attr({
				fill : "FBCEB1"
			});
		}
			//make it black
			this.dragClone.attr({
				x : newX,
				y : newY,
				//so it seems there is a problme
			});
			//	this.activity.draw(); farzaneh: oct 29 I didn't get the reason behind this. ooh long time ago!
		},
		startDrag = function(startDragX, startDragY, e) {

			//rightclick: add an edge
			if (e.which == 3) {
				if (line == null) {//starting a new edge: source
					lineX = this.attr("x");
					lineY = this.attr("y");
					newEdge = new Edge(this.activity, null);
					dummyObj = editor.circle(lineX, lineY, 2).attr({
						stroke : 'white'
					});
					line = smartEdge(this.node, dummyObj);
					this.activity.fromEdges.push(newEdge);
					$("#editor").bind('mousemove', function(ev) {
						lineX = ev.pageX - $("#editor").offset().left;
						lineY = ev.pageY - $("#editor").offset().top;
						//line.updateEnd(lineX, lineY);
						dummyObj.attr({
							cx : lineX,
							cy : lineY
						});
						line.remove();
						line = smartEdge(newEdge.from.shape, dummyObj);
					});
				}else{ //setting the destination
					newEdge.to = this.activity;
					this.activity.toEdges.push(newEdge);
					newEdge.draw();
					//lineX = this.attr("x");
					//     lineY =this.attr("y");
					//    line.updateEnd(lineX, lineY);
					//line.node.remove();
					line.remove();
					dummyObj.remove();
					$("#editor").unbind('mousemove');
					line = null;
				}
				return false;
			}
			//left click
			if (e.which == 1) {
				this.ox = this.attr("x");
				this.oy = this.attr("y");
				this.sizer.ox = this.sizer.attr("x");
				this.sizer.oy = this.sizer.attr("y");
				this.dragClone = this.clone();
				this.dragClone.attr({
					//TODO: a bug in firefox? the clone is not shown correctly when moving the object! if you set opacity
					//to one it just starts working again, so instead of opacity I had to use fill-opacity and sroke-opacity and that's
					//called engineering :D
					'fill-opacity' : 0.5,
					'stroke-opacity' : 0.5,

				});
				this.dragClone.toFront();
				//like a click it just sets the chosenActivity
				selected="activity";
				chosenActivity = this.activity;
				loadProperties(chosenActivity);

			}

		}, 
		upDrag = function(e) {
			//left click
			if (e.which == 1) {
				if (loopMode == true) {
					if (theLoop.start == null) {
						theLoop.start = this.activity;
						if(this.activity.parentActivity!=null){
							theLoop.start=this.activity.parentActivity;
						}
					} else {
						theLoop.end = this.activity;
						if(this.activity.parentActivity!=null){
							theLoop.end=this.activity.parentActivity;
						}
						theLoop.draw();
						theLoop = null;
						loopMode = false;
					}
				}else if(hierarchyMode==true){
					if (theUpperActivity.leftActivity == null) {
						theUpperActivity.leftActivity = this.activity;
						if(this.activity.parentActivity!=null){
							theUpperActivity.leftActivity=this.activity.parentActivity;
						}
					} else {
						theUpperActivity.rightActivity = this.activity;
						if(this.activity.parentActivity!=null){
							theUpperActivity.rightActivity=this.activity.parentActivity;
						}
						theUpperActivity.draw();
						theUpperActivity = null;
						hierarchyMode = false;
					}
				}
				y = this.dragClone.attr("y");
				newPlane = findNearestPlane(y, socialPlanes);
				if (newPlane != this.activity.socialPlane) {
					changed = true;
				}
				this.activity.socialPlane = newPlane;
				newX = this.dragClone.attr("x");
				theActivity = findActivityByTime(newX);
				//changed horizentally
				if (theActivity != null && theActivity != this.activity && theActivity != this.activity.parentActivity) {
					changed = true;
					//if we are going forward
					if (this.activity.startTime < theActivity.startTime) {
						if (this.activity.parentActivity == null) {
							this.activity.moveForward(theActivity);
						} else {
							this.activity.parentActivity.moveForward(theActivity);
						}
					} else {//we are going backwards
						if (this.activity.parentActivity == null) {
							this.activity.moveBackward(theActivity);
						} else {
							this.activity.parentActivity.moveBackward(theActivity);
						}
					}
				}
				if (lastTarget != null && lastTarget.shape!=null) {
					lastTarget.shape.attr({
						fill : lastTarget.color
					});
					lastTarget.shape.sizer.attr({
						fill : lastTarget.color
					});
				}
				
				if(this.activity.parentActivity!=null){
					this.activity.parentActivity.draw();
				}else{
					this.activity.draw();
				}
				//draw again all edges
				jsPlumb.repaintEverything();
				redrawAllLoops();
				this.dragClone.remove();
			}
		},
		//USED FOR RESIZING
		rstart = function() {
			// storing original coordinates
			this.ox = this.attr("x");
			this.oy = this.attr("y");
			this.box.ow = this.box.attr("width");
			this.box.oh = this.box.attr("height");

		}, 
		rmove = function(dx, dy) {
			// move will be called with dx and dy (dx is from the original place)
			dx = this.ox + dx - this.attr("x");
			//the real dx
			newDuration = parseFloat(this.box.activity.getDuration() + dx);
			//todo: minimum duration: 10
			if (newDuration >= 10) {
				//should we move the things after
				var prevDur = this.box.activity.parentActivity != null ? this.box.activity.parentActivity.getTotalDuration() : this.box.activity.getDuration();
				this.box.activity.setDuration(newDuration);
				this.box.activity.draw();
				var newDur = this.box.activity.parentActivity != null ? this.box.activity.parentActivity.getTotalDuration() : newDuration;
				if (newDur - prevDur != 0) {
					shiftActivitiesAfter(this.box.activity, newDur - prevDur);
					if (this.box.activity.parentActivity != null) {
						this.box.activity.parentActivity.setDuration(this.box.activity.parentActivity.getTotalDuration());
					}

				}
				jsPlumb.repaintEverything();
				redrawAllLoops();
			}
		}, rup = function() {
			//nothing to do! we already did in r move
		};

		/*
		* THE REAL THING THAT IS BEING DONE IN DRAW
		*/
		//if this activity is splited!?
		if (this.subgroups.length != 0) {
			for (var i = 0; i < this.subgroups.length; i++) {
				this.subgroups[i].startTime = this.startTime;
				this.subgroups[i].draw();

			}
			//you have to remove this shape, but what then?
			if (this.shape != null) {
				this.shape.hide();//why not remove? do u know?
				this.shape.text.hide();
				this.shape.sizer.hide();
				this.shape=null;
			}
		} else {
			//normal activity
			var width=activityW;
			var yPos=this.socialPlane.yPosition;
			if(this.parentActivity!=null){
					var index=0;
					var total=0;
					for(var i=0;i<this.parentActivity.subgroups.length;i++){
						if( this.parentActivity.subgroups[i].name== this.name){
							index=total;
				}
				if(this.parentActivity.subgroups[i].socialPlane==this.socialPlane){
					total+=1;
				}
			}
					width= activityW/this.parentActivity.subgroups.length;
					//even number of subgroups
					if(total==0){
						yPos=this.socialPlane.yPosition;
					}
					if(total%2==0){
						if(index<total/2){
						//go down the plane
						yPos= this.socialPlane.yPosition - (5+width)*(total/2-index-1)-5-width/2;
					}else{
						//go up the plane
						yPos=this.socialPlane.yPosition + (5+width)*(index-total/2)+ 5 + width/2;
					}
				}else{
					var mid= Math.floor(total/2);
					if(index==mid){
						yPos=this.socialPlane.yPosition;
					}else if(index<mid){
						//go down the plane
						yPos= this.socialPlane.yPosition - (5+width)*(mid-index-1)-5-width/2-width/2;
					}else{
						//go up the plane
						yPos=this.socialPlane.yPosition + (5+width)*(index-mid-1)+ 5 + width/2+width/2;
					}
				}
			}
			//not drawn before
			if (this.shape == null) {
				if(this.parallel){
					shadowX=this.startTime+5;
					shadowY=yPos-(width/4)
					this.shadow1=editor.rect(shadowX, shadowY - (width / 2), duration, width).attr({
						fill : this.color,
						cursor : "move"
					});
					shadowX=this.startTime+2;
					shadowY=yPos-(width/8)
					this.shadow2=editor.rect(shadowX, shadowY - (width / 2), duration, width).attr({
						fill : this.color,
						cursor : "move"
					});
				}		
				this.shape = editor.rect(this.startTime, yPos - (width / 2), duration, width).attr({
					fill : this.color,
					cursor : "move"
				});
				var resizeRect = editor.rect(this.startTime + duration - 10, yPos - (width / 2), 10, width).attr({
					fill : this.color,
					stroke : "none",
					opacity : .5,
					cursor : "e-resize"
				});
				//todo: color , font-size
				this.shape.text = editor.text(this.startTime + duration / 2, yPos, this.name).attr({
					fill : "A8516E",
					"font-size" : 13
				});
				this.shape.sizer = resizeRect;
				this.shape.text.activity = this;
				this.shape.drag(move, startDrag, upDrag);
				resizeRect.drag(rmove, rstart, rup);
				if(this.upper){
				//drawing the { sign
				var middleX=this.startTime+(this.getTotalDuration()/2);
				var middleY=this.socialPlane.yPosition+(activityW/2)+5;
				//triangle
	var leftX=middleX-10;
	var leftY=middleY+10;
	var rightX=middleX+10;
	var rightY=leftY;
	
	this.upperShape=editor.path("M"+this.startTime+","+(leftY+10)+"L"+this.startTime+","+leftY+"L"+leftX+","+leftY+"L"+middleX+","+middleY+"L"+rightX+","+rightY+"L"+(this.startTime+this.getTotalDuration())+","+rightY+"L"+(this.startTime+this.getTotalDuration())+","+(rightY+10));
}
resizeRect.box = this.shape;
				//box is the thing that contains this
				this.shape.activity = this;

				//EDGES not previously drawn

			} else { //previously drawn
				newY = yPos - (width / 2);
				if(this.shadow1!=null){
					this.shadow1.attr({
						x : this.startTime+5,
						y : newY-(width/4),
						width : duration,
						height : width,
						fill : this.color
					});
				}
				if(this.shadow2!=null){
					this.shadow2.attr({
						x : this.startTime+2,
						y : newY-(width/8),
						width : duration,
						height : width,
						fill : this.color
					});
				}
				this.shape.attr({
					x : this.startTime,
					y : newY,
					width : duration,
					height : width,
					fill : this.color
				});
				this.shape.sizer.attr({
					x : this.startTime + duration - 10,
					y : newY,
					fill : this.color
				});
				this.shape.text.attr({
					x : this.startTime + duration / 2,
					y : yPos,
					text : this.name
				});

				if(this.upperShape!=null){
					this.upperShape.remove();
					var middleX=this.startTime+(this.getTotalDuration()/2);
					var middleY=this.socialPlane.yPosition+(activityW/2)+5;
	//triangle
	var leftX=middleX-10;
	var leftY=middleY+10;
	var rightX=middleX+10;
	var rightY=leftY;
	
	this.upperShape=editor.path("M"+this.startTime+","+(leftY+10)+"L"+this.startTime+","+leftY+"L"+leftX+","+leftY+"L"+middleX+","+middleY+"L"+rightX+","+rightY+"L"+(this.startTime+this.getTotalDuration())+","+rightY+"L"+(this.startTime+this.getTotalDuration())+","+(rightY+10));
}

}

			//************************jsplumb**************//
			this.shape.node.id = this.name;

			var node = $("#" + this.name);
			node.height(node.attr("height"));
			node.width(node.attr("width"));
			node.attr({
				"class" : "w"
			});
			//**********************************************//
			//**************loops***************//
			

			var leftee=this.leftBar;	
			var rightee=this.rightBar;
			if(this.parentActivity!=null){
				leftee=this.parentActivity.leftBar;
				rightee=this.parentActivity.rightBar;
			}
			if(leftee!=null){
				leftee.draw();
			}
			if(rightee!=null){
				rightee.draw();
			}
			//I just need to see how I can have them redrawn. if I can't then just remove them.
			if (this.leftRect != null) {
				this.leftRect.attr({
					x : this.startTime
				});
			}
			if (this.rightRect != null) {
				this.rightRect.attr({
					x : this.startTime + this.getDuration()
				});
			}
		}
	};
	/*
	 * updates the edge to the next activity. I don't think it's ever used.
	 */
	 this.updateEdge = function() {
		//edges
		if (this.edgeToNext != null) {
			this.edgeToNext.to = this.nextActivity;
		} else {
			this.edgeToNext = new Edge(this, this.nextActivity);
		}
		this.edgeToNext.draw();
	}
}
//general functions
/**
 * Returns The last activity based on the starting time. Null if there are no activities
 * @param
 * @return      activity
 */
 function getLastActivity() {
 	maxActivity = null;
 	for ( i = 0; i < activities.length; i++) {
 		theActivity = activities[i];
 		if (maxActivity == null || theActivity.startTime > maxActivity.startTime) {
 			maxActivity = theActivity;
 		}
 	}
 	if(maxActivity!=null &&maxActivity.parentActivity!=null){
 		return maxActivity.parentActivity;
 	}
 	return maxActivity;
 }
/*
 * Returns The first activity based on the starting time. Null if there are no activities
 * @param
 * @return      activity
 */
 function getFirstActivity() {
 	minActivity = null;

 	for ( i = 0; i < activities.length; i++) {
 		theActivity = activities[i];
 		if (minActivity == null || theActivity.startTime < minActivity.startTime) {
 			minActivity = theActivity;
 		}
 	}
 	if(minActivity!=null && minActivity.parentActivity!=null){
 		return minActivity.parentActivity;
 	}
 	return minActivity;
 }

/*Returns the activity that starts or is being done at this time. If the time is less than the start of the class, first activity is returned
 * if the time is after the end of the class, last activity is returned
 * @param time
 * @return activity
 */
 function findActivityByTime(time) {
 	for ( i = 0; i < activities.length; i++) {
 		theActivity = activities[i];
 		if (time >= theActivity.startTime && time < parseFloat(theActivity.startTime + theActivity.getDuration())) {
 			if(theActivity.parentActivity!=null){
 				return theActivity.parentActivity;
 			}
 			return theActivity;
 		}
 	}
	//I don't really like this! because null should be returned in these cases.
	factivity = getFirstActivity();
	if (factivity != null && factivity.startTime > time) {
		return factivity;
	}
	lactivity = getLastActivity();
	if (lactivity != null && lactivity.startTime < time) {
		return lactivity;
	}
	return null;
}

/*
 * Shifts all the activities after activity for the amount of dx
 * @param activity: activities after this activity will be shifted by param dx
 * @param dx : amount of shift
 */
 function shiftActivitiesAfter(activity, dx) {

 	for ( i = 0; i < activities.length; i++) {
 		theActivity = activities[i];
 		if (theActivity != activity && theActivity.startTime > activity.startTime) {
 			theActivity.startTime = theActivity.startTime + dx;
 			theActivity.draw();
 		}
 	}
 	
 }
/*
 * Finds the activity that is next to the this activity and starts before this one
 * @param this activity
 * @return the activity before
 */
 function getActivityBefore(theActivity) {
 }
/*
 * Finds the activity that is next to this activity and comes after this activity
 * @param this activity
 * @return the activity after
 */
 function getActivityAfter(theActivity) {
	//something that I should decide about: If every activity draws the line to the previous activity and next activity then there are
	//going to be duplicate edges in the graph!
	//It is going to be a little stupid. It is more logical if I keep a reference from each activity to the activity that comes before
}
