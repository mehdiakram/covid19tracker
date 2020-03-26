const countryMap = new Map();
var chart;
const chartType = "bar";
const chartLabel = "Confirmed Cases";
const countryListURL = "https://api.covid19api.com/countries";
const countryCaseURL = "https://api.covid19api.com/total/country/"
const countryCaseURLSuffix = "/status/confirmed";

window.onload = function() {
    console.log("Entering document ready function");

    drawChart();

    // get the list of countries tracked by the API populate the dropdown list with them
    fetch(countryListURL)
    .then((res) => res.json())
    .then(function(countryData) {
        //do stuff
        console.log("Logging data from JSON response...");
        console.log(countryData);
        var countrySelect = document.getElementById("countrySelect");
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
    var context = document.getElementById("coronaChart").getContext("2d");
    chart = new Chart(context, {
        type: chartType,
        data: {
            labels: [],
            datasets: [{
                label: chartLabel,
                data: [],
                backgroundColor: 'rgba(176, 95, 95, 1)',
                borderColor: 'rgba(176, 95, 95, 1)'
            }]
        },
    });
}


// for a given country, get the number of confirmed cases for each day 
function countrySearch() {

    var dates = [], cases = [];
    var countrySelect = document.getElementById("countrySelect");
    var countryName = countrySelect.options[countrySelect.selectedIndex].value;
    console.log("Country Slug is " + countryName);

    fetch(countryCaseURL + countryName + countryCaseURLSuffix)
    .then((res) => res.json())
    .then(function(countryStats) {

        //do stuff
        countryStats.forEach(function(day){
            dates.push(day.Date.slice(0,10));
            cases.push(day.Cases);
        });

        chart.data.labels = dates;
        chart.data.datasets[0].data = cases;
        console.log(chart.data.datasets);

        chart.update();

    }).catch(err => {
        console.log(err);
    })
    
}