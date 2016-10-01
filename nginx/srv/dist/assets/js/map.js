
var loadMap = function () {
    // Leaflet map
    var mymap = L.map('map', {
        zoomControl: false,
        maxZoom: 19,
        minZoom: 11
    }).setView([37.5576793, -122.20764], 12);

    var cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        maxZoom: 19,
        minZoom: 11
    });

    var commandCenter = L.control({position: 'topright'});

    commandCenter.onAdd = function () {
        var div = L.DomUtil.create('div', 'map-control-panel');

        div.innerHTML =
            '<button class="btn btn-default"><i class="icon-resize-full"></i></button>';
        return div;
    };

    var zoom = L.control.zoom({ position: 'topright' });

    cartoPositron.addTo(mymap);
    commandCenter.addTo(mymap);
    zoom.addTo(mymap);

    $zoom = $('.leaflet-control-zoom'),
    $mpc  = $('.map-control-panel');

    $($mpc).prepend($zoom);
    return mymap;
};
