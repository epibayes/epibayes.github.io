// UI Related Functions
function initSlider() {
    let days = d3.timeDay.count(minDate, maxDate)
    dateSlider = d3.scaleLinear()
        .domain([0, days])
        .range([minDate, maxDate])

    d3.select('#slider')
        .attr('max', days)
        .attr('value', days)
        .on('input', function () {
            updateMap(this.value)
            updateIncidenceCircle(this.value, anim = false)
        })
}

function updateDateRange(metric) {
    let sliderValue = d3.select('#slider').property('value')
    endDate = d3.timeDay(dateSlider(sliderValue))
    startDate = metric === 'casecum' ? minDate : d3.max([minDate, d3.timeDay.offset(endDate, -(N - 1))])
    setDateRange(startDate, endDate)
}

function setDateRange(startDate, endDate) {
    d3.select('#startdate').text(sliderFmt(startDate))
    d3.select('#enddate').text(sliderFmt(endDate))
}

function updateTotal(metric) {
    let sliderValue = d3.select('#slider').property('value')
    let total = metric === 'casecum' ? incidenceData[sliderValue]['cumulative'] : incidenceData[sliderValue]['weekly']
    d3.select('#total').text(numFmt(total))
}

function updateMap(sliderValue) {
    updateFillExpression(metric)
    updateHexLayers(metric)
    updateDateRange(metric)
    updateTotal(metric)
}
