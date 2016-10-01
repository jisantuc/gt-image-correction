$(function() {

    var gammaRange = {min: 0, max: 2.5};
    var gammaPips = {
        mode: 'values',
        values: [0, 0.5, 1, 1.5, 2, 2.5],
        density: 4,
        format: wNumb({decimals: 1})
    };

    var originalLandsatParams = {
        redGamma: 0.8,
        greenGamma: 0.8,
        blueGamma: 0.8,
        min: 4000,
        max: 15176,
        contrast: 30,
        brightness: 15
    };


    var landsatParams = {
        redGamma: 0.8,
        greenGamma: 0.8,
        blueGamma: 0.8,
        min: 4000,
        max: 15176,
        contrast: 30,
        brightness: 15
    };

    var originalSentinelParams = {
        redGamma: 1.24,
        greenGamma: 0.8,
        blueGamma: 0.71,
        min: 0,
        max: 7864,
        contrast: 65.23,
        brightness: 57
    };

    var sentinelParams = {
        redGamma: 1.24,
        greenGamma: 0.8,
        blueGamma: 0.71,
        min: 0,
        max: 7864,
        contrast: 65.23,
        brightness: 57
    };

    var activeLayer = 'landsat';

    var landsatUrl = '/tiles/landsat-8/{z}/{x}/{y}/';
    var landsatLayer = L.tileLayer(landsatUrl, {tms: true, attribution: 'Raster Foundry'});

    var sentinelUrl = '/tiles/sentinel-2/{z}/{x}/{y}/';
    var sentinelLayer = L.tileLayer(sentinelUrl, {tms: true, attribution: 'Raster Foundry'});

    var map = loadMap();
    landsatLayer.addTo(map);

    /*
     * Bootstrap plugins
     */
    $('[data-toggle="tooltip"]').tooltip();

    /*
     * Prototype functionality
     */
    $('[data-toggle-hide]').on('click', function(el){
        el.preventDefault;

        $target = $(this).attr('data-target');
        $($target).toggleClass('hide');
    });

    function constructQueryParameters(params) {
        return '?' + 'redGamma=' + params.redGamma + '&' +
            'blueGamma=' + params.blueGamma + '&' +
            'greenGamma=' + params.greenGamma + '&' +
            'contrast=' + params.contrast + '&' +
            'brightness=' + params.brightness + '&' +
            'min=' + params.min + '&' +
            'max=' + params.max;
    }

    function updatePublishURL(path) {
        var fullPath = 'https://demo.rasterfoundry.com' + path;
        $('#map-url').attr('value', fullPath);
    }

    function updateSentinelLayer() {
        var url = sentinelUrl + constructQueryParameters(sentinelParams);
        sentinelLayer.setUrl(url);
        sentinelLayer.addTo(map);
        updatePublishURL(url);
        map.removeLayer(landsatLayer);
    }

    function updateLandsatLayer() {
        var url = landsatUrl + constructQueryParameters(landsatParams);
        landsatLayer.setUrl(url);
        landsatLayer.addTo(map);
        updatePublishURL(url);
        map.removeLayer(sentinelLayer);
    }


    function updateLayers() {
        if (activeLayer === 'landsat') {
            updateLandsatLayer();
        } else {
            updateSentinelLayer();
        }
    }

    var lazyUpdateLayers = _.debounce(updateLayers, 300);

    // Gamma Correction
    function gammaFilter(elementId, usePips) {
        var gammaFilter = document.getElementById(elementId);
        var config = {
            start: 0.8,
            connect: false,
            range: gammaRange
        };
        if (usePips) {
            config.pips = gammaPips;
        }

        return noUiSlider.create(gammaFilter, config);
    }
    var redGammaSlider = gammaFilter('red-gamma');
    redGammaSlider.on('update', function (values) {
        var updateParams = (activeLayer === 'landsat') ? landsatParams : sentinelParams;
        updateParams.redGamma = values[0];
        lazyUpdateLayers();
    });

    var blueGammaSlider = gammaFilter('blue-gamma');
    blueGammaSlider.on('update', function (values) {
        var updateParams = (activeLayer === 'landsat') ? landsatParams : sentinelParams;
        updateParams.blueGamma = values[0];
        lazyUpdateLayers();
    });

    var greenGammaSlider = gammaFilter('green-gamma', true);
    greenGammaSlider.on('update', function (values) {
        var updateParams = (activeLayer === 'landsat') ? landsatParams : sentinelParams;
        updateParams.greenGamma = values[0];
        lazyUpdateLayers();
    });


    function filterBrightness() {
        var brightness = document.getElementById('brightness');
        return noUiSlider.create(brightness, {
            start: 15,
            connect: false,
            range: {min: 0, max: 100},
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 4,
                stepped: true
            }
        });
    }
    var brightnessSlider = filterBrightness();
    brightnessSlider.on('update', function (values) {
        var updateParams = (activeLayer === 'landsat') ? landsatParams : sentinelParams;
        updateParams.brightness = parseInt(values[0]);
        lazyUpdateLayers();
    });

    function filterContrast() {
        var contrast = document.getElementById('contrast');
        return noUiSlider.create(contrast, {
            start: 30,
            connect: false,
            range: {min: 0, max: 100},
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 100,
                stepped: true
            }
        });
    }
    var contrastSlider = filterContrast();
    contrastSlider.on('update', function (values) {
        var updateParams = (activeLayer === 'landsat') ? landsatParams : sentinelParams;
        updateParams.contrast = values[0];
        lazyUpdateLayers();
    });

    function filterMinMax() {
        var minmax = document.getElementById('minmax');
        return noUiSlider.create(minmax, {
            start: [ 4000, 15176 ],
            connect: true,
            behaviour: 'tap-drag',
            step: 1,
            range: {min: 0, max: 24000},
            pips: {
                mode: 'count',
                values: 8,
                format: wNumb({
                    edit: function (a) {
                        var s = a.toString().substring(0, 2);
                        if (s.endsWith('0')) {
                            return s.substring(0, 1) + 'K';
                        }
                        return s.substring(0, 1) + '.' + s.substring(1, 2) + 'K';
                    }
                })
            }
        });
    }
    var minMaxFilter = filterMinMax();
    minMaxFilter.on('update', function (values) {
        var updateParams = (activeLayer === 'landsat') ? landsatParams : sentinelParams;
        updateParams.min = parseInt(values[0]);
        updateParams.max = parseInt(values[1]);
        lazyUpdateLayers();
    });


    // sentinelLayer.addTo(map);

    updateLayers();

    function updateSliders(params) {
        minMaxFilter.set([params.min, params.max]);
        contrastSlider.set(params.contrast);
        brightnessSlider.set(params.brightness);
        redGammaSlider.set(params.redGamma);
        greenGammaSlider.set(params.greenGamma);
        blueGammaSlider.set(params.blueGamma);
    }

    $('#landsat-8').click(function () {
        $(this).addClass('active');
        $('#sentinel-2').removeClass('active');
        activeLayer = 'landsat';
        updateSliders(landsatParams);
        lazyUpdateLayers();
    });

    $('#sentinel-2').click(function () {
        $(this).addClass('active');
        $('#landsat-8').removeClass('active');
        activeLayer = 'sentinel';
        updateSliders(sentinelParams);
        lazyUpdateLayers();
    });

    $('#reset-params').click(function () {
        if (activeLayer === 'landsat') {
            $.extend(landsatParams, originalLandsatParams);
            updateSliders(landsatParams);
        } else {
            $.extend(sentinelParams, originalSentinelParams);
            updateSliders(sentinelParams);
        }
        lazyUpdateLayers();
    });
});
