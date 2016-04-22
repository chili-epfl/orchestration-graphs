var inspectedActivity;

/**
 * Edit information about an activity
 *
 */
function editActivityForm(activitySet) {
	inspectedActivity = activitySet;
	$('#newActivityTitle')[0].value = activitySet[1].attr('text');
    $('#newActivityDesc')[0].value = activitySet[0].attr('title');
    $('#newActivityUrl')[0].value = activitySet[0].attr('href');
    $('#activityForm').modal('show');
}


/**
 * Processes information about a new activity from the activity form
 *
 */
function submitEditedActivityForm() {
    $('#activityForm').modal('hide');
    inspectedActivity[0].attr('text', $('#newActivityTitle')[0].value);
    inspectedActivity[0].attr('title', $('#newActivityDesc')[0].value);
    inspectedActivity[0].attr('href', $('#newActivityUrl')[0].value);
}