var apiKey = "KwldLG7M";    // API-key till SMAPI
var mapElem;				// Objekt för kartan
var marker;		            // markering

// Initiering av globala variabler och händelsehanterare
function init() {
    let courseId = getCookie("courseId");   // sparar den valda banans id i en variabel
    getCourse(courseId);
    getReviews(courseId);
    getLocation(courseId);
    getInfoJson(courseId);
}   // end init
window.addEventListener("load",init);

// initierar karta för golfbanan
function initMap(lat,lng) {
    lat = Number(lat);
    lng = Number(lng);
    mapElem = new google.maps.Map(document.getElementById('map') , {
            center: {lat: lat, lng: lng},
            zoom: 15,
            styles: [
                {featureType:"poi", stylers:[{visibility:"off"}]}, 
                {featureType:"transit.station",stylers:[{visibility:"off"}]}  
            ]
        }
    );
}   // end initMap

// hämtar ut golfbanor utifrån användarens position
function getCourse(id) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&ids=" + id + "&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) showCourse(request.responseText);
            else coursesElem.innerHTML = "går inte att hitta";
    };
} // end sortPosition

// hämtar recensioner ur SMAPI
function getReviews(id) {
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getReviews&id=" + id + "&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) showReviews(request.responseText); else coursesElem.innerHTML = "går inte att hitta";
    };
}   // end getReviews

// hämtar golfbanans koordinater för att kunna se vädret
function getLocation(id) {
    courseId = [];
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://smapi.lnu.se/api/?api_key=" + apiKey + "&debug=true&controller=establishment&method=getall&descriptions=golfbana&ids=" + id + "&format=json&nojsoncallback=1",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4) 
            if (request.status == 200) {
                let response = JSON.parse(request.responseText);
                let lat = response.payload[0].lat;
                let lng = response.payload[0].lng;
                getWeather(lat,lng);
                initMap(lat,lng);
            } else tipsElem.innerHTML = "går inte att hitta";
    };
}   // end getLocation

// hämtar väder mha SMHI och koordinater
function getWeather(lat,lng) {
    showDays();
    let request = new XMLHttpRequest(); // object för ajax-anropet
    request.open("GET","https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/" + lng + "/lat/" + lat + "/data.json",true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4)
            if (request.status == 200) showWeather(request.responseText); else coursesElem.innerHTML = "går inte att hitta";
    };
}   // end getWeather

// hämtar vilken dag det är och skriver ut 5 dagar framöver
function showDays() {
    let date = new Date().toString();   // dagens date
    const weekdays = ["Mån","Tis","Ons","Tor","Fre","Lör","Sön"];   // veckans dagar
    var weekday = "";                   // variabel för dagen, förkortning
    switch(date.slice(0,3)) {
        case "Mon":
            weekday = 0;           
            break;
        case "Tue":
            weekday = 1;          
            break;
        case "Wed":
            weekday = 2;          
            break;
        case "Thu":
            weekday = 3;          
            break;
        case "Fri":
            weekday = 4;          
            break;
        case "Sat":
            weekday = 5;          
            break;
        case "Sun":
            weekday = 6;          
            break;
    } 
    // skriver ut dagen och de fem kommande i de divar som ska visa vädret
    for(let i = 0; i < 5; i++) {
        document.getElementById("day"+i).innerHTML = weekdays[weekday];
        // "nollställer" veckodagarna för att de ska gå från söndag till måndag
        if (weekday == 6) {
            weekday = 0;
        } else weekday++;
    }
}   // end showDays

