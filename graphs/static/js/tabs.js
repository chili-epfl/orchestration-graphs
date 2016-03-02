/*
 * The code is from: http://remotesynthesis.com/post.cfm/adding-and-removing-tabs-with-jquery-and-jquery-ui
 * maybe I'll use them later, but for now I am only using the closeTabs() function in my code
 * 
 */

function init() {
   $("#mytabs").tabs();
   // wipe all the tabs so we can programatically show the ones we want
   removeAllTabs();
   // if {condition}, then show relevant tab. this is just for example purposes
   if (true) {
      $("#tabs-1-tab").css("display","list-item");
   }
   // now show the tabs area
   $("#mytabs").css("display","block");
}

function openTab(tabNum,closeOthers) {
   if (closeOthers != false) {
      removeAllTabs();
   }
   $("#tabs-"+tabNum+"-tab").css("display","list-item");
   $("#mytabs").tabs("select",tabNum-1);
}

function removeAllTabs(tabListId) {
   $(tabListId).children().css("display","none");
}

function createTab4() {
   // this will add a tab via the standard method
   $("#mytabs").tabs("add","#tabs-4","Fourth Tab");
   $("#tabs-4").css("display","block");
}

function removeTab4() {
   // this will add a tab via the standard method. part of the problem here is I don't know the index...just assuming its on the end
   $("#mytabs").tabs("remove",$("#mytabs").tabs("length")-1);
   // reselect the 2nd tab or it will show tab 3
   $("#mytabs").tabs("select",1);
}

function createTab5() {
   // this will add a tab via the standard method
   $("#mytabs").tabs("add","tabs5.htm","Fifth Tab");
}


function removeTab5() {
   // this will add a tab via the standard method. part of the problem here is I don't know the index...just assuming its on the end
   $("#mytabs").tabs("remove",$("#mytabs").tabs("length")-1);
   // reselect the 2nd tab or it will show tab 3
   $("#mytabs").tabs("select",1);
}

