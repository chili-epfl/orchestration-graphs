// TODO 0: General parameters of this experiment (time for each task and pauses in between)
var task_time_sym = 60; // time to do each task, in seconds
var task_time_ball = 60;
var task_time_dual = 60;

var current_minitask=0;
var minitask_time_sym=10; //Time to answer the minitask about symmetry
							//For the ball game, it only depends on the time it takes to reach the ground (may change)
var current_minitask_timestamp=0;//Timestamp for each minitask

//For this task we need some specific timers and variables
var current_minitask_sym_success = false; //whether the current task has been successfully passed or not
var current_minitask_ball_success = false; //whether the current task has been successfully passed or not
var current_minitask_elapsed_time_sym = minitask_time_sym*1000; //time taken to solve this task (until keypress)
var current_minitask_elapsed_time_ball = minitask_time_sym*1000; //time taken to solve this task (until keypress)
var help_timestamp = 0; //moment in which we accessed the help
var total_help_time = 0; //total time spent in help during this task



var results_baseline_ball = [];
var results_baseline_sym = [];

var dual_minitask_completed_ball=false;//In dual mode, each minitask is actually the completion of two minitasks, the symmetry and the ball game
var dual_minitask_completed_sym=false;//In dual mode, each minitask is actually the completion of two minitasks, the symmetry and the ball game


// TODO 1: Define the user profile useful for this task (to be shown as a form in the intro)
//User profile for the DUAL task
user_profile = {
	device_id: "LM",
	condition: "A", //A=stable symmetry, increasing ball; B=increasing symmetry, stable ball
	baseline_ball: 0, //Number of completed ball tasks in the last 30s of the single-task period
	baseline_sym: 0 //Number of completed symmetry tasks in the last 30s of the single-task period
};

// TODO 2: Define any experiment-specific data structures
//Data for the DUAL task
//These are the sets of shapes
var canvas_left = $("#canvas_left")[0];
var canvas_right = $("#canvas_right")[0];

//This stores the properties of the current pair of shapes
var current_fig = {
	complexity: 0.5, //Complexity of shape
	complexity_diff: 0.5, //Complexity of differentiation
	symmetrical: false 
};

var ball_speed = 1; //speed at which the ball falls


// TODO 3: Define the number of tasks that will make up the workflow of the experiment for one subject
num_tasks = 3; //i.e. the two single tasks, plus the dual task


// TODO 4: Define the init-specific() function with 
var game;
//Shooter game following this example http://examples.phaser.io/_site/view_full.html?d=games&f=invaders.js&t=invaders

function init_specific(){

	//Decide the condition randomly - to get equal number of people, for now we do even userids A and odd ones, B
	if(user_id % 2 == 0){
		user_profile.condition = "A";
	} 
	else{
		user_profile.condition = "B";
	} 

	//We add the behavior to capture keypresses
	$(document).keypress(function(e){
		if(on_task && !on_modal){
	    	if(e.which == 89 || e.which == 121){// pressed y

	    		yes();

	    	}else if(e.which == 78 || e.which == 110){// pressed n

	    		no();
	    		
	    	}
		}
	});



	//Just in case, we hide the stimulus and buttons, as we begin with the pause stimulus
	$("#stimulus").hide();
	$("#stimulus-buttons").hide();

}


function preload () {

	//Load all the needed images, both for the ball, cannon and for the symmetry figures
	game.load.image('bullet', '/static/img/bullet.png');
	game.load.image('ship', '/static/img/player.png');
    game.load.spritesheet('kaboom', '/static/img/explode.png', 128, 128);
	game.load.image('invader', '/static/img/ball.png');


}

// TODO: delete the unused ones
var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var firingTimer = 0;
var livingEnemies = [];

