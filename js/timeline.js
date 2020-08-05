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
    annotations = await d3.csv('data/timeline.csv', d => {
        d.date = d3.timeParse('%m/%d/%y')(d.date)
        return d
    })
    grps = d3.group(annotations, d => +d.date)

    // Set the dimensions and margins of the graph
    H = 200;
    W = 600;

    // Set the height and margins for the focus view
    margin = {top: 0, right: 80, bottom: 80, left: 80};
    width = W - margin.left - margin.right;
    height = H - margin.top - margin.bottom;

    // Set the height and margins for the context view (this goes below the focus view)
    margin2 = {top: H-60, right: margin.right, bottom: 40, left: margin.left}
    height2 = H - margin2.top - margin2.bottom

    // append timetable svg
    svg = d3.select('#timeline').append("svg")
        .attr("viewBox", `-20 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")

    //set ranges
    x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])
    x2 = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])
    y = d3.scaleLinear()
        .domain([0, weekBin ? 13000 : 2500])
        .range([height, 0])
    y2 = d3.scaleLinear()
        .domain([0, weekBin ? 13000 : 2500])
        .range([height2, 0])
    
    //set ticks
    ticks = [0,500,1000,1500,2000],
        xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0),
        yAxis = d3.axisRight(y)
            .ticks(5)
            .tickValues(weekBin ? ticks.map(d => d*5) : ticks)
            .tickSize(3)
        xAxis2 = d3.axisBottom(x2).ticks(6).tickSizeOuter(0)
        yAxis2 = d3.axisRight(y2)
            .ticks(0)
            .tickValues(0)
            .tickSize(0)

    // add brush
    brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed)
        .on("end", brushended) // add brush snapping


    // create focus (top chart)
    focus = svg.append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr('class', 'focussvg')
    
    // set context (bottom chart)
    context = svg.append('g')
        .attr('transform', `translate(${margin2.left}, ${margin2.top})`)
        .attr('class', 'contextsvg')


    // adding axes and labels to focus
    focus.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    focus.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', `translate(${width},0)`)
        .call(yAxis) 

    focus.select('.y-axis .domain').remove()

    focus.append('text')
        .attr('id', 'ylabel')
        .attr('x', width+2)
        .attr('y', 5)
        .text(weekBin ? 'Weekly Cases' : 'Daily Cases')
    

    // adding axes and labels to context
    context.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${height2})`)
        .call(xAxis2)

    context.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', `translate(${width},0)`)
        .call(yAxis2) 

    context.select('.y-axis .domain').remove()
    
    //this rectangle shows from when to when the stay home stay safe period was in place 
    //add it to focus
    focus.append('rect').lower()
        .attr('class', 'rect')
        .attr('x', x(new Date(2020,2,24)))
        .attr('width', x(new Date(2020,5,2)) - x(new Date(2020,2,24)))
        .attr('height', height)

    focus.append('text')
        .attr('class', 'rect-text')
        .attr('x', x(new Date(2020,2,26)))
        .attr('y', 10)
        .text('Stay Home, Stay Safe period')
    
    //add the stay home stay safe rectangle to context too
    context.append('rect').lower()
        .attr('class', 'rect')
        .attr('x', x(new Date(2020,2,24)))
        .attr('width', x(new Date(2020,5,2)) - x(new Date(2020,2,24)))
        .attr('height', height2) 

    // add the context brush
    const beginDate = minDate
    xBrush = context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [x2(beginDate), x2(maxDate)]) // initialize brush selection
    xBrush.selectAll('.overlay').remove()

    // clipping rectangle
    focus.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("x", 0)
        .attr("width", width-0)
        .attr("height", height2)

    // Add bootstrap tooltip
    $(function() {
        $('[data-toggle="tooltip"]').tooltip()
    })

    addBars()
    addAverageLines()
    addMilestoneText(minDate, maxDate)

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
    // context.selectAll(".avgLine")
    //     .attr("d", mvAvgLine2);
    // context.select(".x-axis")
    //     .call(xAxis2)
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
    
    //do this when the brush snaps
    // make some content updates
    updateXAxis() //update the months that show up
    updateBars() //update the bars that show up
    updateAvLine() //update the average line
    
};
function updateXAxis(rescale = true){
    setXDomain(rescale)
    d3.select('.x-axis')
        .call(xAxis)
    // setXTicks()
}

