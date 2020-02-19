//Root Server Address
var server = "http://127.0.0.1:5000";
var feature = "diaBP";

// Ajax to get Graph Data from Server
function fetchDataset(){
    var appdir='/fetchDataset';
    $.ajax({
        type: "POST",
        url:server+appdir,
        dataType: 'json'
    }).done(function(data) { 
        console.log("Dataset Received")
        console.log(data);
        // createBarGraph(data['info'], "gender", "Gender");
        createHistogram(data['info'], "diaBP", "Diastolic Blood Pressure (mmHg)", 15, false)
        checkWhichOptionIsClickedOn(data); 
        recomputeBins(data);
    });
}

function recomputeBins(data) {
    $(document).on('input change', '#myRange', function() {
        $('#demo').html( $(this).val() );
        defaultBinSize = $(this).val();
        console.log("Feature", feature);
        console.log(defaultBinSize);
        toogleBetweenGraphs(data, feature, defaultBinSize, true);
        // createHistogram(data['info'], "diaBP", "Diastolic Blood Pressure (mmHg)", defaultBinSize, true);
    });
}

function checkWhichOptionIsClickedOn(data) {
    $('#navigationBar').click(function (e) {
        feature = e.target.id;
        toogleBetweenGraphs(data, feature, 15, false);
    });
}

function toogleBetweenGraphs(data, feature,defaultBinSize, flag) {
    switch(feature) {
        // Categorical
        case "gender":
            createBarGraph(data['info'], "gender", "Gender");
            break;
        case "education":
            createBarGraph(data['info'], "education", "Education");
            break;
        case "currentSmoker":
            createBarGraph(data['info'], "currentSmoker", "Current Smoker");
            break;
        case "BPMeds":
            createBarGraph(data['info'], "BPMeds", "Blood Pressure Medication");
            break;
        case "prevalentStroke":
            createBarGraph(data['info'], "prevalentStroke", "Prevalent Stroke");
            break;
        case "prevalentHyp":
            createBarGraph(data['info'], "prevalentHyp", "Prevalent Hypertension");
            break;
        case "diabetes":
            createBarGraph(data['info'], "diabetes", "Diabetes");
            break;
        case "TenYearCHD":
            createBarGraph(data['info'], "TenYearCHD", "Ten Year Coronary Heart Disease");
            break;

        // Numerical
        case "diaBP":
            createHistogram(data['info'], "diaBP", "Diastolic Blood Pressure (mmHg)", defaultBinSize, flag);
            break;
        case "heartRate":
            createHistogram(data['info'], "heartRate", "Heart Rate (Beats/Min)", defaultBinSize, flag);
            break;
        case "cigsPerDay":
            createHistogram(data['info'], "cigsPerDay", "Cigarettes Per Day", defaultBinSize, flag);
            break;
        case "totChol":
            createHistogram(data['info'], "totChol", "Total Cholesterol Level (mg/dL)", defaultBinSize, flag);
            break;
        case "sysBP":
            createHistogram(data['info'], "sysBP", "Systolic Blood Pressure (mmHg)", defaultBinSize, flag);
            break;
        case "BMI":
            createHistogram(data['info'], "BMI", "Body Mass Index (Weight (kg) / Height(meter-squared))", defaultBinSize, flag);
            break;
        case "glucose":
            createHistogram(data['info'], "glucose", "Glucose Level (mg/dL)", defaultBinSize, flag);
            break;  
        
        // Default Case
        default:
            createBarGraph(data['info'], "gender", "Gender");
    }
}

