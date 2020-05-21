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
const numFmt = d3.format(',.0f')

async function makeTimeline(weekBin=false) {
    // Get data
    daily = await d3.csv('data/dailyweeklycum_cases_statewide.csv', d3.autoType)
    daily.map((d,i) => {
        d.date = dateParser(d.date)
        return d
    })
    insertAvgCase()
    weekly = daily.filter((d,i) => i%7 === 6)

    let minDate = d3.min(daily, d => d.date)
    const movingAvgData = movingAverage(daily, 7, 'daily');
    let annotations = await d3.csv('data/timeline.csv', d => {
        d.date = d3.timeParse('%m/%d/%y')(d.date)
        return d
    })
    let grps = d3.group(annotations, d => +d.date)

    // Set the dimensions and margins of the graph
    const margin = {top: 10, right: 40, bottom: 30, left: 80};
    const W = 600;
    const width = W - margin.left - margin.right;
    const H = 200;
    const height = H - margin.top - margin.bottom;
    const yoffset = 0;

    // append timetable svg
    const svg = d3.select(weekBin ? '#timeline-weekly' : '#timeline').append("svg")
        .attr("viewBox", `0 ${-yoffset} ${W} ${H+yoffset}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
      .append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)

    let x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])

    let y = d3.scaleLinear()
        .domain([0, weekBin ? 12500 : 2500])
        .range([height, 0])

    let ticks = [0,500,1000,1500,2000],
        xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0),
        yAxis = d3.axisRight(y)
            .ticks(5)
            .tickValues(weekBin ? ticks.map(d => d*5) : ticks)
            .tickSize(3)

    svg.append("g")
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
        .attr("title", d => {
            txt = `${d3.timeFormat('%B %e')(d.date)}<br>Cases: ${numFmt(weekBin ? d.weekly : d.daily)}`
            txt += weekBin ? '' : `<br>7-day avg: ${numFmt(d.weekly/7)}`
            return txt
        })

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
        .attr('y', 5)
        .text(weekBin ? 'Weekly Cases' : 'Daily Cases')

    // Moving average section
    let mvAvgLine = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d.date))
        .y(d => weekBin ? y(d.avg*7) : y(d.avg))

    let avgLine = svg.append('path')
        .datum(movingAvgData)
        .attr('class', 'avgLine')
        .attr('d', mvAvgLine)

    // Annotation section
    svg.selectAll('.milestone')
      .data(annotations)
      .join('line').lower()
        .attr('class', 'milestone')
        .attr('x1', d => x(d3.timeHour.offset(d.date,12)))
        .attr('x2', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y1', d => y(daily[d3.timeDay.count(minDate,d.date)]['daily'] + 30) )
        .attr('y2', d => {
            if (weekBin) {
                return grps.get(+d.date).length > 1 ? y(d.y3 - 100) : y(d.y3)
            } else {
                return grps.get(+d.date).length > 1 ? y(d.y2 - 100) : y(d.y2)
            }
        })

    svg.selectAll('.milestone-text')
      .data(annotations)
      .join('text')
        .attr('class', d => `milestone-text ${d.date < new Date(2020,3,3) ? 'end' : ''}`)
        .attr('x', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y', d => weekBin ? y(d.y3) - 3 :y(d.y2) - 3)
        .text(d => d.annotation)
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", d => `<b>${d3.timeFormat('%B %e')(d.date)}</b><br>${d.description}`)     

    const x0 = weekBin ? -50 : 20, y0 = 15;
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
        .attr('y', 10)
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
makeTimeline(weekBin=true)