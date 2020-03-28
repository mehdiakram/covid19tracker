const countryMap = new Map();
var chart;
var dates = [], cases = [], deaths = [];
const chartType = "line";
const chartLabel = "Confirmed Cases", deathLabel = "Deaths";
const countryListURL = "https://api.covid19api.com/countries";
const countryCaseURL = "https://api.covid19api.com/total/country/"
const countryCaseURLConfirmedSuffix = "/status/confirmed";
const countryCaseURLDeathSuffix = "/status/deaths";

window.onload = function() {
    //Calls function to draw the chart with no data in it - for now
    drawChart();

    // get the list of countries tracked by the API populate the dropdown list with them
    fetch(countryListURL)
    .then((res) => res.json())
    .then(function(countryData) {

        //get the element that will hold the country list to populate it
        var countrySelect = document.getElementById("countrySelect");

        //iterate through data returned in the response and create new items to be placed in the select element
        //the display name will become the display text - the slug used for the next request will be the value
        countryData.forEach(function(country){
            if (country.Country != "") {
                var countryItem = document.createElement("option");
                countryItem.text = country.Country;
                countryItem.value = country.Slug;
                countryMap.set(country.Country, country.Slug);
                countrySelect.appendChild(countryItem);
            }
        });
    }).catch(err => {
        console.log(err);
    })
}

function drawChart() {

    //Get the element that will hold the actual chart
    var context = document.getElementById("coronaChart").getContext("2d");

    //Create a new chart object with no data for now
    chart = new Chart(context, {
        type: chartType,
        data: {
            labels: [],
            datasets: [{
                label: chartLabel,
                data: [],
                // pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                pointBorderColor: 'rgba(0, 0, 0, 1)',
                backgroundColor: 'rgba(0, 119, 255, 1)',
                borderColor: 'rgba(0, 119, 255, 1)',
                fill: 1},
            {
                label: deathLabel,
                data: [],
                // pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                pointBorderColor: 'rgba(0, 0, 0, 1)',
                backgroundColor: 'rgba(176, 95, 95, 1)',
                borderColor: 'rgba(176, 95, 95, 1)'
                
            }]
        },
        options: {
            plugins: {
                filler: {
                    propagate: true
                }
            }
        }
    });
}


// for a given country, get the number of confirmed cases for each day 
function countrySearch() {

    //clear the data from the lists so we don't end up with multiple charts at the same time
    dates =[], cases = [], deaths = [];

    // Get the element with the country list and grab the slug value that correponds 
    var countrySelect = document.getElementById("countrySelect");
    var countryName = countrySelect.options[countrySelect.selectedIndex].value;

    // update the data source lists
    updateCases(countryName);
    updateDeaths(countryName);

        // add the lists with the data to the chart object at the correct levels
        chart.data.labels = dates;
        chart.data.datasets[0].data = cases;
        chart.data.datasets[1].data = deaths;

}


function updateCases(countryName) {

    // make request to endpoint and get confirmed case statistics
    fetch(countryCaseURL + countryName + countryCaseURLConfirmedSuffix)
    .then((res) => res.json())
    .then(function(countryStats) {

        // update lists for dates and confirmed cases
        countryStats.forEach(function(day){
            // chop off the time part of the date values sine they're always 00:00:00
            dates.push(day.Date.slice(0,10));
            cases.push(day.Cases);
        });

        chart.update();

    }).catch(err => {
        console.log(err);
    });

}


function updateDeaths(countryName) {

    // make request to endpoint and get death statistics 
    fetch(countryCaseURL + countryName + countryCaseURLDeathSuffix)
    .then((res) => res.json())
    .then(function(countryDeaths) {

        // update list for deaths data
        countryDeaths.forEach(function(day){
            deaths.push(day.Cases);
        });

        chart.update();

    }).catch(err => {
        console.log(err);
    });

}