function createBarGraph(data, feature, xLabel="x-axis label") {
    // set the dimensions and margins of the graph

    $("#graphRender").empty();
    $(".slidecontainer" ).remove();
    var tooltip = d3.select("#graphRender").append("div").attr("class", "barToolTip");

    var categories = data.map(function(d) { return d[feature]; });
    var counts = {};

    for (var i = 0; i < categories.length; i++) {
        var num = categories[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    data = [];

    console.log(counts);
    Object.keys(counts).forEach(function(key) {
        var element = {};
        switch(feature) {
            case "gender":
                element["category"] =  key == 1 ? "man" : "woman";
                element["count"] = counts[key];
                break;
            case "education":
                if (key == 1) {
                    element["category"] = "Some High School";
                } else if (key == 2) {
                    element["category"] = "High School or GED"
                } else if (key == 3) { 
                    element["category"] = "Some College or Vocational School"
                } else{
                    element["category"] = "college"
                }
                element["count"] = counts[key];
                break;
            case "currentSmoker":
                element["category"] =  key == 1 ? "Current Smoker" : "Not a Current Smoker";
                element["count"] = counts[key];
                break;
            case "BPMeds":
                element["category"] =  key == 1 ? "Is on Blood Pressure medications" : "Not on Blood Pressure medications";
                element["count"] = counts[key];
                break;
            case "prevalentStroke":
                element["category"] =  key == 1 ? "Previously had a Stroke" : "Previously did not have a Stroke";
                element["count"] = counts[key];
                break;
            case "prevalentHyp":
                element["category"] =  key == 1 ? "Previously  Hypertensive" : "Previously Not Hypertensive";
                element["count"] = counts[key];
                break;
            case "diabetes":
                element["category"] =  key == 1 ? "Previously had Diabetes" : "Previously did not have Diabetes";
                element["count"] = counts[key];
                break;
            case "TenYearCHD":
                element["category"] =  key == 1 ? "Had a Coronary Heart Disease" : "Did not have Coronary Heart Disease";
                element["count"] = counts[key];
                break;
        }
        data.push(element);
    });

    console.log(data);

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
    var y = d3.scaleLinear()
            .range([height, 0]);
            
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#graphRender").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50) 
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    x.domain(data.map(function(d) { return d["category"]; }));
    y.domain([0, d3.max(data, function(d) { return d["count"]; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d["category"]); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d["count"]); })
        .attr("height", function(d) { return height - y(d["count"]); })
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 450 + "px")
              .style("top", d3.event.pageY - 400 + "px")
              .style("display", "inline-block")
              .html(("Label : " + d["category"]) + "<br>" + "Frequency : " + (d["count"]));
        })
        .on("mouseover", function(d,i) {
            // d3.select(this)
            //     .style("transform", "scale(1.1,1.1)")
            //     .style("transform-origin", "50% 90%");
            var newWidth = Number(d3.select(this).attr('width')) + 20;
            var newHeight = Number(d3.select(this).attr('height')) + 20;
            var x = d3.select(this).attr("x");
            var y = Number(d3.select(this).attr("y")) - 20;
            console.log(x,y);
            // var newTransalation = d3.select(this).attr("transform");
            // var translate = newTransalation.substring(newTransalation.indexOf("(")+1, newTransalation.indexOf(")")).split(",");
            // translate[0] = Number(translate[0]) - 5;
            // translate[1] = Number(translate[1]) - 5;
            d3.select(this).attr("r", 10).style("fill", "#fe615a")
            d3.select(this).style("opacity", "1")
            d3.select(this).attr("width", newWidth)
            d3.select(this).attr("height", newHeight)
            d3.select(this).attr("y", y)
            // d3.select(this).attr("transform", "translate(" + translate[0] +"," + translate[1] + ")")
        })
        .on("mouseout", function(d,i){ 
            var oldWidth = Number(d3.select(this).attr('width')) - 20;
            var oldHeight = Number(d3.select(this).attr('height')) - 20;
            var x = d3.select(this).attr("x");
            var y = Number(d3.select(this).attr("y")) + 20;
            // var translate = newTransalation.substring(newTransalation.indexOf("(")+1, newTransalation.indexOf(")")).split(",");
            // translate[0] = Number(translate[0]) + 5;
            // translate[1] = Number(translate[1]) + 5;
            console.log(x,y);
            tooltip.style("display", "none")
            d3.select(this).attr("r", 10).style("fill", "#69b3a2")
            d3.select(this).style("opacity", "1")
            d3.select(this).attr("width", oldWidth)
            d3.select(this).attr("height", oldHeight)
            d3.select(this).attr("y", y)
            // d3.select(this).attr("transform", "translate(" + translate[0] +"," + translate[1] + ")")
                // d3.select(this)
                // .style("transform", "scale(1,1)")
                // .style("transform-origin", "0% 0%");            
            });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")             
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(xLabel)
        .attr("font-family", "sans-serif")
        .attr("font-size", "90%"); 

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

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
}

