function sharePopUp(){
	console.log("graphId="+graphId);
	if(graphId==""){
		alert("You need to save the graph first!");
	}else{

	shareWindow = window.open(messageUrl, '_blank', 
		'toolbar=0,scrollbars=1,location=0,status=1,menubar=0,resizable=1,width=500,height=500');  

shareWindow.onload=function(){
	var theUrl="theURL";
	shareWindow.document.getElementById("MessageSubject").value="Shared Graph: "+graphName;
	index=viewLink.indexOf('"',10);
	theLink=viewLink.substring(0, index) +"/"+graphId + viewLink.substring(index, viewLink.length);
	shareWindow.document.getElementById("MessageBody").value="Hi, Check my graph "+theLink;
};
}
}