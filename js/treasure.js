// EXTERNAL LIBRARIES USED
// Chart.js: Used for all 4 of the graphs that are on the search results screen.
// jQuery: Used for general tasks around the code; made it really easy to access
// elements in the DOM and basic animation and callback setups.

var filterCount = 0; //A count of the total number of active filters
var filters = {}; //Keep a reference to all of the currently active filters

var graphCount = 4; //A count of the total number of graphs on the screen
var graphs = {}; //Keep a reference to all of the graphs on the screen

var fetchingSearch = true; //When we're waiting for response of a completely new search or filters
var fetchingAdditionalArticles = false; //Keep track of when a search is being made
var allArticlesShown = true;
var currentPage = 0; //Keep track of the current page of articles that we are showing.
var currentSearch = "";

//When dealing with Async calls, we need to be careful of them returing out of
//order. When the additional articles are returned, we need to make sure that
//the main search or filters have not changed. If they have, these articles will
//no longer be relevant to the search and should be discarded. The following two
//variables keep track of the last URL used to make a full search, and the last
//URL used to make an additional article search.
var lastSearchURL = "";
var lastAdditionalArticleURL = "";


// ================================
// Filters
// ================================

//Generate the HTML for a filter block
function newFilterBlock(filter) {
	var output = "";
	var buttonId = "clear-" + filter.identifier;

	output += "<div id=\"" + filter.identifier + "\" class=\"filter-block inner-content-segment\">";
	output += "<h2>" + filter.displayName + "</h2>";
	output += "<p>" + filter.displayValue + "</p>";
	output += "<input id=\"" + buttonId + "\" class=\"button filter-clear-button\" type=\"submit\" value=\"Clear\">";
	output += "</div>";

	return output;
}

function addNewFilter(displayName, troveName, displayValue, value) {
	var filter = {
		displayName: displayName,
		troveName: troveName,
		displayValue: displayValue,
		value: value,
		identifier: "filter-item-" + troveName
	};

	if (filters[filter.identifier] == undefined) { //If there isn't already a filter for this facet
		filterCount += 1;
		filters[filter.identifier] = filter; //Store a reference to this filter

		//In case the filter box is currently hidden, show it on the screen
		$("#right-column").removeClass("hidden");
		$("#main-content-wrapper").removeClass("wrapper-no-filters"); //There are filters now, so make the window wider

		//Then add the new filter to the filters box on the screen
		var filterBlock = newFilterBlock(filter); //Get the html for the new filter block
		$("#filters").append(filterBlock);

		//Register the callback for removing this filter
		var clearButtonId = "#clear-" + filter.identifier;
		$(clearButtonId).click(function(event) { //When the 'Clear' button is clicked
			removeFilter(filter.identifier); //Remove this filter from the screen
		});

		//Added a new filter, have to update the data
		runSearch();
	}


}

function removeFilter(id) {
	var filterToRemove = filters[id];

	filterCount -= 1;
	delete filters[id]; //Delete this filter from the array

	$("#" + id).remove(); //Delete this filter from the screen

	//If there are no filters left to show, then hide the filter container from the screen
	if (filterCount <= 0) {
		$("#right-column").addClass("hidden");
		$("#main-content-wrapper").addClass("wrapper-no-filters"); //There are no filters, re-adjust main content wrapper
	}

	//Removed a filter, have to update the data
	runSearch();
}

// ================================
// Data Display
// ================================

// ===== Articles =====
function newResultBlock(article) {
	var output = "";

	output += "<a target=\"_blank\" href=\"" + article.url + "\">"; 
	output += "<div class=\"result inner-content-segment\">";
	output += "<h2>" + article.title + "</h2>";
	output += "<p>" + article.snippet + "</p>";
	output += "</div>";
	output += "</a>";

	return output;
}

function resultBlocks(articleData) {
	var output = ""

	articleData.forEach(function(article, index, array) {
		output += newResultBlock(article);
	});

	return output;
}

function resultsHeaderContentString(rd) {
	if (rd == undefined) { //If there is nothing to show
		allArticlesShown = true;
		return "There were no articles returned for this search";
	} else {
		return 	rd.totalRecords + " Articles";
	}
}

