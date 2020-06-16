// initialize variables
const countyTileset = 'counties_v17a-3qtxmg'
const countyTilesetSrc = {
    type: 'vector',
    url: 'mapbox://caoa.1wm38rfu',
}
const hex20Tileset = 'hexagons_20km_polygons-1hrgjz'
const hex20TilesetSrc = {
    type: 'vector',
    url: 'mapbox://caoa.cyt5711y',
}
const hex10Tileset = 'hexagons_10km_polygons-aw4rnj'
const hex10TilesetSrc = {
    type: 'vector',
    url: 'mapbox://caoa.1k14v3f6',
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

let colorCaseCum = d3.scaleSequentialLog(d3.interpolateYlOrRd)
    .domain([1, 100000])
    .clamp(true)
let colorCaseWeek = d3.scaleSequentialLog(d3.interpolateYlGnBu)
    .domain([1, 1000])
    .clamp(true)
let colorCaseCumRate = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, 1000])
    .clamp(true)
let colorCaseWeekRate = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([0, 400])
    .clamp(true)    
let colorScales = {
    'cumulative': colorCaseCum,
    'weekly': colorCaseWeek,
    'cumulativerate': colorCaseCumRate,
    'weeklyrate': colorCaseWeekRate,
}
