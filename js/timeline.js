// calculates simple moving average over N days
// assumes no missing dates (best dataset format)
function movingAverage(data, N, column) {
    return data.map((row, idx, total) => {
        const startIdx = Math.max(0, idx-N+1)
        const endIdx = idx
        const movingWindow = total.slice(startIdx, endIdx+1)
        const sum = movingWindow.reduce((a,b) => a + b[column], 0)
        return {
            date: d3.timeHour.offset(row.date, 12), // offset point by 12 hrs (noon)
            avg: sum / movingWindow.length,
        };
    });
}
const dateParser = d3.timeParse('%y%m%d')

async function makeTimeline() {
    // Get data
    daily = await d3.csv('data/dailyweeklycum_cases_statewide.csv', d3.autoType)
    daily.map((d,i) => {
        d.date = dateParser(d.date)
        return d
    })
    insertAvgCase()

    let minDate = d3.min(daily, d => d.date)
    const movingAvgData = movingAverage(daily, 7, 'daily');
    let annotations = await d3.csv('data/timeline.csv', d => {
        d.date = d3.timeParse('%m/%d/%y')(d.date)
        return d
    })
    let grps = d3.group(annotations, d => +d.date)

    // Set the dimensions and margins of the graph
    const margin = {top: 10, right: 40, bottom: 30, left: 60};
    const W = 600;
    const width = W - margin.left - margin.right;
    const H = 200;
    const height = H - margin.top - margin.bottom;
    const yoffset = 0;

    // append timetable svg
    const svg = d3.select(`#timeline`).append("svg")
        .attr("viewBox", `0 ${-yoffset} ${W} ${H+yoffset}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
      .append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)

    let x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])

    let y = d3.scaleLinear()
        .domain([0, 2500])
        .range([height, 0])

    let xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0),
        yAxis = d3.axisRight(y).ticks(5).tickValues([0,500,1000,1500,2000]).tickSize(3)

    svg.append("g")
      .selectAll(".bar")
      .data(daily)
      .join("rect")
        .attr('class', 'bar')
        .attr('x', d => x(d3.timeHour.offset(d.date)))
        .attr('y', d => y(d.daily))
        .attr('width', x(79200*1000)-x(0))
        .attr('height', d => height - y(d.daily))

    svg.append('g')
        .attr('class', 'x-axis axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    svg.append('g')
        .attr('class', 'y-axis axis')
        .attr('transform', `translate(${width},0)`)
        .call(yAxis) 

    svg.select('.y-axis .domain').remove()

    svg.append('text')
        .attr('id', 'ylabel')
        .attr('x', width+2)
        .attr('y', y(2400))
        .text('Daily Cases')

    // Moving average section
    let mvAvgLine = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d.date))
        .y(d => y(d.avg))

    let avgLine = svg.append('path')
        .datum(movingAvgData)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine)

    // add milestone text
    svg.selectAll('.milestone')
      .data(annotations)
      .join('line').lower()
        .attr('class', 'milestone')
        .attr('x1', d => x(d3.timeHour.offset(d.date,12)))
        .attr('x2', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y1', d => y(daily[d3.timeDay.count(minDate,d.date)]['daily'] + 30) )
        .attr('y2', d => grps.get(+d.date).length > 1 ? y(d.y2 - 100) : y(d.y2) )

    svg.selectAll('.milestone-text')
      .data(annotations)
      .join('text')
        .attr('class', d => `milestone-text ${d.date < new Date(2020,3,3) ? 'end' : ''}`)
        .attr('x', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y', d => y(d.y2) - 3)
        .text(d => d.annotation)
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", d => `<b>${d3.timeFormat('%B %e')(d.date)}</b><br>${d.description}`)     

    // Annotation section
    const x0 = 20, y0 = 15;
    svg.append('line')
        .attr('class', 'avgLine')
        .attr('x1', x0)
        .attr('x2', x0+20)
        .attr('y1', y0)
        .attr('y2', y0)

    svg.append('text')
        .attr('class', 'milestone-text')
        .attr('x', x0+25)
        .attr('y', y0)
        .attr('dy', '0.35em')
        .text('7-day average')
        .style('font-size', '0.5em')

    svg.append('rect').lower()
        .attr('class', 'rect')
        .attr('x', x(new Date(2020,2,24)))
        .attr('width', x(x.domain()[1]) - x(new Date(2020,2,24)))
        .attr('height', height)

    svg.append('text')
        .attr('class', 'rect-text')
        .attr('x', x(new Date(2020,3,12)))
        .attr('y', y(2350))
        .text('Stay Home, Stay Safe period')
          
      // Add bootstrap tooltip
      $(function() {
          $('[data-toggle="tooltip"]').tooltip()
      })
}

function insertAvgCase() {
    let value = Math.round(daily[daily.length-1]['weekly']/7/50)*50
    d3.select('#avg-case').text(value)
}

makeTimeline()