// hämtar och visar vädret på golfbanan
function showWeather(response) {
    response = JSON.parse(response);      
    var weatherId = []; // sparar de object från väder-API:et som ska visas
    for (let i = 0; i < response.timeSeries.length; i++) {
        let time = response.timeSeries[i].validTime.toString(); // gör om för att kunna läsa av tiden för prognosen
        // lägger in vädret och temperaturen kl tolv varje dag, är klockan över tolv tar den det aktuella vädret
        if (i > 12 && weatherId.length == 0) weatherId.push(0);
        if (time.slice(11,13) == "12") {
            weatherId.push(i);
        }
        if (weatherId.length > 4) break;
    }
    for (let i = 0; i < 5; i++) {
        let day = document.getElementById("day" + i);   // referens till elementet för aktuell dag
        let temp = document.createElement("p");         // skapar p-element för temperaturen
        let icon = document.createElement("p");         // p-element för väderikonen
        temp.setAttribute("class","weatherTemp");
        temp.innerHTML = Math.round(response.timeSeries[i].parameters[10].values[0]) + " C";        
        icon.setAttribute("class","icon");
        // lägger in rätt väderikon utifrån prognosen
        switch(response.timeSeries[weatherId[i]].parameters[18].values[0]) {
            case 1: 
            case 2:
                icon.style.backgroundImage = "url('../img/sun.png')";                
                break;
            case 3:
            case 4:
                icon.style.backgroundImage = "url('../img/sun-cloud.png')";    
                break;
            case 5:
                icon.style.backgroundImage = "url('../img/cloudy.png')";            
                break;
            case 6:
                icon.style.backgroundImage = "url('../img/cloud.png')";            
                break;
            case 7:
                icon.style.backgroundImage = "url('../img/mist.png')";            
                break;
            case 8:
            case 9:
            case 10:
            case 18:
            case 19:
            case 20:
                icon.style.backgroundImage = "url('../img/rain.png')";            
                break;
            case 12:
            case 13:
            case 14:
            case 22:
            case 23:
            case 24:
            case 15:
            case 16:
            case 17:
            case 25:
            case 26:
            case 27:
                icon.style.backgroundImage = "url('../img/snow.png')";            
                break;
            case 11:
                icon.style.backgroundImage = "url('../img/thunderstorm.png')";            
                break;
            case 21:
                icon.style.backgroundImage = "url('../img/thunder.png')";            
                break;
        }
        day.appendChild(icon);
        day.appendChild(temp);
    } 
}   // end showWeather

// skrivet ut recensionerna för golfbanan, en fakerecension har lagt till för att kunna visa hur de ska se ut även när recensioner saknas i SMAPI
function showReviews(response) {
    response = JSON.parse(response);
    for (let i = 0; i < response.payload.length; i++) {
        let review = document.createElement("div");    // div-element för recension
        review.setAttribute("class","review");
        review.innerHTML = "<p class='reviewName'>" + response.payload[i].name + "</p><p class='comment'>" + response.payload[i].comment + "</p><p class='time'>" + response.payload[i].relative_time + "</p>";        
        document.getElementById("recensioner").appendChild(review);
    }
}   // end showReviews

// skriver ut den generella strukturen med info
function showCourse(response) {
    let text  = document.getElementById("text").innerHTML;  // referens till elementet där texten ska in
    let a = document.createElement("a");                    // skapar a-element för webbaddress 
    let tel = document.createElement("p");                  // skapar p-element för telefonnummer
    let add = document.createElement("p");                  // akapar p-element för golfbanans address
   // var url = "url('../img/pic" + Math.floor(Math.random()*6) + ".jpg')";
    document.getElementById("picture1").style.backgroundImage = "url('../img/pic" + Math.floor(Math.random()*9) + ".jpg')";
    document.getElementById("picture2").style.backgroundImage = "url('../img/pic" + Math.floor(Math.random()*9) + ".jpg')";
    response = JSON.parse(response);
    document.getElementById("courseName").innerHTML = response.payload[0].name;
    document.getElementById("price").innerHTML = response.payload[0].price_range + " kr";
    document.getElementById("abstract").innerHTML = response.payload[0].abstract;
    document.getElementById("text").innerHTML = response.payload[0].text + text;
    add.setAttribute("class","inf");
    add.innerHTML = "<p id='adress'>Adress: </p> " + response.payload[0].address;
    document.getElementById("clubInfo").appendChild(add);
    tel.setAttribute("class","inf");
    tel.innerHTML = "<p id='tele'>Telefon: </p> " + response.payload[0].phone_number;
    document.getElementById("clubInfo").appendChild(tel);
    a.setAttribute("href",response.payload[0].website);
    a.innerHTML = response.payload[0].name + "s webbsida"
    document.getElementById("webbplats").appendChild(a);
}   // end showCourse

// hämtar och skriver ut infon från json-filen som skapats
function getInfoJson(id) {
	let request = new XMLHttpRequest(); // Object för Ajax-anropet
	request.open("GET","json/courseSpec.json",true);
	request.send(null); 				
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if (request.readyState == 4)
			if (request.status == 200) {
                let response = JSON.parse(request.responseText);
                for (let i = 0; i < response.info.length; i++) {
                    if (response.info[i].id == id) {
                        document.getElementById("time1").innerHTML = response.info[i].week;
                        document.getElementById("time2").innerHTML = response.info[i].weekend;
                        document.getElementById("holes").innerHTML += response.info[i].holes;
                        break;
                    }
                }
            } else document.getElementById("time1").innerHTML = "Den begärda resursen fanns inte.";
	};
}   // end getInfoJson