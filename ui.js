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
        .on('input', function() {
            sliderValue = this.value
            updateMapInfo(this.value)
            updateIncidenceCircle(this.value, anim = false)
        })
}

function initRadio() {
    // change choropleth fill based on radio button
    d3.selectAll('.metric').on('change', function() {
        metric = this.value
        let active = d3.select('#toggle-count-rate').classed('active')
        metric = active ? metric + 'rate' : metric
        updateFillExpression(metric)
        updateHexLayers(metric)
        updateLegend(metric)
        updateTotal(metric)
        updateDateRange(metric)
        updateIncidenceChart(metric)
    })
}

function initToggle() {
    d3.select('#toggle-count-rate').on('click', function() {
        let active = d3.select(this).classed('active')
        metric = active ? metric.replace('rate','') : metric + 'rate'
        d3.select(this).text(active ? 'Show Case Rate' : 'Show Case Count')
        updateFillExpression(metric)
        updateHexLayers(metric)
        updateLegend(metric)
    })
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
    const total = incidenceData[sliderValue][key]
    d3.select('#total').text(numFmt(total))
}

function getDateFromSlider() {
    return d3.timeDay(dateSlider(sliderValue))
}

function getSliderValue() {
    return d3.select('#slider').property('value')
}

function updateMapInfo(sliderValue) {
    updateFillExpression(metric)
    updateHexLayers(metric)
    updatePopup()
    updateTotal(metric)
    updateDateRange(metric)
}