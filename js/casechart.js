function makeCaseChart() {
    // set the dimensions and margins of the graph
    let margin = { top: 15, right: 10, bottom: 30, left: 10 },
        W = 490,
        H = 150,
        width = W - margin.left - margin.right,
        height = H - margin.top - margin.bottom,

    // set the ranges
    x = d3.scaleTime()
        .domain(d3.extent(caseData.get(status), d => d.date))
        .range([0, width]);
    y = d3.scaleLinear()
        .domain([0, d3.max(caseData.get(status), d => d.value)]).nice()
        .range([height, 0]);

    // define the line
    valueline = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.date))
        .y(d => y(d.value));

    let svg = d3.select("#casechart").append("svg")
        .attr('id', 'chartsvg')
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")        
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the valueline path.
    svg.append("path")
        .datum(caseData.get(status))
        .attr("class", `daily-${datatype}`)
        .attr("d", valueline);

    svg.append('circle')
        .data(Array(caseData.get(status)[getSliderValue()]))
        .attr('id', 'current-circle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', datatype === 'symptoms' ? '#08519C' : '#00274C')

    xAxis = d3.axisBottom(x).ticks(4).tickSizeOuter(0)
    yAxis = d3.axisRight(y).ticks(4)

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

    // Add the X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr('class', 'y-axis')
        .attr("transform", `translate(${0},0)`)
        .call(yAxis)
        .call(formatAxis)

    svg.append('text')
        .attr('id', 'yaxislabel')
        .attr('x', 37)
        .attr('y', y(30000))
        .attr('dy', "-.35em")
        .attr('font-size', '0.7em')
        .text('cumulative responses')
    
    setYAxisTicks()

    // clipping rectangle
    focus.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height)
}

function updateCaseCircle(k, anim=true) {
    let circle = d3.select('#current-circle').datum(caseData.get(status)[k])
    if (anim && k > 0) {
        circle.transition().duration(delay)
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
    } else {
        circle.attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
    }
}

function updateCaseChart(startDate, endDate, metric, CP=false) {
    let T = 750
    const stat = metric.replace('rate','')
    caseData.get(status).map(d => { d.value = d[stat]; return d })
    let key = CP ? 'CP' : status

    // set the x domain
    x.domain([startDate, endDate])

    y.domain([0, d3.max(caseData.get(key), d => d.value)]).nice()

    d3.select('.y-axis').call(yAxis).call(formatAxis)
    setYAxisTicks()
    d3.select(`.daily-${datatype}`).datum(caseData.get(status))
      .transition().duration(T)
        .attr('d', valueline)
    d3.select('#current-circle').datum(caseData.get(status)[sliderValue])
      .transition().duration(T)
        .attr('cy', d => y(d.value))
}

function setYAxisTicks() {
    let ticks = d3.selectAll('.y-axis .tick')
    ticks.each((d,i) => { if (i === ticks.size()-1) setYAxisLabel(d) })    
}


function setYAxisLabel(d) {
    const stat = metric.replace('rate','')
    d3.select('#yaxislabel')
        .attr('y', y(d)) 
        .text(stat === 'cumulative' ? 'cumulative responses' : 'weekly responses')    
}