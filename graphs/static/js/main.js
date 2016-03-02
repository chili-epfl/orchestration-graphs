/**
*some main stuff!!
*@author Farzaneh
**/
$(function() {
	//disable righ-click on the page
	document.oncontextmenu = function(){
		return false;
	};

	try{
	//this is for enabling the nice drop-down	
	edgeDD=$("#activity-prop select").msDropDown();

}catch(e){

	console.log(e.message);
	
}

		//I know this is stupid, but if I put it somewhere else, the north pane gets smaller than what I want it to be!
		$('#innerBody').layout({
			applyDefaultStyles : true,

					east__size : 340, //TODO: it should be automatically resized, because of the properties tab
					north__size: 60, //TODO
					east__childOptions : {
						applyDefaultStyles : true,
						defaults : {

						},
						south : {
							initClosed : true,
							fxName : "slide", // none, slide, drop, scale
							fxSettings_open : {
								easing : "swing"
							},
							size : 380, //TODO: ?
						},
						north:{
							//initClosed : true,
							size: 90,
						},

					}
					
				});

		$( "#tabs" ).tabs();
		$( "#graph-tabs" ).tabs();
		$( "#pallet-tabs" ).tabs();
		$( "#prop-tabs" ).tabs();
		removeAllTabs("#prop-list");

	//$('body').layout({ applyDefaultStyles: true });
	$("#activityName").change(function() {
		if(chosenActivity!=null){

			chosenActivity.name=$("#activityName").val().replace(/\s/g, '');
		//	alert(chosenActivity.name);
			chosenActivity.draw();
		}
	});

	$("#loop-repeat").change(function() {
		if(chosenLoop!=null){
			chosenLoop.repeat=$("#loop-repeat").val();
		}
	});

	$("#graphName").change(function() {
		graphName=$("#graphName").val();
	});
	
	
	$("#activityType").change(function() {
		if(chosenActivity!=null){
			chosenActivity.type=$("#activityType").val();
			chosenActivity.draw();
		}
	});
	$("#activitySplit").change(function() {
		console.log(activities);
		if(chosenActivity!=null){
		//two cases:
		//1) this is a normal activity
		//2) this is a result of an already splitted activity
		//no difference! we always split the original activity and no problem
		var parentActivity=null;
		if(chosenActivity.parentActivity!=null){
			parentActivity=chosenActivity.parentActivity;
		}else if(chosenActivity.subgroups.length!=0){
			parentActivity=chosenActivity;
		}
		if(parentActivity!=null){
			//Design Decision: The parent is changed from the base, there is no split inside 
			//split. OK? no dreams within a dream?
			//Alors! delete from activities totally. If saved as well. Just call delete activity
			//and then go on!Achtung: you might not find the parent here!
			deleteActivity(chosenActivity,false,false);
			// for(i=0;i<parentActivity.subgroups.length;i++){
			// 	deleteActivity(parentActivity.subgroups[i],false);
			// }
			// console.log(activities.length);
			parentActivity.subgroups=Array();
			chosenActivity=parentActivity;
		}
		var number=$("#activitySplit").val();
		if(number!=5){
			if(chosenActivity.shadow1!=null){
				chosenActivity.shadow1.remove();
				chosenActivity.shadow1=null;
			}
			if(chosenActivity.shadow2!=null){
				chosenActivity.shadow2.remove();
				chosenActivity.shadow2=null;
			}
			chosenActivity.parallel=false;
		}

		if(number==1){
			chosenActivity.draw();
		}else{
			if(number==5){
				//try to see if u can have t 
				width=activityW;
				shadowX=chosenActivity.startTime+5;
				shadowY=chosenActivity.socialPlane.yPosition-(width/4);
				chosenActivity.shadow1=editor.rect(shadowX, shadowY - (width / 2), chosenActivity.getDuration(), width).attr({
					fill : chosenActivity.color,
					cursor : "move"
				});
				shadowX=chosenActivity.startTime+2;
				shadowY=chosenActivity.socialPlane.yPosition-(width/8);
				chosenActivity.shadow2=editor.rect(shadowX, shadowY - (width / 2), chosenActivity.getDuration(), width).attr({
					fill : chosenActivity.color,
					cursor : "move"
				});
				chosenActivity.shadow2.toBack();
				chosenActivity.shadow1.toBack();
				
				chosenActivity.draw();
				chosenActivity.parallel=true;
			}else{

				for(var i=0;i<number;i++){
					var newAct=new Activity(chosenActivity.name+i, chosenActivity.socialPlane, chosenActivity.getDuration(), chosenActivity.startTime, chosenActivity.preActivity);
					activities.push(newAct);
					newAct.nextActivity=chosenActivity.nextActivity;
			//activities[activities.length] = newAct;
			chosenActivity.subgroups.push(newAct);
			newAct.parentActivity=chosenActivity;
			//add all the edges to the new activity
			
			for(var j=0;j<chosenActivity.fromEdges.length;j++){
				//create a copy of the edge and add it IQ!!
				theEdge=chosenActivity.fromEdges[j];
				newEdge=copyEdge(theEdge,newAct,theEdge.to);
				newAct.fromEdges.push(newEdge);
				newEdge.to.toEdges.push(newEdge);
				//TODO edges.push(newEdge);
			//	newEdge.draw();
		}
		for(var j=0;j<chosenActivity.toEdges.length;j++){

			theEdge=chosenActivity.toEdges[j];
			newEdge=copyEdge(theEdge,theEdge.from,newAct);
			newAct.toEdges.push(newEdge);
			newEdge.from.fromEdges.push(newEdge);
				//TODO  edges.push(newEdge);
				//newEdge.draw();
			}
		}
		//deleting all the previously defined edges
		for(i=0;i<chosenActivity.fromEdges.length;i++){
			theEdge=chosenActivity.fromEdges[i];
			toAct=theEdge.to;
			toAct.deleteToEdge(theEdge);
			deleteEdge(theEdge);
		}
		for(i=0;i<chosenActivity.toEdges.length;i++){
			theEdge=chosenActivity.toEdges[i];
			fromAct=theEdge.from;
			fromAct.deleteFromEdge(theEdge);
			console.log(fromAct.fromEdges);
			deleteEdge(theEdge);
		}



		jsPlumb.detachAllConnections(chosenActivity.name);
		//remove all the edges from the chosen activity
		chosenActivity.draw();
		
		chosenActivity.fromEdges=Array();
		chosenActivity.toEdges=Array();
		//This looks a little stupid, but it works!
		for(var i=0;i<chosenActivity.subgroups.length;i++){
			theAct=chosenActivity.subgroups[i];
			for(var j=0;j<theAct.fromEdges.length;j++){
				theAct.fromEdges[j].draw();
			}
			for(var j=0;j<theAct.toEdges.length;j++){
				theAct.toEdges[j].draw();
			}
		}
		//now remove the edge!
		//Cause everytime an activity is added we put forward folan
		tmax=tmax-number*chosenActivity.getDuration();
		//TODO	chosenActivity.del();
	}
}
}

if(chosenActivity.subgroups.length!=0){
	chosenActivity=chosenActivity.subgroups[1];
}

console.log("chosen Activity is "+chosenActivity.name+" and last target is = "+lastTarget);
});

$("#edge-strength").change(function() {
	if(chosenEdge!=null){
		chosenEdge.strength=$("#edge-strength").val();
		chosenEdge.draw();
	}
});

$("#edge-operator").change(function() {
	if(chosenEdge!=null){
		chosenEdge.operator=$("#edge-operator").val();
		chosenEdge.draw();
	}
});
$("#edge-fiber").change(function() {
	if(chosenEdge!=null){
		chosenEdge.fiber=$("#edge-fiber").val(); 
	}
});

initialize_editor();
	//initialize_pallet();
	
	//initialize the dialog!
	initializeActivityDialog();
	
	$('#color').colorPicker({pickerDefault: "0000ff", colors: ['0000FF','0066FF','598FEF','B3D4FC','FFFFFF'], transparency: true});
	  //'ffffff','ccffff','00ccff','3366ff','0000ff' 
	  
//I am loading the graph
if(redirectedGraphId!=""){
	openGraph(redirectedGraphId);
	if(!owner){
		//TODO: open a window to tell them that they are not the owner of the graph! 
		console.log("You are not the owner of this graph");
	}
}

//when keys like delete or esc are pressed 
$(document).unbind('keydown').bind('keydown', function (event) {
	var doPrevent = false;
    //ESC pressed
    if(event.keyCode === 27){
    	selected=null;
   	//the modes! loop? hierarchy?
   	if(loopMode == true){
   		loopMode=false;
   		theLoop=null;
   		loops.pop(); //last element
   	}
   	if(hierarchyMode==true){
   		hierarchyMode=false;
   		theUpperActivity=null;
   		upperActivities.pop();
   	}

   }
   //Delete pressesd
   if (event.keyCode === 8) {
   	var d = event.srcElement || event.target;
   	if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD')) 
   		|| d.tagName.toUpperCase() === 'TEXTAREA') {
   		doPrevent = d.readOnly || d.disabled;
   }
   else {
   	doPrevent = true;
   }
}

if (doPrevent) {
	event.preventDefault();
	if(selected=="activity"){
		var shiftRest=true;
		if(chosenActivity.upper==true){
			shiftRest=false;
		}
		deleteActivity(chosenActivity,shiftRest);
	}else if(selected=="edge"){
		deleteSelectedEdge(chosenEdge);
	}else if(selected=="loop"){
		deleteSelectedLoop(chosenLoop);
	}


}
});

jsPlumb.connectorClass="edge";

jsPlumb.Defaults.Container = "editor";
jsPlumb.draggable(jsPlumb.getSelector(".w"));

});



