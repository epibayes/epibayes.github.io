async function initDashboard(embedMap=false) {
    const popdata = await d3.csv('data/hex_pop.csv', d3.autoType)
    hexpop = d3.group(popdata, d => d.hex)
    km = 20
    const weeklycum_cases_20km = 'https://gist.githubusercontent.com/choisteph/1ee6eac84d6c9c1c4cea22bd046c1113/raw/3b3f2edb3f6c725f7a96f5db5442f62437ff129e/weeklycum_cases_20km.csv'
    const data20 = await d3.csv(weeklycum_cases_20km, type)
    km = 10
    const weeklycum_cases_10km = 'https://gist.githubusercontent.com/choisteph/9a7d7e541969c00b252526b8b5cd3b13/raw/2b7daf98ff75183af0fa4c3070889e15a95d69a8/weeklycum_cases_10km.csv'
    const data10 = await d3.csv(weeklycum_cases_10km, type)
    const dateExtent = d3.extent(data20, d => d.date)
    minDate = dateExtent[0]
    maxDate = dateExtent[1]

    const dailyweeklycum_cases_statewide = 'https://gist.githubusercontent.com/choisteph/494b84d649a51bfb764e4792567ccb0f/raw/a7c75dea94f90a7f19f6ce1df7507d296a1c9fc5/dailyweeklycum_cases_statewide.csv'
    caseData = await d3.csv(dailyweeklycum_cases_statewide, d3.autoType)
    caseData.map((d,i) => {
        d.date = dateParser(d.date)
        d.value = d.cumulative
        d.idx = i
        return d
    })
    caseData = d3.group(caseData, d => d.status)

    hexfillTemplate = {} // Object to contain the fill expressions for hex grid
    metrics.forEach(metric => hexfillTemplate[metric] = Array(2))
    hexfill = {
        'CP': hexfillTemplate,
        'C': hexfillTemplate,
    }
    hexdata = {
        'hex20': d3.group(data20, d => +d.date, d => d.index),
        'hex10': d3.group(data10, d => +d.date, d => d.index),
    }

    initSlider()
    initRadio()
    generateEmbedURL()

    initMap()
    setDateRange(minDate, maxDate)

    if (!embedMap) {
        insertDates(minDate, maxDate)
        updateTotal(metric)
        makeCaseChart()
    }
}

// Mapbox Related Functions
function initMap() {
    metrics.forEach(metric => updateFillExpression(metric, maxDate))

    mapboxgl.accessToken = 'pk.eyJ1IjoiZXBpYmF5ZXMiLCJhIjoiY2tiaml0b3JpMHBuNzJ1bXk3MzdsbWs1aCJ9.YlxrUIBkuWk-VuYDDeMjBQ';
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
    const column = `${key}_${status.toLowerCase()}`
    hexLayers.forEach((h,i) => {
        hexfill[status][key][i] = createFillExpression(hexdata[h].get(+day), colorScale, column)
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
    metricsStatus = metrics.map(metric => `${metric}_${status.toLowerCase()}`)
    let data = metricsStatus.map((col,i) => array === undefined ? '0'
        : ( (i%2 == 0) && (d3.range(1,6).includes(array[0][col])) ) ? '≤5'
        : numFmt(array[0][col])
    )
    // assigns ≤ to rate values where appropriate
    data.forEach((d,i) => { if ((d.includes('≤')) && (i%2 == 0)) data[i+1] = `≤${data[i+1]}` })
    data.splice(0, 0, sliderFmt(day))
    return data
}

function createTableTemplate(data) {
    return `<table class="table table-sm table-borderless popupdetails">
    <thead>
        <tr class="headingrow">
            <th class="tabledata text-left" scope="col"></th>
            <th class="text-right" scope="col">Cases</th>
            <th class="text-right" id="popup-header" scope="col">per 100,000<br>people</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="text-left">Cumulative</td>
            <td class="tabledata text-right"></td>
            <td class="tabledata text-right"></td>
        </tr>
        <tr>
            <td class="text-left">Previous Week</td>
            <td class="tabledata text-right"></td>
            <td class="tabledata text-right"></td>
        </tr>
    </tbody>
    </table>`
}

// Data Wrangling Related Functions
function type(d) {
    const poprate = 100000 / hexpop.get(km)[d.index-1]['POP'] 
    d.index = +d.index
    d.date = dateParser(d.date)
    d.weekly_cp = +d.weekly_cp || 0
    d.cumulative_cp = +d.cumulative_cp
    d.weeklyrate_cp = d.weekly_cp * poprate
    d.cumulativerate_cp = d.cumulative_cp * poprate
    d.weekly_c = +d.weekly_c || 0
    d.cumulative_c = +d.cumulative_c
    d.weeklyrate_c = d.weekly_c * poprate
    d.cumulativerate_c = d.cumulative_c * poprate
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
