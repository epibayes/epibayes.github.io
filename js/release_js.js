function makeCaseChart() {
    console.log("making case chart")
    // set the dimensions and margins of the graph
    let margin = { top: 15, right: 10, bottom: 30, left: 10 },
        W = 490,
        H = 150,
        width = W - margin.left - margin.right,
        height = H - margin.top - margin.bottom;

    // set the ranges
    x = d3.scaleTime()
        .domain(d3.extent(caseData.get(status), d => d.date))
        .range([0, width]);
    y = d3.scaleLinear()
        .domain([0, d3.max(caseData.get('CP'), d => d.value)]).nice()
        .range([height, 0]);

    // define the line
    valueline = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.date))
        .y(d => y(d.value));

    let svg = d3.select("#casechart").append("svg")
        .attr('id', 'chartsvg')
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")        
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the valueline path.
    svg.append("path")
        .datum(caseData.get(status))
        .attr("class", "daily-cases")
        .attr("d", valueline);

    svg.append('circle')
        .data(Array(caseData.get(status)[getSliderValue()]))
        .attr('id', 'current-circle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value))
        .attr('r', 4)

    xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0)
    yAxis = d3.axisRight(y).ticks(4)

    formatAxis = g => g
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr('x2', width)
            .attr("stroke-opacity", 0.3)
            .attr("stroke-dasharray", "2,4"))
        .call(g => g.selectAll(".tick text")
            .attr('x', 0)
            .attr("dy", -4)
        )

    // Add the X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr('class', 'y-axis')
        .attr("transform", `translate(${0},0)`)
        .call(yAxis)
        .call(formatAxis)

    svg.append('text')
        .attr('id', 'yaxislabel')
        .attr('x', 34)
        .attr('y', y(30000))
        .attr('dy', "-.35em")
        .attr('font-size', '0.7em')
        .text('cumulative cases')
    
    setYAxisLabel()
}

function updateCaseCircle(k, anim=true) {
    let circle = d3.select('#current-circle').datum(caseData.get(status)[k])
    if (anim && k > 0) {
        circle.transition().duration(delay)
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
    } else {
        circle.attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
    }
}

function updateCaseChart(metric, CP=false) {
    let T = 750
    const stat = metric.replace('rate','')
    caseData.get(status).map(d => { d.value = d[stat]; return d })
    let key = CP ? 'CP' : status
    y.domain([0, d3.max(caseData.get(key), d => d.value)]).nice()
    d3.select('.y-axis').call(yAxis).call(formatAxis)
    setYAxisLabel()
    d3.select('.daily-cases').datum(caseData.get(status))
      .transition().duration(T)
        .attr('d', valueline)
    d3.select('#current-circle').datum(caseData.get(status)[sliderValue])
      .transition().duration(T)
        .attr('cy', d => y(d.value))
}

function setYAxisLabel() {
    let ticks = d3.selectAll('.y-axis .tick')
    ticks.each((d,i) => { if (i === ticks.size()-1) updateYAxisLabel(d) })    
}

function updateYAxisLabel(d) {
    d3.select('#yaxislabel')
        .attr('y', y(d)) 
        .text(metric === 'cumulative' ? 'cumulative cases' : 'weekly cases')    
}// initialize variables
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
// D3 Legend Variables
const w = 20
const h = 120
let tickValues = {
    'cumulative': [10, 100, 1000, 10000],
    'weekly': [10, 100],
    'cumulativerate': [200, 400, 600, 800],
    'weeklyrate': [100, 200, 300],
}

