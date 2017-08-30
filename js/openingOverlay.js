$(document).ready(function(){ 
	setupOpeningInputCallbacks();

	$("#open-search-submit").click(function(event) {
		event.preventDefault();
		openingPerformSearch();
	});

	$("#open-lucky-submit").click(function(event) {
		event.preventDefault();
		openingPerformLuckySearch();
	});
});

function openingPerformSearch() {
	var currentSearchBox = $("#open-search-box");
	var currentInput = currentSearchBox.val();

	if (currentInput != "") { //If at least something has been entered
		proceedToMainScreen(currentInput);
	}
}

function openingPerformLuckySearch() {
	var possibleSearches = ["Dog", "Cat", "Pants", "Brisbane", "Dank", 
			"Hello World", "Treasure", "Fishing", "Car", "Cheese", "Swag", 
			 "Tree", "Car", "Book", "Orange", "Green", "Twitter", "Facebook", 
			 "MySpace", "Music", "Memes", "Sydney", "Melbourne", "Perth", 
			 "Trove", "Treasure", "Slippers", "Watch", "Coffee", "Tea", 
			 "Water", "Ocean", "Cordial", "Pepsi", "Taxation", "Mug", "Pen", 
			 "Tablet", "Notebook", "Hard Drive", "Laptop", "Photo"];

	//Get an index of one of the element in the above array
	var randomIndex = Math.floor(Math.random() * possibleSearches.length);

	proceedToMainScreen(possibleSearches[randomIndex]);
}

function toggleTutorial() {
	if ($("#tutorial").hasClass("hidden")) { //Tutorial is currently not being shown
		$("#tutorial").removeClass("hidden");
		$("#hide-tutorial").removeClass("hidden");

		$("#show-tutorial").addClass("hidden");


		//In case the window is really short, and the tutorial isn't going
		//to be visible when it appears, move the view down to the element
		document.getElementById('tutorial').scrollIntoView();
	} else { //Tutorial is being shown
		$("#tutorial").addClass("hidden");
		$("#hide-tutorial").addClass("hidden");

		$("#show-tutorial").removeClass("hidden");
	}
}

// Hides the initial starting screen that is shown, and proceeds to the
// main screen, with the specified search input. If the input box should be
// focused (allowing the user to keep typing), then set shouldFocus as true.
function proceedToMainScreen (input) {
	var mainSearchBox = $("#search-box");

	mainSearchBox.val(input); //Copy the input to the new search box

	$("#opening-main-display-wrapper").addClass("hidden"); //Hide the opening display

	//Show the main screen, the initial cover screen is now gone for good
	$("#main").removeClass("hidden");

	var search = $("#search-treasure");
	search.submit();
}

// Sets callbacks for focus, blur and change on the input field, triggering
// actions for these events
function setupOpeningInputCallbacks() {
	$("#open-search-box").focus(function() { //on focus on the text input
		$("#open-search-wrapper").addClass("search-input-wrap-selected"); //highlight the outer line green
	});

	$("#open-search-box").blur(function() { //lose focus on the text input
		$("#open-search-wrapper").removeClass("search-input-wrap-selected"); //reset to original highlight
	});

	$("#open-search-form").submit(function() { //when the input changes
		performSearch();
	});
}