function connect(act1, act2) {
	var anchor1="ContinuousLeft";
	var anchor2="ContinuousLeft";
	return jsPlumb.connect({
		source : act1.name,
		target : act2.name,
		newConnection: true,
		connector : ["Straight"],
		anchors : [anchor1, anchor2],
		paintStyle:{ lineWidth:2, strokeStyle:'black' },
		endpoint: "Blank"

	});
}




/*I HAVE NO IDEA WHAT THIS IS FOR*/
//todo: simonsarris.com
//so I am going to do sth about it! I guess
//see if you can have an instance of every thing and drag and drop them.
function initializeActivityDialog(){
	$( "#dialog:ui-dialog" ).dialog( "destroy" );
	var name = $( "#name" ),
		//email = $( "#email" ),
		//password = $( "#password" ),
		allFields = $( [] ).add( name ),//.add( email ).add( password ),
		tips = $( ".validateTips" );

		function updateTips( t ) {
			tips
			.text( t )
			.addClass( "ui-state-highlight" );
			setTimeout(function() {
				tips.removeClass( "ui-state-highlight", 1500 );
			}, 500 );
		}

		function checkLength( o, n, min, max ) {
			if ( o.val().length > max || o.val().length < min ) {
				o.addClass( "ui-state-error" );
				updateTips( "Length of " + n + " must be between " +
					min + " and " + max + "." );
				return false;
			} else {
				return true;
			}
		}

		function checkRegexp( o, regexp, n ) {
			if ( !( regexp.test( o.val() ) ) ) {
				o.addClass( "ui-state-error" );
				updateTips( n );
				return false;
			} else {
				return true;
			}
		}


		$( "#dialog-form" ).dialog({
			autoOpen: false,
			height: 300,
			width: 350,
			modal: true,
			buttons: {
			"OK": function() { //what exactly I should search about: I should be able to pass a graph
				var bValid = true;
				allFields.removeClass( "ui-state-error" );

				bValid = bValid && checkLength( name, "name", 1, 16 ); //TODO: check it's tekrari or not
			//	bValid = bValid && checkLength( email, "email", 6, 80 );
			//	bValid = bValid && checkLength( password, "password", 5, 16 );

			bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Name may consist of a-z, 0-9, underscores, begin with a letter." );
				// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			//	bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
			//	bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );

			if ( bValid ) {
//					$( "#users tbody" ).append( "<tr>" +
//						"<td>" + name.val() + "</td>" + 
//						"<td>" + email.val() + "</td>" + 
//						"<td>" + password.val() + "</td>" +
//					"</tr>" ); 
var $activity=$("#dialog-form").data('activity');
$activity.name=name.val(); 
   			$activity.draw(); //new name

   			$( this ).dialog( "close" );
   		}
   	},
   	Cancel: function() {
   		$( this ).dialog( "close" );
   	}
   },
   close: function() {
   	allFields.val( "" ).removeClass( "ui-state-error" );
   }

});
}

