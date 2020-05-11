// D3 Legend Variables
const w = 20
const h = 120
let axisScaleCaseCum = d3.scaleLog()
    .domain(colorCaseCum.domain())
    .range([h, 0])
let axisRightCaseCum = d3.axisRight(axisScaleCaseCum)
    .ticks(3, ',')
    .tickSize(0)
    .tickValues([10, 100, 1000, 10000])
let axisScaleCaseWeek = d3.scaleLog()
    .domain(colorCaseWeek.domain())
    .range([h, 0])
let axisRightCaseWeek = d3.axisRight(axisScaleCaseWeek)
    .ticks(3, ',')
    .tickSize(0)
    .tickValues([10, 100])

// Legend Related Functions
function addLegend() {
    // Setup our svg layer that we can manipulate with d3
    let container = map.getCanvasContainer()
    let svg = d3.select(container).append("svg")
        .attr('id', 'mapbox-legend')

    // d3 legend
    const xpos = 5
    const ypos = 345

    legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${xpos},${ypos})`)

    let defs = legend.append("defs");

    linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    let colorScale = getColorScale()
    linearGradient.selectAll("stop")
      .data(getLinearGradientData(colorScale))
      .join("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legend.append('rect')
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'url(#linear-gradient)')

    legendAxis = legend.append('g')
        .attr("class", `legend-axis`)
        .attr("transform", `translate(${w + 2},0)`)
        .call(axisRightCaseCum)

    legend.select('path.domain').remove()
}

function getLinearGradientData(colorScale) {
    return colorScale.ticks().map((d, i, arr) => ({ offset: `${100 * i / arr.length}%`, color: convert2rgba(colorScale(d)) }))
}

function convert2rgba(rgb) {
    return rgb.replace('rgb','rgba').replace(')',`, ${alpha})`)
}

function updateLegend(metric) {
    let colorScale = getColorScale()
    linearGradient.selectAll("stop")
      .data(getLinearGradientData(colorScale))
      .join("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    legendAxis.call(metric === 'cumulative' ? axisRightCaseCum : axisRightCaseWeek)
    legend.select('path.domain').remove()
}

function LegendText(d, i, arr) {
    return i < arr.length - 1 ? `${numFmt(d)}-${numFmt(arr[i + 1].__data__)}` : `${numFmt(d)}+`
}
