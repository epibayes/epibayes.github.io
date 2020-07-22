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
        d3.select(this).text(active ? 'Showing case count' : 'Showing cases per 100,000 people')
        updateHexGrid()
        updateLegend(metric)
        generateEmbedURL()
    })
    // confirmed cases only toggle
    d3.select('#toggle-probable-cases').on('click', function() { // updateToggle
        let active = d3.select(this).classed('active')
        status = active ? 'CP' : 'C'
        d3.select(this).text(active ? 'Showing confirmed and probable cases' : 'Showing confirmed cases only')
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
    const embeddableLink = `<iframe width="550px" height="500px" src="https://covidmapping.org/embedmap.html?${query_string}"></iframe>`
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