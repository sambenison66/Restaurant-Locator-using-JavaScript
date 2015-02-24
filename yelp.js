/*   -----------

Name : Samuel Benison Jeyaraj Victor
Email ID : sambenison66@gmail.com
Project Link : http://omega.uta.edu/~xxx1234/project3/yelp.html

------------ */

// Initial declarations
var geocoder;
var map;
var markersArray = [];

// OnLoad method which will load the Map with default settings
function YelpApp () {

  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(32.75, -97.13);
  var mapOptions = {
      zoom: 16,
      center: latlng
  }
  map = new google.maps.Map(document.getElementById("outputMap"), mapOptions);
  google.maps.event.addListener(map, "bounds_changed", function() {
   // send the new bounds back to your server
   console.log("map bounds --> "+map.getBounds());
  });

}

// Method to draw the Marker in the Map
YelpApp.mapMarker = function(addressDetails, icon, title)
{
  var searchAddress=addressDetails;
  var labelText = icon + ". " + title + "\n" + searchAddress; // To display the label details for each Marker
  console.log(searchAddress);

  // Retrieving the Marker Image from the Project 3 folder in order to customize the marker
  var image = new google.maps.MarkerImage('marker' + icon + '.png',
                      new google.maps.Size(20, 34),
                      new google.maps.Point(0, 0),
                      new google.maps.Point(10, 34));
 
  geocoder.geocode({'address':searchAddress},function(results,status){ 

  if(status == google.maps.GeocoderStatus.OK)
  {
     //map.setCenter(results[0].geometry.location);
     console.log("Geo location of the given address is" + results[0].geometry.location);
     // Marker Attributes
     var marker= new google.maps.Marker({
      map:map,
      draggable:false,
      icon: image,
      title: labelText,
      animation: google.maps.Animation.DROP,
      position: results[0].geometry.location
     });
     markersArray.push(marker);
  } 
  else
  {
    console.log("Unable to mark the address on to the map  --> "+addressDetails);
  }
});
}

// Map Bound method to get the bounding box values
YelpApp.boundingBox = function(){
  var bounds = map.getBounds()
  /*
  bounds.toString -- (sw,ne)
  ((32.74548820090014, -97.13643730163574), (32.75451157058446, -97.12356269836425))
          y                 x                     y2                  x2
          lat              lon                   lat                  lon
  ga.b == -97.13643730163574 == x
  ga.d == -97.12356269836425 == x2
  bounds.ta.b == 32.75451157058446 == y2
  bounds.ta.d == 32.74548820090014 == y

  

    nw --> y2,x            ne --> y2, x2
    nw --> ta.b, ga.b      ne --> ta.b, ga.d



    sw --> y,x             se --> y, x2
    sw --> ta.d, ga.b      se --> ta.d, ga.d

  */
  bounds = {  nw: {lat: bounds.ta.b, 
                   lon: bounds.ga.b}, 
              ne: {lat: bounds.ta.b, 
                   lon: bounds.ga.d}, 
              sw: {lat: bounds.ta.d, 
                   lon: bounds.ga.b}, 
              se: {lat: bounds.ta.d, 
                   lon: bounds.ga.d} };
  return bounds;
}

// Method called when the Search button is clicked
YelpApp.sendRequest = function() {
   var term = document.querySelector("#search").value.split(" ").join("+");
   for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
    }
    markersArray.length = 0;
   var xhr = new XMLHttpRequest();
   var bounds = YelpApp.boundingBox();
   //bounds=sw_latitude,sw_longitude|ne_latitude,ne_longitude
   bounds = "" + bounds.sw.lat + "," + bounds.sw.lon + "|" + bounds.ne.lat + "," + bounds.ne.lon;
   //http://api.yelp.com/v2/search?term=food&bounds=37.900000,-122.500000|37.788022,-122.399797
   xhr.open("GET", "proxy.php?term="+term+"&bounds="+bounds+"&limit=10");
   //xhr.open("GET", "proxy.php?term=indian+restaurant&location=Arlington+Texas&limit=5");
   xhr.setRequestHeader("Accept","application/json");
   xhr.onreadystatechange = function () {
       if (this.readyState == 4) {
          var json = JSON.parse(this.responseText);
          /*var str = JSON.stringify(json,undefined,2);
          document.getElementById("output1").innerHTML = "<pre>" + str + "</pre>"; */
          var destination_element = document.querySelector("#output");   // Searching for an element with id name 'movielistings'
          YelpApp.response = json;
          console.log("Search Result : \n");
          console.log(json);
          YelpApp.showListings(json,destination_element);   //  Calling the method showListing
       }
   };
   xhr.send(null);
};

