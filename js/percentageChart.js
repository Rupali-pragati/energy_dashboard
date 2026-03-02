function initPercentageChart(data) {

  const margin = { top: 50, right: 40, bottom: 60, left: 70 };

  const fullWidth = 900;
  const fullHeight = 450;

  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  const container = d3.select("#percentageChart");

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
// Data Preparation

  const sortedData = data.slice().sort((a, b) => a.Year - b.Year);

  const percentageData = sortedData.map(d => ({
    year: d.Year,
    value: d["Percentage from renewable sources and waste"]
  }));

// Scales

  const xScale = d3.scaleLinear()
    .domain(d3.extent(percentageData, d => d.year))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(percentageData, d => d.value)])
    .nice()
    .range([height, 0]);

//  Axes

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  // Y Axis
  svg.append("g")
    .call(
      d3.axisLeft(yScale)
        .tickFormat(d3.format(".2f"))
    );

  // Grid Lines
  svg.append("g")
    .attr("class", "grid")
    .call(
      d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
    )
    .selectAll("line")
    .attr("stroke-opacity", 0.08);

// Y Axis Label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Renewable Energy Share (%)");

    
// Title

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Renewable Energy Share Over Time");

    // Area Generator
  const area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(d.year))
    .y0(height)
    .y1(d => yScale(d.value));

  const areaPath = svg.append("path")
    .datum(percentageData)
    .attr("fill", "#69b3a2")
    .attr("opacity", 0)
    .attr("d", area);

  // Area Fade-In Animation
  areaPath
    .transition()
    .duration(1000)
    .ease(d3.easeCubicOut)
    .attr("opacity", 0.2);


// Line Generator

  const line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));

  const linePath = svg.append("path")
    .datum(percentageData)
    .attr("fill", "none")
    .attr("stroke", "#1b7f79")
    .attr("stroke-width", 4)
    .attr("stroke-linecap", "round")
    .attr("d", line);

// SAFE Line Animation

  const totalLength = linePath.node().getTotalLength();

  linePath
    .attr("stroke-dasharray", totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1500)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);

// Tooltip

  const focus = svg.append("circle")
    .attr("r", 6)
    .attr("fill", "#1b7f79")
    .style("opacity", 0);

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mousemove", function(event) {

      const [mouseX] = d3.pointer(event);
      const year = Math.round(xScale.invert(mouseX));

      const closest = percentageData.reduce((prev, curr) =>
        Math.abs(curr.year - year) < Math.abs(prev.year - year)
          ? curr
          : prev
      );

      focus
        .attr("cx", xScale(closest.year))
        .attr("cy", yScale(closest.value))
        .style("opacity", 1);

      d3.select("#tooltip")
        .style("opacity", 1)
        .html(`
          <strong>${closest.year}</strong><br/>
          ${closest.value.toFixed(2)} %
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");

    })
    .on("mouseout", function() {
      focus.style("opacity", 0);
      d3.select("#tooltip").style("opacity", 0);
    });

}