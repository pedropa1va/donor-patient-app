var map;
var graphic;
var currLocation;
var watchId;

var socket = io(window.location.origin);
var ip;
socket.on('getip', function(clientIp){
  ip = clientIp;
});

var pins;

require([
  "esri/map",
  "esri/dijit/Search",
  "esri/dijit/LocateButton",
  "esri/geometry/Point",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/graphic",
  "esri/Color",
  "esri/dijit/Popup",
  "esri/dijit/PopupTemplate",
  "dojo/dom-construct",
  "dojo/parser",
  "esri/layers/FeatureLayer",
  "esri/tasks/query",
  "esri/InfoTemplate",
  "esri/layers/GraphicsLayer",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/TextSymbol",
  "esri/geometry/webMercatorUtils",
  "esri/toolbars/draw",
  "esri/layers/GraphicsLayer",
  "esri/symbols/PictureFillSymbol",
  "esri/symbols/CartographicLineSymbol",
  "dojo/domReady!"
  ], function(
    Map,
    Search,
    LocateButton,
    Point,
    SimpleFillSymbol,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    Graphic,
    Color,
    Popup,
    PopupTemplate,
    domConstruct,
    parser,
    FeatureLayer,
    Query,
    InfoTemplate,
    GraphicsLayer,
    PictureMarkerSymbol,
    TextSymbol,
    geographicToWebMercator,
    Draw,
    Graphicslayer,
    PictureFillSymbol,
    CartographicLineSymbol
    ) {


    map = new Map("map", {
      basemap: "streets",
      center: [-66.8791900,10.4880100],  //(longitud,latitude) located by default in Caracas - Venezuela
      zoom: 15,
      infoWindow: popup
    });

    socket.emit('getpins', {});

    socket.on('loadpins', function(data){
      pins = data;
    });

    socket.on('loadnewpins', function(data){
      pins = data;
      addpins();
    });

    socket.on('clearpins', function(){
      map.graphics.clear(); // removes current pins and readds them
      socket.emit('getnewpins', {}); // update pins array with new donor
    })

    var search = new Search({
      map: map
    }, "search");
    search.startup();

    var geoLocate = new LocateButton({
      map: map,
      highlightLocation: false
    }, "LocateButton");
    geoLocate.startup();

  // Popupform form configuration ------------------------------------------------------
  var popup = new Popup({}, domConstruct.create("div"));

  var telephones = [{ "mask": "+## ### #### ###"}, { "mask": "00## ### #### ###"}];

  // I manually creted the popup form using JQuery (the regex's are for telephone and email validation - I chose not to use HTML5 email input type so non-modern browsers will accept it as well):
  var popupForm = 
    `<form id=popupForm>
      <h5>First Name</h5><input id="firstName" type='text' value='' required/></br>
      <h5>Last Name</h5><input id="lastName" type='text' value='' required/></br>
      <h5>Telephone</h5><input id="telephone" type='text' value='' required pattern='^[\\d() +-]+$'/></br>
      <h5>Email</h5><input id="email" type='text' value='' required pattern='^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'/></br>
      <h5>Blood Type</h5>
      <select>
        <option value="O+">O+</option>
        <option value="A+">A+</option>
        <option value="B+">B+</option>
        <option value="AB+">AB+</option>
        <option value="O-">O-</option>
        <option value="A-">A-</option>
        <option value="B-">B-</option>
        <option value="AB-">AB-</option>
      </select>
      <input type='submit' class="btn btn-default" value='Submit'>
    </form>`;

  map.on("click", function(event){

    if (document.getElementById("Donor")){
      
      // map.infoWindow.close();
      map.infoWindow.show(event.mapPoint);
      // map.infoWindow.move(event.mapPoint);
      
      $('.contentPane').children().remove(); // will remove the #markerPopup or #popupForm in case there was any
      $('.contentPane').append(popupForm);
      
      //changes telephone format:
      $('#telephone').inputmask({
        mask: telephones,
        greedy: false, 
        definitions: { '#': { validator: "[0-9]", cardinality: 1}} 
      });

      $('#popupForm').submit(function(e) {
        e.preventDefault(); // prevent submit from reloading page
        socket.emit('newpin', {
          'firstName': $("#firstName").val(),
          'lastName': $("#lastName").val(),
          'telephone': $("#telephone").val(),
          'email': $("#email").val(),
          'bloodType': $("select").val(),
          'latitude': event.mapPoint.getLatitude(),
          'longitude': event.mapPoint.getLongitude(),
          'ip': ip,
          'id': socket.id
        })
        $('.contentPane').children().remove();
        $('.contentPane').append('<h4>You can click again as a patient and edit this item using this password:</h4><h5>' + socket.id + ' </h5>')
        socket.emit('getnewpins', {}); // update pins array with new donor
      });
      addpins(); // adds the last created pin
    }
  })

  // Insert the blood markers/pins: ------------------------------------------------------------
  function addpins(){ //all inside of this function because it all needs map.on('ready') to work

    var picSymbol = new PictureMarkerSymbol(
      './img/blood_drop.png', 40, 40);

    for (var i = 0; i < pins.length; i++) {
      if (pins[i].longitude && pins[i].latitude){ // check if data has the coordinates correctly
        var geometryPoint = new Point(pins[i].longitude, pins[i].latitude);
        var newGraphic = new Graphic(geometryPoint, picSymbol, map.spatialReference);
        newGraphic.setAttributes(pins[i]);
        map.graphics.setInfoTemplate();
        map.graphics.add(newGraphic);
      }
    }

        map.graphics.on('click', function(ev){
      if (document.getElementById("Patient")){ // only patients can see the markerPopup

        var attributes = ev.graphic.attributes; // we are not worried here if an attribute is not present, since the donor form requires all fields
        map.infoWindow.show(ev.screenPoint);
        var markerPopup = '<h3 id="markerPopup">DONOR INFO</h3><h5>Name: ' + attributes.firstName + ' ' + attributes.lastName + '</h5><h5>Phone: <button id="hidePhone">Click to see</button><span id="hiddenPhone">' + attributes.telephone + '</span></h5><h5>Email: <button id="hideEmail">Click to see</button><span id="hiddenEmail">' + attributes.email + '</span></h5><h5>Blood Type: ' + attributes.bloodType + '</h5><button id="edit">edit</button> <button id="delete">delete</button>';

        $('.contentPane').children().remove(); // will remove the #popupForm or #markerPopup in case there was any
        $('.contentPane').append(markerPopup);
        
        //the below methods will hide/show the phone and emails (made separately so the user has to click on each to show them)
        $('#hiddenPhone').hide();
        $('#hidePhone').show();
        $('#hidePhone').click(function(){
          $('#hidePhone').hide();
          $('#hiddenPhone').show();
        });

        $('#hiddenEmail').hide();
        $('#hideEmail').show();
        $('#hideEmail').click(function(){
          $('#hideEmail').hide();
          $('#hiddenEmail').show();
        });

        //Edit/delete functionality ---------------------------------------------------------
        //The id chosen for users to edit their posts is their socket id, saved in the database
        
        /*There are clear security issues with this code, however it is just a simplification of
          this functionality */

        $('#edit').click(function(e){
          $('.contentPane').children().remove();
          var editPopup = '<h3>Edit</h3><h5>Password:</h5><form id="editPopup"><input type="text" id="password" /><button type="submit">submit</button></form>'
          $('.contentPane').append(editPopup);
          $('#editPopup').submit(function(event){
            event.preventDefault(); // prevent submit from reloading page

            if ($('#password').val() === attributes.id){
              var newPopupForm = `<form id=newPopupForm>
                <h5>First Name</h5><input id="firstName" type='text' value=` + attributes.firstName + ` required/></br>
                <h5>Last Name</h5><input id="lastName" type='text' value=` + attributes.lastName + ` required/></br>
                <h5>Telephone</h5><input id="telephone" type='text' value=` + attributes.telephone + ` pattern='^[\\d() +-]+$'/></br>
                <h5>Email</h5><input id="email" type='text' value=` + attributes.email + ` pattern='^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'/></br>
                <h5>Blood Type</h5>
                <select>
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
                </select>
                <input type='submit' value='Submit'>
                </form>`
              $('.contentPane').children().remove();
              $('.contentPane').append(newPopupForm);
              //changes telephone format:
              $('#telephone').inputmask({
                mask: telephones,
                greedy: false, 
                definitions: { '#': { validator: "[0-9]", cardinality: 1}} 
              });

              $('#newPopupForm').submit(function(e) {
                e.preventDefault(); // prevent submit from reloading page
                socket.emit('editpin', {
                  'firstName': $("#firstName").val(),
                  'lastName': $("#lastName").val(),
                  'telephone': $("#telephone").val(),
                  'email': $("#email").val(),
                  'bloodType': $("select").val(),
                  'latitude': attributes.latitude,
                  'longitude': attributes.longitude,
                  'ip': ip,
                  'id': attributes.id
                })
                $('.contentPane').children().remove();
                map.infoWindow.hide();
                socket.emit('getnewpins', {}); // update pins array with new donor
              });
              addpins(); // changes the last edited pin (recursive function in this case)
            }
          })
        });

        $('#delete').click(function(e){
          $('.contentPane').children().remove();
          var editPopup = '<h3>Delete</h3><h5>Password:</h5><form id="editPopup"><input type="text" id="password" /><button type="submit">submit</button></form>'
          $('.contentPane').append(editPopup);
          $('#editPopup').submit(function(event){
            event.preventDefault(); // prevent submit from reloading page

            if ($('#password').val() === attributes.id){
              socket.emit('deletepin', {id: attributes.id});
              $('.contentPane').children().remove();
              map.infoWindow.hide();
            }
          })
        })
      }
    });
  }

  map.on('load', addpins);
});