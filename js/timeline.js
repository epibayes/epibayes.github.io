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
    daily = await d3.csv('dailyweeklycum_cases_statewide.csv', d3.autoType)
    daily.map((d,i) => {
        d.date = dateParser(d.date)
        return d
    })
    let minDate = d3.min(daily, d => d.date)
    const movingAvgData = movingAverage(daily, 7, 'daily');
    let annotations = await d3.csv('timeline.csv', d => {
        d.date = d3.timeParse('%Y-%m-%d')(d.date)
        return d
    })
    let grps = d3.group(annotations, d => +d.date)

    // Set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 50, left: 10};
    const W = 500;
    const width = W - margin.left - margin.right;
    const H = 200;
    const height = H - margin.top - margin.bottom;
    const yoffset = 0;

    // append timetable svg
    const svg = d3.select(`#timeline`).append("svg")
        .attr("viewBox", `0 ${-yoffset} ${W} ${H+yoffset}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
//        .attr('class', 'svg-content')
      .append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)

    let x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])

    let y = d3.scaleLinear()
        .domain([0, d3.max(daily, d => d.daily)+200]).nice()
        .range([height, 0])

    let xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0),
        yAxis = d3.axisRight(y).ticks(5)

    svg.append("g")
      .selectAll(".bar")
      .data(daily)
      .join("rect")
        .attr('class', d => grps.get(+d.date) ? 'highlight' : 'bar')
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
    // svg.selectAll('.milestoneText')
    //   .data(annotations)
    //   .join('text')
    //     .attr('class', 'milestoneText end')
    //     .attr('x', d => x(d.date))
    //     .attr('y', d => y(d.y3))
    //     .text(d => d.description)

    // svg.selectAll('.milestone')
    //   .data(annotations)
    //   .join('line')
    //     .attr('class', 'milestone')
    //     .attr('x1', d => x(d.date))
    //     .attr('x2', d => x(d.date))
    //     .attr('y1', d => {
    //         let k = d3.timeDay.count(minDate,d.date)
    //         return y(daily[k]['daily'] + 30)
    //     })
    //     .attr('y2', d => y(d.y2))

    // Annotation section
    const y0 = height + 30
    svg.append('line')
        .attr('class', 'avgLine')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', y0)
        .attr('y2', y0)

    svg.append('text')
        .attr('class', 'milestoneText')
        .attr('x', 25)
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
        .attr('class', 'rectText')
        .attr('x', x(new Date(2020,3,12)))
        .attr('y', y(1850))
        .text('Stay Home, Stay Safe period')

    svg.selectAll('.tooltipbar')
        .data(daily)
        .join('rect')
          .attr('class', 'tooltipbar')
          .attr('x', d => x(d3.timeHour.offset(d.date)))
          .attr('y', d => y(1000))
          .attr('width', x(79200*1000)-x(0))
          .attr('height', d => height - y(1000))
          .attr("data-toggle", "tooltip")
          .attr("data-html", true)
          .attr("title", d => {
              if (grps.get(+d.date)) {
                  let array = grps.get(+d.date)
                  let html = `${array[0].description}`
                  return html
              } else {
                  return ''
              }
          })                
  
      // Add bootstrap tooltip
      $(function() {
          $('[data-toggle="tooltip"]').tooltip({
              'placement': 'bottom',
              'trigger': 'hover',
          })
      })

}
makeTimeline()