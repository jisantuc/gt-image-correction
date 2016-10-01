
function getChart() {
    var xVals = ['x'];
    for (var i = 0; i <= 255; i++) {
        xVals.push(i);
    }
    var chart = c3.generate({
        size: {
            width: 440,
            height: 240
        },
        interaction: {enabled: false},
        axis: {y: {show: false}, x: {show: true}},
        tooltip: {show: false},
        point: {show: false},
        legend: {show: false},
        data: {
            x: 'x',
            colors: {
                red: '#ff0000',
                green: '#00bf00',
                blue: '#0000ff'
            },
            columns: [
                xVals
            ]
        }
    });
    return chart;
}
