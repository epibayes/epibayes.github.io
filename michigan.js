async function initDashboard(filename) {
    // const bin20 = await d3.csv('binned_case_20_km_hex_index.csv', type2)
    // const bin10 = await d3.csv('binned_case_10_km_hex_index.csv', type2)
    const bin20 = await d3.csv('weeklycum_cases_20km.csv', type)
    const bin10 = await d3.csv('weeklycum_cases_10km.csv', type)    
    data20 = bin20.filter(d => d.weekly != null)
    data10 = bin10.filter(d => d.weekly != null)
    let dateExtent = d3.extent(data20, d => d.date)
    minDate = dateExtent[0]
    maxDate = dateExtent[1]
    // data20f = dateSliderFilter(data20, maxDate)
    // data10f = dateSliderFilter(data10, maxDate)
    // incidenceData = Array.from(
    //     d3.rollup(data20, v => d3.sum(v, d => d.n), d => +d.date),
    //     ([key, value]) => ({ 'date': new Date(key), 'daily': value })
    // ).sort((a, b) => d3.ascending(a.date, b.date))
    // incidenceData.map((d, i, arr) => {
    //     d.cum = d3.sum(arr.slice(0, i + 1), d => d.daily)
    //     d.value = d.cum
    //     d.idx = i
    //     return d
    // })
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
    hexcases = { // Object to contain the data for hex grid
        'caseweek': Array(2),
        'casecum': Array(2),
    }

    initSlider()
    let metrics = ['caseweek', 'casecum']
    metrics.forEach(key => updateFillExpression(key))

    setDateRange(minDate, maxDate)
    updateTotal(metric)
    // updateLastWeek()
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
        center: [-84.597, 44.48],
        // center: [-86.34,45.01],
        zoom: 5.68,
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

function createPopup(e) {
    const idx = e.features[0].properties.index;
    k = map.getZoom() < zoomThreshold ? 0 : 1
    let value = hexcases[metric][k].get(idx) 
    let cases = value === undefined ? 0
        : value === '<=5' ? '≤5'
        : numFmt(hexcases[metric][k].get(idx))
    let text = `Cases: ${cases}`
//    text += `<br>${idx}`
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(text)
        .addTo(map);
}

function updateFillExpression(key) {
    let sliderValue = d3.select('#slider').property('value')
    let day = d3.timeDay(dateSlider(sliderValue))
    let dataArrays = [data20.filter(d => +d.date === +day), data10.filter(d => +d.date === +day)]
    let colorScale = getColorScale(key)
    if (key === 'casecum') {
        dataArrays.forEach((data, i) => {
            hexcases[key][i] = groupbyHex(data, key)
            hexfill[key][i] = createFillExpression(hexcases[key][i], colorScale)
        })
    } else {
        dataArrays.forEach((data, i) => {
//            let pastweek = pastweekFilter(data, N)
            hexcases[key][i] = groupbyHex(data, key)
            hexfill[key][i] = createFillExpression(hexcases[key][i], colorScale)
        })
    }

}

function createFillExpression(data, colorScale) {
    let expression = ['match', ['get', 'index']];
    data.forEach((n, idx) => 
    expression.push(idx, n === '<=5' ? colorScale(5) : colorScale(n)));
    expression.push(colorScale(0)) // unknown case
    return expression
}

function getColorScale(key = metric) {
    return key === 'casecum' ? colorCaseCum : colorCaseWeek
}

// Data Wrangling Related Functions
function type(d) {
    d.index = +d.index
    d.date = d3.timeParse('%y%m%d')(d.date)
    d.weekly = d.weekly === '<=5' ? d.weekly : +d.weekly
    d.cumulative = d.cumulative === '<=5' ? d.cumulative : +d.cumulative
    return d
}

// function pastweekFilter(data, N) {
//     const endDate = d3.max(data, d => d.date)
//     return data.filter(d => d.date > d3.timeDay.offset(endDate, -N))
// }

function groupbyHex(data, key) {
    let column = key === 'casecum' ? 'cumulative' : 'weekly'
    return new Map(data.map(d => [d.index, d[column]]))
}

function dateSliderFilter(data, endDate) {
    return data.filter(d => d.date <= endDate)
}

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
