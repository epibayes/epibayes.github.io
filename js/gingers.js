  function makeGingers(demographic){
    console.log("going into makeGingers, demographic is", demographic)
    if (demographic === "black"){
      console.log("demographic is black");

      w1_percent = 8.3,
      w2_percent = 3.3,
      w1_color = "#ed7d31",
      w2_color = "#ed7d31",
      w1_gradientid = "black_w1_gradient",
      w2_gradientid = "black_w2_gradient"
    } else if (demographic === "white"){
      console.log("demographic is white");

      w1_percent = 6.3,
      w2_percent = 2.1,
      w1_color = "#6680B6",
      w2_color = "#6680B6",
      w1_gradientid = "white_w1_gradient",
      w2_gradientid = "white_w2_gradient"
    } else if (demographic === "api"){
      console.log("demographic is api");
      
      w1_percent = 5.5,
      w2_percent = 2.4,
      w1_color = "#ff0000",
      w2_color = "#ff0000",
      w1_gradientid = "api_w1_gradient",
      w2_gradientid ="api_w2_gradient"
    } else if (demographic === "latino"){
      console.log("demographic is latino");

      w1_percent = 5.4,
      w2_percent = 3.0,
      w1_color = "#f05856",
      w2_color = "#f05856",
      w1_gradientid = "latino_w1_gradient",
      w2_gradientid = "latino_w2_gradient"
    } else {
      console.log("demographic is other");

      w1_percent = 4.5,
      w2_percent = 1.6,
      w1_color = "#A566CA",
      w2_color = "#A566CA",
      w1_gradientid = "other_w1_gradient",
      w2_gradientid = "other_w2_gradient"
    }
  }

  function buildSVG(div, textid, color, percent, gradientid){  
    // the SVG is added to the div
    mySvg = d3.select(div).append("svg").attr("viewBox", "0 0 100 100");
        
    // rows and columns needed for ginger diagram
    numCols = 10;
    numRows = 10;

    //padding for the grid
    xPadding = 10;
    yPadding = 15;

    //horizontal and vertical spacing between the icons
    hBuffer = 8;
    wBuffer = 8;

    //generate a d3 range for the total number of required elements
    myIndex = d3.range(numCols * numRows);
    
    
    //add a background rectangle
    mySvg.append("rect").attr("width", 150).attr("height", 150);   
     
    //add the gingerbreads
    mySvg.append("defs")
          .append("g")
          .attr("id", "iconCustom")
         .attr('fill', 'url(#gradient)')
          .append("path")
                  .attr("d", "M3.1955,2.3642a1.8248,1.8248,0,0,0-.1263-.48.9585.9585,0,0,0-.8823-.5707c-.0859-.0018-.172,0-.258,0A.6656.6656,0,0,0,2.4252.6766.6747.6747,0,0,0,1.076.6569a.6623.6623,0,0,0,.4972.6567c-.0936.0007-.1872-.0016-.2807,0a.9415.9415,0,0,0-.8012.4381,1.1494,1.1494,0,0,0-.1578.454c-.08.4309-.1713.86-.2582,1.2892C.05,3.62.0228,3.7448,0,3.8705a.2891.2891,0,0,0,.2406.3468.2944.2944,0,0,0,.3347-.2437Q.7272,3.2191.88,2.4647A.113.113,0,0,1,.9,2.4329a.1591.1591,0,0,1,.0079.0345C.9068,3.0048.9049,3.5421.9047,4.0793Q.904,5.6237.904,7.1682c0,.025.0051.0332.032.033.1933-.0012.3865-.0015.58,0,.0329,0,.0413-.007.0413-.0408q-.0016-1.4517-.0016-2.9034c0-.03.0077-.038.0376-.0372.0905.002.1811.0023.2716,0,.0326-.0008.0413.0066.0413.0406q-.0016,1.4517-.0016,2.9034c0,.03.0079.0377.0378.0375q.3032-.0021.6062,0c.0293,0,.0378-.0061.0378-.0369Q2.5846,5.9906,2.5853,4.817V4.0291q0-.783.0006-1.566a.0888.0888,0,0,1,.0127-.03c.0069.0085.0176.0161.02.0258.01.0384.017.0774.0248.1163q.1425.7059.2848,1.412A.2917.2917,0,0,0,3.5,3.873C3.4,3.37,3.3,2.8665,3.1955,2.3642Z");
        
    //text to display number of icons highlighted
    textdiv = mySvg.append("text")
        .attr("id", textid)
        .attr("x", xPadding)
        .attr("y", yPadding)
        .attr("dy", -3)
        .text("0");

    //create group element and create an svg <use> element for each icon
    mySvg.append("g")
    .attr("class", ".pictoLayer")
    .selectAll("use")
    .data(myIndex)
    .enter()
    .append("use")
        .attr("xlink:href", "#iconCustom")
        .attr("id", function (d) {
            return "icon" + d;
        })
        .attr("x", function (d) {
            var remainder = d % numCols;//calculates the x position (column number) using modulus
            return xPadding + (remainder * wBuffer);//apply the buffer and return value
        })
          .attr("y", function (d) {
              var whole = Math.floor(d / numCols)//calculates the y position (row number)
              return yPadding + (whole * hBuffer);//apply the buffer and return the value
          })
        .classed("iconPlain", true);


    // Define the gradient
    myGradient = mySvg.append("svg:defs")
                .append("svg:linearGradient")
                // .attr("id", "gradient")
                .attr("id", gradientid)
                .attr("x1", "0%")
                .attr("x2", "100%")
                .attr("spreadMethod", "pad");

    // Define the gradient colors
    myGradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1);

    var valueLit = percent,
    total = numCols * numRows,
    valuePict = total * (percent / 100),
    valueDecimal = (valuePict % 1);

    textdiv.text(valueLit + '%')
      .style("fill", color);

    mySvg.selectAll("use").attr("fill", function (d) {
      if (d < valuePict - 1) {              
          return color;
        } else if (d > (valuePict - 1) && d < (valuePict)){
          myGradient.append("svg:stop")
            .attr("offset", (valueDecimal * 100) + '%')
            .attr("stop-color", color)
            .attr("stop-opacity", 1);
          myGradient.append("svg:stop")
            .attr("offset", (valueDecimal * 100) + '%')
            .attr("stop-color", "#5a5858")
            .attr("stop-opacity", 1);
          myGradient.append("svg:stop")
            .attr("offset", '100%')
            .attr("stop-color", "#5a5858")
            .attr("stop-opacity", 1);
          return `url(#${gradientid})`;
          // return 'url(#gradient)'
        } else if (d === (valuePict-1) && valueDecimal === 0){
          return color;
        } else {
          return "#5a5858";
        }              
    });
  }

  function gingerRaceButton(){
    d3.selectAll("#gingerbutton > *").on("click", function(){
      demographic = this.value;
      makeGingers(demographic)
    })

  }