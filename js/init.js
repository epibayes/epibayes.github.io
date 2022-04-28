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
// const schoolTileset = 'school_districts'
// const schoolTilesetSrc = {
//     type: 'vector',
//     url: 'mapbox://epibayes.ckduippsj1bj324p9iacozz9d-6as5y',
// }

const datafiles = {
    'cases': {
        'weeklycum_20km': 'https://gist.githubusercontent.com/choisteph/1ee6eac84d6c9c1c4cea22bd046c1113/raw',
        'weeklycum_10km': 'https://gist.githubusercontent.com/choisteph/9a7d7e541969c00b252526b8b5cd3b13/raw',
        'dailyweeklycum_statewide': 'https://gist.githubusercontent.com/choisteph/494b84d649a51bfb764e4792567ccb0f/raw',
    },
    'symptoms': {
        'weeklycum_20km': 'https://gist.githubusercontent.com/choisteph/155c3f691a975d901be675311d9937c4/raw',
        'weeklycum_10km': 'https://gist.githubusercontent.com/choisteph/2bada37d1c9c04b428c7a26aaa54a317/raw',
        'dailyweeklycum_statewide': 'https://gist.githubusercontent.com/choisteph/bf6d330edb7a92c84aabf53700bfc176/raw',
    },
    'embed':{
        'hex_lastday': 'https://gist.githubusercontent.com/choisteph/7763a24cb0abc2a75f38e54180e5b639/raw/92133e66132b6504798bf31db7bc508092f03aba/hex_lastday.csv'
    }
}

const hexLayers = ['hex20','hex10']
const dateParser = d3.timeParse('%y%m%d')
const daterangeFmt = d3.timeFormat('%B %e, %Y')
const tooltipFmt = d3.timeFormat('%b %e')
const numFmt = d3.format(',.0f')
const proportionFmt = d3.format('.2f')
const zoomThreshold = 8.5
let minDate, maxDate, caseData, riskStatus;
let playing = false;
let delay = 100;
let alpha = 0.65;
let metrics = ['cumulative','cumulativerate','weekly','weeklyrate'];
let metric = 'weekly';

let colorScales = {
    'cases' : {
        'cumulative': d3.scaleSequentialLog(d3.interpolateYlOrRd).domain([1, 100000]).clamp(true),
        'cumulativerate': d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 24000]).clamp(true),
        'weekly': d3.scaleSequentialLog(d3.interpolateYlGnBu).domain([1, 400]).clamp(true),
        'weeklyrate': d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 400]).clamp(true),
    },
    'symptoms': {
        'cumulative': d3.scaleSequentialLog(d3.interpolateBlues).domain([1, 500000]).clamp(true),
        'cumulativerate': d3.scaleSequential(d3.interpolateBlues).domain([0, 2]).clamp(true),
        'weekly': d3.scaleSequentialLog(d3.interpolatePurples).domain([1, 4000]).clamp(true),
        'weeklyrate': d3.scaleSequential(d3.interpolatePurples).domain([0, 2]).clamp(true),
    },
}
