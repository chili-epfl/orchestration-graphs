var inspectedActivity;

/**
 * Edit information about an activity
 *
 */
function editActivityForm(activitySet) {
	inspectedActivity = activitySet;
	// TODO: $('#activitySelector').val() must be set to the db id of the inspectedActivity
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
    inspectedActivity[1].attr('text', $('#newActivityName')[0].value);
    inspectedActivity[0].attr('title', $('#newActivityType')[0].value);
    inspectedActivity[0].attr('href', $('#newActivityUrl')[0].value);
    $('#newActivityName')[0].value = '';
    $('#newActivityType')[0].value = '';
    $('#newActivityUrl')[0].value = '';
}