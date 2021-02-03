function makeCaseChart2() {

    N = getNumDays()
    chartData = newChartData()

    // Define date label formats
    let formatHour = d3.timeFormat("%I %p"),
        formatDay = d3.timeFormat("%a %e"),
        formatWeek = d3.timeFormat("%b %e"),
        formatMonth = d3.timeFormat("%b"),
        formatYear = d3.timeFormat("%Y");

    function multiDateFormat(date) {
        return (d3.timeDay(date) < date ? formatHour
            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
            : d3.timeYear(date) < date ? formatMonth
            : formatYear)(date);
    }

    // set the dimensions and margins of the graph
    const H = 200, W = 490;
    margin = {top: 15, right: 15, bottom: 80, left: 15}
    width = W - margin.left - margin.right
    height = H - margin.top - margin.bottom
    margin2 = {top: H-50, right: margin.right, bottom: 30, left: margin.left}
    height2 = H - margin2.top - margin2.bottom

    // append timetable svg
    svg = d3.select("#casechart").append("svg")
        .attr('id', 'chartsvg')
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")

    // set the ranges
    x2 = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, width])
    y2 = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.total)]).nice()
        .range([height2, 0])
    x = d3.scaleTime()
        .domain(x2.domain())
        .range(x2.range())
    y = d3.scaleLinear()
        .domain(y2.domain())
        .range([height, 0])

    // sets ticks for time series chart
    if (datatype === "symptoms"){
        xAxis = d3.axisBottom(x)
            .ticks(8)
            .tickFormat(multiDateFormat)
            .tickSizeOuter(0)
        yAxis = d3.axisRight(y)
            .ticks(5)
        xAxis2 = d3.axisBottom(x2)
            .ticks(8)
            .tickFormat(multiDateFormat)
            .tickSizeOuter(0)
    } else {
        xAxis = d3.axisBottom(x)
            .ticks(4)
            .tickFormat(multiDateFormat)
            .tickSizeOuter(0)
        yAxis = d3.axisRight(y)
            .ticks(4)
        xAxis2 = d3.axisBottom(x2)
            .ticks(4)
            .tickFormat(multiDateFormat)
            .tickSizeOuter(0)
    }

    formatAxis = g => g
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr('x2', width)
            .attr("stroke-opacity", 0.3)
            .attr("stroke-dasharray", "2,4"))
        .call(g => g.selectAll(".tick text")
            .attr('x', 0)
            .attr("dy", -4)
        )

    // Add brush in x-dimension
    brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed)
        .on("end", brushended) // add brush snapping

    // define the focus moving avg
    movingAvg1 = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.total))

    // define the context moving avg
    movingAvg2 = d3.area()
        .x(d => x2(d.date))
        .y0(y2(0))
        .y1(d => y2(d.total))

    // focus is the micro level view
    focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", `translate(${margin.left},${margin.top})`)

    // context is the macro level view
    context = svg.append("g")
        .attr("class", "context")
        .attr("transform", `translate(${margin2.left},${margin2.top})`);

    // add the focus moving avg line path
    avgLine1 = focus.append("path")
        .datum(chartData)
        .attr("class", "avgLine")
        .attr("d", movingAvg1)

    circles = focus.selectAll('pts')
      .data(chartData)
      .join('circle')
        .attr('class', 'pts')
        .attr('r', 8)
        .attr('opacity', 0)
        .attr('cursor', 'pointer')

    // add the focus x-axis
    focus.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    // add the focus y-axis
    focus.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .call(formatAxis)

    focus.append('text')
        .attr('id', 'yaxislabel')
        .attr('x', 50)
        .attr('y', y(20000))
        .attr('dy', "-.35em")
        .attr('font-size', '0.7em')

    // add the context moving avg line path
    avgLine2 = context.append("path")
        .datum(chartData)
        .attr("class", "sumLine")
        .attr("fill", "steelblue")
        .attr("d", movingAvg2)

    // add the context x-axis
    context.append("g")
        .attr("class", "x2-axis")
        .attr("transform", `translate(0,${height2})`)
        .call(xAxis2);

    // add the context brush
    const beginDate = minDate
    xBrush = context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [x2(beginDate), x2(maxDate)]) // initialize brush selection

    updateYAxis()
    updateLines()
    addDateRangePicker()

    // clipping rectangle
    focus.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("x", 0)
        .attr("width", width-0)
        .attr("height", height)
};

// updates timetable graph
function updateCaseChart2(updateAxis=true) {
    // calculate new dataset
    chartData = newChartData()
    // update chart
    if (updateAxis) updateYAxis()
    updateLines()
};

