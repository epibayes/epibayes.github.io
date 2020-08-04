const dateParser = d3.timeParse('%y%m%d')
const numFmt = d3.format(',.0f')

async function makeTimeline(weekBin=false) {
    // Get data
    daily = await d3.csv('data/dailyweeklycum_cases_statewide.csv', d3.autoType)
    daily = daily.filter(d => d.status === 'CP')
    daily.map((d,i) => {
        d.date = dateParser(d.date)
        d.avg7 = i > 6 ? +d.weekly/7 : +d.weekly/(i+1)
        return d
    })
    insertDuration()
    weekly = daily.filter((d,i) => i%7 === 6)

    let [minDate, maxDate] = d3.extent(daily, d => d.date)
    let annotations = await d3.csv('data/timeline.csv', d => {
        d.date = d3.timeParse('%m/%d/%y')(d.date)
        return d
    })
    let grps = d3.group(annotations, d => +d.date)

    // Set the dimensions and margins of the graph
    const H = 200;
    const W = 600;

    const margin = {top: 0, right: 80, bottom: 40, left: 80};
    const width = W - margin.left - margin.right;
    const height = H - margin.top - margin.bottom;

    // Set the height and margins for the focus view (this goes under the context view)
    const margin2 = {top: H-20, right: margin.right, bottom: 0, left: margin.left}
    const height2 = H - margin2.top - margin2.bottom

    // append timetable svg
    svg = d3.select('#timeline').append("svg")
        .attr("viewBox", `-20 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
    
    // set context 
    context = svg.append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)
    
    // set focus
    timelinefocus = svg.append('g')
        .attr('transform', `translate(${margin2.left}, ${margin2.top})`)

    //set ranges
    let x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])
    let x2 = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])
    let y = d3.scaleLinear()
        .domain([0, weekBin ? 13000 : 2500])
        .range([height, 0])
    let y2 = d3.scaleLinear()
        .domain([0, weekBin ? 13000 : 2500])
        .range([height2, 0])
    
    //set ticks
    let ticks = [0,500,1000,1500,2000],
        xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0),
        yAxis = d3.axisRight(y)
            .ticks(5)
            .tickValues(weekBin ? ticks.map(d => d*5) : ticks)
            .tickSize(3)
        xAxis2 = d3.axisBottom(x2).ticks(6).tickSizeOuter(0)
        yAxis2 = d3.axisRight(y2)
            .ticks(5)
            .tickValues(weekBin ? ticks.map(d => d*5) : ticks)
            .tickSize(2)

    context.append("g")
      .selectAll(".bar")
      .data(weekBin ? weekly : daily)
      .join("rect")
        .attr('class', 'bar')
        .attr('x', d => x(weekBin ? d3.timeHour.offset(d3.timeDay.offset(d.date,-6),3) : d3.timeHour.offset(d.date)))
        .attr('y', d => y(weekBin ? d.weekly : d.daily))
        .attr('width', weekBin ? x(583200*1000)-x(0) : x(79200*1000)-x(0))
        .attr('height', d => height - y(weekBin ? d.weekly : d.daily))
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", (d,i) => {
            txt = `${d3.timeFormat('%B %e')(d.date)}<br>Cases: ${numFmt(weekBin ? d.weekly : d.daily)}`
            txt += weekBin ? '' : `<br>7-day Avg: ${numFmt(d.avg7)}`
            return txt
        })

    context.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    context.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', `translate(${width},0)`)
        .call(yAxis) 

    context.select('.y-axis .domain').remove()

    context.append('text')
        .attr('id', 'ylabel')
        .attr('x', width+2)
        .attr('y', 5)
        .text(weekBin ? 'Weekly Cases' : 'Daily Cases')

    // Moving average section
    // for the context
    let mvAvgLine = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d3.timeHour.offset(d.date,12)))
        .y(d => weekBin ? y(d.weekly) : y(d.avg7))

    let avgLine = context.append('path')
        .datum(daily)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine)
    
    // for the focus
    let mvAvgLine2 = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x2(d3.timeHour.offset(d.date,12)))
        .y(d => weekBin ? y2(d.weekly) : y2(d.avg7))
    
    let avgLine2 = timelinefocus.append('path')
        .datum(daily)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine2)

    // Annotation section
    context.selectAll('.milestone')
      .data(annotations)
      .join('line').lower()
        .attr('class', 'milestone')
        .attr('x1', d => x(d3.timeHour.offset(d.date,12)))
        .attr('x2', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y1', d => y(daily[d3.timeDay.count(minDate,d.date)]['daily'] + 30) )
        .attr('y2', d => {
            col = weekBin ? 'y3' : 'y2'
            return grps.get(+d.date).length > 1 ? y(d[col] - 100) : y(d[col])
        })

    context.selectAll('.milestone-text')
      .data(annotations)
      .join('text')
        .style('text-anchor', d => d.anchor )
        .attr('class', 'milestone-text')
        .attr('x', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y', d => weekBin ? y(d.y3) - 3 :y(d.y2) - 3)
        .text(d => d.annotation)
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", d => `<b>${d3.timeFormat('%B %e')(d.date)}</b><br>${d.description}`)     

    const x0 = x(maxDate)-80, y0 = 10;
    context.append('line')
        .attr('class', 'avgLine')
        .attr('x1', x0)
        .attr('x2', x0+20)
        .attr('y1', y0)
        .attr('y2', y0)

    context.append('text')
        .attr('class', 'milestone-text')
        .attr('x', x0+25)
        .attr('y', y0)
        .attr('dy', '0.35em')
        .text('7-day average')
        .style('font-size', '0.5em')

    context.append('rect').lower()
        .attr('class', 'rect')
        .attr('x', x(new Date(2020,2,24)))
        .attr('width', x(new Date(2020,5,2)) - x(new Date(2020,2,24)))
        .attr('height', height)

    context.append('text')
        .attr('class', 'rect-text')
        .attr('x', x(new Date(2020,2,26)))
        .attr('y', 10)
        .text('Stay Home, Stay Safe period')

    // focus additions
    // add the focus x-axis and y-axis
    timelinefocus.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${height2})`)
        .call(xAxis2)

    timelinefocus.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', `translate(${width},0)`)
        .call(yAxis2) 

    timelinefocus.select('.y-axis .domain').remove()
    
    timelinefocus.append('g')
    .selectAll(".bar")
      .data(weekBin ? weekly : daily)
      .join("rect")
        .attr('class', 'bar')
        .attr('x', d => x2(weekBin ? d3.timeHour.offset(d3.timeDay.offset(d.date,-6),3) : d3.timeHour.offset(d.date)))
        .attr('y', d => y2(weekBin ? d.weekly : d.daily))
        .attr('width', weekBin ? x(583200*1000)-x(0) : x(79200*1000)-x(0))
        .attr('height', d => height2 - y2(weekBin ? d.weekly : d.daily))

    timelinefocus.append('text')
        .attr('id', 'yaxislabel')
        .attr('x', 37)
        .attr('y', y(20000))
        .attr('dy', "-.35em")
        .attr('font-size', '0.7em')
    
    // clipping rectangle
    timelinefocus.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("x", 0)
        .attr("width", width)
        .attr("height", height2)
    
        // add brush
    brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed)
        .on("end", brushended) // add brush snapping

    // Add bootstrap tooltip
    $(function() {
        $('[data-toggle="tooltip"]').tooltip()
    })
}

function insertDuration() {
    const months = Math.floor(d3.timeDay.count(new Date(2020,0,22), new Date) / 30.4)
    d3.select('#duration').text(months)
}

function insertAvgCase() {
    let value = Math.round(daily[daily.length-1]['weekly']/7/50)*50
    d3.select('#avg-case').text(value)
}

// brush function
function brushed() {
    const selection = d3.event.selection || x2.range(); // default brush selection
    x.domain(selection.map(x2.invert, x2)); // new focus x-domain
    focus.selectAll(".avgLine")
        .attr("d", mvAvgLine2);
    focus.select(".x-axis")
        .call(xAxis2)

};

// brush snapping function
function brushended() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) brushed(); // Empty selection returns default brush
    const dateRange = d3.event.selection.map(x2.invert);
    let dayRange = dateRange.map(d3.timeDay.round);
    x.domain(dayRange)
    xBrush.transition()
        .call(brush.move, dayRange.map(x2));

};

makeTimeline(weekBin=false)
