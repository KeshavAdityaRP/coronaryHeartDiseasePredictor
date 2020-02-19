function createHistogram(data, feature, xLabel="x-axis label", defaultBinSize=15, recomputBinFlag=false) {

    $("#graphRender").empty();
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#graphRender")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = data.map(function(d) { return d[feature]; });
    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return + d; })])      // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(defaultBinSize)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    // var tooltip = d3.select("#graphRender").append("div").style("opacity", 0).attr("class", "tooltip");
    var tooltip = d3.select("#graphRender")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "#b7d8d6")
        .style("color", "#789e9e")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("text-align", "center")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function(d) {
        var newWidth = Number(d3.select(this).attr('width')) + 5;
        var newHeight = Number(d3.select(this).attr('height')) + 5;
        var newTransalation = d3.select(this).attr("transform");
        var translate = newTransalation.substring(newTransalation.indexOf("(")+1, newTransalation.indexOf(")")).split(",");
        translate[0] = Number(translate[0]) - 5;
        translate[1] = Number(translate[1]) - 5;
        tooltip
        .transition()
        .duration(100)
        .style("opacity", 1)
        tooltip
        .html(xLabel +" : " + d.x0 + " - " + d.x1 + "<br>" + "Number of People : " + (d.length - 2)) 
        .style("left", (d3.mouse(this)[0]+20) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
        d3.select(this).attr("r", 10).style("fill", "#fe615a")
        d3.select(this).attr("width", newWidth)
        d3.select(this).attr("height", newHeight)
        d3.select(this).attr("transform", "translate(" + translate[0] +"," + translate[1] + ")")
    }

    var moveTooltip = function(d) {
        tooltip
        .style("left", (d3.mouse(this)[0]+450) + "px")
        .style("top", (40) + "px")
    }
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function(d) {
        var oldWidth = Number(d3.select(this).attr('width')) - 5;
        var oldHeight = Number(d3.select(this).attr('height')) - 5;
        var newTransalation = d3.select(this).attr("transform");
        var translate = newTransalation.substring(newTransalation.indexOf("(")+1, newTransalation.indexOf(")")).split(",");
        translate[0] = Number(translate[0]) + 5;
        translate[1] = Number(translate[1]) + 5;
        tooltip
        .transition()
        .duration(100)
        .style("opacity", 0)
        d3.select(this).attr("r", 10).style("fill", "#69b3a2")
        d3.select(this).attr("width", oldWidth)
        d3.select(this).attr("height", oldHeight)
        d3.select(this).attr("transform", "translate(" + translate[0] +"," + translate[1] + ")")
    }

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + (x(d.x0)+5) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return Math.max(0,x(d.x1) - x(d.x0) -1) ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )
    
    // text label for the x axis
    svg.append("text")             
        .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(xLabel)
        .attr("font-family", "sans-serif")
        .attr("font-size", "90%");

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 - margin.left))
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of People")
        .attr("font-family", "sans-serif")
        .attr("font-size", "90%");

    if (!recomputBinFlag) {
        $(".slidecontainer" ).remove();
        $("#graphConntainer").append('<div class="slidecontainer">'+
        '<span class="helper"> 5 </span> <input type="range" min="5" max="25" value="15" step=2 class="slider" id="myRange"> <span class="helper"> 25 </span>'+
        '<p class="miniInfo">Move the green square above to change bins. Current Value: <span id="demo">'+ defaultBinSize +'</span></p></div>');
    } else{
        // $("#graphRender").append('<div class="slidecontainer">'+
        // '<input type="range" min="5" max="30" value="' + defaultBinSize +'" class="slider" id="myRange">'+
        // '<p>Value: <span id="demo"></span></p></div>');
        $("#myRange").attr("value",defaultBinSize);
    }
}