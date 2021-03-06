var svgWidth = 960;
var svgHeight = 545;

var margin = {
  top: 20,
  right: 40,
  bottom: 85,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .classed("chart", true);


// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
      d3.max(csvData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
};

// function used for updating y-scale var upon click on axis label
function yScale(csvData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
      d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
};
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
};

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
};

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
};

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
};

function renderCircleText(chosenXAxis, chosenYAxis, circleText, xLinearScale, yLinearScale) {
  circleText.transition()
  .duration(1000)
    .attr("x", d => xLinearScale(d[chosenXAxis]) )
    .attr("y", d => yLinearScale(d[chosenYAxis]))
 ;
 return circleText;
 
};


// TOOOOOOOLTIPPP fxn
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var ylabel;
  var xlabel;


  if (chosenYAxis === "healthcare") {
    ylabel = "% Lacking Healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "% Smokers:";
  }
  else {
    ylabel = "% Obesity:";
  };

  if (chosenXAxis === "poverty") {
    xlabel = "% Poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Median Age:";
  }
  else {
    xlabel = "Median Household Income:";
  };

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

  //GETS DATA AND DOES ALL THE STUFF// 
d3.csv('./assets/data/data.csv').then(csvData => {
 
 // Step 1: Parse Data/Cast as numbers
    // ==============================
    csvData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;

    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d.poverty)* 0.8, d3.max(csvData, d => d.poverty)* 1.2])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(csvData, d => d.healthcare)* 0.8, d3.max(csvData, d => d.healthcare)* 1.2])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles and text
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("class", "stateCircle");

    var circleText = chartGroup.append("g").selectAll("text")
    .data(csvData)
    .enter()
    .append("text")
    .attr("x", (d,i) => xLinearScale(d[chosenXAxis]) )
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => `${d.abbr}`)
    .attr("class", "stateText");
 
    // Create tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height+20})`)
    .classed("aText", true)
    ;

    // Create  x axes labels
    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    // .classed("aText", true)
    .text("Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");    


    
    // Create group for two y-axis labels
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, ${height / 2})`)
    .classed("aText", true)
    ;

    // Create  y axes labels
    var healthLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacking Healthcare (%)");

    var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0 -60)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obesity (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0 - 80)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");



       // x axis labels event listener
  xlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;


      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(csvData, chosenXAxis);
      // yLinearScale = reScale(csvData, chosenYAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      circleText = renderCircleText(chosenXAxis, chosenYAxis, circleText, xLinearScale, yLinearScale);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLabel
          .classed("active", true)
          .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });


  
       // y axis labels event listener
       ylabelsGroup.selectAll("text")
       .on("click", function() {
         // get value of selection
         var value = d3.select(this).attr("value");
         if (value !== chosenYAxis) {
     
           // replaces chosenYAxis with value
           chosenYAxis = value;
     
     
           // functions here found above csv import
           // updates y scale for new data
           yLinearScale = yScale(csvData, chosenYAxis);
           // yLinearScale = reScale(csvData, chosenYAxis);
     
           // updates y axis with transition
           yAxis = renderYAxes(yLinearScale, yAxis);
     
           // updates circles with new y values
           circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
     
           // updates tooltips with new info
           circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
     
           circleText = renderCircleText(chosenXAxis, chosenYAxis, circleText, xLinearScale, yLinearScale);



           // changes classes to change bold text
           if (chosenYAxis === "healthcare") {
            healthLabel
               .classed("active", true)
               .classed("inactive", false);
               obeseLabel
               .classed("active", false)
               .classed("inactive", true);
               smokesLabel
               .classed("active", false)
               .classed("inactive", true);
           }
           else if (chosenYAxis === "obesity") {
            healthLabel
               .classed("active", false)
               .classed("inactive", true);
               obeseLabel
               .classed("active", true)
               .classed("inactive", false);
               smokesLabel
               .classed("active", false)
               .classed("inactive", true);
           }
           else {
            healthLabel
               .classed("active", false)
               .classed("inactive", true);
               obeseLabel
               .classed("active", false)
               .classed("inactive", true);
               smokesLabel
               .classed("active", true)
               .classed("inactive", false);
           }
         }
       });


});