function newResultsHeaderBlock(rd) {
	var output = "";

	output += "<div id=\"results-header\">";
	output += "<h2> Results </h2>";
	output += "<p id=\"results-header-overview\">";
	output += resultsHeaderContentString(rd);
	output += "</p>";
	output += "</div>";

	return output;
}

function displayResults(resultData) {
	//Generate the HTML to show results
	var displayHTML = newResultsHeaderBlock(resultData);

	if (resultData != undefined) {
		displayHTML += resultBlocks(resultData.articleData);
	}

	//Show this HTML in the results div
	$("#results").removeClass("hidden");
	$("#results-inner").html(displayHTML);
}


// ===== Graphs =====
function checkShowGraphSegment() {
	if (graphCount <= 0) { //If no graphs are being shown
		$("#graphs").addClass("hidden"); //Hide the graph segment
		$("#graphs-no-results").removeClass("hidden"); //Show the no graphs message
	} else { //If at least one graph is visible
		$("#graphs").removeClass("hidden"); //Show whole graph segment
		$("#graphs-no-results").addClass("hidden"); //Hide the no graphs message
	}
}

function hideGraphWithId(id) {
	var hashId = "#" + id;

	if ($(hashId).hasClass("hidden") == false) { //If it's not already hidden
		$(hashId).addClass("hidden"); //Hide it
		graphCount -= 1; //1 less graph is being shown
	}

	checkShowGraphSegment(); //Check to see if the whole graph segment should be hidden
}

function showGraphWithId(id) {
	var hashId = "#" + id;

	if ($(hashId).hasClass("hidden") == true) { //If it's not already being shown
		$(hashId).removeClass("hidden"); //Show it
		graphCount += 1; //1 more graph is being shown
	}

	checkShowGraphSegment(); //Check to see if the whole graph segment should be shown
}

function renderGraphUpdates() {
	graphs.decade.update();
	graphs.availability.update();
	graphs.australian.update();
	graphs.format.update();
}

function updatePieGraphWithData(graph, data) {
	data.forEach(function(dataItem, index, array) {
		graph.segments[index].value = dataItem;
	});
}

function updateBarGraphWithData(graph, data) {
	data.forEach(function(dataItem, index, array) {
		graph.datasets[0].bars[index].value = dataItem;
	});
}

function updateGraphsForNewFacetData(facetData) {
	if (facetData == undefined) { //If there was no facet data returned at all
		facetData = {}; //Set facetData to an empty object; the code below will hide everything
	}

	if (facetData.decade != undefined) {
		updateBarGraphWithData(graphs.decade, facetData.decade.data.data);
		showGraphWithId("decade");
	} else {
		hideGraphWithId("decade");
	}

	if (facetData.format != undefined) {
		updateBarGraphWithData(graphs.format, facetData.format.data.data);
		showGraphWithId("format");
	} else {
		hideGraphWithId("format");
	}

	//Availability and Australian graphs are in the same line, they are hidden and shown together
	if (facetData.availability != undefined && facetData.australian != undefined) {
		updatePieGraphWithData(graphs.availability, facetData.availability.data.data);
		updatePieGraphWithData(graphs.australian, facetData.australian.data.data);

		showGraphWithId("availability");
		showGraphWithId("australian");
	} else {
		hideGraphWithId("availability");
		hideGraphWithId("australian");
	}

	renderGraphUpdates();
}

// ================================
// Data Interpretation
// ================================

// ===== Articles =====
function parseArticleFields(article) {
	// Can't assume that any of the values will be present in the, returned
	// article data set. Initialise all of the fields as their empty placeholders,
	// and fill them if they're defined in the 'article' object 
	var title = "No Title Provided";
	var snippet = "No Snippet Provided";
	var year = "";
	var relevance = "";
	var url = "http://trove.nla.gov.au/";


	if (article.title != undefined) title = article.title;
	if (article.snippet != undefined) snippet = article.snippet;
	if (article.issued != undefined) year = article.issued;
	if (article.relevance != undefined) relevance = article.relevance;
	if (article.troveUrl != undefined) url = article.troveUrl;


	var articleData = {
		title: title,
		snippet: snippet,
		year: year,
		relevance: relevance,
		url: url
	}

	return articleData;
}