function setXDomain(rescale){
    const idx0 = Math.round(x.domain()[0])
    const idx1 = Math.round(x.domain()[1])
    console.log("idx0 and idx1 are", idx0, idx1)
    // x.domain(d3.extent(daily.slice(idx0, idx1+1), d => d.total)).nice()
    // x2.domain([0, d3.max(daily, d => d.total)]).nice()
}
// function setXTicks() {
//     let ticks = d3.selectAll('.x-axis .tick')
//     ticks.each((d,i) => { if (i === ticks.size()-1) setXAxisLabel(d) })    
// }

// function setXAxisLabel(d) {
//     d3.select('#xaxislabel')
//         .attr('x', x(d)) 
//         .text(d)    
// }

function addBars(){
    console.log("add the bars")

    // focus is the top chart
    focus.selectAll(".bar")
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

    //context is the bottom chart  
    context.selectAll(".bar")
      .data(weekBin ? weekly : daily)
      .join("rect")
        .attr('class', 'bar')
        .attr('x', d => x2(weekBin ? d3.timeHour.offset(d3.timeDay.offset(d.date,-6),3) : d3.timeHour.offset(d.date)))
        .attr('y', d => y2(weekBin ? d.weekly : d.daily))
        .attr('width', weekBin ? x(583200*1000)-x(0) : x(79200*1000)-x(0))
        .attr('height', d => height2 - y2(weekBin ? d.weekly : d.daily))
}
function addAverageLines(){
    // create the data for moving average lines
    mvAvgLine = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d3.timeHour.offset(d.date,12)))
        .y(d => weekBin ? y(d.weekly) : y(d.avg7))

    mvAvgLine2 = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x2(d3.timeHour.offset(d.date,12)))
        .y(d => weekBin ? y2(d.weekly) : y2(d.avg7))

    // moving average paths based on the data created above
    avgLine = focus.append('path')
        .datum(daily)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine)
    
    avgLine2 = context.append('path')
        .datum(daily)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine2)
}
function addMilestoneText(minDate, maxDate){
    // milestone text only needs to be added to the top chart (focus)
    focus.selectAll('.milestone')
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

    focus.selectAll('.milestone-text')
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

    focus.append('line')
        .attr('class', 'avgLine')
        .attr('x1', x0)
        .attr('x2', x0+20)
        .attr('y1', y0)
        .attr('y2', y0)

    focus.append('text')
        .attr('class', 'milestone-text')
        .attr('x', x0+25)
        .attr('y', y0)
        .attr('dy', '0.35em')
        .text('7-day average')
        .style('font-size', '0.5em')

}

function updateBars(){
    // console.log("the bars will update")
    focus.selectAll(".bar")
    .data(daily)
    .join("rect")
      .attr('class', 'bar')
      .attr('x', d => x(weekBin ? d3.timeHour.offset(d3.timeDay.offset(d.date,-6),3) : d3.timeHour.offset(d.date)))
      .attr('y', d => y(d.daily))
      .attr('width', weekBin ? x(583200*1000)-x(0) : x(79200*1000)-x(0))
      .attr('height', d => height - y(weekBin ? d.weekly : d.daily))
    console.log("daily is", daily)
}

function updateAvLine() {
    console.log("update av line")
    // avgLine.datum(daily).attr("d", mvAvgLine)
    // avgLine2.datum(daily).attr("d", mvAvgLine2)
    // focus.selectAll(".bar")
    // .data(weekBin ? weekly : daily)
    // .join("rect")
    //   .attr('class', 'bar')
    //   .attr('x', d => x(weekBin ? d3.timeHour.offset(d3.timeDay.offset(d.date,-6),3) : d3.timeHour.offset(d.date)))
    //   .attr('y', d => y(weekBin ? d.weekly : d.daily))
    //   .attr('width', weekBin ? x(583200*1000)-x(0) : x(79200*1000)-x(0))
    //   .attr('height', d => height - y(weekBin ? d.weekly : d.daily))
    //   .attr("data-toggle", "tooltip")
    //   .attr("data-html", true)
    //   .attr("title", (d,i) => {
    //       txt = `${d3.timeFormat('%B %e')(d.date)}<br>Cases: ${numFmt(weekBin ? d.weekly : d.daily)}`
    //       txt += weekBin ? '' : `<br>7-day Avg: ${numFmt(d.avg7)}`
    //       return txt
    //   })
}


makeTimeline(weekBin=false)
