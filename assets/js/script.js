//Backup API key for n2yo.com
// https://www.n2yo.com/rest/v1/satellite/above/41.702/-76.014/0/70/18/&apiKey=589P8Q-SDRYX8-L842ZD-5Z9

//picture of ISS from NASA site. free to use https://images.nasa.gov/
// "NASA should be acknowledged as the source of the material.""
//pic of ISS
//https://images-assets.nasa.gov/image/0701891/0701891~orig.jpg

// pic of progress spacecraft
// https://images-assets.nasa.gov/image/iss023e030445/iss023e030445~orig.jpg

//endless loop pic in the assets folder is from u/metrolinaszabi on reddit r/astrophotography
// response1 is the openweather response
// response is the n2y0 ABOUT response

var cityLat = 0;
var cityLon = 0;
var cityName = "";

$(document).ready(function () {
    $("#error-message").hide();
    $(".card-sat-info").hide();
    $('select').formSelect();
    $("#Description").hide();
    function showPosition(position) {
        $("#lat").text("Latitude: " + position.coords.latitude);
        $("#lon").text("Longitude: " + position.coords.longitude);
        cityLat = position.coords.latitude;
        cityLon = position.coords.longitude;
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&units=imperial";
        // Anitha - Added AJAX request to get current city
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            $("#current-city").text("City : " + response.name);
            $("#city").val(response.name);
            $('#city').focus();
            cityName = response.name;
        });
    }
    $("#current-location").on("click", function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
    });
    var cityName = "";
    var category = 0;
    console.log("city selected is: " + cityName);
    renderHistory();
    $("#submitBtn,#past-cities").on("click", function (event) {
        event.preventDefault();
        $("#offset").removeClass("offset-s4 s4 testcls");
        $('#offset').addClass("s12 m3");
        // get location from user input box or from history list
        let e = $(event.target)[0];
        let cityName = "";
        if (e.id === "submitBtn") {
            cityName = $('#city').val().trim().toUpperCase();
        }
        else if (e.className === ("cityList")) {
            cityName = e.innerText;
        }
        if (cityName == "") {
            $("#error-message").show();
            return;
        }
        $("#error-message").hide();
        updateCityStore(cityName);
        renderHistory();
        //this empties the sat list and says calculating while waiting for API to repond
        $("#satList ul").empty();
        $("#satList ul").append("<li>Calculating...</li>");
        $(".card-sat-info").hide();
        //TODO tim tanner, make this a prepending list, with a max of 5? 10?
        $("#cityNameSpan").text(cityName);
        category = $("#satellite-category").val();
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?q=";
        var apiIdURL = "&appid=";
        var openCurrWeatherAPI = currentURL + cityName + apiIdURL + apiKey;
        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
            cityLat = response1.coord.lat;
            cityLon = response1.coord.lon;
            //Parse City Name into top header
            $("#current-city").text("City : " + cityName);
            $("#city").val(cityName);
            $('#city').focus();
            $("#lat").text("Latitude: " + cityLat);
            $("#lon").text("Longitude: " + cityLon);
            //End of Open Weather API
            var queryURL =
                "https://www.n2yo.com/rest/v1/satellite/above/" +
                cityLat +
                "/" +
                cityLon +
                "/0/70/" +
                category +
                "/&apiKey=WWZP6Q-SXMAX7-WBLGBK-4EVN";
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                //Currently untested, idea being that if response above is empty, error is displayed
                if (!response.above) {
                    $("#satList ul li").text("Satellite not found");
                    $("#satName").text("Satellite not found");
                    $("#satID").text("Satellite not found");
                    $("#Direction").text("Satellite not found");
                    $("#Elevation").text("Satellite not found");
                    $("#Description").text("Description not found");
                    $("#link").attr("href", "");
                } else {
                    //emptying the sat list before populating it
                    $("#satList ul").empty();
                    $(".card-sat-info").show();
                    //this loop populates the list of sats above location
                    for (var i = 0; i < response.above.length; i++) {
                        //console.log("i is " + i + " " + response.above[i].satname + "Satellite ID :" + response.above[i].satid);
                        $("#satList ul").append("<li class='tab satListClass' value = '" + i + "'><a>"
                            + response.above[i].satname + "</a></li>");
                        try {
                            $('.tabs').tabs();
                        } catch (e) { }
                    }

                    //Populating data that will not change regardless of sat clicked
                    //TODO add weather viewing conditions 
                    console.log("sunset" + response1.sys.sunset);
                    console.log("sunrise" + response1.sys.sunrise);
                    //TODO code that calcs if the current city in any part of the world is at night time
                    // https://openweathermap.org/current
                    // $("#nightTime").text("#nightTime");
                    // console.log("conditions" + response1.weather[0].description);
                    $("#Conditions").text(response1.weather[0].description);
                    //populating card with the first sat retrieved
                    //ONLY what is below is what will change if different Sat is clicked. 
                    $("#satName").text(response.above[0].satname);
                    $("#satID").text(response.above[0].satid);
                    $("#Direction").text("Calculating...");
                    $("#Elevation").text("Calculating...");
                    //TODO retrieve NORAD sat id, use the other api to display viewing direction and elevation
                    var NoradID = response.above[0].satid
                    elevationAzimuth(NoradID, cityLat, cityLon);
                    displayWikiApi(NoradID);
                    $(".satListClass").on("click", function () {
                        $("#Description").hide();
                        var clickedIndex = $(this).attr("value");
                        console.log("sat clicked index of " + clickedIndex);
                        $("#satName").text(response.above[clickedIndex].satname);
                        $("#satID").text(response.above[clickedIndex].satid)
                        $("#Direction").text("Calculating...");
                        $("#Elevation").text("Calculating...");
                        var NoradID = response.above[clickedIndex].satid
                        elevationAzimuth(NoradID, cityLat, cityLon);
                        displayWikiApi(NoradID);
                    });
                }
            });
        });
    });

    function updateCityStore(city) {
        // Update local storage with searched City's
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        cityList.unshift(city);
        // removes dulicate cities
        for (let i = 1; i < cityList.length; i++) {
            if (cityList[i] === cityList[0]) {
                cityList.splice(i, 1);
            }
        }
        if (cityList.length > 5) {
            cityList.length = 5;
        }

        //stores in local storage
        localStorage.setItem('cityList', JSON.stringify(cityList));
    };

    function renderHistory() {
        // function to pull city history from local memory
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        $('#past-cities').empty();
        cityList.forEach(function (city) {
            let cityNameDiv = $('<div>');
            cityNameDiv.addClass("cityList");
            cityNameDiv.attr("value", city);
            cityNameDiv.text(city);
            $("#Description").hide();
            $('#past-cities').append(cityNameDiv);
        });
    };

    //this stores the sat category on change to satCat
    $("#satellite-category").on("change", function () {
        satCat = $(this).val();
    });
});

