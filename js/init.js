// initialize variables
const countyTileset = 'mi_counties'
const countyTilesetSrc = {
    type: 'vector',
    url: 'mapbox://epibayes.ckcqn77d00igv2an5hvegcds2-307nw',
}
const hex20Tileset = 'hexagons_20km_polygons'
const hex20TilesetSrc = {
    type: 'vector',
    url: 'mapbox://epibayes.ckcqmt8ey0paa2bt69m7pyfdn-6k0du',
}
const hex10Tileset = 'hexagons_10km_polygons'
const hex10TilesetSrc = {
    type: 'vector',
    url: 'mapbox://epibayes.ckcqms42v0gv229qk9hakzxbe-70thk',
}

const hexLayers = ['hex20','hex10']
const dateParser = d3.timeParse('%y%m%d')
const sliderFmt = d3.timeFormat('%B %e')
const numFmt = d3.format(',')
const N = 7
const zoomThreshold = 8.5
let minDate, maxDate, caseData, sliderValue;
let playing = false;
let delay = 100;
let alpha = 0.65;
let metrics = ['cumulative','cumulativerate','weekly','weeklyrate'];
let metric = 'cumulative';
let status = 'CP';
let startDate = "03/08/2020"
let endDate = "07/14/2020"

let colorScales = {
    'cases' : {
        'cumulative': d3.scaleSequentialLog(d3.interpolateYlOrRd).domain([1, 100000]).clamp(true),
        'cumulativerate': d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 1000]).clamp(true),
        'weekly': d3.scaleSequentialLog(d3.interpolateYlGnBu).domain([1, 1000]).clamp(true),
        'weeklyrate': d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 400]).clamp(true),
    },
    'symptoms': {
        'cumulative': d3.scaleSequentialLog(d3.interpolateBlues).domain([1, 10000]).clamp(true),
        'cumulativerate': d3.scaleSequential(d3.interpolateBlues).domain([0, 1]).clamp(true),
        'weekly': d3.scaleSequentialLog(d3.interpolatePurples).domain([1, 1000]).clamp(true),
        'weeklyrate': d3.scaleSequential(d3.interpolatePurples).domain([0, 1]).clamp(true),
    },
}
