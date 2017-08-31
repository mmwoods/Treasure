# Treasure
Graphical Search Engine

## Purpose and Audience
Treasure is search application that uses Trove data. It provides a visual method of refining the results in the form of graphs. Treasure is aimed at high school students and those in other high level studies, such as TAFE, as an easy method of advanced research expected in higher studies. Treasure can be seen as a link between basic Google searches and advanced research programs such as Google scholar or JStor. This is further highlighted by Treasure’s exclusive searching of articles, which are text based documents. This was done because, when it comes to research, articles are considered more reliable and useful than other forms of media.

## External Sources: 3rd Party Libraries, Frameworks, Code
Throughout the project, these libraries and frameworks were kept to a minimum. Libraries were only used where absolutely necessary. The following table details all of the external libraries used in the project, and what they were used for.

Library/Source | How It Was Used
------------ | -------------
Chart.js | The backbone of this application is good-looking, easy to access chats. As creating animated charts ourselves was going to be exceptionally complex, it was decided upon to use Chart.js. This library gave easy access to a number of different charts and graphs (of which only Pie and Bar were used), and allowed for easy render and animation of updates within an HTML canvas.
jQuery | jQuery was used across the website, so give easy access to objects within the DOM, as well as a much easier way to access functions on DOM objects and specify event callbacks.
Google Fonts | It was an aim to be able to have a number of third party fonts on our website. In order for this to work consistently, we used Google’s font library. This allowed easy access to a number of free to use fonts, and render them on any machine (even if they don’t have these fonts installed locally).

## Instructions
Using Treasure is very simple. When you first load Treasure, you are presented with a simple home page, with a text box, and three buttons, labelled "Treasure Search", "Random Search" and "Show Tutorial". To search for information, you simply enter your query into the text box and either press enter, or click "Treasure Search". This brings up a list of results for your query. Alternatively, you can click "Random Search", which returns a random query's results.

On the search results page, you have a number of options available to you to customise and refine the information that you see. Clicking on any one of the graphs, Treasure will filter the results, only displaying those matching what you clicked on. For example, if you clicked on the "2000s" column on the "Year of Publication" graph, it would only show results for items published between 2000 and 2009.

The filters that you have applied will show on the right hand side of the screen, next to the graphs and query results. If you want to remove one of the filters, simply click the "Clear" button underneath the filter you want to remove. This will remove that specific filter on the information, as well as clearing it from the list of filters. Removing all filters will result in the sidebar being removed, with it reappearing with the addition of a new filter.
Once you've filtered your information to how you want it, if you want to view an article, simply scroll down to the list of results, and click on the link that says "View on Trove" for the article you want to view. This will take you to Trove's listing for the article, where you can view/download it.

For a more specific example, if a user wanted to read articles about Brisbane from the 1980s that were free and published in a journal from Australia, the user would conduct the following steps. Type ‘Brisbane’ in the search bar and click ‘Treasure Search’, then from the ‘Year of Publication’ graph, click ‘1980s’, then under ‘Availability’ click ‘Freely Available’, then under ‘Published in Australia’ click ‘Australia’, and finally under ‘Format’ click ‘Journal or Magazine’. This would bring up all results of the articles matching these conditions, which can then be viewed or downloaded from Trove.
