function makeCaseChart2() {

    const chartData = movingSum(caseData.get(status), N)

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
    const H = 210, W = 490;
    margin = {top: 30, right: 10, bottom: 80, left: 0}
    width = W - margin.left - margin.right
    height = H - margin.top - margin.bottom
    margin2 = {top: H-50, right: 10, bottom: 30, left: 0}
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

    // clipping rectangle
    focus.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("x", 0)
        .attr("width", width-0)
        .attr("height", height)

    // add the focus moving avg line path
    avgLine1 = focus.append("path")
        .datum(chartData)
        .attr("class", "avgLine")
        .attr("d", movingAvg1)

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
        .attr('x', 37)
        .attr('y', y(20000))
        .attr('dy', "-.35em")
        .attr('font-size', '0.7em')
        .text(`cases over last ${N} days`)
    setYAxisLabel()

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
    const beginDate = d3.timeDay.offset(maxDate, -N)
    xBrush = context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [x(beginDate), x(maxDate)]) // initialize brush selection
    //  xBrush.selectAll('.handle, .overlay').remove()
};

// updates timetable graph
function updateCaseChart2(updateAxis=true) {
    N = numDays()
    const chartData = movingSum(caseData.get(status), N)
    // axis transition
    if (updateAxis) {
        y2.domain([0, d3.max(chartData, d => d.total)]).nice()
        y.domain(y2.domain());
        d3.select('.y-axis')
            .call(yAxis)
            .call(formatAxis)
        setYAxisLabel()
    }
    // line transition
    const easeFunc = d3.easeQuad;
    const T = 750;
    avgLine1.datum(chartData)
        .transition().ease(easeFunc).duration(T)
        .attr("d", movingAvg1)
    avgLine2.datum(chartData)
        .transition().ease(easeFunc).duration(T)
        .attr("d", movingAvg2)
};

// brush function
function brushed() {
    const selection = d3.event.selection || x2.range(); // default brush selection
    x.domain(selection.map(x2.invert, x2)); // new focus x-domain
    focus.selectAll(".avgLine")
        .attr("d", movingAvg1);
    focus.select(".x-axis")
        .call(xAxis)
    updateTotalInfo()
};

// brush snapping function
function brushended() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) brushed(); // Empty selection returns default brush
    const dateRange = d3.event.selection.map(x2.invert);
    let dayRange = dateRange.map(d3.timeDay.round);
    // If empty when rounded, use floor & ceil instead.
    if (dayRange[0] >= dayRange[1]) {
        dayRange[0] = d3.timeDay.floor(dateRange[0]);
        dayRange[1] = d3.timeDay.offset(dayRange[0],1);
    }
    // dayRange[1] = d3.timeSecond.offset(dayRange[1],-1)
    xBrush.transition()
        .call(brush.move, dayRange.map(x2));
    updateMapInfo()
    updateDateRangePicker(dayRange);
};

function chooseCustomDate(beginDate, endDate) {
    xBrush.call(brush.move, [x2(beginDate), x2(endDate)])
}

function numDays() {
    return d3.timeDay.count(x.domain()[0],x.domain()[1]) + 1
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

function setYAxisLabel() {
    let ticks = d3.selectAll('.y-axis .tick')
    ticks.each((d,i) => { if (i === ticks.size()-1) updateYAxisLabel(d) })    
}

function updateYAxisLabel(d) {
    d3.select('#yaxislabel')
        .attr('y', y(d)) 
        .text(`cases over last ${N} days`)    
}

function addDateRangePicker() {
    $(function() {
        $('.drpbutton').daterangepicker({ 
            opens: 'left',
            minDate: new Date(2020,2,8),
            startDate: new Date(2020,2,8),
            endDate: new Date(2020,6,26),
            maxDate: new Date(2020,6,26),
            ranges: {
                '7 Day Period': [new Date(2020,6,20), new Date(2020,6,26)],
                '14 Day Period': [new Date(2020,6,13), new Date(2020,6,26)],
                '30 Day Period': [new Date(2020,5,27), new Date(2020,6,26)],
                'Cumulative': [new Date(2020,2,8), new Date(2020,6,26)],
            }
        }, function(start, end) {
            chooseCustomDate(start.toDate(), d3.timeDay(end.toDate()) ) // move time to beginning of day instead of the end
            updateCaseChart2()
        });
    })
}

function updateDateRangePicker(dayRange) {
    const [startDate, endDate] = dayRange;
    $('.drpbutton').data('daterangepicker').setStartDate(startDate);
    $('.drpbutton').data('daterangepicker').setEndDate(endDate);
}
