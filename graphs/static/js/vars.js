/**
contains all the variables
**/


var selected=null;


/*


* ACTIVITY
*/
var line = null;
//Just to say that an edge is being drawn
var newEdge = null;
var dummyObj = null;
var savingActivity;
var activities = Array();
var allActivitiesSaved=false;
var nextId=0;
var deletedActivities=Array();

var upperActivities=Array();
var hierarchyMode=false;
var theUpperActivity;
/*
COORDINATES
*/

/*
 * Attension: The plane at position zero has the largest y and planes are sorted.
 */
var socialPlanes= Array();

/*
EDGE
*/
//used to load the properties
var chosenEdge = null;
var allEdgesSaved=false;
var edges= Array();
var savingEdge;
var deletedEdges=Array();


/*
INITIALIZE
*/
var pallet;
var editor;
var axisY;
var base;

var planeNames = ["Individual", "Group", "Class", "Periphery", "Community", "World"];
var activityW = 50;
var tmax = 5;
var initialDuration = 80;
lastTarget = null;
var chosenActivity = null;


/*
LOOP
*/
var loopMode = false;
var theLoop;
var chosenLoop=null;
var loops=Array();
var deletedLoops=Array();
/*
MAIN
*/
var edgeDD;
var openWindow;


/*
RELATED TO THE GRAPH
*/
var graphId="";
var graphName="My Graph"
