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

function initDropdown() {
    // time period dropdown button
    d3.selectAll('#period a').on('click', function() { // updateRadio
        const timePeriod = d3.select(this).attr("value")
        if (metric.includes(timePeriod)) return;
        const rateRadio = datatype === 'cases' ? d3.select('#select-case-rate').property('checked')
            : d3.select('#response-proportion').property('checked') ? true 
            : false
        metric = rateRadio ? timePeriod + 'rate' : timePeriod
        updateHexGrid()
        updateLegend(metric)
        updateTotalInfoCustom()
        updateCaseChart(metric)
        generateEmbedURL()
    })
}

function initRadio() {
    // case count rate radio button
    if (datatype === 'cases') {
        d3.selectAll('.count-rate').on('click', function() { // updateRadio
            const timePeriod = metric.replace('rate','')
            const caseRadio = this.value
            metric = timePeriod + caseRadio
            updateHexGrid()
            updateLegend(metric)
            generateEmbedURL()
        })
    }
    // confirmed probable cases radio button OR mi symptoms radio buttons
    d3.selectAll('.case-type').on('click', function() { // updateRadio
        if (this.value === 'rate') {
            metric = metric + 'rate'
            status = 'C'
        } else {
            metric = metric.replace('rate','')
            status = this.value
        }
        updateHexGrid()
        updateLegend(metric)
        updateTotalInfoCustom()
        if (datatype === 'symptoms') {
            updateCaseChart(metric, CP=false)
            d3.select('#CP-total-text').text(status === 'CP' ? 'MI Symptoms responses' : 'COVID-like illness responses')
        } else {
            updateCaseChart(metric, CP=true)
            d3.select('#CP-total-text').text(status === 'CP' ? 'confirmed & probable cases' : 'confirmed cases')
        }
        updatePopup()
        generateEmbedURL()
    })
}

function generateEmbedURL() {
    const query_string = `status=${status}&metric=${metric}`
    const embeddableLink = `<iframe width="550px" height="500px" src="https://covidmapping.org/embedmap.html?${query_string}"></iframe>`
    d3.select('#embeddable').text(embeddableLink)
}

function updateDateRange() {
    const endDate = getDateFromSlider()
    const key = metric.replace('rate','')
    startDate = key === 'cumulative' ? minDate : d3.max([minDate, d3.timeDay.offset(endDate, -(N-1))])
    setDateRange(startDate, endDate)
}

function setDateRange(startDate, endDate) {
    d3.select('#startdate').text(sliderFmt(startDate))
    d3.select('#enddate').text(sliderFmt(endDate))
}

// function updateTotal() {
//     const key = metric.replace('rate','')
//     const total = caseData.get(status)[sliderValue][key]
//     d3.select('#total').text(numFmt(total))
// }

function updateTotalCustomDate(startDate, idx1) {
    const idx0 = Math.round(dateSlider.invert(startDate))
    const array = caseData.get(status).slice(idx0, parseInt(idx1)+1)
    const total = d3.sum(array, d => d.daily)
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
    updateTotalInfoCustom()
}

function updateHexGrid() {
    updateFillExpression(metric)
    updateHexLayers(metric)    
}

function updateTotalInfo() {
    updateTotal()
    updateDateRange()    
}

function updateTotalInfoCustom() {
    updateTotalCustomDate(x.domain()[0], sliderValue)
    updateDateRange()
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