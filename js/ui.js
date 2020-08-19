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

function initRadio(embedmap = false) {   
    // time period radio button
    if (embedmap){
        d3.selectAll('.period').on('click', function() { // updateRadio
            const timePeriod = d3.select(this).attr("value")
            if (metric.includes(timePeriod)) return;
            metric =  timePeriod
            updateHexGrid()
            updateLegend(metric)
        })
    } else {
        d3.selectAll('.time-period a').on('click', function() { // updateRadio
            const timePeriod = d3.select(this).attr("value")
            if (metric.includes(timePeriod)) return;
            const rateRadio = d3.select('#radio-case-rate').property('checked')
            metric = rateRadio ? timePeriod + 'rate' : timePeriod
            updateHexGrid()
            updateLegend(metric)
            updateTotalInfo()
            updateCaseChart(metric)
            generateEmbedURL()
            let dbutton = d3.select('#dropdownMenuButton');
            let ccase = d3.select('#ccase');
            let wcase = d3.select('#wcase');
    
            if (timePeriod === 'weekly'){
                dbutton.html(wcase.text()) 
                ccase.classed('active', false)
                wcase.classed('active', true)
            } else {
                dbutton.html(ccase.text())
                ccase.classed('active', true)
                wcase.classed('active', false)
            }
    
        })

    }
    
    // case count rate radio button
    d3.selectAll('.count-rate').on('click', function() { // updateRadio
        const timePeriod = metric.replace('rate','')
        const caseRadio = this.value
        metric = timePeriod + caseRadio
        updateHexGrid()
        updateLegend(metric)
        generateEmbedURL()
    })
    // confirmed probable cases radio button
    d3.selectAll('.case-type').on('click', function() { // updateRadio
        status = this.value
        d3.select('#cp-total-text').text(status === 'cp' ? 'confirmed & probable cases' : 'confirmed cases')
        updateHexGrid()
        updateLegend(metric)
        updateTotalInfo()
        updateCaseChart(metric, cp=true)
        updatePopup()
        generateEmbedURL()
    })
}

function generateEmbedURL() {
    // const query_string = `status=${status}metric=${metric.replace('rate','')}`
    const query_string = `status=${status}&metric=${metric}`
    const embeddableLink = `<iframe width="550px" height="550px" src="https://covidmapping.org/embedmap.html?${query_string}"></iframe>`
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