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
    })
}

function initToggles() {
    d3.select('#toggle-count-rate').on('click', function() { // updateToggle
        let active = d3.select(this).classed('active')
        metric = active ? metric.replace('rate','') : metric + 'rate'
        d3.select(this).text(active ? 'Show cases per 100,000 people' : 'Show case count')
        updateHexGrid()
        updateLegend(metric)
    })
    d3.select('#toggle-probable-cases').on('click', function() { // updateToggle
        let active = d3.select(this).classed('active')
        status = active ? 'CP' : 'C'
        d3.select(this).text(active ? 'Show confirmed cases' : 'Show confirmed and probable cases')
        updateHexGrid()
        updateLegend(metric)
        updateTotalInfo()
        updateCaseChart(metric, CP=true)
        updatePopup()
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