// Server Address
var server = "http://127.0.0.1:5000";
// var dataset = null;

// Listiner to get chosenOption of selected menu
function checkWhichOptionIsClickedOn(dataset) {
    $('#navigationBar').click(function (e) {
        var chosenOption = e.target.id;
        toogleBetweenGraphs(chosenOption, dataset);
    });
}

function fetchData() {
    var appdir='/fetchData';
    // Ajax to get Data from Server
    $.ajax({
        type: "POST",
        url:server+appdir,
        dataType: 'json'
    }).done(function(dataset) { 
        console.log("Datset Obtained");
        createScreePlot(dataset['originalDatasetScreePlot']);
        // data = dataset;
        console.log(dataset);
        checkWhichOptionIsClickedOn(dataset);
    });       
}

// Toogle Between Options
function toogleBetweenGraphs(chosenOption, dataset) {
    switch(chosenOption) {
        // Scree Plot
        case "originalDatasetScreePlot":
            createScreePlot(dataset['originalDatasetScreePlot']);
            break;
        case "randomSampledDatasetScreePlot":
            createScreePlot(dataset['randomSampledDatasetScreePlot']);
            break;
        case "stratifiedSampledDatasetScreePlot":
            createScreePlot(dataset['stratifiedSampledDatasetScreePlot']);
            break;
        
        // 2D Scatter Plot
        case "originalDataset2dScatterPlot":
            create2dScatterPlot(dataset['originalDataset2dScatterPlot']);
            break;
        case "randomSampledDataset2dScatterPlot":
            create2dScatterPlot(dataset['randomSampledDataset2dScatterPlot']);
            break;
        case "stratifiedSampledDataset2dScatterPlot":
            create2dScatterPlot(dataset['stratifiedSampledDataset2dScatterPlot']);
            break;
        
        // Default Case
        default:
            createScreePlot(dataset['originalDatasetScreePlot']);
    }
}

// Create a Bar Graph
function createScreePlot(information) {   
    console.log(information);
    data = information["graph"];
    
    // remove existing elements
    $("#graphRender").empty();

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
    var y = d3.scaleLinear()
            .range([height, 0]).nice();

    // var x = d3.scale.ordinal().rangeBands([0, width], .09); // <-- to change the width of the columns, change the .09 at the end to whatever
    // var y = d3.scale.linear().range([height, 0]);

    // set the ranges
    // var x = d3.scaleTime().range([0, width]);
    // var y = d3.scaleLinear().range([height, 0]);

    var valueline = d3.line()
        .x(function(d) { return x(d.principalComponent); })
        .y(function(d) { return y(d.cumulativeSum); });
            
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#graphRender").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");


    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.principalComponent; }));
    y.domain([0, d3.max(data, function(d) { return d.cumulativeSum; })]);

    // // Scale the range of the data
    // x.domain(d3.extent(data, function(d) { return d.principalComponent; }));
    // y.domain([0, d3.max(data, function(d) { return d.eigenValuePercentage; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.principalComponent); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.eigenValuePercentage); })
        .attr("height", function(d) { return height - y(d.eigenValuePercentage); });

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")             
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                            (height + margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .text("Principal Component")
        .attr("font-family", "sans-serif")
        .attr("font-size", "90%"); 

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y)
        .tickValues(d3.range(0, 110, 10)));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 - margin.left))
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Explained Varience")
        .attr("font-family", "sans-serif")
        .attr("font-size", "90%"); 
    
    // Add Legend
    var legend = [{"color" : "#69b3a2", "label" : "Eigen Value Percentage"}, {"color" : "steelblue", "label" : "Cumulative Sum"}];

    var margin = 10;

    svg.selectAll("g.legend").data(legend).enter().append("g")
    .attr("class", "legend").attr("transform", function(d,i) {
        return "translate(" + margin + "," + (margin + i*20) + ")";
    }).each(function(d, i) {
        d3.select(this).append("rect").attr("width", 30).attr("height", 15)
        .attr("fill", d.color);
        d3.select(this).append("text").attr("text-anchor", "start")
        .attr("x", 30+10).attr("y", 15/2).attr("dy", "0.35em")
        .text(d.label);
    });
}

function create2dScatterPlot(information) {
    console.log(information);
    data = information["graph"];
    
    // remove existing elements
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
            "translate(" + margin.left + "," + margin.top + ")")

    // Add X axis
    var x = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d["principalComponent1"] }), d3.max(data, function(d) { return d["principalComponent1"] })])
        .range([ 0, width ])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
        .select(".domain").remove()

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d["principalComponent2"] }), d3.max(data, function(d) { return d["principalComponent2"] })])
        .range([ height, 0])
        .nice()
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))
        .select(".domain").remove()

    // Customization
    svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top)
        .text("Principal Component 1");

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("Principal Component 2")

    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica" ])
        .range([ "#402D54", "#D18975", "#8FD175"])

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d["principalComponent1"]); } )
        .attr("cy", function (d) { return y(d["principalComponent2"]); } )
        .attr("r", 5)
        .style("fill", function (d) { return color() } )

}

// On-Load (Start of Script)
$(function() {
    fetchData();			
});