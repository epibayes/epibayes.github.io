function makeIncidenceChart() {
    // set the dimensions and margins of the graph
    let margin = { top: 20, right: 20, bottom: 30, left: 20 },
        width = 490 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    // set the ranges
    xInc = d3.scaleTime()
        .domain(d3.extent(incidenceData, d => d.date))
        .range([0, width]);
    yInc = d3.scaleLinear()
        .domain([0, d3.max(incidenceData, d => d.value)]).nice()
        .range([height, 0]);

    // define the line
    valueline = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => xInc(d.date))
        .y(d => yInc(d.value));

    let svg = d3.select("#incidence").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the valueline path.
    svg.append("path")
        .datum(incidenceData)
        .attr("class", "daily-incidence")
        .attr("d", valueline);

    svg.append('circle')
        .data(Array(incidenceData[getSliderValue()]))
        .attr('id', 'current-circle')
        .attr('cx', d => xInc(d.date))
        .attr('cy', d => yInc(d.value))
        .attr('r', 5)

    xAxis = d3.axisBottom(xInc).ticks(5).tickSizeOuter(0)
    yAxis = d3.axisRight(yInc).ticks(4)

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
        .attr('x', 34)
        .attr('y', yInc(30000))
        .attr('dy', "-.35em")
        .attr('font-size', '0.7em')
        .text('cumulative cases')
    
    setYAxisLabel()
}

function updateIncidenceCircle(k, anim = true) {
    let circle = d3.select('#current-circle').datum(incidenceData[k])
    if (anim && k > 0) {
        circle.transition().duration(delay)
            .attr('cx', d => xInc(d.date))
            .attr('cy', d => yInc(d.value))
    } else {
        circle.attr('cx', d => xInc(d.date))
            .attr('cy', d => yInc(d.value))
    }
}

function updateIncidenceChart(metric) {
    let T = 750
    const key = metric.replace('rate','')
    if (key === 'cumulative') {
        incidenceData.map(d => { d.value = d.cumulative; return d })
    } else {
        incidenceData.map(d => { d.value = d.daily; return d })
    }
    yInc.domain([0, d3.max(incidenceData, d => d.value)]).nice()
    d3.select('.y-axis').call(yAxis).call(formatAxis)
    setYAxisLabel()
    d3.select('.daily-incidence').transition().duration(T)
        .attr('d', valueline)
    d3.select('#current-circle').transition().duration(T)
        .attr('cy', d => yInc(d.value))
}

function setYAxisLabel() {
    let ticks = d3.selectAll('.y-axis .tick')
    ticks.each((d,i) => { if (i === ticks.size()-1) updateYAxisLabel(d) })    
}

function updateYAxisLabel(d) {
    d3.select('#yaxislabel')
        .attr('y', yInc(d)) 
        .text(metric === 'cumulative' ? 'cumulative cases' : 'daily cases')    
}