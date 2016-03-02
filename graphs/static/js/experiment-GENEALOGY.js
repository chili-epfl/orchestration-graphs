// TODO 0: General parameters of this experiment (time for each task and pauses in between)
task_time = 30; // time to do each task, in seconds
pause_time = 2; // pause between each task, in seconds
var cur_task_resp = false; // was the last question responded

// TODO 1: Define the user profile useful for this task (to be shown as a form in the intro)
//User profile for the STROOP task
user_profile = {
	device_id: "LM"
};

// TODO 2: Define any experiment-specific data structures
//Data for the GENEALOGY task
//These are the sets of logical elements
var phrases = [
{
	statements: "$d is the son of $a<br/>$a is the father of $b<br/>$a is the brother of $c", 
	subjects: ["$a", "$b", "$c", "$d"],
	sex: ["m", "f", "m", "m"],
	question: "Who is the uncle of $b?", 
	num_elements: 3, 
	options: ["$a","$c","$d"], 
	solution: "$c"
},
{
	statements: "$c is the mother of $d<br/>$a is the father of $b<br/>$e is the brother of $d<br/>$b is the brother of $c", 
	subjects: ["$a", "$b", "$c", "$d", "$e"],
	sex: ["m", "f", "f", "m", "m"],
	question: "Who is the grandfather of $e?", 
	num_elements: 4, 
	options: ["$a","$d","$e"], 
	solution: "$a"
},
{
	statements: "$a is the mother of $b<br/>$b is the sister of $d<br/>$d is the mother of $e<br/>$e is the brother of $f<br/>$c is the son of $b", 
	subjects: ["$a", "$b", "$c", "$d", "$e", "$f"],
	sex: ["f", "f", "m", "f", "m", "f"],
	question: "Who is the aunt of $f?", 
	num_elements: 5, 
	options: ["$a","$b","$d"], 
	solution: "$b"
},
{
	statements: "$b is the daughter of $a<br/>$c is the brother of $b<br/>$c is the husband of $d<br/>$e is the son of $d<br/>$b is the mother of $f<br/>$f is the brother of $g", 
	subjects: ["$a", "$b", "$c", "$d", "$e", "$f", "$g"],
	sex: ["m", "f", "m", "f", "m", "m", "m"],
	question: "Who is the grandfather of $e?", 
	num_elements: 6, 
	options: ["$a","$c","$f"], 
	solution: "$a"
},
{
	statements: "$e is the son of $d<br/>$b is the daughter of $a<br/>$c is the brother of $b<br/>$c is the husband of $d<br/>$h is the brother of $b<br/>$f is the brother of $g<br/>$b is the mother of $f", 
	subjects: ["$a", "$b", "$c", "$d", "$e", "$f", "$g", "$h"],
	sex: ["m", "f", "m", "f", "m", "m", "f", "m"],
	question: "Who is the uncle of $e?", 
	num_elements: 7, 
	options: ["$a","$e","$h"], 
	solution: "$h"
},
{
	statements: "$c is the husband of $d<br/>$e is the son of $d<br/>$c is the brother of $b<br/>$b is the mother of $f<br/>$h is the brother of $b<br/>$f is the brother of $g<br/>$b is the daughter of $a<br/>$i is the son of $g", 
	subjects: ["$a", "$b", "$c", "$d", "$e", "$f", "$g", "$h", "$i"],
	sex: ["f", "f", "m", "f", "m", "m", "f", "m", "m"],
	question: "Who is the grandson of $b?", 
	num_elements: 8, 
	options: ["$i","$c","$f"], 
	solution: "$i"
},
{
	statements: "$b is the daughter of $a<br/>$c is the husband of $d<br/>$e is the son of $d<br/>$c is the brother of $b<br/>$b is the mother of $f<br/>$i is the son of $g<br/>$j is the brother of $h<br/>$h is the brother of $b<br>$f is the brother of $g", 
	subjects: ["$a", "$b", "$c", "$d", "$e", "$f", "$g", "$h", "$i", "$j"],
	sex: ["f", "f", "m", "f", "m", "m", "f", "m", "m", "m"],
	question: "Who is the aunt of $g?", 
	num_elements: 9, 
	options: ["$a","$d","$b"], 
	solution: "$d"
},
{
	statements: "$b is the mother of $f<br/>$i is the son of $g<br/>$j is the brother of $h<br/>$b is the daughter of $a<br/>$c is the husband of $d<br/>$k is the wife of $a<br/>$e is the son of $d<br/>$c is the brother of $b<br>$h is the brother of $b<br/>$f is the brother of $g", 
	subjects: ["$a", "$b", "$c", "$d", "$e", "$f", "$g", "$h", "$i", "$j", "$k"],
	sex: ["f", "f", "m", "f", "m", "m", "m", "f", "m", "m", "f"],
	question: "Who is the mother of $h?", 
	num_elements: 10, 
	options: ["$b","$d","$k"], 
	solution: "$k"
}
];