function readArticlesFromData(data) {
	if (data.response.zone[0].records.work != undefined) { //If there was at least an article returned
		var records = data.response.zone[0].records; //Easy handle on the records object

		//Get the general return data
		var totalRecords = parseInt(records.total); //The total number of records matching the search
		var recordsPerPage = parseInt(records.n); //The total number of records returned in this call
		var startingRecord = parseInt(records.s) + 1;
		var stoppingRecord = startingRecord + recordsPerPage - 1;

		var totalPages = 0;
		var currentPage = 0;

		if (recordsPerPage != 0) { //If at least some records were returned in the request
			var totalPages = Math.ceil(totalRecords / recordsPerPage); //The total number of pages required to show all of the records
			var currentPage = Math.ceil(startingRecord / recordsPerPage); //The page of records that is currently being displayed
		}


		//Get the data for each article
		var articleDataList = []; //Empty array to store formatted article data

		//For every article that was returned
		records.work.forEach(function(article, index, array) {
			articleDataList.push(parseArticleFields(article));
		})


		//Prepare the output object
		var output = {
			totalRecords: totalRecords,
			recordsPerPage: recordsPerPage,
			startingRecord: startingRecord,
			stoppingRecord: stoppingRecord,
			totalPages: totalPages,
			currentPage: currentPage,
			articleData: articleDataList
		}

		return output;
	} else {
		return null;
	}
}



// ===== Facets =====
function parseAustralianFacet(facetData, total) {
	var australianCount = parseInt(facetData[0].count); //Get the number of australian articles
	var otherCount = total - australianCount; //Calculate number of non-australian

	var data = [australianCount, otherCount];

	//Format and return this data
	var output = {
		data: data
	};

	return output;
} 

function parseFormatFacet(facetData) {
	var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	facetData.forEach(function (dataItem, index, array) {
		if (dataItem.search == "Article") { //If it's an article
			//Use the next level down of format descriptors
			dataItem.term.forEach(function (innerDataItem, index, array) {
				var countInt = parseInt(innerDataItem.count);
				var name = innerDataItem.search;

				switch (name) {
					case "Article/Abstract":
						data[0] = countInt;
						break;
					case "Article/Book chapter":
						data[1] = countInt;
						break;
					case "Article/Conference paper":
						data[2] = countInt;
						break;
					case "Article/Journal or magazine article":
						data[3] = countInt;
						break;
					case "Article/Other article":
						data[4] = countInt;
						break;
					case "Article/Report":
						data[5] = countInt;
						break;
					case "Article/Review":
						data[6] = countInt;
						break;
					case "Article/Working paper":
						data[7] = countInt;
						break;
				}
			});
		} else { //If it's not an article, just use the top level format descriptor
			var countInt = parseInt(dataItem.count);
			var name = dataItem.search;

			switch (name) {
				case "Conference Proceedings":
					data[8] = countInt;
					break;
				case "Periodical":
					data[9] = countInt;
					break;
				case "Data set":
					data[10] = countInt;
					break;
				case "Microform":
					data[11] = countInt;
					break;
			}
		}
	});

	//Format and return this data
	var output = {
		data: data
	};

	return output;
} 

function parseAvailabilityFacet(facetData) {
	var data = [0, 0, 0, 0]; //Initialise all data as 0

	//For the availability facet, data that is to be shown is nested one more level down
	if (facetData[0].term != undefined) { //If the data is available
		facetData = facetData[0].term; //Reassign facet data to the new array that is needed

		facetData.forEach(function(dataItem, index, array) {
			var itemCountInt = parseInt(dataItem.count);

			//For each type of data that is present, store its count in the data array
			switch(dataItem.search) {
				case "y/f":
					data[0] = itemCountInt;
					break;
				case "y/r":
					data[1] = itemCountInt;
					break;
				case "y/s":
					data[2] = itemCountInt;
					break;
				case "y/u":
					data[3] = itemCountInt;
					break;
			}
		});

		//Format and return this data
		var output = {
			data: data
		};

		return output;

	} else { //There is no data available that can be used
		return null; //Return nothing
	}
} 

