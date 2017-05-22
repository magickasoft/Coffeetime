/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    browser: null,
    connectionError:false,
    position:null,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.startBrowser();
    },
    startBrowser: function() {
        app.browser = cordova.InAppBrowser.open('https://orders.feedmytum.com', '_blank', 'location=no,zoom=no,hardwareback=yes,hidden=yes,disallowoverscroll=yes,toolbar=no');
        app.browser.addEventListener('loadstop', function(){
            //app.browser.executeScript({'code':'$("#StartPageSearchForm").prepend("<a id=\'fixLocationClick\'>Get my location</a>"); $("#fixLocationClick").click(function () { $(\'#geoIcon\').addClass( "pulse animated" ); navigator.geolocation.getCurrentPosition( function(position){ var geoLat = position.coords.latitude; var geoLong = position.coords.longitude; var i = 0; $.getJSON(\'http://maps.googleapis.com/maps/api/geocode/json?latlng=\'+geoLat+\',\'+geoLong+\'&sensor=true\', function (response) { $.each(response, function (item, value) { if(item == "results") { var geoCityName = value[3].address_components[2].long_name; $(\'#geoIcon\').removeClass( "pulse animated" ); $(\'#geoLocationCityOutput\').html(geoCityName); $(\'#geoLocationModal\').modal(\'show\'); $(\'#linkSearchCityWithLocation\').attr("href", "http://www.dailycato.de/stadt/?searchcity=" + geoCityName); } }); }); }, function(){ $(\'#geoIcon\').removeClass( "pulse animated" );  alert("Lokalisierung fehlgeschlagen"); } ) });'});
            app.browser.show();
        });
        app.browser.addEventListener('loaderror', function(){
            document.getElementsByClassName('loader')[0].innerHTML = "Error!<br/>Please, check your internet connection, and retry.<div><div class='icon-reload'></div></div>";
            document.getElementsByClassName('icon-reload')[0].addEventListener('click', function(){
                app.connectionError = false;
                document.getElementsByClassName('loader')[0].innerHTML = "Loading...";
                app.startBrowser();
            });
            app.connectionError = true;
            app.browser.close();
        });
        app.browser.addEventListener('exit', function(){
            if(!app.connectionError){
                navigator.app.exitApp();
            }
        });
    }

};

app.initialize();