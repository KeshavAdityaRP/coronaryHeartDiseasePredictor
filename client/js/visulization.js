// Server Address
var server = "http://127.0.0.1:5000";
var dataset = {};
var currentMenuSelection = 'originalDatasetScreePlot';

// Listiner to get chosenOption of selected menu
function checkWhichOptionIsClickedOn(dataset) {
    $('#navigationBar').click(function (e) {
        var chosenOption = e.target.id;
        if (currentMenuSelection != chosenOption) {
            currentMenuSelection = e.target.id;
            toogleBetweenGraphs(chosenOption, dataset);
        }
    });
}

function fetchData() {
    var appdir='/fetchData';
    // Ajax to get Data from Server
    $.ajax({
        type: "POST",
        url:server+appdir,
        dataType: 'json'
    }).done(function(fetchDataset) { 
        fetchMdsData("originalDatasetMdsEuclidian", false);
        // fetchMdsData("originalDatasetMdsCorrelation", false);
        console.log("Datset Obtained");
        dataset = fetchDataset;
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

        // Mds Euclidian
        case "originalDatasetMdsEuclidian":
            handleForOriginalMds(chosenOption);
            break;
        case "randomSampledDatasetMdsEuclidian":
            fetchMdsData(chosenOption);
            break;
        case "stratifiedSampledMdsEuclidian":
            fetchMdsData(chosenOption);
            break;

        // Mds Correlation
        case "originalDatasetMdsCorrelation":
            handleForOriginalMds(chosenOption);
            break;
        case "randomSampledDatasetMdsCorrelation":
            fetchMdsData(chosenOption);
            break;
        case "stratifiedSampledMdsCorrelation":
            fetchMdsData(chosenOption);
            break;

        // Top Three Attributes
        case "originalDatasetTop3Attributes":
            createScatterPlotMatrix(dataset['originalDatasetTop3Attributes']);
            break;
        case "randomSampledDatasetTop3Attributes":
            createScatterPlotMatrix(dataset['randomSampledDatasetTop3Attributes']);
            break;
        case "stratifiedSampledTop3Attributes":
            createScatterPlotMatrix(dataset['stratifiedSampledTop3Attributes']);
            break;
        
        // Default Case
        default:
            createScreePlot(dataset['originalDatasetScreePlot']);
    }
}

function handleForOriginalMds(chosenOption) {
    if (chosenOption in dataset) {
        createMdsScatterPlot(dataset[chosenOption]);
    } else {
        displayLoading();
    }    
}

function fetchMdsData(chosenOption, flag=true) {
    if (chosenOption in dataset) {
        createMdsScatterPlot(dataset[chosenOption]);
    } else{
        // data: {json_str: JSON.stringify(formData)}
        var appdir='/fetchMdsData';
        // Ajax to get Data from Server
        $.ajax({
            type: "POST",
            url:server+appdir,
            data: {chosenOption: chosenOption},
            dataType: 'json'
        }).done(function(fetchDataset) { 
            dataset[chosenOption] = fetchDataset[chosenOption];
            console.log("Print");
            console.log(dataset[chosenOption]);
            if (chosenOption == currentMenuSelection) {
                createMdsScatterPlot(dataset[chosenOption]);
            }
        });
        if (flag) {
            displayLoading();
        }
    }
}

function displayLoading() {
    // remove existing elements
    $("#graphRender").empty();    

    $("#graphRender").append("<h1>Loading ...</h1>" );
}

function createMdsScatterPlot(information) {
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
        .domain([d3.min(data, function(d) { return d["mdsDimensionX"] }), d3.max(data, function(d) { return d["mdsDimensionX"] })])
        .range([ 0, width ])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
        .select(".domain").remove()

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d["mdsDimensionY"] }), d3.max(data, function(d) { return d["mdsDimensionY"] })])
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
        .text("MDS 1");

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("MDS 2")

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
        .attr("cx", function (d) { return x(d["mdsDimensionX"]); } )
        .attr("cy", function (d) { return y(d["mdsDimensionY"]); } )
        .attr("r", 5)
        .style("fill", function (d) { return color() } )
}

function createScatterPlotMatrix(information) {
    console.log(information);
    data = information["graph"];
    
    // remove existing elements
    $("#graphRender").empty();

    var width = 960,
    size = 250,
    padding = 70;


    var x = d3.scaleLinear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scaleLinear()
        .range([size - padding / 2, padding / 2]);

    var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(6);

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(6);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var domainByTrait = {},
    traits = d3.keys(data[0]).filter(function(d) { return d !== "species"; });
    n = traits.length;

    console.log(traits);    
    traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    console.log(domainByTrait);

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var brush = d3.brush()
        .on("start", brushstart)
        .on("brush", brushmove)
        .on("end", brushend)
        .extent([[0,0],[size,size]]);

    var svg = d3.select("#graphRender").append("svg")
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    var cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    cell.call(brush);

    function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        cell.selectAll("circle")
            .data(data)
        .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 4)
            .style("fill", function(d) { return color(d.species); });
    }

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(p) {
        if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        brushCell = this;
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
        }
    }

    // Highlight the selected circles.
    function brushmove(p) {
        var e = d3.brushSelection(this);
        svg.selectAll("circle").classed("hidden", function(d) {
        return !e
            ? false
            : (
            e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
            || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
            );
        });
    }

    // If the brush is empty, select all circles.
    function brushend() {
        var e = d3.brushSelection(this);
        if (e === null) svg.selectAll(".hidden").classed("hidden", false);
    }


    function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
    }
}

// Create a Scree Plot
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