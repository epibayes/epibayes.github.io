// UI Related Functions
function initSlider() {
    const days = d3.timeDay.count(minDate, maxDate)
    date2idx = d3.scaleLinear()
        .domain([minDate, maxDate])
        .range([0, days])
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
        updateCaseChart()
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
            updateCaseChart2(CP=false)
            d3.select('#CP-total-text').text(status === 'CP' ? 'MI Symptoms responses' : 'COVID-like illness responses')
        } else {
            updateCaseChart2(CP=false)
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

function updateDateRange(startDate, endDate) {
    setDateRange(startDate, endDate)
}

function setDateRange(startDate, endDate) {
    d3.select('#startdate').text(sliderFmt(startDate))
    d3.select('#enddate').text(sliderFmt(endDate))
}

function updateTotalCustomDate(startDate, endDate) {
    const idx0 = Math.round(date2idx(startDate))
    const idx1 = Math.round(date2idx(endDate))
    const subset = caseData.get(status).slice(idx0, idx1+1)
    const total = d3.sum(subset, d => d.daily)
    d3.select('#total').text(numFmt(total))
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

function updateTotalInfoCustom(startDate=x.domain()[0], endDate=x.domain()[1]) {
    updateTotalCustomDate(startDate, endDate)
    updateDateRange(startDate, endDate)
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