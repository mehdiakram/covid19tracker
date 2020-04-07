
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

    // Add keyup event listener to the search element
    var country_input = document.getElementById("countryName");
    this.countryName.addEventListener("keyup", function(event){countryHinter(event)});

    //create global XHR object so we can abort requests easier
    window.countryHinterXHR = new XMLHttpRequest();

}

function countryHinter(event) {

    //retrieve the input element
    var input = event.target;

    //retrieve the datalist element
    var countrySearchList = document.getElementById("countrySearchList");

    //Set a minimum number of characters before showing suggestions
    var min_characters = 1;

    // Ignore logic if user hasn't entered a letter yet
    if (input.value.length < min_characters) {
        return;
    } else {

        //abort pending requests
        window.countryHinterXHR.abort();

        window.countryHinterXHR.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                // Convert JSON response toan object
                var response = JSON.parse(this.responseText);

                // clear old options in datalist
                countrySearchList.innerHTML = "";

                response.forEach(function(item) {
                    // Create new <option> element
                    var option = document.createElement("option");
                    option.value = item.Slug;

                    // Attach option to the datalist element
                    countrySearchList.appendChild(option);
                });

            }
        };

        window.countryHinterXHR.open("GET", "https://api.covid19api.com/countries", true);
        window.countryHinterXHR.send()

    }

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
    // var countrySelect = document.getElementById("countrySelect");
    var countrySelect = document.getElementById("countryName");
    console.log("country name from autocomplete is " + countrySelect.value);
    // var countryName = countrySelect.options[countrySelect.selectedIndex].value;
    var countryName = countrySelect.value;

    // update the data source lists
    updateCases(countryName);
    updateDeaths(countryName);

        // add the lists with the data to the chart object at the correct levels
        chart.data.labels = dates;
        chart.data.datasets[0].data = cases;
        chart.data.datasets[1].data = deaths;

}


function updateCases(countryName) {

    var casesXHR = new XMLHttpRequest();

    // make request to endpoint and get confirmed case statistics
    casesXHR.onreadystatechange = function() {

        if (casesXHR.readyState !==4 ) return;

        if (casesXHR.status >= 200 && casesXHR.status <300) {

            // update lists for dates and confirmed cases
            var response = JSON.parse(this.responseText);
            response.forEach(day => {
                // chop off the time part of the date values sine they're always 00:00:00
                dates.push(day.Date.slice(0,10));
                cases.push(day.Cases);
            });

            chart.update();
        }

    };
    casesXHR.open("GET", countryCaseURL + countryName + countryCaseURLConfirmedSuffix, true);
    casesXHR.send();

}


function updateDeaths(countryName) {

    var deathsXHR = new XMLHttpRequest();

    // make request to endpoint and get death statistics 
    deathsXHR.onreadystatechange = function() {

        if (deathsXHR.readyState !==4 ) return;

        if (deathsXHR.status >= 200 && deathsXHR.status < 300) {

            // update list for deaths data
            var response = JSON.parse(this.responseText);
            response.forEach(day => {
                deaths.push(day.Cases);
            });

            chart.update();
        }
    };

    deathsXHR.open("GET", countryCaseURL + countryName + countryCaseURLDeathSuffix, true);
    deathsXHR.send();

}