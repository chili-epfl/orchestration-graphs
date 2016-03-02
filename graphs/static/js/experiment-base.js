//General experiment state variables
//States whether we are in "intro-mode" (explanation and initial user profile questions) or not
var intro = true;
var counters_initialized=false;
var timeshelp = 0; //times the user asked for help
var timetask = 0; // time employed in doing the current task
var timehelp = 0; // time employed in help mode
var task_time = 3; // time to do each task, in seconds
var pause_time = 3; // pause between each task, in seconds
var current_task = 0; //index of the current task
var on_task = false; //denotes whether we are on a task - to capture the keypresses
var on_modal = false; //denotes whether we are on the modal window - to not capture keypresses
var current_task_success = false; //whether the current task has been successfully passed or not
var current_task_timestamp = 0; //timestamp of the start of this task
var current_task_elapsed_time = task_time*1000; //time taken to solve this task (until keypress)
var help_timestamp = 0; //moment in which we accessed the help
var total_help_time = 0; //total time spent in help during this task
var num_tasks; //This will store the number of individual tasks that each experiment will have (e.g. one phrase in the STROOP experiment)

//We define the structure of the result object to be sent to the server at the end of the experiment
var data;//This will store the current task's data
var user_profile; //This will store the current user profile information, to be set in the intro phase
var results = [];

// UI functions that apply to all experiments

// Show the modal window with the intro/help
function showModal(intromode){

	if(intromode){ // It is in intro mode
		$("#introExperimentModal").modal('show');
		$("#modalProfile").css( "visibility", "visible" );
	} else { // It is help mode
		$("#modalProfile").css( "visibility", "hidden" );
		$("#introExperimentModal").modal('show');
	}

}

// Initializes the experiment, including the generic UI elements and any other experiment-specific stuff
function init(){

	//We hide and add behavior to the ending modal window
	$('#endModal').hide();
	$('#endModal').on('hide.bs.modal', function () {
		window.location.href = '/';
	});

	//We start the counters as soon as the modal window is closed
	$('#introExperimentModal').on('hide.bs.modal', function () {

		on_modal=false;
		if(!counters_initialized){
			initCounters();	
			counters_initialized=true;
		}
    	resumeCounters();

    	if(!intro && on_task){//if it is not the intro and we are on task, we are tracking help time
	    	var now = (new Date()).getTime();
	    	total_help_time += (now - help_timestamp);
    	}

   		intro = false; //Next time, the intro will be in help mode

  	});

  	$('#introExperimentModal').on('show.bs.modal', function () {
  		on_modal=true;
    	pauseCounters();
    	if(!intro && on_task){//if it is not the intro and we are on track, we are tracking help time
	    	help_timestamp = (new Date()).getTime();
	    }
  	});

	//We show the intro window
	showModal(intro);

	//We do any other experiment-specific initialization
	init_specific();

}


// Initializes the task and inter-task pauses countdowns
function initCounters(){
	//We display the big dot
	$("#pauseStimulus").show();
	$("#stimulus").hide();

	//We start and display the pause countdown
	$('#initialMessage').hide();
	$('#clocktask').hide();
	$('#clockpauses').show();
	$('#clockpauses').countdown({
			until: '+'+pause_time+'s', 
	    	layout: 'Task will start in {sn}s...',
	    	onExpiry: startTask
    	});

}

// Resumes the counters when exiting the help
function resumeCounters(){

	console.log('resuming counters');
	$('#clocktask').countdown('resume');
	$('#clockpauses').countdown('resume');
    if($('#clockminitask') && $('#clockminitask').countdown) $('#clockminitask').countdown('resume');//For the experiment 4, which has a minitask counter

}

// Pauses the task counter when entering the help
function pauseCounters(){

	console.log('pausing counters');
	$('#clocktask').countdown('pause');
	$('#clockpauses').countdown('pause');
    if($('#clockminitask') && $('#clockminitask').countdown) $('#clockminitask').countdown('pause');//For the experiment 4, which has a minitask counter


}


// shows the help window and updates the appropriate counter
function showHelp(){
	showModal(intro);

	timeshelp++;
}


// Generic useful functions for the experiments

// Makes a random permutation of an array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//Simple function to clone JS objects (so that we do not pass them by reference, as default)
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


// Date formatting function
function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
};