function parseDecadeFacet(facetData) {
	var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //Initialise all data as 0

	facetData.forEach(function(dataItem, index, array) { //For each piece of facet data (each decade)
		//Count for this decade is returned as string, convert it to an integer
		var itemCountInt = parseInt(dataItem.count);

		/*  Decade is specified as starting year / 10. (ie. 2010-2019 is 201, 2000-2009 is 200, 
			etc.). However, we want the top decade (which is 201) to correspond to the 13 entry 
			(index 12). And the decade before that is to be in the entry before that, and so on. 

			Therefore, we have converted the decade value to an index into the data array. For
			decades that are "Pre 1900s", their 'dataIndex' will be <= 0, therefore all of these
			decades values can be summed in the first element of the data array */

		var dataIndex = dataItem.search - 189;

		if (dataIndex <= 0) { //If this decade is pre 1900s,
			data[0] += itemCountInt;
		} else if (dataIndex > 12) {
			//In certain cases, trove can return decade facets with values greater
			//than 201. Need to skip these otherwise end up with data out of the
			//intended array bounds
			return;
		} else { //If it's in the normal range of decades
			data[dataIndex] = itemCountInt;
		}
	});


	//Format and return this data
	var output = {
		data: data
	};

	return output;
} 


function parseFacets(facetArray, total) {
	var output = {}; //Parsed data to be returned; will be built as we go

    if (facetArray.length) {
        facetArray.forEach( function(facet, index, array) {
            var facetData = facet.term; //Data for this facet
            var parsedFacetData;

            if (facetData != undefined) { //If there is some data for this facets
                switch(facet.name) {
                    case "decade":
                        parsedFacetData = parseDecadeFacet(facetData);
                        break;

                    case "availability":
                        parsedFacetData = parseAvailabilityFacet(facetData);
                        break;

                    case "format":
                        parsedFacetData = parseFormatFacet(facetData);
                        break;

                    case "australian":
                        parsedFacetData = parseAustralianFacet(facetData, total);
                        break;
                }
            }

            if (parsedFacetData) { //If there was some data returned
                var parsedFacet = { //Format the data for output
                    name: facet.name,
                    displayName: facet.displayname,
                    data: parsedFacetData
                }

                output[parsedFacet.name] = parsedFacet; //Add this faced to the sortedFacets, with the name as key
            }
        });
    }

	return output;
}

function readFacetsFromData(data) {
	if (data.response.zone[0].facets != undefined) { //If there were facets given in this response
		var facetArray = data.response.zone[0].facets.facet;
		var totalCount = parseInt(data.response.zone[0].records.total);

		return parseFacets(facetArray, totalCount);
	} else {
		return null;
	}
}


// ================================
// Data Fetch
// ================================
function readData(data) {
	//Process
	var facetData = readFacetsFromData(data);
	var articleData = readArticlesFromData(data);

	//Display
	updateGraphsForNewFacetData(facetData);
	displayResults(articleData);
}

function displayAdditionalArticles(data) {
    //As with the initial search, we will need to parse the data so that
    //it can be read more easily. Only need to parse the articles for
    //this section, however, as none of the graphs or filters have changed in this case
    
    if (searchHasNotChanged(lastAdditionalArticleURL, lastSearchURL)) {
        var articles = readArticlesFromData(data);
        var articleData;
        
        if (articles) {
            articleData = articles.articleData;
            
            var articleHTML = "";
        
            if (articleData != undefined) {
                articleHTML += resultBlocks(articleData);
            }

            $("#results-inner").append(articleHTML);
        } else {
        	if (!allArticlesShown) {
        		allArticlesShown = true; //We have reached the end of the articles
            	$("#results-inner").append("<p id=\"results-footer\"> That's it! </p>");
        	}
        }
    }
}

function searchHasNotChanged(url1, url2) {
    sUrl1 = url1.split("&");
    sUrl2 = url2.split("&");
    
    // Go through all of the elements in the first url, and make sure that it is equal to the
    // value in the second URL, except, ignore the skip value, because we want this to be
    // different.
    for (var i = 0; i < sUrl1.length; i++) {
        var id = sUrl1[i].split("=")[0];
        
        if (id != 's') { //If this is not the skip value            
            if (sUrl1[i] != sUrl2[i]) { //If this value has changed
                return false; //Some element of the url has changed
            }
        }
    }
    
    //If we make it to here, all of the elements of both URLs are the same,
    //return true as the search has not changed
    return true;
}

