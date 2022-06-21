// Spara en cookie
function setCookie(cookieName,cookieValue,days) {
	document.cookie = cookieName + "=" + cookieValue + ";expires=" + expireDate(days);
} // End setCookie

function expireDate(d) {
	let theDate = new Date();
	theDate.setTime(theDate.getTime()+(d*86400000)); // Omräknat till millisekunder, 86400000 = 1000*60*60*24
	return theDate.toUTCString(); // Universal Time, form för tiden som ska sparas i cookien
} // End expireDate

// Hämta cookien (om den finns)
function getCookie(cookieName) {
	let start, end;	// Start- och slutposition för cookiens värde i cookiesträngen
	let valueStr;
	start = document.cookie.indexOf(cookieName); // Sök efter cookiens namn i hela den tillgängliga cookie-strängen
	if (start > -1) { // Cookien hittades
		start += cookieName.length + 1; // Start-position för cookiens värde
		end = document.cookie.indexOf(";",start); 
		if (end < start) end = document.cookie.length; // ; hittades inte, så ta resten av cookie-strängen
		valueStr = document.cookie.substring(start,end); // Cookiens värde som en sträng
		return valueStr; // Returnera cookiens värde
	}
	else return null; // Cookien hittades inte, så returnera null
} // End getCookie
