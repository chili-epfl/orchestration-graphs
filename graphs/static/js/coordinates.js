/*
 * Contains everything related to the x and y coordinates
 * @author Farzaneh
 */

/*
 * Returns the nearest social plane
 * @param y : the y element
 * @ return the nearest plane to this y position
 */
function findNearestPlane(y){
	y=Math.floor(1000*y);	
	for(var i=0;i<socialPlanes.length-1;i=i+1){

		if(y<=Math.floor(1000*socialPlanes[i].yPosition) && y>Math.floor(1000*socialPlanes[i+1].yPosition)){
			return socialPlanes[i];
		}
	}
	if(y<=Math.floor(1000*socialPlanes[socialPlanes.length-1].yPosition)){
		return socialPlanes[socialPlanes.length-1];
	}
	if(socialPlanes.length>0 && y>=Math.floor(1000*socialPlanes[0].yPosition)){
		return socialPlanes[0];
	}
	return null;
}
/*
 * Class SocialPlane
 */
function SocialPlane(name,yPosition){
	this.name=name; //so far: 1- individual 2- Group 3-Class 4-Periphery 5-Community 6-World
	this.yPosition=yPosition; //it should be  float
	/*Draws the social plane horizental line and writes its name
	 * @param editor where to draw
	 * @param baseX editor start x
	 * @param editors width
	 */  
	//the name of the social plane
	this.draw=function(editor,baseX,length,thinkness){ //plugin
		editor.path("M"+baseX+","+this.yPosition+"H"+length)
	    .attr({stroke: "gray",
	     "stroke-width": thickness
	     });
		//name of it
		editor.text(length-60,this.yPosition-10,this.name).attr({
			"font-size":14
		});
	};
	
}

