const dateParser = d3.timeParse('%y%m%d')
const numFmt = d3.format(',.0f')

async function makeTimeline(weekBin=false) {
    // Get data
    const dailyweeklycum_cases_statewide = 'https://gist.githubusercontent.com/choisteph/494b84d649a51bfb764e4792567ccb0f/raw'
    daily = await d3.csv(dailyweeklycum_cases_statewide, d3.autoType)
    daily = daily.filter(d => d.status.toLowerCase() === 'cp')
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
    const margin = {top: 10, right: 80, bottom: 30, left: 80};
    const W = 600;
    const width = W - margin.left - margin.right;
    const H = 200;
    const height = H - margin.top - margin.bottom;

    // append timetable svg
    const svg = d3.select('#timeline').append("svg")
        .attr("viewBox", `-20 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
      .append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)

    let x = d3.scaleTime()
        .domain([d3.min(daily, d => d.date), d3.timeDay.offset(d3.max(daily, d=> d.date))])
        .range([0, width])

    let y = d3.scaleLinear()
        .domain([0, weekBin ? 13000 : 12000])
        .range([height, 0])

    let ticks = [0,2000,4000,6000,8000,10000,12000],
        xAxis = d3.axisBottom(x).ticks(7).tickSizeOuter(0),
        yAxis = d3.axisRight(y)
            .ticks(7)
            .tickValues(weekBin ? ticks.map(d => d*7) : ticks)
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
        .attr("title", (d,i) => {
            txt = `${d3.timeFormat('%B %e')(d.date)}<br>Cases: ${numFmt(weekBin ? d.weekly : d.daily)}`
            txt += weekBin ? '' : `<br>7-day Avg: ${numFmt(d.avg7)}`
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
        .attr('y', 8)
        .text(weekBin ? 'Weekly Cases' : 'Daily Cases')

    // Moving average section
    let mvAvgLine = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d3.timeHour.offset(d.date,12)))
        .y(d => weekBin ? y(d.weekly) : y(d.avg7))

    let avgLine = svg.append('path')
        .datum(daily)
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
            col = weekBin ? 'y3' : 'y2'
            return grps.get(+d.date).length > 1 ? y(d[col] ) : y(d[col]) - 30
        })

    svg.selectAll('.milestone-text')
        .data(annotations)
        .join('text')
        .style('text-anchor', d => d.anchor )
        .attr('class', 'milestone-text')
        .attr('x', d => x(d3.timeHour.offset(d.date,12)))
        .attr('y', d => weekBin ? y(d.y3) - 3 : grps.get(+d.date).length > 1 ? y(d[col] - 10 ) : y(d[col]) - 30)
        .text(d => d.annotation)
        .attr("data-toggle", "tooltip")
        .attr("data-html", true)
        .attr("title", d => `<b>${d3.timeFormat('%B %e')(d.date)}</b><br>${d.description}`)     
                
    // // Annotation section
    // svg.selectAll('.milestone')
    //   .data(annotations)
    //   .join('line').lower()
    //     .attr('class', 'milestone')
    //     .attr('x1', d => x(d3.timeHour.offset(d.date,12)))
    //     .attr('x2', d => x(d3.timeHour.offset(d.date,12)))
    //     .attr('y1', d => y(daily[d3.timeDay.count(minDate,d.date)]['daily'] + 30) )
    //     .attr('y2', d => {
    //         col = weekBin ? 'y3' : 'y2'
    //         return grps.get(+d.date).length > 1 ? y(d[col] - 100) : y(d[col])
    //     })

    // svg.selectAll('.milestone-text')
    //   .data(annotations)
    //   .join('text')
    //     .style('text-anchor', d => d.anchor )
    //     .attr('class', 'milestone-text')
    //     .attr('x', d => x(d3.timeHour.offset(d.date,12)))
    //     .attr('y', d => weekBin ? y(d.y3) - 3 :y(d.y2) - 3)
    //     .text(d => d.annotation)
    //     .attr("data-toggle", "tooltip")
    //     .attr("data-html", true)
    //     .attr("title", d => `<b>${d3.timeFormat('%B %e')(d.date)}</b><br>${d.description}`)     

    const x0 = x(maxDate)-80, y0 = 10;
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
        .attr('width', x(new Date(2020,5,2)) - x(new Date(2020,2,24)))
        .attr('height', height)

    svg.append('text')
        .attr('class', 'rect-text')
        .attr('x', x(new Date(2020,2,26)))
        .attr('y', 10)
        .text('Stay Home, Stay Safe period')
          
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

makeTimeline(weekBin=false)