// Method to show the list of search items based on the selected query
YelpApp.showListings = function(json,element){
    console.log("GOT HERE!");
    // Clearing the existing list (if any) before listing the new details
    while(element.hasChildNodes()){ element.removeChild(element.firstChild);}//remove children before listing

    // Checking for error messages returned from JSON if applicable
    if(json.error) {
      var errorLog = json.error.text;
      errorLog = errorLog || "Area is in Range";
      console.log(errorLog);
      if(errorLog == "Area too large") {
        alert("Area too large, Adjust the Map Boundings");
        return;
      }
    }

    // Displaying the heading for the search list
    if(json.businesses.length > 0) {
        var heading = document.createElement("h1");
        heading.innerText = "Below are the top 10 Yelp Search List for the given bounding box:"
        var breakLine = document.createElement("br");
        element.appendChild(heading);
        element.appendChild(breakLine);

    }
    else {
      var heading = document.createElement("h1");
        heading.innerText = "No Search Result for the given keyword, Try different keyword"
        var breakLine = document.createElement("br");
        element.appendChild(heading);
        element.appendChild(breakLine);
        return;
    }
    // Displaying the list from the json search result
    for (var i=0; i<json.businesses.length; i++)
    {
        var id = i + 1;
        var nameTitle = json.businesses[i].name;
        console.log(json.businesses[i].name);
        var dispAddress = json.businesses[i].location.display_address;
        var sendAddress = JSON.stringify(dispAddress,undefined,2);
        YelpApp.mapMarker(sendAddress, id, nameTitle);

        var lineBreak = document.createElement("br");
        //Creating a Div to list name and rating
        var set = document.createElement("div");
        var divida = "id" + id + "a";
        set.setAttribute("id",divida);
        //Creating a Div to list image and snippet text
        var set1 = document.createElement("div");
        var dividb = "id" + id + "b";
        set1.setAttribute("id",dividb);
        // Creating the Serial number and the Search Result name and it's hyperlink
        var sno = document.createElement("b");
        sno.innerText = id + ".   ";
        var nameLink = document.createElement("a");
        var hreflink = json.businesses[i].url;
        nameLink.setAttribute("href",hreflink);
        var targetWindow = "_blank";
        nameLink.setAttribute("target",targetWindow);
        nameLink.innerText = json.businesses[i].name + "    ";
        // Creating the Rating URL
        var ratingImg = document.createElement("img");
        var hrefrating = json.businesses[i].rating_img_url;
        hrefrating = hrefrating || ""; // Default to null if the json didn't return any url link
        ratingImg.setAttribute("src",hrefrating);
        //Creating the image URL
        var searchImg = document.createElement("img");
        var hrefpicture = json.businesses[i].image_url;
        hrefpicture = hrefpicture || ""; // Default to null if the json didn't return any url link
        searchImg.setAttribute("src",hrefpicture);
        // Creating the Snippet Text
        var snippetText = document.createElement("p");
        var txtContent = json.businesses[i].snippet_text;
        txtContent = txtContent || "No Details Specified";
        snippetText.innerText = txtContent;

        // Adding the child elements to it's corresponding parents
        set.appendChild(sno);
        set.appendChild(nameLink);
        set.appendChild(ratingImg);
        element.appendChild(set);
        element.appendChild(lineBreak);
        set1.appendChild(searchImg);
        set1.appendChild(snippetText);
        element.appendChild(set1);
        element.appendChild(lineBreak);
    };
};