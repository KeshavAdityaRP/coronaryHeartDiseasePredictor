// Server Address
var server = "http://127.0.0.1:5000";
// Keep of feature being clicked on
var feature = "gender";

// Ajax to get Graph Data from Server
function fetchDataset(){
    var appdir='/fetchDataset';
    $.ajax({
        type: "POST",
        url:server+appdir,
        dataType: 'json'
    }).done(function(data) { 
        // console.log("Dataset Received")
        // console.log(data);
        // createHistogram(data['info'], "diaBP", "Diastolic Blood Pressure (mmHg)", 15, false)
        createBarGraph(data['info'], "gender", "Gender");
        checkWhichOptionIsClickedOn(data); 
        recomputeBins(data);
    });
}

// Lister to recompute bins in numerical graphs
function recomputeBins(data) {
    $(document).on('input change', '#myRange', function() {
        $('#demo').html( $(this).val() );
        defaultBinSize = $(this).val();
        toogleBetweenGraphs(data, feature, defaultBinSize, true);
    });
}

// Listiner get id of selected menu
function checkWhichOptionIsClickedOn(data) {
    $('#navigationBar').click(function (e) {
        feature = e.target.id;
        toogleBetweenGraphs(data, feature, 15, false);
    });
}

// Toogle Between Graphs
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

// Create a Bar Graph
function createBarGraph(data, feature, xLabel="x-axis label") {
    
    // remove existing elements
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

    // set margins for the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
    var y = d3.scaleLinear()
            .range([height, 0]);
            
    // add svg
    var svg = d3.select("#graphRender").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50) 
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set x and y values
    x.domain(data.map(function(d) { return d["category"]; }));
    y.domain([0, d3.max(data, function(d) { return d["count"]; })]);

    // create bars
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d["category"]); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d["count"]); })
        .attr("height", function(d) { return height - y(d["count"]); })
        .on("mousemove", function(d){
            // console.log("lol");
            // var pos = $(this).position();
            var newHeight = Number(d3.select(this).attr('height')) + 5;
            tooltip
                .style("left", d3.event.pageX - 450 + "px")
                .style("bottom", newHeight + "px")
                // .style("top", d3.event.pageY - 400 + "px")
                // .style("left",pos.left)
                // .style("top", pos.top)
                .style("display", "inline-block")
                .html(("Label : " + d["category"]) + "<br>" + "Frequency : " + (d["count"]));
        })
        .on("mouseover", function(d,i) {
            var newWidth = Number(d3.select(this).attr('width')) + 20;
            var newHeight = Number(d3.select(this).attr('height')) + 20;
            var x = d3.select(this).attr("x");
            var y = Number(d3.select(this).attr("y")) - 20;
            d3.select(this).attr("r", 10).style("fill", "#fe615a")
            d3.select(this).style("opacity", "1")
            d3.select(this).attr("width", newWidth)
            d3.select(this).attr("height", newHeight)
            d3.select(this).attr("y", y)
        })
        .on("mouseout", function(d,i){ 
            var oldWidth = Number(d3.select(this).attr('width')) - 20;
            var oldHeight = Number(d3.select(this).attr('height')) - 20;
            var x = d3.select(this).attr("x");
            var y = Number(d3.select(this).attr("y")) + 20;
            tooltip.style("display", "none")
            d3.select(this).attr("r", 10).style("fill", "#69b3a2")
            d3.select(this).style("opacity", "1")
            d3.select(this).attr("width", oldWidth)
            d3.select(this).attr("height", oldHeight)
            d3.select(this).attr("y", y)         
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

function createHistogram(data, feature, xLabel="x-axis label", defaultBinSize=15, recomputBinFlag=false) {

    // remove existing elements
    $("#graphRender").empty();

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set margins for the graph
    var svg = d3.select("#graphRender")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = data.map(function(d) { return d[feature]; });
    
    // set the ranges : x -axis
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

    // create bins
    var bins = histogram(data);

    // set the ranges : y -axis
    var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
        .call(d3.axisLeft(y));

    // tooltip creation
    var tooltip = d3.select("#graphRender")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "#b7d8d6")
        .style("color", "#789e9e")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("text-align", "center")

    // on tooltip show
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

    // on tooltip move
    var moveTooltip = function(d) {
        tooltip
        .style("left", (d3.mouse(this)[0]+450) + "px")
        .style("top", (40) + "px")
    }

    // on tooltip hide
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

    // add the bars to svg
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

    // check when slider must be removed or modified
    if (!recomputBinFlag) {
        $(".slidecontainer" ).remove();
        $("#graphConntainer").append('<div class="slidecontainer">'+
        '<span class="helper"> 5 </span> <input type="range" min="5" max="25" value="15" step=2 class="slider" id="myRange"> <span class="helper"> 25 </span>'+
        '<p class="miniInfo">Move the green square above to change bins. Current Value: <span id="demo">'+ defaultBinSize +'</span></p></div>');
    } else{
        $("#myRange").attr("value",defaultBinSize);
    }
}

// On-Load (Start of Script)
$(function() {
    fetchDataset(); 			
});