function createHistogram1(data, feature, xLabel="x-axis label", defaultBinSize=15, recomputBinFlag=false) {

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
    .append("g");

    // get the data
    var data = data.map(function(d) { return d[feature]; });
    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return + d; })])    // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +e })
        .range([0, width]);
    // svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));

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
    // svg.append("g")
    //     .call(d3.axisLeft(y));

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

        // var bar = d3.select(this);
        var newWidth = Number(d3.select(this).attr('width')) + 5;
        var newHeight = Number(d3.select(this).attr('height')) + 5;
        var newTransalation = d3.select(this).attr("transform");
        var translate = newTransalation.substring(newTransalation.indexOf("(")+1, newTransalation.indexOf(")")).split(",");
        translate[0] = Number(translate[0]) - 5;
        translate[1] = Number(translate[1]) - 5;
        // console.log("trans", translate[0], translate[1]);
        // var height = bar.attr('height');

        // var scale = 1.5;

        // bar.transition().style('transform','scale('+scale+')')

        // d3.select(this)
        // .style("transform", "translate(" + x(d.x0) + "," + y(d.length) + ") scale(1.1,1.1)")
        // .style("transform-origin", "50% 90%")
        // .style('transform-origin','bottom')
        // d3.select(this)
        // .style("width", width+2)
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
            .attr("transform", function(d) { return "translate(" + (x(d.x0) + 5) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return Math.max(0,(x(d.x1) - x(d.x0) -1)); })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
            // Show tooltip on hover
            .on("mouseover", 
                showTooltip
            )
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )

    // // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + 20 + ")")
        .call(d3.axisBottom(x));
    
    // text label for the x axis
    svg.append("text")             
        .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(xLabel)
        .attr("font-family", "sans-serif")
        .attr("font-size", "90%");
    
    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

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
        '<span class="helper"> 5 </span> <input type="range" min="5" max="25" value="15" step=2 class="slider" id="myRange"> <span class="helper"> 45 </span>'+
        '<p class="miniInfo">Move the green square above to change bins. Current Value: <span id="demo">'+ defaultBinSize +'</span></p></div>');
    } else{
        // $("#graphRender").append('<div class="slidecontainer">'+
        // '<input type="range" min="5" max="30" value="' + defaultBinSize +'" class="slider" id="myRange">'+
        // '<p>Value: <span id="demo"></span></p></div>');
        $("#myRange").attr("value",defaultBinSize);
    }
}

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

    // svg.selectAll("rect")
    //     .data(bins)
    //     .enter()
    //     .append("rect")
    //         .attr("x", 1)
    //         .attr("transform", function(d) { return "translate(" + (x(d.x0) + 5) + "," + y(d.length) + ")"; })
    //         .attr("width", function(d) { return Math.max(0,(x(d.x1) - x(d.x0) -1)); })
    //         .attr("height", function(d) { return height - y(d.length); })
    //         .style("fill", "#69b3a2")
    //         // Show tooltip on hover
    //         .on("mouseover", 
    //             showTooltip
    //         )
    //         .on("mousemove", moveTooltip )
    //         .on("mouseleave", hideTooltip )

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

// On-Load
$(function() {
    fetchDataset(); 
    // keepTrackOfRangeChange();			
});