var female_names = [ "Anna",
	"Beverly",
	"Cynthia",
	"Dorothy",
	"Elenna",
	"Fatimah",
	"Grace",
	"Iris",
	"Jennifer",
	"Kate",
	"Laura",
	"Mary",
	"Nelly",
	"Petra",
	"Rose",
	"Susan",
	"Tania",
	"Vivian",
	"Wendy",
	"Yasmine"
];
var male_names = ["Albert",
	"Bob",
	"Charles",
	"Donald",
	"Emett",
	"Ferdinand",
	"Gary",
	"Harold",
	"Jerry",
	"Kevin",
	"Liam",
	"Manuel",
	"Nestor",
	"Paul",
	"Richard",
	"Simon",
	"Tom",
	"Victor",
	"Walter",
	"Zed"
];


// TODO 3: Define the number of tasks that will make up the workflow of the experiment for one subject
num_tasks = phrases.length;

// TODO 4: Define the init-specific() function with 
function init_specific(){

	//Just in case, we hide the stimulus and buttons
	$("#stimulus").hide();
	$("#stimulus-buttons").hide();

}

function generateNameMapping(phrase){

	var males = clone(shuffle(male_names));//We randomize the order of appearance of names
	var females = clone(shuffle(female_names));
	var mapnames = {};
	for (var i=0; i<phrase.subjects.length;i++){
		if(phrase.sex[i]=="m"){ //if this subject is a male, we take the name from the male names
			mapnames[phrase.subjects[i]] = males.pop();
		} else {
			mapnames[phrase.subjects[i]] = females.pop();
		}

	}
	//Now we have the name mappings, which we will use to substitute in different parts of the interface...
	return mapnames;	
}

function doNameSubstitution(string, mapping){

	var newString = string;
	//console.log("substituting "+string);
	for(var i in mapping){//For each name in our mapping, we iterate over the keys
		//console.log(i+" "+mapping[i]);
		var re = new RegExp("\\"+i, 'g');
		newString = newString.replace(re,mapping[i]);
	}
	return newString;
}

// TODO 5: Define the startTask() function with whatever happens at the beginning of each task (show stimuli, countdown timers, initialize task timestamps)
function startTask(){


	var phrase = phrases[current_task];
	var mapnames = generateNameMapping(phrase);

	var stimulus = doNameSubstitution(phrase.statements, mapnames);
	var question = doNameSubstitution(phrase.question, mapnames);

	// This part shoud
	current_task_success=false;//we reset the success of the task to false
	current_task_elapsed_time = task_time*1000; //we reset the time taken to solve the puzzle
	help_timestamp = 0;
        total_help_time = 0;
        cur_task_resp = false;

	//Experiment-specific stuff
	//We display the phrases and the question
	$("#pauseStimulus").hide();
	$("#stimulus").html( stimulus + "<br/><strong>" + question + "</strong>" );
	$("#stimulus").show();

	//We generate the response buttons and their behavior
	var buttons="";
	for (i = 0; i<phrase.options.length; i++){
		if(phrase.options[i]==phrase.solution){//button for the correct solution
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">'+doNameSubstitution(phrase.options[i],mapnames)+'</button>';
		} else {//button for an incorrect solution
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">'+doNameSubstitution(phrase.options[i],mapnames)+'</button>';
		}
	}
	buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">I don\'t know!</button>';
	$("#stimulus-buttons").html(buttons);
	$('.correct-btn').on('click', function () {
    	if(on_task && !on_modal && current_task<num_tasks){
    		correct();
    	}
  	})
	$('.incorrect-btn').on('click', function () {
    	if(on_task && !on_modal && current_task<num_tasks){
    		incorrect();
    	}
  	})
	$("#stimulus-buttons").show();

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
		console.log("ended task - correctly? "+current_task_success + " in " + (current_task_elapsed_time - total_help_time) + " ms.");
		//We send store the data locally to be sent at the end of the experiment
		var result = {
		  "ordinal": current_task,
		  "num_elements": phrases[current_task].num_elements,
		  "outcome_corr": current_task_success,
                  "resp": cur_task_resp,
		  "time": (current_task_elapsed_time - total_help_time)
		};
		results.push(result);

		//This part is largely generic, but has some experiment-specific stuff
		if(current_task<(phrases.length-1)){

			//Experiment-specific transition between task and pause (exchange stimuli)
			//We display the big dot
			$("#pauseStimulus").show();
			$("#stimulus").hide();
			$("#stimulus-buttons").hide();

			//We start and display the pause countdown
			$('#initialMessage').hide();
			$('#clocktask').hide();
			$('#clockpauses').show();
			$('#clocktask').countdown('option',{
				onExpiry: null
			});
			$('#clockpauses').countdown('option',{
					until: '+'+pause_time+'s', 
			    	layout: 'Task will start in {sn}s...',
			    	onExpiry: startTask
		    	});

			current_task++;

			//We update the progress bar
			var progress = Math.floor((current_task / num_tasks)*100);
			//console.log('trying to update progress bar to '+progress);
			$('#taskProgress').attr("aria-valuenow",progress);
			$('#taskProgress').attr("style", "width: "+progress+"%");
			//$('#taskProgress').html(progress+" % done");


			on_task = false;

		} else {
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