function updateLines() {
    addTooltip()
    avgLine1.datum(chartData).attr("d", movingAvg1)
    avgLine2.datum(chartData).attr("d", movingAvg2)
    focus.selectAll('.pts')
      .data(chartData)
      .join('circle')
        .attr('title', d => `${numFmt(d.total)} cases<br>${getDateRange(d)}`)
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.total))
}

function getDateRange(d) {
    return `${tooltipFmt(d3.max([d3.timeDay.offset(d.date,-N+1), minDate]))} to ${tooltipFmt(d.date)}`
}

function newChartData() {
    return movingSum(caseData.get(status), N)
}

function updateYAxis(rescale=true) {
    setYDomain(rescale)
    d3.select('.y-axis')
        .call(yAxis)
        .call(formatAxis)
    setYAxisTicks()
}

function setYDomain(rescale) {
    const idx0 = Math.round(date2idx(x.domain()[0]))
    const idx1 = Math.round(date2idx(x.domain()[1]))     
    y.domain(d3.extent(chartData.slice(idx0,idx1+1), d => d.total)).nice()
    y2.domain([0, d3.max(chartData, d => d.total)]).nice()
}

function setYAxisTicks() {
    let ticks = d3.selectAll('.y-axis .tick')
    ticks.each((d,i) => { 
        console.log("d and i at tick are", d, i) 
        if (i === ticks.size()-1) setYAxisLabel(d) 
    })    
}

function setYAxisLabel(d) {
    if (datatype === "symptoms"){
        d3.select('#yaxislabel')
            .attr('y', y(d)) 
            .text(N === 7 ? 'weekly responses' : 'cumulative responses')    
    } else {
        d3.select('#yaxislabel')
            .attr('y', y(d)) 
            .text(N === 7 ? 'weekly cases' : 'cumulative cases')    
    }

}

// brush function
function brushed(updateYAx=false) {
    const selection = d3.event.selection || x2.range(); // default brush selection
    x.domain(selection.map(x2.invert)); // new focus x-domain
    focus.selectAll(".avgLine")
        .attr("d", movingAvg1);
    focus.select(".x-axis")
        .call(xAxis)
    updateTotalInfo()
    if (updateYAx) {
        updateYAxis()
        updateLines()
    }
};

// brush snapping function
function brushended() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) { // Empty selection returns default brush
        brushed(updateYAx=true); 
        return
    }
    const dateRange = d3.event.selection.map(x2.invert);
    let dayRange = dateRange.map(d3.timeDay.round);
    // If empty when rounded, use floor & ceil instead.
    // if (dayRange[0] >= dayRange[1]) {
    //     dayRange[0] = d3.timeDay.floor(dateRange[0]);
    //     dayRange[1] = d3.timeDay.offset(dayRange[0],1);
    // }
    x.domain(dayRange)
    xBrush.transition()
        .call(brush.move, dayRange.map(x2));
    updateMapInfo()
    updateYAxis()
    updateLines()
};

function chooseCustomDate(beginDate, endDate) {
    xBrush.call(brush.move, [x2(beginDate), x2(endDate)])
}

// calculates simple moving sum over N days
// assumes no missing dates (best dataset format)
function movingSum(data, N) {
    return data.map((row, idx, total) => {
        const startIdx = Math.max(0, idx-N+1)
        const endIdx = idx
        const movingWindow = total.slice(startIdx, endIdx+1)
        return {
            date: row.date,
            total: d3.sum(movingWindow, d => d.daily),
        };
    });
};

function addDateRangePicker() {
    $(function() {
        $('.drpbutton').daterangepicker({ 
            opens: 'left',
            minDate: minDate,
            maxDate: maxDate,
            ranges: {
                'View Entire Period': [minDate, maxDate],
                'View Last 7 Days': [d3.timeDay.offset(maxDate,-6), maxDate],
                'View Last 14 Days': [d3.timeDay.offset(maxDate,-13), maxDate],
                'View Last 30 Days': [d3.timeDay.offset(maxDate,-29), maxDate],
            }
        }, function(start, end) {
            chooseCustomDate(start.toDate(), d3.timeDay(end.toDate()) ) // move time to beginning of day instead of the end
            updateCaseChart2()
        });
    })
}

function addTooltip(){
    $(function() {
        $('.pts').tooltip('dispose')
        $('.pts').tooltip({
            'html': true,
            'data-placement': 'top',
            'data-toggle': 'tooltip',
            'trigger': 'click',
            'animated': 'fade',
        }).on('mouseout', function() {
            $(this).tooltip('hide')
        })
    })
}
