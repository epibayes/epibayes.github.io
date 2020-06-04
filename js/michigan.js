async function initDashboard(embedMap=false) {
    const data20 = await d3.csv('data/weeklycum_cases_20km_with_rateper100k.csv', type)
    const data10 = await d3.csv('data/weeklycum_cases_10km_with_rateper100k.csv', type)    
    const dateExtent = d3.extent(data20, d => d.date)
    minDate = dateExtent[0]
    maxDate = dateExtent[1]
    if (!embedMap) insertDates(minDate, maxDate)

    incidenceData = await d3.csv('data/dailyweeklycum_cases_statewide.csv', d3.autoType)
    incidenceData.map((d,i) => {
        d.date = dateParser(d.date)
        d.value = d.cumulative
        d.idx = i
        return d
    })

    hexfill = { // Object to contain the fill expressions for hex grid
        'weekly': Array(2),
        'cumulative': Array(2),
        'weeklyrate': Array(2),
        'cumulativerate': Array(2),
    }
    hexdata = {
        'hex20': d3.group(data20, d => +d.date, d => d.index),
        'hex10': d3.group(data10, d => +d.date, d => d.index),
    }

    initSlider()
    initRadio()
    initToggle()

    setDateRange(minDate, maxDate)
    if (!embedMap) updateTotal(metric)
    initMap()
    if (!embedMap) makeIncidenceChart()
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
                "fill-color": hexfill[metric][0],
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
                "fill-color": hexfill[metric][1],
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
    hexLayers.forEach((d, i) => updateHexFill(d, hexfill[metric][i]))
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
        hexfill[key][i] = createFillExpression(hexdata[h].get(+day), colorScale, column)
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
    const array = hexdata[h].get(+day).get(idx)
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
                updateIncidenceCircle(sliderValue)
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