// Legend Related Functions
function addLegend() {
    // Setup our svg layer that we can manipulate with d3
    let container = map.getCanvasContainer()
    let svg = d3.select(container).append("svg")
        .attr('id', 'mapbox-legend')

    const xpos = 5
    const ypos = 345

    legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${xpos},${ypos})`)

    let defs = legend.append("defs");

    linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    let colorScale = getColorScale()
    linearGradient.selectAll("stop")
      .data(getLinearGradientData(colorScale))
      .join("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legend.append('rect')
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'url(#linear-gradient)')

    legendScaleLog = d3.scaleLog()
        .domain(colorScale.domain())
        .range([h, 0])
    legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([h, 0])
    legendYAxisLog = d3.axisRight(legendScaleLog)
        .ticks(3, ',')
        .tickSize(0)
        .tickValues(tickValues[metric])
    legendYAxis = d3.axisRight(legendScale)
        .ticks(3, 'd')
        .tickSize(0)
        .tickValues(tickValues[metric])
    let yAxis = metric.includes('rate') ? legendYAxis : legendYAxisLog

    legendAxis = legend.append('g')
        .attr("class", `legend-axis`)
        .attr("transform", `translate(${w + 2},0)`)
        .call(yAxis)

    legend.select('path.domain').remove()
}

function getLinearGradientData(colorScale) {
    return colorScale.ticks().map((d, i, arr) => ({ offset: `${100 * i / arr.length}%`, color: convert2rgba(colorScale(d)) }))
}

function convert2rgba(rgb) {
    return rgb.replace('rgb','rgba').replace(')',`, ${alpha})`)
}

function updateLegend(metric) {
    let yAxis;
    let colorScale = getColorScale()
    linearGradient.selectAll("stop")
      .data(getLinearGradientData(colorScale))
      .join("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    if (metric.includes('rate')) {
        legendScale.domain(colorScale.domain())
        yAxis = legendYAxis
    } else {
        legendScaleLog.domain(colorScale.domain())
        yAxis = legendYAxisLog
    }
    yAxis.tickValues(tickValues[metric])
    legendAxis.call(yAxis)
    legend.select('path.domain').remove()
}

function LegendText(d, i, arr) {
    return i < arr.length - 1 ? `${numFmt(d)}-${numFmt(arr[i+1].__data__)}` : `${numFmt(d)}+`
}
async function initDashboard(embedMap=false) {
    const data20 = await d3.csv('data/weeklycum_cases_20km_with_rateper100k.csv', type)
    const data10 = await d3.csv('data/weeklycum_cases_10km_with_rateper100k.csv', type)
    const dateExtent = d3.extent(data20, d => d.date)
    minDate = dateExtent[0]
    maxDate = dateExtent[1]
    if (!embedMap) insertDates(minDate, maxDate)

    caseData = await d3.csv('data/dailyweeklycum_cases_statewide.csv', d3.autoType)
    caseData.map((d,i) => {
        d.date = dateParser(d.date)
        d.value = d.cumulative
        d.idx = i
        return d
    })
    caseData = d3.group(caseData, d => d.status)

    hexfillTemplate = { // Object to contain the fill expressions for hex grid
        'weekly': Array(2),
        'cumulative': Array(2),
        'weeklyrate': Array(2),
        'cumulativerate': Array(2),
    }
    hexfill = {
        'CP': hexfillTemplate,
        'C': hexfillTemplate,
    }
    hexdata = {
        'hex20': d3.group(data20, d => d.status, d => +d.date, d => d.index),
        'hex10': d3.group(data10, d => d.status, d => +d.date, d => d.index),
    }

    initSlider()
    initRadio()
    initToggles()

    setDateRange(minDate, maxDate)
    if (!embedMap) updateTotal(metric)
    initMap()
    if (!embedMap) makeCaseChart()
}

// Mapbox Related Functions
function initMap() {
    metrics.forEach(metric => updateFillExpression(metric, maxDate))

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FvYSIsImEiOiJjazkxc2QyMTcwMHp4M2ZubnByeWwycjYwIn0.HMO_9ZdIJxTIXLl_zqyuHw';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-86.04, 44.65],
        zoom: 5.48,
        maxBounds: [[-100, 36], [-75, 52]],
        attributionControl: false,
    })
    map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        autocomplete: true,
        countries: 'us',
        bbox: [-90.4, 41.7, -82.4, 48.2],
        marker: { color: 'orange' },
        mapboxgl: mapboxgl,
        placeholder: 'Search Map',
    }), 'top-left');
    // map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: 'University of Michigan Public Health',
    }));

    map.on('load', () => { // load from tileset directly
        map.addLayer({
            "id": "hex20",
            "type": "fill",
            "source": hex20TilesetSrc,
            "source-layer": hex20Tileset,
            "maxzoom": zoomThreshold,
            "layout": { 'visibility': 'visible' },
            "paint": {
                "fill-color": hexfill[status][metric][0],
                "fill-opacity": alpha,
            },
        });
        map.addLayer({
            "id": "hex10",
            "type": "fill",
            "source": hex10TilesetSrc,
            "source-layer": hex10Tileset,
            "minzoom": zoomThreshold,
            "layout": { 'visibility': 'visible' },
            "paint": {
                "fill-color": hexfill[status][metric][1],
                "fill-opacity": alpha,
            },
        });
        map.addLayer({
            "id": "county-border",
            "type": "line",
            "source": countyTilesetSrc,
            "source-layer": countyTileset,
            "layout": { 'visibility': 'visible' },
            "paint": {
                "line-width": 1,
                "line-color": "#fff",
            },
        });
        hexLayers.forEach(layerId => {
            map.on('click', layerId, e => createPopup(e))
            map.on('mouseenter', layerId, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', layerId, () => map.getCanvas().style.cursor = '');
        })
        addLegend()
        animateMap()
    });
}

function updateHexLayers(metric) {
    hexLayers.forEach((d,i) => updateHexFill(d, hexfill[status][metric][i]))
}

function updateHexFill(layerId, scale) {
    map.setPaintProperty(layerId, 'fill-color', scale)
}

function getHexLayer() {
    return map.getZoom() < zoomThreshold ? 'hex20' : 'hex10'
}

function updateFillExpression(key, day=getDateFromSlider()) {
    const colorScale = getColorScale(key)
    const column = key
    hexLayers.forEach((h,i) => {
        hexfill[status][key][i] = createFillExpression(hexdata[h].get(status).get(+day), colorScale, column)
    })
}

function createFillExpression(data, colorScale, column) {
    let expression = ['match', ['get', 'index']];
    data.forEach((d, idx) => expression.push(idx, colorScale(d[0][column])));
    expression.push(colorScale(0)) // unknown case
    return expression
}

function getColorScale() {
    return colorScales[metric]
}

function createPopup(e) {
    hexIdx = e.features[0].properties.index;
    const data = getMetricValues(hexIdx)
    d3.select('.mapboxgl-popup').remove()
    popup = new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(createTableTemplate())
        .addTo(map)
    setPopupData(data)
}

function updatePopup() {
    if (typeof popup === 'undefined' || !popup.isOpen()) return
    const data = getMetricValues(hexIdx)
    setPopupData(data)
}

function setPopupData(data) {
    d3.selectAll('.tabledata').data(data).text(d => d)
}

function getMetricValues(idx) {
    const day = getDateFromSlider()
    const h = getHexLayer()
    const array = hexdata[h].get(status).get(+day).get(idx)
    let data = metrics.map((col,i) => array === undefined ? '0'
        : ( (i%2 == 0) && (d3.range(1,6).includes(array[0][col])) ) ? '≤5'
        : numFmt(array[0][col])
    )
    // assigns ≤ to rate values where appropriate
    data.forEach((d,i) => { if ((d.includes('≤')) && (i%2 == 0)) data[i+1] = `≤${data[i+1]}` })
    data.splice(0, 0, sliderFmt(day))
    return data
}

function createTableTemplate(data) {
    return `<table>
    <tr>
      <th class="tabledata"></th>
      <th>Cases</th>
      <th id="popup-header">per 100,000 people</th>
    </tr>
    <tr>
      <td>Cumulative</td>
      <td class="tabledata" align="right"></td>
      <td class="tabledata" align="right"></td>
    </tr>
    <tr>
      <td>Previous Week</td>
      <td class="tabledata" align="right"></td>
      <td class="tabledata" align="right"></td>
    </tr></table>`
}

// Data Wrangling Related Functions
function type(d) {
    d.index = +d.index
    d.date = dateParser(d.date)
    d.weekly = +d.weekly || 0
    d.cumulative = +d.cumulative
    d.weeklyrate = +d.weeklyrate || 0
    d.cumulativerate = +d.cumulativerate
    return d
}

function filterByDate(data, date) {
    return data.filter(d => +d.date === +date)
}

function insertDates(minDate, maxDate) {
    d3.select('#first-date').text(sliderFmt(minDate))
    d3.select('#last-date').text(sliderFmt(maxDate))
    d3.select('#update-date').text(d3.timeFormat('%B %e, %Y')(d3.timeDay.offset(maxDate)))
}

// Animation Functions
function animateMap() {
    let timer;
    d3.select('#play').on('click', function () {
        sliderValue = parseInt(d3.select('#slider').property('value'))
        let sliderMax = parseInt(d3.select('#slider').property('max'))
        if (!playing) {
            timer = setInterval(function () {
                sliderValue = sliderValue > sliderMax ? 0 : sliderValue+1
                if (sliderValue > sliderMax) return // temp fix
                d3.select('#slider').property('value', sliderValue)
                updateMapInfo()
                updateCaseCircle(sliderValue)
            }, delay);
            d3.select(this).html('Stop');
            playing = true;
        } else {
            clearInterval(timer);
            d3.select(this).html('Play cases over time');
            playing = false;
        }
    });
}
const dateParser = d3.timeParse('%y%m%d')
const numFmt = d3.format(',.0f')

async function makeTimeline(weekBin=false) {
    // Get data
    daily = await d3.csv('data/dailyweeklycum_cases_statewide.csv', d3.autoType)
    daily = daily.filter(d => d.status === 'CP')
    daily.map((d,i) => {
        d.date = dateParser(d.date)
        d.avg7 = i > 6 ? +d.weekly/7 : +d.weekly/(i+1)
        return d
    })
    insertDuration()
    weekly = daily.filter((d,i) => i%7 === 6)

    let [minDate, maxDate] = d3.extent(daily, d => d.date)
    let annotations = await d3.csv('data/timeline.csv', d => {
        d.date = d3.timeParse('%m/%d/%y')(d.date)
        return d
    })
    let grps = d3.group(annotations, d => +d.date)

    // Set the dimensions and margins of the graph
    const margin = {top: 10, right: 80, bottom: 30, left: 80};
    const W = 600;
    const width = W - margin.left - margin.right;
    const H = 200;
    const height = H - margin.top - margin.bottom;

    // append timetable svg
    const svg = d3.select('#timeline').append("svg")
        .attr("viewBox", `-20 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
      .append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)

    let x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])

    let y = d3.scaleLinear()
        .domain([0, weekBin ? 13000 : 2500])
        .range([height, 0])

    let ticks = [0,500,1000,1500,2000],
        xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0),
        yAxis = d3.axisRight(y)
            .ticks(5)
            .tickValues(weekBin ? ticks.map(d => d*5) : ticks)
            .tickSize(3)

    svg.append("g")
      .selectAll(".bar")
      .data(weekBin ? weekly : daily)
      .join("rect")
        .attr('class', 'bar')
        .attr('x', d => x(weekBin ? d3.timeHour.offset(d3.timeDay.offset(d.date,-6),3) : d3.timeHour.offset(d.date)))
        .attr('y', d => y(weekBin ? d.weekly : d.daily))
        .attr('width', weekBin ? x(583200*1000)-x(0) : x(79200*1000)-x(0))
        .attr('height', d => height - y(weekBin ? d.weekly : d.daily))
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", (d,i) => {
            txt = `${d3.timeFormat('%B %e')(d.date)}<br>Cases: ${numFmt(weekBin ? d.weekly : d.daily)}`
            txt += weekBin ? '' : `<br>7-day Avg: ${numFmt(d.avg7)}`
            return txt
        })

    svg.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    svg.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', `translate(${width},0)`)
        .call(yAxis) 

    svg.select('.y-axis .domain').remove()

    svg.append('text')
        .attr('id', 'ylabel')
        .attr('x', width+2)
        .attr('y', 5)
        .text(weekBin ? 'Weekly Cases' : 'Daily Cases')

    // Moving average section
    let mvAvgLine = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d3.timeHour.offset(d.date,12)))
        .y(d => weekBin ? y(d.weekly) : y(d.avg7))

    let avgLine = svg.append('path')
        .datum(daily)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine)

    // Annotation section
    svg.selectAll('.milestone')
      .data(annotations)
      .join('line').lower()
        .attr('class', 'milestone')
        .attr('x1', d => x(d3.timeHour.offset(d.date,12)))
        .attr('x2', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y1', d => y(daily[d3.timeDay.count(minDate,d.date)]['daily'] + 30) )
        .attr('y2', d => {
            col = weekBin ? 'y3' : 'y2'
            return grps.get(+d.date).length > 1 ? y(d[col] - 100) : y(d[col])
        })

    svg.selectAll('.milestone-text')
      .data(annotations)
      .join('text')
        .attr('class', d => `milestone-text ${d.date < new Date(2020,3,7) ? 'end' : ''}`)
        .attr('x', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y', d => weekBin ? y(d.y3) - 3 :y(d.y2) - 3)
        .text(d => d.annotation)
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", d => `<b>${d3.timeFormat('%B %e')(d.date)}</b><br>${d.description}`)     

    const x0 = x(maxDate)-80, y0 = 10;
    svg.append('line')
        .attr('class', 'avgLine')
        .attr('x1', x0)
        .attr('x2', x0+20)
        .attr('y1', y0)
        .attr('y2', y0)

    svg.append('text')
        .attr('class', 'milestone-text')
        .attr('x', x0+25)
        .attr('y', y0)
        .attr('dy', '0.35em')
        .text('7-day average')
        .style('font-size', '0.5em')

    svg.append('rect').lower()
        .attr('class', 'rect')
        .attr('x', x(new Date(2020,2,24)))
        .attr('width', x(new Date(2020,5,2)) - x(new Date(2020,2,24)))
        .attr('height', height)

    svg.append('text')
        .attr('class', 'rect-text')
        .attr('x', x(new Date(2020,2,26)))
        .attr('y', 10)
        .text('Stay Home, Stay Safe period')
          
    // Add bootstrap tooltip
    $(function() {
        $('[data-toggle="tooltip"]').tooltip()
    })
}

function insertDuration() {
    const months = Math.floor(d3.timeDay.count(new Date(2020,0,22), new Date) / 30.4)
    d3.select('#duration').text(months)
}

function insertAvgCase() {
    let value = Math.round(daily[daily.length-1]['weekly']/7/50)*50
    d3.select('#avg-case').text(value)
}

makeTimeline(weekBin=false)
// UI Related Functions
function initSlider() {
    const days = d3.timeDay.count(minDate, maxDate)
    dateSlider = d3.scaleLinear()
        .domain([0, days])
        .range([minDate, maxDate])
    sliderValue = dateSlider.invert(maxDate)
        
    d3.select('#slider')
        .attr('max', days)
        .attr('value', days)
        .on('input', function() { // updateSlider
            sliderValue = this.value
            updateMapInfo()
            updateCaseCircle(this.value, anim = false)
        })
}

function initRadio() {
    // change choropleth fill based on radio button
    d3.selectAll('.metric').on('change', function() { // updateRadio
        metric = this.value
        let active = d3.select('#toggle-count-rate').classed('active')
        metric = active ? metric + 'rate' : metric
        updateHexGrid()
        updateLegend(metric)
        updateTotalInfo()
        updateCaseChart(metric)
        generateEmbedURL()
    })
}

function initToggles() {
    // case rate toggle
    d3.select('#toggle-count-rate').on('click', function() { // updateToggle
        let active = d3.select(this).classed('active')
        metric = active ? metric.replace('rate','') : metric + 'rate'
        d3.select(this).text(active ? 'Show cases per 100,000 people' : 'Show case count')
        updateHexGrid()
        updateLegend(metric)
        generateEmbedURL()
    })
    // confirmed cases only toggle
    d3.select('#toggle-probable-cases').on('click', function() { // updateToggle
        let active = d3.select(this).classed('active')
        status = active ? 'CP' : 'C'
        d3.select(this).text(active ? 'Show confirmed cases only' : 'Show confirmed and probable cases')
        d3.select('#CP-total-text').text(active ? 'confirmed & probable cases' : 'confirmed cases')
        updateHexGrid()
        updateLegend(metric)
        updateTotalInfo()
        updateCaseChart(metric, CP=true)
        updatePopup()
        generateEmbedURL()
    })
    generateEmbedURL()
}

function generateEmbedURL() {
    const query_string = `status=${status}&metric=${metric}`
    const embeddableLink = `<iframe width="550px" height="500px" src="https://covidmapping.org/embedmap.html?${query_string}></iframe>`
    d3.select('#embeddable').text(embeddableLink)
}

function updateDateRange(metric) {
    const endDate = getDateFromSlider()
    const key = metric.replace('rate','')
    startDate = key === 'cumulative' ? minDate : d3.max([minDate, d3.timeDay.offset(endDate, -(N-1))])
    setDateRange(startDate, endDate)
}

function setDateRange(startDate, endDate) {
    d3.select('#startdate').text(sliderFmt(startDate))
    d3.select('#enddate').text(sliderFmt(endDate))
}

function updateTotal(metric) {
    const key = metric.replace('rate','')
    const total = caseData.get(status)[sliderValue][key]
    d3.select('#total').text(numFmt(total))
}

function getDateFromSlider() {
    return d3.timeDay(dateSlider(sliderValue))
}

function getSliderValue() {
    return d3.select('#slider').property('value')
}

function updateMapInfo() {
    updateHexGrid()
    updatePopup()
    updateTotalInfo()
}

function updateHexGrid() {
    updateFillExpression(metric)
    updateHexLayers(metric)    
}

function updateTotalInfo() {
    updateTotal(metric)
    updateDateRange(metric)    
}

function toggleEmbed() {
    let iframeDiv = d3.select('#embeddable');
    if (iframeDiv.style('display') === 'block'){
        iframeDiv.style('display','none');
        d3.select('#embedToggle').html('<i class="fa fa-code" aria-hidden="true"></i> Embed Map')
        d3.select('#copyButton').style('display','none')
    } else {
        iframeDiv.style('display','block')
        d3.select('#copyButton').style('display','inline-block')
        d3.select('#embedToggle').html('Hide Window')
    }
}

function copyEmbed() {
    let theCode = d3.select('#embeddable').text();
    d3.select('textarea').remove()
    let textArea = document.createElement('textarea');
    textArea.textContent = theCode;
    document.body.append(textArea);
    textArea.select();
    document.execCommand('copy');
    alert('Copied.');
}
//# sourceMappingURL=release.map