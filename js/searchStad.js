var apiKey = "KwldLG7M";    // API-key till SMAPI
var citiesElem;             // referens till elementet där checkboxarna visas
var coursesElem;            // referens till elementet där banorna visas
var chosenCities;           // array för att spara de checkade städerna
var muni = [];              // array med kommuner
var courseId = [];          // array för att spara banornas id
var pageNr;				    // aktuellt sidnummer


// Initiering av globala variabler och händelsehanterare
function init() {
    citiesElem = document.getElementById("checkboxes");
    coursesElem = document.getElementById("golfbanor");
    document.getElementById("searchBtn").addEventListener("click",function() {
        pageNr = 1;
        sortCity(); });
    document.getElementById("nextBtn").addEventListener("click",nextPage);
    document.getElementById("prevBtn").addEventListener("click",prevPage);
    document.getElementById("prevBtn").addEventListener("click",prevPage);
    document.getElementById("nextBtn").addEventListener("click",nextPage);
    document.getElementById("pageBtns").style.visibility = "hidden";
    getCities();
}   // end init
window.addEventListener("load",init);

// hämtar alla de valbara städerna
function getCities() {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) writeCities(request.responseText);
            else citiesElem.innerHTML = "går inte att hitta";
    };   
}   // end getCities

// skriver ut städerna/skapar checkboxes för varje stad
function writeCities(response) {
    response = JSON.parse(response);
    var a = []; // array med städerna (kommunerna) från golfbanorna i smapi
    for (let i = 0; i < response.payload.length; i++){
        muni.push(response.payload[i].municipality);
        let stad = response.payload[i].municipality.replace("kommun","");   // tar bort kommun för att bara ha städernas namn
        if (stad.charAt(stad.length -2) == "s") {
            stad = stad.slice(0,-2);
        } else stad = stad.slice(0,-1);
        a[i] = stad;
    } 
    muni = Array.from(new Set(muni)).sort();
    let cities = Array.from(new Set(a)).sort(); // plockar bort alla duplications
    let c = cities.slice(0);                    // skapar en kopia av cities
    for(let i  = 0; i < cities.length/3; i++) {
        let newElem = document.createElement("tr"); // 
        newElem.setAttribute("class","rows");
        for (let j  = 0; j < 3; j++) {
            let check = document.createElement("td");   // td-element för varje checkbox
            check.setAttribute("class","cities")
            check.innerHTML += "<input id='" + j + "' class='checkbox_input' type='checkbox' value='" + c[j] + "'><label for='" + c[j] + "'>" + c[j] + "</label>";
            newElem.appendChild(check);
        }
        c = c.splice(3,c.length-1);
        citiesElem.appendChild(newElem);
    }
}   // end writeCities

// kollar vilka städer som valts och hämtar dem ur SMAPI
function sortCity() {
    let cities = document.forms[0]; // sparar formuläret
    var city = [];                  // skapar en array för de checkade städerna
    coursesElem.innerHTML = "";
    document.getElementById("pageBtns").style.visibility = "visible";
    chosenCities = "";
    // kollar om knappen är checked och sparar den i city
    for (let i = 0; i < cities.length; i++) {
        if (cities[i].checked) {
            chosenCities = chosenCities + (muni[i]) + ",";
            city.push(" " + cities[i].value);
        }
    }
    let c = chosenCities.slice(0,-1);   // skapar en kopia av städerna
    document.getElementById("city").innerHTML = city;
    c = chosenCities.toLocaleLowerCase();
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&municipalities=" + c + "&per_page=8&current_page=" + pageNr + "&order_by=municipality&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function ()  {
        if (request.readyState == 4)
            if (request.status == 200) showCourses(request.responseText);
            else citiesElem.innerHTML = "går inte att hitta";
    };
}   // sortCity

// visar golfbanorna/skapar "korten" 
function showCourses(response) {
    response = JSON.parse(response);
    if (response.payload.length < 8) {
        document.getElementById("nextBtn").disabled = true;
    } else document.getElementById("nextBtn").disabled = false;
    
    if (pageNr == 1) {
        document.getElementById("prevBtn").disabled = true;
    } else document.getElementById("prevBtn").disabled = false;

    for (let i = 0; i < response.payload.length; i++){
        var url = "url('../img/course" + Math.floor(Math.random()*15) + ".jpg')";   // tar fram url:en för en random bild
        let id = response.payload[i].id;                // banans id
        let a = document.createElement("a");            // ett nytt a-element för kortet
        a.setAttribute("href","golfSpec.html");
        let newElem = document.createElement("div");    // nytt div-element 
        newElem.setAttribute("id",id);
        newElem.setAttribute("class","banor");
        courseId[i] = response.payload[i].id;
        let name = response.payload[i].name;            // banans namn
        let price = response.payload[i].price_range;    // banans pris
        let city = response.payload[i].city;            // banans stad
        let rating = Math.round(response.payload[i].rating*10)/10;  // banans rating
        //let distance = response.payload[i].distance_in_km;
        newElem.innerHTML = "<div class='top-name'><h3 class='namn'>" + name + "</h3><h4>" + city + "</h4></div><div class='lower-divs'><div class='left-bottom'><p class='pris'>" + price + " kr</p></div><div class='right-bottom'><p class='rating'>" + rating + "</p></div></div>";
        newElem.style.backgroundImage = url;
        a.appendChild(newElem);
        a.addEventListener("click",function() { saveCourseId(response.payload[i].id); });
        coursesElem.appendChild(a);
    }
    navigator.geolocation.getCurrentPosition(function(res){console.log(res);lat=res.coords.latitude;lng=res.coords.longitude;
        for (let i = 0; i < response.payload.length; i++) {
            getPosition(lat,lng,courseId[i]);
        }
    }); 
}   // end showCourses

// hämtar användarens position för att ta fram avståndet till golfbanan
function getPosition(lat,lng,id) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getfromlatlng&lat=" + lat +"&lng=" + lng + "&ids=" + id + "&radius=400&format=json&nojsoncallback=1",true);
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
    let newElem = document.createElement("p");  // skapar p-element för avståndet
    var a = document.getElementById(id);        // referens till kortet med banan
    newElem.setAttribute("class","distance");
    newElem.innerHTML = Math.round(distance*10)/10 + " km från dig";
    a.children[1].children[0].prepend(newElem);
}   // end position

// går tillbaka en sida
function prevPage() {
	if (pageNr > 1) {
		pageNr--;
		sortCity();
	}
} // end prevPage

// går till nästa sida
function nextPage() {
	pageNr++;
    sortCity();
}   // end nextPage

// sparar banans id i en cookie
function saveCourseId(id) {
    setCookie("courseId",id,30);
}   // end saveCourseId