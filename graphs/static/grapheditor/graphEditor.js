var graph, builders;

var operatorTypes = {
	"Aggregation": ["Listing", "Classifying", "Sorting", "Synthesizing", "Visualizing"],
	"Distribution": ["Broadcasting", "User selection", "Sampling", "Splitting", "Conflicting", "Adapting"],
	"Social": ["Group formation", "Class split", "Role assignement", "Role rotation", "Group rotation", "Dropout management", "Anonymisation"],
	"BackOffice": ["Grading", "Feedback", "Anti-plagiarism", "Rendering", "Translating", "Summarizing", "Converting", "Updating"]
};
var operatorLabels = {
	"Preparation": ["Prerequisite", "ZPD", "Advanced organizer", "Motivation", "Anticipation", "Logistics", "Data collection"],
	"Set": ["Aggregation", "Expansion", "Decomposition", "Selection", "Juxtaposition", "Contrast", "Identity"],
	"Translation": ["Proceduralization", "Elicitation", "Alternate", "Reframe", "Reverse", "Repair", "Teach"],
	"Generalization": ["Induction", "Deduction", "Extraction", "Analogy", "Synthesis", "Tranfer", "Restriction"]
};

window.onload = function () {
	// Init options for operator type and label selector
	Object.keys(operatorTypes).forEach(function(key) {
		$('#operatorTypeSelector').html(
		$('#operatorTypeSelector').html() + '<option value="' + key + '" href="#">' + key + '</option>');
	});
	Object.keys(operatorLabels).forEach(function(key) {
		$('#operatorLabelSelector').html(
		$('#operatorLabelSelector').html() + '<option value="' + key + '" href="#">' + key + '</option>');
	});
	$("#operatorSubtype").hide();
	$("#operatorSublabel").hide();


	$.extend($.expr[":"], {"containsIN": function(elem, i, match, array) {
    	return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }});
    $("#filterActivityModal").keyup(filterActivityList);
    $("#activityList tr").click(function() {
    	$(this).find('input:radio').prop('checked', true);
    });

	graph = SingletonGraph.getInstance("graph");
}
