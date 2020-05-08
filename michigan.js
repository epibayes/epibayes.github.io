async function initDashboard(filename) {
    const data20 = await d3.csv('weeklycum_cases_20km.csv', type)
    const data10 = await d3.csv('weeklycum_cases_10km.csv', type)    
    const dateExtent = d3.extent(data20, d => d.date)
    minDate = dateExtent[0]
    maxDate = dateExtent[1]

    incidenceData = await d3.csv('dailyweeklycum_cases_statewide.csv', d3.autoType)
    incidenceData.map((d,i) => {
        d.date = d3.timeParse('%y%m%d')(d.date)
        d.value = d.cumulative
        d.idx = i
        return d
    })

    hexfill = { // Object to contain the fill expressions for hex grid
        'caseweek': Array(2),
        'casecum': Array(2),
    }
    hexdata = {
        'hex20': d3.group(data20, d => +d.date, d => d.index),
        'hex10': d3.group(data10, d => +d.date, d => d.index),
    }

    initSlider()
    let metrics = ['caseweek', 'casecum']
    metrics.forEach(key => updateFillExpression(key))

    setDateRange(minDate, maxDate)
    updateTotal(metric)
    initMap()
    makeIncidenceChart()
}

initDashboard()

// Mapbox Related Functions
function initMap() {
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
        // change choropleth fill based on radio button
        d3.selectAll('.metric').on('change', function () {
            metric = this.value
            updateFillExpression(metric)
            updateHexLayers(metric)
            updateDateRange(metric)
            updateTotal(metric)
            updateLegend(metric)
            updateIncidenceChart(metric)
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

function toggleMapLayer(layerId = 'county-border') {
    const visibility = map.getLayoutProperty(layerId, 'visibility')
    let value = visibility === 'visible' ? 'none' : 'visible'
    map.setLayoutProperty(layerId, 'visibility', value)
    let label = visibility === 'visible' ? 'Show Counties' : 'Hide Counties'
    d3.select('#county-borders').text(label)
}

function getHexLayer() {
    return map.getZoom() < zoomThreshold ? 'hex20' : 'hex10'
}

function updateFillExpression(key) {
    let day = getDateFromSlider()
    let colorScale = getColorScale(key)
    let column = key === 'casecum' ? 'cumulative' : 'weekly'
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

function getColorScale(key = metric) {
    return key === 'casecum' ? colorCaseCum : colorCaseWeek
}

function createPopup(e) {
    hexIdx = e.features[0].properties.index;
    const h = getHexLayer()
    const casecum = getMetricValue(h, hexIdx, 'cumulative')
    const caseweek = getMetricValue(h, hexIdx, 'weekly')
    const html = createTablePopup([casecum, caseweek])
    popup = new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
}

function createTablePopup(data) {
    let day = getDateFromSlider()
    return `<table>
    <tr><th id="popup-date">${d3.timeFormat('%b %d')(day)}</th><th>Cases</th></tr>
    <tr><td>Cumulative</td><td id="popup-cum" align="right">${data[0]}</td></tr>
    <tr><td>Previous Week</td><td id="popup-week" align="right">${data[1]}</td></tr>
    </table>`
}

function updatePopup() {
    if (typeof popup === 'undefined' || !popup.isOpen()) return
    let day = getDateFromSlider()
    const h = getHexLayer()
    const casecum = getMetricValue(h, hexIdx, 'cumulative')
    const caseweek = getMetricValue(h, hexIdx, 'weekly')
    d3.select('#popup-date').text(d3.timeFormat('%b %d')(day))
    d3.select('#popup-cum').text(casecum)
    d3.select('#popup-week').text(caseweek)
}

function getMetricValue(h,idx,column) {
    let day = getDateFromSlider()
    let value = hexdata[h].get(+day).get(idx)
    return value === undefined ? 0
        : value[0][column] <= 5 ? '≤5'
        : numFmt(value[0][column])
}

// Data Wrangling Related Functions
function type(d) {
    d.index = +d.index
    d.date = d3.timeParse('%y%m%d')(d.date)
    d.weekly = +d.weekly || 0
    d.cumulative = +d.cumulative
    return d
}

function filterByDate(data, date) {
    return data.filter(d => +d.date === +date)
}

// Animation Functions
function animateMap() {
    let timer;
    d3.select('#play').on('click', function () {
        let k = parseInt(d3.select('#slider').property('value'))
        if (!playing) {
            timer = setInterval(function () {
                k = dateSlider(k) > maxDate ? 0 : k + 1
                d3.select('#slider').property('value', k)
                updateMap(k)
                updateIncidenceCircle(k)
            }, delay);
            d3.select(this).html('Stop');
            playing = true;
        } else {
            clearInterval(timer);
            d3.select(this).html('Play');
            playing = false;
        }
    });
}