function elevationAzimuth(NoradID, cityLat, cityLon) {
    var queryURLElevation =
        "https://www.n2yo.com/rest/v1/satellite/positions/" +
        NoradID + "/" +
        cityLat +
        "/" +
        cityLon +
        "/0/1/" +
        "&apiKey=WWZP6Q-SXMAX7-WBLGBK-4EVN";
    console.log("queryURLElevation" + queryURLElevation)
    $.ajax({
        url: queryURLElevation,
        method: "GET"
    }).then(function (elevationAzimuthresponse) {
        console.log("elevationAzimuthresponse");
        console.log(elevationAzimuthresponse);
        var elevationAzimuthObject = {
            elevation: elevationAzimuthresponse.positions[0].elevation,
            azimuth: elevationAzimuthresponse.positions[0].azimuth,
        }
        var azi = elevationAzimuthresponse.positions[0].azimuth;
        var AzimuthString = "";
        if (azi > 11.25 && azi <= 33.75) AzimuthString = "NNE";
        if (azi > 33.75 && azi <= 56.25) AzimuthString = "NE";
        if (azi > 56.25 && azi <= 78.75) AzimuthString = "ENE";
        if (azi > 78.75 && azi <= 101.25) AzimuthString = "East";
        if (azi > 101.25 && azi <= 123.75) AzimuthString = "ESE";
        if (azi > 123.75 && azi <= 146.25) AzimuthString = "SE";
        if (azi > 146.25 && azi <= 168.75) AzimuthString = "SSE";
        if (azi > 168.75 && azi <= 191.25) AzimuthString = "South";
        if (azi > 191.25 && azi <= 213.75) AzimuthString = "SSW";
        if (azi > 213.75 && azi <= 236.25) AzimuthString = "SW";
        if (azi > 236.25 && azi <= 258.75) AzimuthString = "WSW";
        if (azi > 258.75 && azi <= 281.25) AzimuthString = "West";
        if (azi > 281.25 && azi <= 303.75) AzimuthString = "WNW";
        if (azi > 303.75 && azi <= 326.25) AzimuthString = "NW";
        if (azi > 326.25 && azi <= 348.75) AzimuthString = "NNW";
        if ((azi > 348.75 && azi < 360) || (azi >= 0 && azi <= 11.25)) AzimuthString = "North";
        // console.log("elevation " + elevationAzimuthObject.elevation);
        // console.log("azimuth " + elevationAzimuthObject.azimuth);
        if (elevationAzimuthresponse.positions[0].sataltitude == 0) {
            $("#Direction").html("<p>Satellite is no longer in orbit</p>");
            $("#Elevation").html("<p>Satellite is no longer in orbit</p>");
        } else {
            $("#Direction").text(AzimuthString);
            $("#Elevation").text(elevationAzimuthObject.elevation);
        }
    });
}
function displayWikiApi(NoradID) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://uphere-space1.p.rapidapi.com/satellite/" + NoradID + "/details",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "uphere-space1.p.rapidapi.com",
            "x-rapidapi-key": "a0699af2e5msh7e3ac5ef7aa5c7cp155d14jsn98f16870b41d"
        }
    }

    $.ajax(settings).then(function (response) {
        console.log(response);
        console.log("response.description");
        console.log(response.description);
        console.log("response.links[0].link_name + response.links[0].link_url");
        $("#Description").show();
        if(response.description){
            $("#Description").html("<h5>Description</h5>" +response.description); 
        }  
        else {
            $("#Description").text("Description not found");
        }     
        if (!response.links[0]) {
            //do nothing if links is empty
        } else {
            console.log(response.links[0].link_name);
            console.log(response.links[0].link_url);
            $("#link").text(response.links[0].link_name);
            $("#link").attr("href", response.links[0].link_url);
        }
    }).catch(function() {
        $("#Description").show();
        $("#Description").text("Description not found");
    });
}

//When I use the website, I can search for satellite passing by my location
//When I want to search for satellite, I can choose by my current location or 
//I can choose a city
//When I search, I can filter sattelite by their categories
//When I have chosen location and category, then click the Search Button
//Then it will display satellite by name, with a list on the bottom left
//Then it will display satellite picture by category, on the bottom right
//When I click on each satellite by name, then it will display info of each satellite
//bellow the satellite picture
//When I do a search, it will save my search history into a table on the right side
//of the search menu

