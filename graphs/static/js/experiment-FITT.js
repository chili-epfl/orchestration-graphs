// TODO 0: General parameters of this experiment (time for each task and pauses in between)
task_time = 3; // time to do each task, in seconds
pause_time = 5; // pause between each task, in seconds
var screen_height = 0;
var screen_width = 0;

// TODO 1: Define the user profile useful for this task (to be shown as a form in the intro)
//User profile for the STROOP task
user_profile = {
    device_id: "LM"
};

// TODO 3: Define the number of tasks that will make up the workflow of the experiment for one subject
num_tasks = 60;

// TODO 2: Define any experiment-specific data structures
//Data for the GENEALOGY task
//These are the sets of logical elements
var balls = []

var condition = Math.random() > 0.5;
if (condition) {
    num_tasks /= 6;
}
for (var i = 0; i < num_tasks / 2; i++){
    balls.push({'x': 0, 'y': 0, 'r': 0.1 });

    if ((condition) && (i == 3)){
	balls.push(balls[5]);
	continue;
    }

    var x = Math.random() * 2 - 1;
    var y = Math.random() * 2 - 1;
    var r = (0.1 + Math.random()*0.9) / 2;
    balls.push({'x': x, 'y': y, 'r': r });
}
if (condition){
    for (var i = 0; i < 5; i++){
	for (var j = 0; j < 10; j++){
	    balls.push(balls[j]);
	}
    }
    num_tasks *= 6;
}


// TODO 4: Define the init-specific() function with 
function init_specific(){
    $('#dot').hide();

    //Just in case, we hide the stimulus and buttons
    $('#dot').click(function(){
	correct();
    });

}


// TODO 5: Define the startTask() function with whatever happens at the beginning of each task (show stimuli, countdown timers, initialize task timestamps)
function startTask(){
    $('#dot').show();
    $('#pauseStimulus').hide();


    // This part shoud
    current_task_success=false;//we reset the success of the task to false
    current_task_elapsed_time = task_time*1000; //we reset the time taken to solve the puzzle
    help_timestamp = 0;
    total_help_time = 0;

    //Experiment-specific stuff
    //We display the dot


    screen_width = $('#ball_bounds').width();
    if (screen_width > 600){
	screen_width = 600;
        $('#ball_bounds').width(screen_width);
    }
    $('#ball_bounds').height(screen_width);
    screen_height = screen_width;

    var radius = balls[current_task]['r'];
    var top = balls[current_task]['y'] * screen_height/2 + screen_height/2 - radius;
    var left = balls[current_task]['x'] * screen_width/2 - radius;

    $('#dot').css({top: top, left: left, position: 'relative'});
    $('#dot').height(radius * 2 * 100);
    $('#dot').width(radius * 2 * 100);


    //We start and display the task countdown
    $('#initialMessage').hide();
    $('#clocktask').show();
    $('#clockpauses').hide();
    $('#clockpauses').countdown('option',{
	onExpiry: null
    });
    $('#clocktask').countdown({
	until: '+'+task_time+'s', 
	layout: '<span class="huge">{sn}</span>s',
	onExpiry: endTask 
    }); //We initialize the clock
    $('#clocktask').countdown('option',{
	until: '+'+task_time+'s', 
	layout: '<span class="huge">{sn}</span>s',
	onExpiry: endTask 
    });// In case the clock was already initialized, we restart it


    // This part should also be in all experiments, probably
    current_task_timestamp = (new Date()).getTime();
    on_task = true;
}

function correct(){
    current_task_success=true;

    var time = (new Date()).getTime();
    current_task_elapsed_time = time - current_task_timestamp;

    endTask();
}

function incorrect(){
    current_task_success=false;

    var time = (new Date()).getTime();
    current_task_elapsed_time = time - current_task_timestamp;

    endTask();
}

// TODO 6: Define the endTask() function with whatever happens at the end of each task (hide stimuli, stop timers, build task result data)
function endTask(){

    if(current_task<num_tasks){// Just in case, it looks like this is called twice on ending
	    
	//This part is experiment-specific
	//We decide if the task was correct?
	console.log("ended task - correctly? " + current_task_success + " in " + (current_task_elapsed_time - total_help_time) + " ms.");
	//We send store the data locally to be sent at the end of the experiment
	var result = {
	    "ordinal": Math.floor(current_task / 2),
	    "x": balls[current_task]['x'],
	    "y": balls[current_task]['y'],
	    "r": balls[current_task]['r'],
	    "screen_width": screen_width,
	    "screen_height": screen_height,
	    "correct": current_task_success,
	    "condition": condition?"deterministic":"random",
	    "time": (current_task_elapsed_time - total_help_time)
	};
	if (current_task % 2 == 1)
	    results.push(result);

	//This part is largely generic, but has some experiment-specific stuff
	//Experiment-specific transition between task and pause (exchange stimuli)

	//We start and display the pause countdown
	current_task++;
    }
    if(current_task<num_tasks){
	// Just in case, it looks like this is called twice o
	startTask();

	//We update the progress bar
	var progress = Math.floor((current_task / num_tasks)*100);
	//console.log('trying to update progress bar to '+progress);
	$('#taskProgress').attr("aria-valuenow",progress);
	$('#taskProgress').attr("style", "width: "+progress+"%");
	//$('#taskProgress').html(progress+" % done");


	on_task = false;

    } else if (current_task == num_tasks) {
	current_task++;

	//We update the progress bar
	var progress = Math.floor((current_task / num_tasks)*100);
	//console.log('trying to update progress bar to '+progress);
	$('#taskProgress').attr("aria-valuenow",progress);
	$('#taskProgress').attr("style", "width: "+progress+"%");
	//$('#taskProgress').html(progress+" % done");

	finishExperiment();
    }
}


// TODO 7: do the finishExperiment() function with whatever happens at the end of the experiment 
// (it is mostly generic like showing the ending window, but double-check that your experiment does not need anything special here)
function finishExperiment(){
    //Show modal Thankyou window with disabled buttons while we send the results to server
    $('#endModal').modal('show');
    $('#closetrbutton').hide();
    $('#endBackHome').button('loading');

    //Build the JS object for the results
    var data = {
	'user_id': user_id,
	'user_profile': JSON.stringify(user_profile),
	'data': JSON.stringify(results)
    }

    //Do Ajax POST to /result/submit
    console.log(data);
    var request = $.ajax({
	type: "POST",
	url: "/result/submit/",
	data: data,
	dataType: "json"
    });
    request.always(showFinalGoodbye);
}

// This is the callback function when the results are successfully sent to server, probably no changes needed
function showFinalGoodbye(){
    console.log("Results sending successful!");
    $('#endBackHome').button('reset');
    $('#closetrbutton').show();
}


// TODO 8: do the storeProfile() function that reads the user profile form and translates it to the data structure that will be sent to the server along with the results
function storeProfile(){
    //We extract the answers and put them into the user profile
    var field = document.getElementById("id_device");
    var device = field.options[field.selectedIndex].value;
    user_profile.device_id = device;

    // We hide the form
    $("#userProfileForm").css( "display", "none" );
    // We display a message
    var newdiv = document.createElement('div');
    newdiv.setAttribute('class','alert alert-success');
    newdiv.setAttribute('role','alert');
    newdiv.innerHTML = "<p>Thanks for the info!</p>";
    document.getElementById("modalProfile").appendChild(newdiv);
}

