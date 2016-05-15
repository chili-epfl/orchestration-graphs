/**
 * Edit information about an activity
 *
 */
function editActivityChoice(activitySet) {
	inspectedActivity = activitySet;
    $('#activitySelector').val(activitySet[0].dbid);
    $('#activityChoice').modal('show');
}

/**
 * Processes information about a new activity from the activity form
 *
 */
function submitEditedGraphActivity() {
    activity = dbActivities[$('#activitySelector').val()]
    $('#activityChoice').modal('hide');
    
    correctTextSize(inspectedActivity[1], activity[0]);
    inspectedActivity[0].attr('title', activity[1]);
    inspectedActivity[0].attr('href', activity[2]);

    newDbid = $('#activitySelector').val();

    // Update id/counter in graph activity
    inspectedActivity[0].dbid = parseInt($('#activitySelector').val());
    counterMap[newDbid] = counterMap[newDbid] + 1 || 1;
    inspectedActivity[0].counter = counterMap[newDbid];

    $('#activitySelector').val('choose');
    
    inspectedActivity = null;
}