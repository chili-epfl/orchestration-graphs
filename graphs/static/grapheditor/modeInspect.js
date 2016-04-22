var inspectedActivity;

/**
 * Edit information about an activity
 *
 */
function editActivityForm(activitySet) {
	inspectedActivity = activitySet;

    $('#activitySelector').val(activitySet[0].dbid);

	$('#newActivityName')[0].value = activitySet[1].attr('text');
    $('#newActivityType')[0].value = activitySet[0].attr('title');
    $('#newActivityUrl')[0].value = activitySet[0].attr('href');
    $('#activityForm').modal('show');
}

/**
 * Processes information about a new activity from the activity form
 *
 */
function submitEditedActivityForm() {
    $('#activityForm').modal('hide');
    inspectedActivity[0].dbid = $('#activitySelector').val();
    // TODO: update graphJson with the new dbid ! (pbm when the same activity is more than once in the graph?)
    inspectedActivity[1].attr('text', $('#newActivityName')[0].value);
    inspectedActivity[0].attr('title', $('#newActivityType')[0].value);
    inspectedActivity[0].attr('href', $('#newActivityUrl')[0].value);
    $('#newActivityName')[0].value = '';
    $('#newActivityType')[0].value = '';
    $('#newActivityUrl')[0].value = '';
}