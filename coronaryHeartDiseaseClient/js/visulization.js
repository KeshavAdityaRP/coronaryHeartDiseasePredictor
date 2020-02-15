//Root Server Address
var server = "http://127.0.0.1:5000";

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
        createBarGraph(data['info'], "gender");
        checkWhichOptionIsClickedOn(data); 
        recomputeBins(data);
    });
}

function recomputeBins(data) {
    $(document).on('input change', '#myRange', function() {
        $('#demo').html( $(this).val() );
        defaultBinSize = $(this).val();
        console.log(defaultBinSize);
        createHistogram(data['info'], "diaBP", defaultBinSize, true);
    });
}

function checkWhichOptionIsClickedOn(data) {
    $('#navigationBar').click(function (e) {
        var feature = e.target.id;
        switch(feature) {
            // Categorical
            case "gender":
                createBarGraph(data['info'], "gender");
                break;
            case "education":
                createBarGraph(data['info'], "education");
                break;
            case "currentSmoker":
                createBarGraph(data['info'], "currentSmoker");
                break;
            case "BPMeds":
                createBarGraph(data['info'], "BPMeds");
                break;
            case "prevalentStroke":
                createBarGraph(data['info'], "prevalentStroke");
                break;
            case "prevalentHyp":
                createBarGraph(data['info'], "prevalentHyp");
                break;
            case "diabetes":
                createBarGraph(data['info'], "diabetes");
                break;
            case "TenYearCHD":
                createBarGraph(data['info'], "TenYearCHD");
                break;

            // Numerical
            case "diaBP":
                createHistogram(data['info'], "diaBP");
                break;
            case "heartRate":
                createHistogram(data['info'], "heartRate");
                break;
            case "cigsPerDay":
                createHistogram(data['info'], "cigsPerDay");
                break;
            case "totChol":
                createHistogram(data['info'], "totChol");
                break;
            case "sysBP":
                createHistogram(data['info'], "sysBP");
                break;
            case "BMI":
                createHistogram(data['info'], "BMI");
                break;
            case "glucose":
                createHistogram(data['info'], "glucose");
                break;  
            
            // Default Case
            default:
                createBarGraph(data['info'], "education");
        }
    });
}

function createBarGraph(data, feature) {
    // set the dimensions and margins of the graph

    $("#graphRender").empty();
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
        .attr("height", height + margin.top + margin.bottom)
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
              .style("left", d3.event.pageX - 20 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d["category"]) + "<br>" + "frequency" + (d["count"]));
        })
        .on("mouseout", function(d){ 
            tooltip
            .style("display", "none"); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "0.75em")
        .style("text-anchor", "middle")
        .text("Frequency");  
}

function createHistogram(data, feature, defaultBinSize=10, recomputBinFlag=false) {

    $("#graphRender").empty();

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#graphRender")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    var data = data.map(function(d) { return d[feature]; });

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return + d; })])    // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +e })
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
    var tooltip = d3.select("#graphRender")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function(d) {
        tooltip
        .transition()
        .duration(100)
        .style("opacity", 1)
        tooltip
        .html("Range: " + d.x0 + " - " + d.x1 + " Frequency : " + (d.length - 2)) 
        .style("left", (d3.mouse(this)[0]+20) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var moveTooltip = function(d) {
        tooltip
        .style("left", (d3.mouse(this)[0]+450) + "px")
        .style("top", (40) + "px")
    }
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function(d) {
        tooltip
        .transition()
        .duration(100)
        .style("opacity", 0)
    }

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
            // Show tooltip on hover
            .on("mouseover", showTooltip )
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )
    
    if (!recomputBinFlag) {
        $(".slidecontainer" ).remove();
        $("#graphConntainer").append('<div class="slidecontainer">'+
        '<span> 5 <input type="range" min="5" max="45" value="20" class="slider" id="myRange"> 45 </span>'+
        '<p>Value: <span id="demo">'+ defaultBinSize +'</span></p></div>');
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