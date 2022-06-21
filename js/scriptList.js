var apiKey = "KwldLG7M";    // API-key till SMAPI
var coursesElem;            // referens till sectionen där banorna ska läggas in
var pageNr;				    // aktuellt sidnummer
var courseId = [];          // array för att spara banornas id
var buttonId;               // variabel för den sökknapp som tryckts

// Initiering av globala variabler och händelsehanterare
function init() {
    buttonId = getCookie("buttonId");   // hämtar den tryckta knappens id från cookie
    coursesElem = document.getElementById("golfbanor");
    pageNrElem = document.getElementById("pageNr");
	document.getElementById("showMore").addEventListener("click",nextPage);
    pageNr = 1;
    // rätt funktion/request körs utifrån vald knapp
    switch(buttonId) {
        case "naraBtn":
            navigator.geolocation.getCurrentPosition(function(res){console.log(res);lat=res.coords.latitude;lng=res.coords.longitude;sortPosition(lat,lng);});            
            break;
        case "ratingBtn":
            document.getElementById("header1").innerHTML = "Högst rankade";
            sortCourses("https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&per_page=8&current_page=" + pageNr + "&sort_in=DESC&order_by=rating&format=json&nojsoncallback=1");
            break;
        case "allaBtn":
            document.getElementById("header1").innerHTML = "Alla golfbanor";
            sortCourses("https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&order_by=name&per_page=8&current_page=" + pageNr + "&format=json&nojsoncallback=1");
            break;
    }
}   // end init
window.addEventListener("load",init);

// hämtar ut golfbanor utifrån användarens position
function sortPosition(lat,lng) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    if (pageNr > 4) {
        document.getElementById("nextBtn").style.visibility = "hidden";
    }
    document.getElementById("header1").innerHTML = "Nära mig";
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getfromlatlng&lat=" + lat +"&lng=" + lng + "&descriptions=golfbana&radius=200&order_by=distance_in_km&per_page=8&current_page=" + pageNr + "&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) coordinates(request.responseText);
            else coursesElem.innerHTML = "går inte att hitta";
    };
} // end sortPosition

// hämtar och sorterar golfbanor utifrån rating eller alfabetisk ordning
function sortCourses(src) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    if (pageNr > 4) {
        document.getElementById("nextBtn").style.visibility = "hidden";
    }
    request.open("GET",src,true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) showCourses(request.responseText);
            else citiesElem.innerHTML = "går inte att hitta";
    };
}   // end sortRating

// skriver ut golfbanorna utifrån position
function coordinates(response) {
    response = JSON.parse(response);
    for (let i = 0; i < response.payload.length; i++){
        var url = "url('../img/course" + Math.floor(Math.random()*15) + ".jpg')";   // tar fram url för random bild
        let id = response.payload[i].id;                // banans id
        let a = document.createElement("a");            // nytt a-element för golfbanan
        a.setAttribute("href","golfSpec.html");
        let newElem = document.createElement("div");    // nytt div-element
        newElem.setAttribute("id",id);
        newElem.setAttribute("class","banor");
        courseId[i] = response.payload[i].id;
        let name = response.payload[i].name;            // banans namn
        let price = response.payload[i].price_range;    // banans pris
        let city = response.payload[i].city;            // staden banan ligger i 
        let rating = Math.round(response.payload[i].rating*10)/10;  // banans rating
        let distance = response.payload[i].distance_in_km;          // avstånd bana-användare
        newElem.innerHTML = "<div class='top-name'><h3 class='namn'>" + name + "</h3><h4>" + city + "</h4></div><div class='lower-divs'><div class='left-bottom'><p class='distance'>" + Math.round(distance*10)/10 + " km</p><p class='pris'>" + price + " kr</p></div><div class='right-bottom'><p class='rating'>" + rating + "</p></div></div>";
        newElem.style.backgroundImage = url;
        a.appendChild(newElem);
        coursesElem.appendChild(a);
        a.addEventListener("click",function() { saveCourseId(response.payload[i].id); });
    }
} // end coordinates

// visar de golfbanor som hämtas i sortCourses
function showCourses(response) {
    response = JSON.parse(response);
    for (let i = 0; i < response.payload.length; i++){
        var url = "url('../img/course" + Math.floor(Math.random()*15) + ".jpg')";   // tar fram url för random
        let id = response.payload[i].id;                // banans id
        let a = document.createElement("a");            // nytt a-element för golfbanan
        a.setAttribute("href","golfSpec.html");         
        let newElem = document.createElement("div");    // nytt div-element
        newElem.setAttribute("id",id);
        newElem.setAttribute("class","banor");
        courseId[i] = response.payload[i].id;
        let name = response.payload[i].name;            // banans namn
        let price = response.payload[i].price_range;    // banans pris
        let city = response.payload[i].city;            //staden banan ligger i
        let rating = Math.round(response.payload[i].rating*10)/10;  // banans rating
        newElem.innerHTML = "<div class='top-name'><h3 class='namn'>" + name + "</h3><h4>" + city + "</h4></div><div class='lower-divs'><div class='left-bottom'><p class='pris'>" + price + " kr</p></div><div class='right-bottom'><p class='rating'>" + rating + "</p></div></div>";
        newElem.style.backgroundImage = url;
        a.appendChild(newElem);
        a.addEventListener("click",function() { saveCourseId(response.payload[i].id); });
        coursesElem.appendChild(a);
    }
    navigator.geolocation.getCurrentPosition(function(res){console.log(res);lat=res.coords.latitude;lng=res.coords.longitude;
        for (let i = 0; i < courseId.length; i++) {
            getPosition(lat,lng,courseId[i]);
        }
    }); 
}   // end showCourses

// hämtar användarens position för att ta fram avståndet till golfbanan
function getPosition(lat,lng,id) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getfromlatlng&lat=" + lat +"&lng=" + lng + "&ids=" + id + "&radius=300&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) {
                response = JSON.parse(request.responseText);
                distance = response.payload[0].distance_in_km;
                position(id,distance);
            } else citiesElem.innerHTML = "går inte att hitta";
    };
}   // end getPosition

// lägger in avståndet i varje kort
function position(id,distance) {
    let newElem = document.createElement("p");  // skapar ett nytt p-element som ska in på kortet
    let a = document.getElementById(id);        // hämtar banans med rätt id
    newElem.setAttribute("class","distance");
    newElem.innerHTML = Math.round(distance*10)/10 + " km från dig";
    a.children[1].children[0].prepend(newElem);
}   // end position

// funktion för att ladda in "nästa sida"/mer golfbanor
function nextPage() {
	pageNr++;
    switch(buttonId) {
        case "naraBtn":
            navigator.geolocation.getCurrentPosition(function(res){console.log(res);lat=res.coords.latitude;lng=res.coords.longitude;sortPosition(lat,lng);});  
            break;
        case "ratingBtn":
            document.getElementById("header1").innerHTML = "Högst rankade";
            sortCourses("https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&per_page=8&current_page=" + pageNr + "&sort_in=DESC&order_by=rating&format=json&nojsoncallback=1");
            break;
        case "allaBtn":
            document.getElementById("header1").innerHTML = "Alla golfbanor";
            sortCourses("https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&order_by=name&per_page=8&current_page=" + pageNr + "&format=json&nojsoncallback=1");
            break;
    }
}   // end nextPage

// sparar id:et för vald bana i cookie
function saveCourseId(id) {
    setCookie("courseId",id,1);
}   // end saveCourseId