function generateFacetFiltersString(filters) {
	filterNames = ["decade", "availability", "australian", "format"];
	output = "";

	filterNames.forEach(function(filterName, index, array) {
		var filter = filters["filter-item-l-" + filterName]; //Get the data for this filter

		if (filter) { //If this filter is active
			//Add it to the URL
			output += "&";
			output += filter.troveName;
			output += "=";
			output += filter.value;
		}
	});

	return output;
}

function formatURL(search, filters, page) {
	if (search == "") search = " "; //If no search was provided, change it to a space so trove doesn't complain

    //Set search constants
	var apiKey = "j6qg4s9769togjq3";
	var encoding = "json";
	var zone = "article";
	var sort = "relevance";

	var skip = page * 10;
	var count = 10;

	var facet = "format,decade,availability,australian"
	var facetFilters = generateFacetFiltersString(filters);

	var outputURL = "http://api.trove.nla.gov.au/result?" + 
					"key=" + apiKey +
					"&encoding=" + encoding +
					"&zone=" + zone +
					"&sortby=" + sort +
					"&q=" + search +
					"&n=" + count +
					"&s=" + skip +
					"&facet=" + facet +
					facetFilters +
					"&callback=?"
    
    outputURL = encodeURI(outputURL);

	return outputURL;
}

function fetchAdditionalArticles(searchTerm, filters, page) {
	$("#article-loading-spinner").removeClass("hidden"); //Show the loading graphic

    fetchingAdditionalArticles = true;
    
    console.log(lastSearchURL);
    console.log(lastAdditionalArticleURL);
    
    var url = formatURL(searchTerm, filters, page + 1);
    
    console.log("[Trove] Additional Article Request Sent: " + url);
    lastAdditionalArticleURL = url;
    
    $.getJSON(url, function(data) {
        console.log("[Trove] Additional Articles Returned");
        displayAdditionalArticles(data);
        console.log("[Trove] Additional Articles Processed");
        
        fetchingAdditionalArticles = false;
        
        $("#article-loading-spinner").addClass("hidden"); //Show the loading graphic
    });
}

function fetchInitialSearchData(searchTerm, filters) {
    $("#loading-overlay").removeClass("hidden");
    fetchingSearch = true;
    currentSearch = searchTerm;

	//Get the request URL for the search
    //This is the initial search, so the page is always 0
	var url = formatURL(searchTerm, filters, 0);
		
	//Send the request to Trove, calling readData when it is returned

    console.log("[Trove] Request Sent: " + url);
    lastSearchURL = url;
    
    
	$.getJSON(url, function(data) {
		console.log("[Trove] Response Returned");
		readData(data);
		console.log("[Trove] Response Processed");
        
        
        fetchingSearch = false; //There is now data showing on the screen
        $("#loading-overlay").addClass("hidden");
	});
}


function refreshTitle () {
	var searchValue = $("#search-box").val();

	if (searchValue != "") {
		var newTitle = searchValue + " - Treasure";
	} else {
		var newTitle = "Treasure";
	}

	$(document).prop('title', newTitle);
}

// ================================
// Graphs
// ================================

// ===== General =====
function hideMainScreen() {
	$("#main").addClass("hidden");
}

function hideAllGraphs() {
	hideGraphWithId("decade");
	hideGraphWithId("availability");
	hideGraphWithId("australian");
	hideGraphWithId("format");
}

function getGraphCanvases() {
	return {
		decade: $("#decade-graph"),
		availability: $("#availability-graph"),
		australian: $("#australian-graph"),
		format: $("#format-graph")
	}
}

function getGraphContexts() {
	return {
		decade: $("#decade-graph").get(0).getContext("2d"),
		availability: $("#availability-graph").get(0).getContext("2d"),
		australian: $("#australian-graph").get(0).getContext("2d"),
		format: $("#format-graph").get(0).getContext("2d")
	}
}

// ===== Callbacks =====
function decadeGraphClicked(event) {
	var eventItem = graphs.decade.getBarsAtEvent(event);

	if (eventItem.length > 0) { //If a graph element was clicked
		var displayName = "Decade";
		var troveName = "l-decade";

		var displayValue = eventItem[0].label;

		//Trove value is unknown, need to work it out from displayValue
		var troveValue = "0";


		//Grapher only gives the label value, need to convert to a Trove value
		if (displayValue == "Pre 1900s") {
			troveValue = 189;
		} else {
			//Trim the '0s' off the end of the label, convert to int
			troveValueString = displayValue.substring(0, displayValue.length - 2);
			troveValue = parseInt(troveValueString);
		}

		addNewFilter(displayName, troveName, displayValue, troveValue);
	}
}

