var map = L.map('map').setView([37.7576793, -122.50764], 13);

var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>' });
layer.addTo(map);

var hostname = 'http://trout.internal.azavea.com:9000';

var redGamma = 0.8;
var greenGamma = 0.8;
var blueGamma = 0.8;
var min = 4000;
var max = 15176;
var contrast = 30;
var brightness = 15;
var url = hostname + '/tiles/{z}/{x}/{y}/?';
var landsatLayer = L.tileLayer(hostname + url, {maxZoom: 19,
                                                minZoom: 13,
                                                tms: true, attribution: 'Raster Foundry' });
landsatLayer.addTo(map);


function updateLandsatLayer() {
    map.removeLayer(landsatLayer);
    var url = hostname + '/tiles/{z}/{x}/{y}/?' +
            'redGamma=' + redGamma + '&' +
            'blueGamma=' + blueGamma + '&' +
            'greenGamma=' + greenGamma + '&' +
            'contrast=' + contrast + '&' +
            'brightness=' + brightness + '&' +
            'min=' + min + '&' +
            'max=' + max ; //'&';
    landsatLayer = L.tileLayer(url, { tms: true, attribution: 'GeoTrellis' });
    landsatLayer.addTo(map);

}

$( "#slider-redGamma" ).slider({
    min: 0,
    max: 2,
    value: .8,
    step: 0.1,
    slide: function( event, ui ) {
        $( "#redGamma" ).val( ui.value );
        redGamma = ui.value;
        updateLandsatLayer();
    }
});
$( "#redGamma" ).val( $( "#slider-redGamma" ).slider( "value" ) );

$( "#slider-greenGamma" ).slider({
    min: 0,
    max: 2,
    value: .8,
    step: 0.1,
    slide: function( event, ui ) {
        $( "#greenGamma" ).val( ui.value );
        greenGamma = ui.value;
        updateLandsatLayer();
    }
});
$( "#greenGamma" ).val( $( "#slider-greenGamma" ).slider( "value" ) );

$( "#slider-blueGamma" ).slider({
    min: 0,
    max: 2,
    value: .8,
    step: 0.1,
    slide: function( event, ui ) {
        $( "#blueGamma" ).val( ui.value );
        blueGamma = ui.value;
        updateLandsatLayer();
    }
});
$( "#blueGamma" ).val( $( "#slider-blueGamma" ).slider( "value" ) );

$( "#slider-brightness" ).slider({
    min: 0,
    max: 60,
    value: 15,
    step: 1,
    slide: function( event, ui ) {
        $( "#brightness" ).val( ui.value );
        brightness = ui.value;
        updateLandsatLayer();
    }
});
$( "#brightness" ).val( $( "#slider-brightness" ).slider( "value" ) );

$( "#slider-contrast" ).slider({
    min: 0,
    max: 60,
    value: 30,
    step: 0.5,
    slide: function( event, ui ) {
        $( "#contrast" ).val( ui.value );
        contrast = ui.value;
        updateLandsatLayer();
    }
});
$( "#contrast" ).val( $( "#slider-contrast" ).slider( "value" ) );

$( "#slider-minmax" ).slider({
    min: 0,
    max: 20000,
    values: [4000, 15176],
    step: 10,
    slide: function( event, ui ) {
        $( "#minmax" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
        min = ui.values[0];
        max = ui.values[1];
        updateLandsatLayer();
    }
});
$( "#minmax" ).val( $( "#slider-minmax" ).slider( "values", 0 ) +
      " - " + $( "#slider-minmax" ).slider( "values", 1 ) );




// With JQuery
// $("#gamma").slider();
// $("#gamma").on("slide", function(slideEvt) {
// 	$("#gammaSliderVal").text(slideEvt.value);
// });

// // Without JQuery
// var slider = new Slider("#gamma");
// slider.on("slide", function(slideEvt) {
//     $("#gammaSliderVal").text(slideEvt.value);
// });
