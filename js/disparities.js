async function initDisparities(){
  essentialworkers_black = [
    {frontline:{"17%":17, "":100-17}, div:"#black-frontline", title:"Front-line Workers"},
    {publictransit:{"26%":26, "": 100-26}, div:"#black-publictransit", title:"Public Transit Workers"},
    {grocery:{"14%":14, "": 100-14}, div:"#black-grocery", title:"Grocery Workers"}, 
    {healthcare:{"18%":18, "":100-18}, div:"#black-healthcare", title:"Health Care Workers"},
    {childcare:{"19%":19, "":100-19}, div:"#black-childcare", title:"Childcare Workers"}
  ]
  essentialworkers_latino = [
    {construction:{"19%":19, "": 100-19}, div:"#latino-construction", title:"Construction Workers"},
    {leisurehospitality:{"12%":12, "": 100-12},div:"#latino-leisurehospitality", title:"Leisure & Hospitality Workers"}
  ]
  buildEssentialWorkDonut(essentialworkers_black);
  buildEssentialWorkDonut(essentialworkers_latino);
}

function buildEssentialWorkDonut(inputdata){
    margin = 10;
    width = 300;
    height = 300;


    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    radius = Math.min(width, height) / 2;

    for (dic of inputdata){
      //dict is {frontline:{obj}, div:"string"}
      // console.log("begin for loop for dic in input")
      // console.log("dic is", dic)
      let div;
      let data;
      let color;
      let title;

      for (let key in dic){
        // console.log("begin for loop for key in dic")
        // console.log("key is", key)
        // console.log("at each key in dic is", dic[key])
        if (key === "div"){
          div = dic[key]
        }
        if (key === "title"){
          title = dic[key]
        }
        if (key != "div" &&  key != "title"){
          data = dic[key]
        }
      } //close for loop for key in dic

      // console.log("div is", div);
      // console.log("data is", data);
      // console.log("title is", title)
      svg = createSvg(div, width, height);
      color = getColor(div, data);
      buildPie(radius, data, color, div, title);

    } //close for loop for dic of inputdata
}

function createSvg(div, width, height){
 return d3.select(div)
  .append("svg")
    .attr("width", "100%")
    .attr("height","100%")
    .attr('viewBox','0 0 '+Math.min(width,height) +' '+Math.min(width,height) )
    .attr("class", "donut")
  .append("g")
    .attr("transform", `translate(${width/2},${height/2})`)
  //   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")


}

function getColor(div, data){      
    // console.log("div is", div)
    // set the color scale
    if (div.includes("latino")){
      // console.log("div is latino")
      return d3.scaleOrdinal()
      .domain(data)
      .range(["#f05856", "#7f7f7f"]);
    } else {
      // console.log("div isn't latino")
      return d3.scaleOrdinal()
        .domain(data)
        .range(["#ffc000","#7f7f7f"])
    }

}

function buildPie(radius, data, color, div, title){
    // Compute the position of each group on the pie:
    var pie = d3.pie()
      .sort(null) // Do not sort group by size
      .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data))

    // The arc generator
    var arc = d3.arc()
      .innerRadius(radius * 0.4)         // This is the size of the donut hole
      .outerRadius(radius * 0.7)

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8)


    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('allSlices')
    .data(data_ready)
      .enter()
        .append('path')
          .attr('d', arc)
          .attr('fill', function(d){ return(color(d.data.key)) })
          // .attr("stroke", "white")
          // .style("stroke-width", "1px")
          .style("opacity", 1)

    // Add the polylines between chart and labels:
    svg
    .selectAll('allPolylines')
    .data(data_ready)
      .enter()
        .append('polyline')
          .attr("stroke", "white")
          .style("fill", "none")
          .attr("stroke-width", 3)
          .attr('points', function(d) {
            // console.log("d is", d);
            if(d.index === 0){
              // console.log("index is 0")
              var posA = arc.centroid(d) // line insertion in the slice
              var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
              var posC = outerArc.centroid(d) // Label position = almost the same as posB

              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
              posC[0] = radius * 0.6 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left

              return [posA, posB, posC]
            }
          })

    // Add the polylines between chart and labels:
    svg
    .selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
      .text( function(d) { 
        if(d.index === 0){
          return d.data.key
        }
      } )
      .attr('transform', function(d) {
        if (d.index === 0){
          var pos = outerArc.centroid(d);
          // console.log(pos)
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          // pos[0] = pos[0]+10 
          pos[0] = radius * 0.55 * (midangle < Math.PI ? 1 : -1) + 10

          return 'translate(' + pos + ')';
        }

      })
      .style('text-anchor', function(d) {
        if (d.index === 0){
          // console.log(d)
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return (midangle < Math.PI ? 'start' : 'end')
          // return 'start'
        }
      })
      .attr('alignment-baseline', 'central')
      .style('fill', function(d){
        if (d.index === 0){
          if (div.includes("latino")){
            return "#f05856"
          } else {
            return "#ffc000"
          }
        }
      })
      .style('font-size', 28)
      .style('font-family','Helvetica Neue')
      .style('font-weight', 500)

  svg.append("text")
  .attr("class", "donutlab")
  .attr("x", 0)
  .attr("y", 125)
  // .attr("dy", 120)
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .text(title)
  .style("fill", "white")
}