/*function to save everything all together*/
function saveAll(){
//saving stuff
$.ajax({
	dataType: "html",
	type: "POST",
	evalScripts: true,
	url: graphUrl,
	data: ({Graph:{id:graphId, name:graphName}}),
	success: function(data){
		graphId=data;
		saveActivities(0);
		owner=true;
	}
});
	//delete edges? cascade? OMG! seems to be ok. 
	deleteLoopsFromDB(0);
	deleteEdgesFromDB(0);
	deleteActivities(0);
}

function loadXML(){
	//send an ajax request
	//get the data back
	//set the contents of folan
}

function exportToImage(){
	imageWindow = window.open(exportUrl, '_blank');  
	imageWindow.onload = function() {
		var canvas = null;
	//var svgElems=Array();
	$("#editor").children('svg').each(function() {
		var top= $(this).offset().top;
		var left= $(this).offset().left;
		canvas=imageWindow.document.createElement('canvas');
		imageWindow.document.getElementById('body').appendChild(canvas);
		canvg(canvas, $('<div />').append(this).html());
		$(canvas).css("position","absolute");
		$(canvas).css("top",top);
		$(canvas).css("left",left);
		//$("#pallet").innerHtml+="<img src='"+img+"'/>";
		//imageWindow.document.append('<img src="'+img+'"/>'); 
		//TODO: there is still problem with the position of the edge!! really? I don't think so!
	});
}
}
function printDiv(divId) {
	printDivCSS = new String ('<link href="/cakephp/css/jquery.ui.all.css" rel="stylesheet" type="text/css">')
 $('#innerBody').layout().close('east'); //to remove it! cool :D
 window.print();

}

function setFlash(type){
	var message;
	if(type=="edge"){
		message="Right click on the source activity, then right click on the destination activity!";
	}else if(type=="loop"){
		message="Click on the first activity in the loop, then click on the last activity!";
	}else if(type=="hierarchy"){
		message="Click on the first overlapping activity, then click on the last one!";
	}else{
		message="tout va bien!";
	}
	$("#info").html(message);
	$(".flash").fadeIn();	
	setTimeout(function(){

		$(".flash").fadeOut("slow", function () {
		}); }, 5000);

}


