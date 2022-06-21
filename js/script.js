var apiKey = "KwldLG7M";    // API-key till SMAPI
var tipsElem;               // referens till elementet för tips-rutorna 
var lat;                    // variabel för användarens position, latitud
var lng;                    // variabel för användarens position, longitud
var courseId = [];          // array med id för de banor som ska visas

// Initiering av globala variabler och händelsehanterare
function init() {
    tipsElem = document.getElementById("tips"); 
    // skapar händelsehanterare för sökknapparna för att spara deras id
    document.getElementById("naraBtn").addEventListener("click",function() {saveButtonId(this.id);});
    document.getElementById("ratingBtn").addEventListener("click",function() {saveButtonId(this.id);});
    document.getElementById("allaBtn").addEventListener("click",function() {saveButtonId(this.id);});
    navigator.geolocation.getCurrentPosition(function(res){console.log(res);lat=res.coords.latitude;lng=res.coords.longitude;sortPosition(lat,lng);}); 
}   // end init
window.addEventListener("load",init);

// hämtar ut golfbanor utifrån användarens position och banans rating
function sortPosition(lat,lng) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getfromlatlng&lat=" + lat +"&lng=" + lng + "&descriptions=golfbana&radius=30&per_page=4&order_by=rating&sort_in=DESC&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) coordinates(request.responseText);
            else tipsElem.innerHTML = "går inte att hitta";
    };
} // end sortPosition

// skriver ut golfbanorna utifrån position
function coordinates(response) {
    response = JSON.parse(response);
    // skapar varje ban-kort
    for (let i = 0; i < response.payload.length; i++){
        var url = "url('../img/course" + Math.floor(Math.random()*15) + ".jpg')";   // tar fram url:en för en random bild
        let id = response.payload[i].id;                // banans id, från API:et
        let a = document.createElement("a");            // skapar ett nytt a-element, för "kortet"
        let newElem = document.createElement("div");    // skapar ett nytt div-element
        a.setAttribute("href","golfSpec.html");
        newElem.setAttribute("id",id);
        newElem.setAttribute("class","tipsbox");
        courseId[i] = response.payload[i].id;
        let name = response.payload[i].name;            // banans namn
        let price = response.payload[i].price_range;    // banans pris
        let city = response.payload[i].city;            // staden som banan ligger vid
        let rating = Math.round(response.payload[i].rating*10)/10;  // banans rating
        let distance = response.payload[i].distance_in_km;          // avståndet från användaren till banan
        newElem.innerHTML = "<div class='top-name'><h3 class='namn'>" + name + "</h3><h4>" + city + "</h4></div><div class='lower-divs'><div class='left-bottom'><p class='distance'>" + Math.round(distance*10)/10 + " km</p><p class='pris'>" + price + " kr</p></div><div class='right-bottom'><p class='rating'>" + rating + "</p></div></div>";
        newElem.style.backgroundImage = url;
        a.appendChild(newElem);
        a.addEventListener("click",function() { saveCourseId(response.payload[i].id); });
        tipsElem.appendChild(a);
    }
} // end coordinates

// sparar knappens id i en cookie för att kunna hämta rätt lista
function saveButtonId(id) {
    setCookie("buttonId",id,1);
}   // end saveButtonId

// sparar banans id i en cookie för att hämta rätt info
function saveCourseId(id) {
    setCookie("courseId",id,1);
}   // end saveCourseId