function create () {

    game.physics.startSystem(Phaser.Physics.ARCADE);

	game.stage.backgroundColor = '#ffffff';
	game.world.setBounds(0, 0, 400, 600);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);


    //  The hero!
    player = game.add.sprite(200, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createBall();


    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(1, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();

    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function createBall () {


	//We randomly set where the ball will appear
	var initialx = game.rnd.integerInRange(1, 399);

	console.log("creating ball at "+initialx+"!");

    var alien = aliens.create(initialx, 50, 'invader');
    alien.anchor.setTo(0.5, 0.5);
    alien.body.moves = false;

    aliens.x = 0;
    aliens.y = 0;

    console.log("adding new tween to "+game.tweens.getAll().length);

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { y: 500 }, 10000, Phaser.Easing.Linear.None, true, 0, 0, false);
    tween.timeScale = (9+ball_speed)/10; //Speed of the ball movement, constant in the baseline, can be increased if needed
    //  When the tween loops it calls descend
    tween.onComplete.add(touchGround, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}



function touchGround() {

	console.log("touching ground!");

	current_minitask_ball_success=false;

	var time = (new Date()).getTime();
	current_minitask_elapsed_time_ball = time - current_minitask_timestamp;

    if(current_task==1) endMiniTask();
    else if(current_task==2){
   		dual_minitask_completed_ball=true;
   		if(dual_minitask_completed_ball && dual_minitask_completed_sym) endMiniTask();//We only end the minitask once the two halves are complete
    } 

}

function update() {

    if (player.alive && player.body)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        // TODO: Add the buttons actions????
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }

        fireBullet();

        //  Run collision
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
    }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    current_minitask_ball_success=true;

	var time = (new Date()).getTime();
	current_minitask_elapsed_time_ball = time - current_minitask_timestamp;


    //  End the task
    if(current_task==1) endMiniTask();
    else if(current_task==2){
   		dual_minitask_completed_ball=true;
   		if(dual_minitask_completed_ball && dual_minitask_completed_sym) endMiniTask();//We only end the minitask once the two halves are complete
    } 
    

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart () {

	console.log("restarting game!");

	game.tweens.removeAll();

	//bullets.removeAll();
	if(bullets) bullets.callAll('kill');
    if(aliens) aliens.removeAll();

    //  And brings the aliens back from the dead :)
    createBall();

    //revives the player
	if(player){
		player.kill();
    	player.revive();
	} 
}

// TODO 5: Define the startTask() function with whatever happens at the beginning of each task (show stimuli, countdown timers, initialize task timestamps)
function startTask(){

	console.log("starting task "+current_task);

	//Experiment-specific stuff
	$("#pauseStimulus").hide();
	$("#stimulus").show();
	$("#countdownMinitask").show();

	// Basically, do three cases for the 3 different phases: 0-shape, 1-game, 2-dual
	if(current_task==0){//Start the shapes task

		//Show the shapes divs, just in case
		$("#shape-left").show();
		$("#shape-right").show();
		$("#stimulus-game").hide();

		//We do not initialize the game yet

		// Initialize the variables for this task
		current_minitask_sym_success = false; //whether the current task has been successfully passed or not
		current_minitask_ball_success = false; //whether the current task has been successfully passed or not
		current_minitask_elapsed_time_sym = minitask_time_sym*1000; //time taken to solve this task (until keypress)
		current_minitask_elapsed_time_ball = minitask_time_sym*1000; //time taken to solve this task (until keypress)
		help_timestamp = 0; //moment in which we accessed the help
		total_help_time = 0; //total time spent in help during this task

		//We start and display the task countdown
		$('#initialMessage').hide();
		$('#clocktask').show();
		$('#clockpauses').hide();
		$('#clockpauses').countdown('option',{
				onExpiry: null
			});
		$('#clocktask').countdown({
				until: '+'+task_time_sym+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    }); //We initialize the clock
		$('#clocktask').countdown('option',{
				until: '+'+task_time_sym+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    });// In case the clock was already initialized, we restart it

		current_minitask = 0;//Initialize the number of shapes tasks within this first phase

		startMiniTask();




	} else if(current_task==1){//Start the game task

		$("#shape-left").hide();
		$("#shape-right").hide();
		$("#stimulus-game").show();

		//Initialize the game?
		game = new Phaser.Game(400, 600, Phaser.AUTO, 'stimulus-game', { preload: preload, create: create, update: update });

		// Initialize the variables for this task
		current_minitask_sym_success = false; //whether the current task has been successfully passed or not
		current_minitask_ball_success = false; //whether the current task has been successfully passed or not
		current_minitask_elapsed_time_sym = minitask_time_sym*1000; //time taken to solve this task (until keypress)
		current_minitask_elapsed_time_ball = minitask_time_sym*1000; //time taken to solve this task (until keypress)
		help_timestamp = 0; //moment in which we accessed the help
		total_help_time = 0; //total time spent in help during this task

		//We start and display the task countdown
		$('#initialMessage').hide();
		$('#clocktask').show();
		$('#clockpauses').hide();
		$('#clockpauses').countdown('option',{
				onExpiry: null
			});
		$('#clocktask').countdown({
				until: '+'+task_time_ball+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    }); //We initialize the clock
		$('#clocktask').countdown('option',{
				until: '+'+task_time_ball+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    });// In case the clock was already initialized, we restart it

		current_minitask = 0;//Initialize the number of ball tasks within this first phase

		startMiniTask();


	} else if(current_task==2){//Start the dual task

		$("#shape-left").show();
		$("#shape-right").show();
		$("#stimulus-game").show();


		//Restart the game
		restart();

		// Initialize the variables for this task
		current_minitask_sym_success = false; //whether the current task has been successfully passed or not
		current_minitask_ball_success = false; //whether the current task has been successfully passed or not
		current_minitask_elapsed_time_sym = minitask_time_sym*1000; //time taken to solve this task (until keypress)
		current_minitask_elapsed_time_ball = minitask_time_sym*1000; //time taken to solve this task (until keypress)
		help_timestamp = 0; //moment in which we accessed the help
		total_help_time = 0; //total time spent in help during this task

		//We start and display the task countdown
		$('#initialMessage').hide();
		$('#clocktask').show();
		$('#clockpauses').hide();
		$('#clockpauses').countdown('option',{
				onExpiry: null
			});
		$('#clocktask').countdown({
				until: '+'+task_time_dual+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    }); //We initialize the clock
		$('#clocktask').countdown('option',{
				until: '+'+task_time_dual+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    });// In case the clock was already initialized, we restart it

		current_minitask = 0;//Initialize the number of shapes/ball tasks within this first phase

		startMiniTask();


	}


	// This part should also be in all experiments, probably
	current_task_timestamp = (new Date()).getTime();
	on_task = true;
}


function startMiniTask(){

	console.log("starting minitask "+current_minitask);

	//We reset the counter for the halves of the dual task
	if(current_task==2){
		dual_minitask_completed_ball=false;
		dual_minitask_completed_sym=false;
	} 

	if(current_task==0){//If we are in the symmetry baseline
		//We generate randomly and show the corresponding shapes on the sides
		current_fig.complexity = 0.1;
		current_fig.complexity_diff = 0.1;
		current_fig.symmetrical = randomBoolean();
		drawFigures(current_fig);
	} else if(current_task==2){//If we are on the dual task
		//We generate and show the corresponding shapes on the sides
		var complex = 0.1;
		if(user_profile.condition=="B"){ //In case we are on the increasing symmetry condition
			 complex = 0.1 + (0.03 * current_minitask);
			 if(complex>1) complex=1;
		}
		current_fig.complexity = complex;
		current_fig.complexity_diff = complex;
		current_fig.symmetrical = randomBoolean();
		drawFigures(current_fig);
	}

	if(current_task==2 && user_profile.condition=="A"){ //If we are in the increasing ball speed conditiion
		ball_speed++;
	}

	if((current_task==1 || current_task==2) && current_minitask!=0){//If we are in the game baseline or the dual task, and not on the first minitask
		//Restart the game
		restart();
	}




		if(current_task!=1){ //We do not show the buttons or the minitask counter for the ball baseline - it is the ball falling down that decides

			//We generate the response buttons and their behavior
			var buttons="";
			if(current_fig.symmetrical){//The shapes are symmetric, so the good response is Y
				buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">Yes</button>';
				buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">No</button>';
			} else {//button for N is the correct solution
				buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">Yes</button>';
				buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">No</button>';
			}
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">I don\'t know!</button>';
			$("#stimulus-buttons").html(buttons);
			$('.correct-btn').on('click', function () {
		    	if(on_task && !on_modal){
		    		correct();
		    	}
		  	})
			$('.incorrect-btn').on('click', function () {
		    	if(on_task && !on_modal){
		    		incorrect();
		    	}
		  	})
			$("#stimulus-buttons").show();


			//We start and display the minitask countdown
			$('#clockminitask').show();
			$('#clockminitask').countdown({
					until: '+'+minitask_time_sym+'s', 
			    	layout: '<span class="huge">{sn}</span>s',
			    	onExpiry: incorrect 
			    }); //We initialize the clock
			$('#clockminitask').countdown('option',{
					until: '+'+minitask_time_sym+'s', 
			    	layout: '<span class="huge">{sn}</span>s',
			    	onExpiry: incorrect 
			    });// In case the clock was already initialized, we restart it
		
		}else{
			$("#stimulus-buttons").hide();
			$('#clockminitask').hide();
		}

		//We reset the help time counters as well
		help_timestamp = 0; //moment in which we accessed the help
		total_help_time = 0; //total time spent in help during this task
		current_minitask_sym_success = false;
		current_minitask_ball_success = false;
		current_minitask_timestamp = (new Date()).getTime();

}

function yes(){//A yes has been registered... is it correct?
	if(current_task == 0 || current_task == 2){// This does not apply to the single task game task
		if(current_fig.symmetrical) correct();
		else incorrect();
	}

}

function no(){//A yes has been registered... is it correct?
	if(current_task == 0 || current_task == 2){// This does not apply to the single task game task
		if(!current_fig.symmetrical) correct();
		else incorrect();
	}

}

function correct(){
				current_minitask_sym_success=true;

	    		var time = (new Date()).getTime();
	    		current_minitask_elapsed_time_sym = time - current_minitask_timestamp;


    if(current_task==0) endMiniTask();
    else if(current_task==2){
   		dual_minitask_completed_sym=true;
   		if(dual_minitask_completed_sym && dual_minitask_completed_ball) endMiniTask();//We only end the minitask once the two halves are complete
    } 
}

function incorrect(){
				current_minitask_sym_success=false;

	    		var time = (new Date()).getTime();
	    		current_minitask_elapsed_time_sym = time - current_minitask_timestamp;

    if(current_task==0) endMiniTask();
    else if(current_task==2){
   		dual_minitask_completed_sym=true;
   		if(dual_minitask_completed_sym && dual_minitask_completed_ball) endMiniTask();//We only end the minitask once the two halves are complete
    } 

}



function endMiniTask(){

	// We disable the minitask clock, so that it does not trigger this function again
	$('#clockminitask').countdown('option',{
	   	onExpiry: null 
	});



	//This part is experiment-specific
	//We decide if the task was correct?
	console.log("ended minitask - correctly? ball "+current_minitask_ball_success + "  sym "+current_minitask_sym_success + "in ball " + (current_minitask_elapsed_time_ball - total_help_time) + " ms. sym " + (current_minitask_elapsed_time_sym - total_help_time) + " ms.");
	//We send store the data locally to be sent at the end of the experiment
	var result = {
	  "ordinal": current_minitask,
	  "outcome_ball_corr": current_minitask_ball_success,
	  "time_ball": (current_minitask_elapsed_time_ball - total_help_time),
	  "outcome_sym_corr": current_minitask_sym_success,
	  "time_sym": (current_minitask_elapsed_time_sym - total_help_time),
	  "complexity_ball": ball_speed,
	  "complexity_sym": (current_fig.complexity)*10
	};


	if(current_task==0){ // If we are in the symmetry baseline, we add it to another array of results, which will be used to calculate the baseline
		results_baseline_sym.push(result);
	} else if(current_task==1){ // If we are in the symmetry baseline, we add it to another array of results, which will be used to calculate the baseline
		results_baseline_ball.push(result);
	} else if(current_task==2){ // It is the dual task, we really add it to the results array
		results.push(result);
	}

	//Experiment-specific transition between task and pause (exchange stimuli)
	current_minitask++;

	//We reset the minitask to the next one
	startMiniTask();

}

// TODO 6: Define the endTask() function with whatever happens at the end of each task (hide stimuli, stop timers, build task result data)
function endTask(){

	// We disable the minitask clock, so that it does not trigger this function again
	$('#clockminitask').countdown('option',{
	   	onExpiry: null 
	});

	if(current_task<num_tasks){// Just in case, it looks like this is called twice on ending
		
		//This part is experiment-specific
		//We decide if the task was correct?
		console.log("ended task "+current_task);

		$('#countdownMinitask').hide();

		if(current_task==0){//If it is the symmetry task, we calculate the symmetry baseline: how many tasks completed in the last 30s?
			//We sum the duration of the tasks correctly completed (starting from the end) until we sum 30000ms
			var completed = 0;
			var completion_time=0;
			for(i=results_baseline_sym.length-1; i>=0; i--){
				completion_time+=results_baseline_sym[i].time_sym;
				if(completion_time>30000) break;//We only count the tasks whose duration is fully within the last 30s
				if(results_baseline_sym[i].outcome_sym_corr) completed++; //We only count the tasks correctly completed
			}
			user_profile.baseline_sym = completed;

		}else if(current_task==1){//If it is the ball game task, we calculate the ball baseline: how many tasks completed in the last 30s?
			//We sum the duration of the tasks correctly completed (starting from the end) until we sum 30000ms
			var completed = 0;
			var completion_time=0;
			for(i=results_baseline_ball.length-1; i>=0; i--){
				completion_time+=results_baseline_ball[i].time_ball;
				if(completion_time>30000) break;//We only count the tasks whose duration is fully within the last 30s
				if(results_baseline_ball[i].outcome_ball_corr) completed++; //We only count the tasks correctly completed
			}
			user_profile.baseline_ball = completed;

		}
		

		//This part is largely generic, but has some experiment-specific stuff
		if(current_task<(num_tasks-1)){

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



//Figure-generation functions

// normalises given set of points to [-1,1] bounds
// on both dimensions
function normalise_figure(figure)
{
  var maxX = 1;
  var maxY = 1;
  var minX = -1;
  var minY = -1;

  for (var i = 0; i < figure.length; i++){
    if (figure[i].x < minX)
      minX = figure[i].x;
    if (figure[i].x > maxX)
      maxX = figure[i].x;
    if (figure[i].y < minY)
      minY = figure[i].y;
    if (figure[i].y > maxY)
      maxY = figure[i].y;
  }
  minY = Math.abs(minY)
  minX = Math.abs(minX)

  for (var i = 0; i < figure.length; i++){
    if (figure[i].x > 0)
      figure[i].x /= maxX; 
    if (figure[i].y > 0)
      figure[i].y /= maxY; 

    if (figure[i].x < 0)
      figure[i].x /= minX; 
    if (figure[i].y < 0)
      figure[i].y /= minY; 
  }
  return figure;
}

// generate figure as a list of tuples (vertices)
// complexity -> real number from 0-1
function generate_figure(complexity)
{
  var figure = []
  if (complexity < 0){
    complextiy = 0;
  }
  if (complexity > 1){
    complextiy = 1;
  }
  var sides = Math.floor(complexity * 20);
  if (sides < 3)
    sides = 3;

  var points = []

  for (var i = 0; i < sides; i++){
    points.push(Math.random())
  } 
  points.sort()
  console.log(sides)

  for (var i = 0; i < sides; i++){
    var p = {}
    p.x = Math.cos(points[i]*2*Math.PI) + (Math.random() - 0.5) * complexity / 2.0
    p.y = Math.sin(points[i]*2*Math.PI) + (Math.random() - 0.5) * complexity / 2.0
    figure.push(p)
  } 
  return normalise_figure(figure)
}

// symmetry of a figure
// returns the exact symmetry if exact = true
// otherwise the difficulty of distinguishing the change
// is given by difficulty parameter
function mirror_figure(figure, exact, difficulty)
{
  var ret = []
  for (var i = 0; i < figure.length; i++){
    var v = {}
    v.x = -figure[i].x
    v.y = figure[i].y
    ret.push(v)
  }
  if (exact)
    return ret

  var angle = 0; (1.1 - difficulty) * 0.1 * Math.PI;

  for (var i = 0; i < figure.length; i++){
    var x = ret[i].x * Math.cos(angle) - ret[i].y * Math.sin(angle)
    var y = ret[i].x * Math.sin(angle) + ret[i].y * Math.cos(angle)
    ret[i].x = x
    ret[i].y = y
  }

  var p = Math.floor(Math.random() * figure.length); 

  var v = Math.random()
  var d = (1.1 - difficulty)
  if (d > 0.3) d = 0.3
  ret[p].x += (v) * d * 2
  ret[p].y += (1 - v) * d * 2
  console.log(p)
  return normalise_figure(ret)
}

// draws a given figure on canvas div
function draw_figure(canvas, figure)
{
  var c2 = canvas.getContext('2d');
  c2.fillStyle = '#33CCFF';
  c2.beginPath();
  c2.lineWidth = 3;

  var xoffset = canvas.width/2;
  var yoffset = canvas.height/2;
  c2.translate(xoffset,yoffset);


  var scale = {}
  scale.x = canvas.width/2 * 0.9
  scale.y = canvas.height/2 * 0.9

  var n = figure.length;
  c2.moveTo(figure[n-1].x*scale.x, figure[n-1].y*scale.y);

  for (var i = 0; i < n; i++){
    c2.lineTo(figure[i].x*scale.x, figure[i].y*scale.y);
  }
  c2.closePath();
  c2.fill();
  c2.stroke();
  c2.translate(-xoffset,-yoffset);
}

function clear_figure(canvas){
	var c2 = canvas.getContext('2d');
	c2.clearRect ( 0 , 0 , canvas.width, canvas.height );
}

//Just calls the two drawing functions, according to the figure properties passed
function drawFigures(figureProps){
	clear_figure(canvas_left);
	clear_figure(canvas_right);
	var f = generate_figure(figureProps.complexity);
	draw_figure(canvas_left, f);
	draw_figure(canvas_right, mirror_figure(f, figureProps.symmetrical, figureProps.complexity_diff));
	$("#shape-left").show();
	$("#shape-right").show();	
}

function randomBoolean(){
        return Math.random()<.5; // Readable, succint
    }