function availabilityGraphClicked(event) {
	var eventItem = graphs.availability.getSegmentsAtEvent(event);

	if (eventItem.length > 0) { //If a graph element was clicked
		var displayName = "Availability";
		var troveName = "l-availability";

		var displayValue = eventItem[0].label;
		var troveValue = "";

		switch (displayValue) {
			case "Freely Available":
				troveValue = "y/f";
				break;

			case "Access Conditions":
				troveValue = "y/r";
				break;

			case "Subscription Required":
				troveValue = "y/s";
				break;

			case "Unknown":
				troveValue = "y/u";
				break;
		}

		addNewFilter(displayName, troveName, displayValue, troveValue);
	}
}

function australianGraphClicked(event) {
	var eventItem = graphs.australian.getSegmentsAtEvent(event);

	if (eventItem.length > 0) { //If a graph element was clicked
		var displayName = "Australian";
		var troveName = "l-australian";

		var displayValue = eventItem[0].label;

		//Can't filter non-australian, only filter if the australian segment is clicked
		if (displayValue == "Australian") {
			displayValue = "Yes";
			var troveValue = "y";

			addNewFilter(displayName, troveName, displayValue, troveValue);
		}
	}
}


function convertFormatDisplayNameToTroveName(displayName) {
	var displayNames = ["Abstract", "Book Chapter", "Conf. Paper", "Journal or Magazine", "Other", "Report", 
				"Review", "Working Paper", "Conf. Proceedings", "Periodical", "Data Set", "Microform"];
	var troveNames = ["Article/Abstract", "Article/Book chapter", "Article/Conference paper", 
				"Article/Journal or magazine article", "Article/Other article", "Article/Report", 
				"Article/Review", "Article/Working paper", "Conference Proceedings", "Periodical", 
				"Data set", "Microform"];

	var troveName = "";

	displayNames.forEach(function (name, index, array) {
		if (name == displayName) { //If this name is the provided display name
			troveName = troveNames[index]; //Get the corresponding trove name
		}
	});

	if (troveName == "") { //If there is still no trove name
		console.log("[FORMAT GRAPH] No troveName for displayName '" + displayName + "'");
	}

	return troveName;
}

function formatGraphClicked(event) {
	var eventItem = graphs.format.getBarsAtEvent(event);

	if (eventItem.length > 0) { //If a graph element was clicked
		var displayName = "Format";
		var troveName = "l-format";

		//Trove value is unknown, need to work it out from displayValue
		var displayValue = eventItem[0].label;
		var troveValue = convertFormatDisplayNameToTroveName(displayValue);

		addNewFilter(displayName, troveName, displayValue, troveValue);
	}
}

function initialiseGraphCallbacks() {
	var canvases = getGraphCanvases();

	canvases.decade.click(decadeGraphClicked);
	canvases.availability.click(availabilityGraphClicked);
	canvases.australian.click(australianGraphClicked);
	canvases.format.click(formatGraphClicked);
}



// ===== Setup =====
function getInitialGraphData() {
	return {
		decadeLabels: ["Pre 1900s", "1900s", "1910s", "1920s", "1930s", "1940s", "1950s", 
				"1960s", "1970s", "1980s", "1990s", "2000s", "2010s"],
		decadeData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

		availabilityLabels: ["Freely Available", "Access Conditions", "Subscription Required", "Unknown"],
		availabilityData: [1, 0, 0, 0],
		availabilityColors: ["#19d303", "#0072ff", "#ff4800", "#ff9e13"],
		availabilityHoverColors: ["#76d46c", "#66abff", "#ffa480", "#ffd191"],

		australianLabels: ["Australian", "Other"],
		australianData: [1, 0],
		australianColors: ["#0072ff", '#e0e0e0'],
		australianHoverColors: ["#66abff", "#e0e0e0"],

		formatLabels: ["Abstract", "Book Chapter", "Conf. Paper", "Journal or Magazine", "Other", "Report", 
				"Review", "Working Paper", "Conf. Proceedings", "Periodical", "Data Set", "Microform"],
		formatData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	}
}

