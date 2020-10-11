// @TODO: YOUR CODE HERE!
d3.csv("assets/data/data.csv").then(data => {
    console.log(data);
});

// The code for the chart is wrapped inside a function that
// automatically resizes the chart
// function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    // var svgArea = d3.select("body").select("scatter");
  
    // // clear svg is not empty
    // if (!svgArea.empty()) {
    //   svgArea.remove();
    // }
  
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;
  
    var margin = {
      top: 50,
      bottom: 50,
      right: 50,
      left: 50
    };
  
    //set height and width of display
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
  
    // Append SVG element
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth);
  
    // Append group element
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Initial Parameters to display
    var paramX = "age";
    var paramY = "healthcare";
    
    //Update x-scale when clicked
    function xUpdate(healthData, paramX) {
        //scaling
        var xLinScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[paramX]),
            d3.max(healthData, d => d[paramX])
            ])
            .range([0,width]);
        return xLinScale;    
    }

     //Update y-scale when clicked
    function yUpdate(healthData, paramY) {
        //scaling
        var yLinScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[paramY]),
            d3.max(healthData, d => d[paramY])
            ])
            .range([height,0]);
        return yLinScale;    
    }

    //new x-axis based on new xlinscale
    function initXaxis(xLinScale, xAxis) {
        var bottomAx = d3. axisBottom(xLinScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAx);
        return xAxis;
    }

    //new y-axis based on new ylinscale
    function initYaxis(yLinScale, yAxis) {
         var leftAx = d3.axisLeft(yLinScale);
         yAxis.transition()
            .duration(1000)
            .call(leftAx);
        return yAxis;
    }

    //new circles from cx update
    function initXcirc(circlesGroup, xLinScale, paramX) {
        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xUpdate(d[paramX]));
        return circlesGroup;
    }

    //new circles from cy update
    function initYcirc(circlesGroup, yLinScale, paramY) {
        circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => yUpdate(d[paramY]));
        return circlesGroup;
    }

    //move text based on cx attribute
    function xText(circlesGroup, xLinScale, paramX) {
        circlesGroup.transition()
        .duration(1000)
        .attr("dx", d=> xUpdate(d[paramX]));
        return circlesGroup;
    }

     //move text based on cx attribute
     function yText(circlesGroup, yLinScale, paramY) {
        circlesGroup.transition()
        .duration(1000)
        .attr("dy", d=> yUpdate(d[paramY]));
        return circlesGroup;
    }

    //MONEY! Formatting currency data
    var currencyForm = new Intl.NumberFormat('en-US', {
        style: "currency",
        currency: "USD"
    });

    //the tooltip function for updates based on axes selections
    function toolTipUpdate(paramX, paramY, circlesGroup) {
        //x and y labels
        var xLabel;
        var yLabel;
        //percent labels to blank
        var xPercent = ""
        var yPercent = ""
        //conditions for x and y 
        if (paramX === "age") {
            xLabel = "Age";
        }
        else if (paramX === "income") {
            xLabel = "Income";
        }
        else {
            xLabel = "Poverty"
            xPercent = "%";
        };

        if (paramY === "healthcare") {
            yLabel = "Healthcare",
            yPercent = "%";
        }
        else if (paramY === "obesity") {
            yLabel = "Obesity";
            yPercent = "%"
        }
        else {
            yLabel = "Smokes";
            yPercent = "%"
        };
    

        // call d3.tip to update tooltip html return 
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                // format to currency if chosen xaxis is income 
                if (paramX === "income"){
                    var incomelevel = currencyForm.format(d[paramX]);
                    return (`<strong>${d.state}</strong><br>${xLabel}: ${incomelevel.substring(0, incomelevel.length-3)}${xPercent}<br>${yLabel}: ${d[paramY]}${yPercent}`);
                }
                // otherwise return this label
                else return (`<strong>${d.state}</strong><br>${xLabel}: ${d[paramX]}${xPercent}<br>${yLabel}: ${d[paramY]}${yPercent}`);
            });
        // call tooltip on circlesgroup for mouse events
        circlesGroup.call(toolTip);
        // on mousein event
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
            // onmouseout event
            .on("mouseout", function (data) {
                toolTip.hide(data);
            });
        return circlesGroup;
    };


    // Read CSV
    d3.csv("assets/data/data.csv").then((healthData, err) =>{
        if (err) throw err;
        console.log(healthData)

        // parse data
        healthData.forEach(data => {
          data.age = +data.age;
          data.income = +data.income;
          data.poverty = +data.poverty;
          data.healthcare = +data.healthcare;
          data.obesity = +data.obesity;
          data.smokes = +data.smokes;
          console.log(data.age)
        });
  
        // create scales
        var xLinScale = xUpdate(healthData, paramX);
        var yLinScale = yUpdate(healthData, paramY);
        
        // create init axes
        var bottomAx = d3.axisBottom(xLinScale);
        var leftAx = d3.axisLeft(yLinScale);
  
        // append axes
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAx);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAx);

        //append circles group
        var circlesGroup = chartGroup.selectAll("g circle")
            .data(healthData)
            .enter()
            .append("g");
        //add circles to the group
        var circlesXY = circlesGroup
            .append("circle")
            .attr("cx", d => xLinScale(d[paramX]))
            .attr("cy", d => yLinScale(d[paramY]))
            .attr("r", 25)
            .classed("stateCircle", true);

        //append circles to circlesgroup
        var circlesText = circlesGroup
            .append("text")
                .text(d => {
                    return d.abbr})
                .attr("dx", d => xLinScale(d[paramX]))
                .attr("dy", d => yLinScale(d[paramY]))
                .classed("stateText", true);
                
        //three x-axis option 
        var xAxisOptions = chartGroup.append("g")
            .attr("transform", `translate(${width}/2}, ${height + 20})`);
        
        var agelabel = xAxisOptions.append("text")
            .attr("x", 0)
            .attr("y", 18)
            .attr("value", "age") 
            .classed("active", true)
            .text("Median Age");

        var incomelabel = xAxisOptions.append("text")
            .attr("x", 0)
            .attr("y", 36)
            .attr("value", "income") 
            .classed("inactive", true)
            .text("Median Household income");

        var povertylabel = xAxisOptions.append("text")
            .attr("x", 0)
            .attr("y", 54)
            .attr("value", "poverty") 
            .classed("inactive", true)
            .text("% in Poverty");

        //three y-axis options
        var yAxisOptions = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        var healthcarelabel = yAxisOptions.append("text")
            .attr("y", 0 - margin.left +50)
            .attr("x", 0 - (height/2))
            .attr("dy", "1em")
            .attr("yValue", "healthcare")
            .classed("active", true)
            .classed("axis-text", true)
            .text("% Without Healthcare");

        var obesitylabel = yAxisOptions.append("text")
            .attr("y", 0 - margin.left + 32)
            .attr("x", 0 - (height/2))
            .attr("dy", "1em")
            .attr("yValue", "obesity")
            .classed("inactive", true)
            .classed("axis-text", true)
            .text("% Obese");
        
        var smokerlabel = yAxisOptions.append("text")
            .attr("y", 0 - margin.left + 14)
            .attr("x", 0 - (height/2))
            .attr("dy", "1em")
            .attr("yValue", "smokes")
            .classed("inactive", true)
            .classed("axis-text", true)
            .text("% Smokes");
        
        circlesGroup = toolTipUpdate(paramX, paramY, circlesGroup);

        //event listener for x axis
        xAxisOptions.select("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value != paramX) {
                    paramX = value;
                    xLinScale = xUpdate(healthData, paramX)
                    xAxis = initXaxis(xLinScale, xAxis);
                    circlesXY = initXcirc(circlesXY, xLinScale, paramX)
                    circlesText = xText(circlesText, xLinScale, paramX)
                    circlesGroup = updateToolTip(paramX, paramY, circlesGroup);

                    if (paramX === "age") {
                        agelabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomelabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertylabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (paramX === "income"){
                        agelabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomelabel
                            .classed("active", true)
                            .classed("inactive", false);
                        povertylabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        agelabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomelabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertylabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }    
                }
            });
        
            //event listener for y-axis
            yAxisOptions.selectAll("text")
                .on("click", function() {
                    var yValue = d3.select(this).attr("yValue");
                    if (yValue != paramY) {
                        paramY = yValue;
                        yLinScale = yUpdate(healthData, paramY);
                        yAxis = initYaxis(yLinScale, yAxis);
                        circlesXY = initYcirc(circlesXY, yLinScale, paramY)
                        circlesText = yText(circlesText, yLinScale, paramY)
                        circlesGroup = updateToolTip(paramX, paramY, circlesGroup);
                        
                        if (paramY === "healthcare") {
                            healthcarelabel
                                .classed("active", true)
                                .classed("inactive", false)
                            obesitylabel
                                .classed("active", false)
                                .classed("inactive", true)
                            smokerlabel
                                .classed("active", false)
                                .classed("inactive", true);                        
                        }
                        else if (paramY === "obesity") {
                            healthcarelabel
                                .classed("active", false)
                                .classed("inactive", true)
                            obesitylabel
                                .classed("active", true)
                                .classed("inactive", false)
                            smokerlabel
                                .classed("active", false)
                                .classed("inactive", true);                        
                        }
                        else {
                            healthcarelabel
                                .classed("active", false)
                                .classed("inactive", true)
                            obesitylabel
                                .classed("active", false)
                                .classed("inactive", true)
                            smokerlabel
                                .classed("active", true)
                                .classed("inactive", false);                        
                        }
                    }
                });

        
    }).catch(error => {
        console.log(error);
    });
// };
        
  
  
// // When the browser loads, makeResponsive() is called.
// makeResponsive();
  
// // When the browser window is resized, makeResponsive() is called.
// d3.select(window).on("resize", makeResponsive);
  