function newBarGraph(color, hoverColor, labels, data, filterValues, context) {
	var graphData = {
		labels: labels,
		datasets: [
	        {
	            fillColor: color,
	            strokeColor: color,
	            highlightFill: hoverColor,
	            highlightStroke: hoverColor,
	            data: data,
	        }
	    ]
	}

	var graphOptions = {
		scaleShowGridLines: false,
		scaleLineColor: "transparent",
		scaleShowLabels: false,

		barShowStroke: true,
		barStrokeWidth: 2
	}

	return new Chart(context).Bar(graphData, graphOptions);
}

function newPieGraph(colors, hoverColors, labels, data, filterValues, context) {
	var graphData = [];

	labels.forEach(function(label, index, array){
		var dataItem = {
			value: data[index],
			color: colors[index],
			highlight: hoverColors[index],
			label: label
		}

		graphData.push(dataItem);
	});

	var graphOptions = {
		segmentStrokeWidth: 1,
		segmentStrokeColor: "#ddd",
		animationEasing: "easeOut"
	};

	return new Chart(context).Pie(graphData, graphOptions);
}

function setupGraphs() {
	var data = getInitialGraphData();
	var contexts = getGraphContexts();

	var decadeGraph = newBarGraph("#19d303", "#76d46c", data.decadeLabels, data.decadeData, data.decadeFilterValues, contexts.decade);
	var availabilityGraph = newPieGraph(data.availabilityColors, data.availabilityHoverColors, data.availabilityLabels, data.availabilityData, null, contexts.availability);
	var australianGraph = newPieGraph(data.australianColors, data.australianHoverColors, data.australianLabels, data.australianData, null, contexts.australian);
	var formatGraph = newBarGraph("#0072ff", "#66abff", data.formatLabels, data.formatData, null, contexts.format);

	graphs = {
		decade: decadeGraph,
		availability: availabilityGraph,
		australian: australianGraph,
		format: formatGraph
	}

	//Graphs must be hidden after they are set up, as unable to draw on a graph that isn't shown
	hideAllGraphs();
	$("#graphs-no-results").addClass("hidden"); //Initially hide the no graphs message

	hideMainScreen();

	initialiseGraphCallbacks();
}


// ================================
// Page Setup
// ================================
function setupInputCallbacks() {
	$("#search-box").focus(function() { //on focus on the text input
		$("#search-input-wrapper").addClass("search-input-wrap-selected"); //highlight the outer line green
	});

	$("#search-box").blur(function() { //lose focus on the text input
		$("#search-input-wrapper").removeClass("search-input-wrap-selected"); //reset to original highlight
	});
}

function runSearch() {
	var search = $("#search-box").val();
	refreshTitle(); //Making a new search, update the title accordingly

    currentPage = 0; //Making new search, going back to the first page
    allArticlesShown = false;
	fetchInitialSearchData(search, filters); //Perform this search
}

function returnToOverlay() {
	$("#opening-main-display-wrapper").removeClass("hidden"); //Hide the opening display
	$("#main").addClass("hidden");
	$("#open-search-box").val("");

	//Going back to the main page, so need to reset all the filters for
	//when the page is reloaded.

	for (filter in filters) {
		removeFilter(filters[filter].identifier);
	}
}


$(document).ready(function(){
	setupInputCallbacks();
	setupGraphs();

	// action that occurs when the form is submitted - either through hitting the enter key or by clicking on Search
	$("form#search-treasure").submit(function(event) {
		event.preventDefault();
		runSearch();		
	});

	$("#page-banner").click(function(event) {
		returnToOverlay();
	});
    
    // We want to automatically load more articles when the user gets close to the bottom
    // of the page. This will trigger this searching.
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            //Now that we know we're at the bottom, we want to fetch more articles
            
            //If there is not currenly a fetch occuring, and there is a search shown on the screen.
            if (!fetchingAdditionalArticles && !fetchingSearch && !allArticlesShown) { //If we're not currently fetching more articles, and there are still more articles for us to show, then trigger a new fetch                
                var search = currentSearch;

                fetchAdditionalArticles(search, filters, currentPage); //Get the additional articles
                currentPage += 1; //We have added another page of articles
            }
           
        }
    });

	//There is an issue with TROVE applications where the first search will result in nothing being returned
	//To get around this, we perform a dummy form submit.
	$("form#searchTreasure").submit();
});







