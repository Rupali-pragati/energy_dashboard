
  // Responsive Multi-Line Chart with Advanced Tooltip

function initLineChart(data, energySources, colorScale) {

  const margin = { top: 40, right: 80, bottom: 50, left: 60 };

  const container = d3.select("#lineChart");
  const containerWidth = container.node().getBoundingClientRect().width;

  const width = containerWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const fullWidth = width + margin.left + margin.right;
  const fullHeight = height + margin.top + margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", fullHeight)
    .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
   
    // Data Preparation
   

  const sortedData = data.slice().sort((a, b) => a.Year - b.Year);

  const seriesData = energySources.map(source => ({
    source: source,
    values: sortedData.map(d => ({
      year: d.Year,
      value: d[source]
    }))
  }));


  // Scales

  const xMin = d3.min(sortedData, d => d.Year);
  const xMax = d3.max(sortedData, d => d.Year);

  const xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([0, width]);

  const yMax = d3.max(seriesData, s =>
    d3.max(s.values, v => v.value)
  );

  const yScale = d3.scaleLinear()
    .domain([0, 2])
    .nice()
    .range([height, 0]);


  // Axes

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
    );

  svg.append("g")
    .call(d3.axisLeft(yScale));

   
  //  Vertical Focus Line

  const focusLine = svg.append("line")
    .attr("stroke", "#aaa")
    .attr("y1", 0)
    .attr("y2", height)
    .style("opacity", 0);


  //  Line Generator

  const lineGenerator = d3.line()
    .curve(d3.curveMonotoneX)
    .defined(d => !isNaN(d.value))
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));


// Draw Lines with Safe Animation

  const paths = svg.selectAll(".energy-line")
    .data(seriesData)
    .enter()
    .append("path")
    .attr("class", d => `energy-line source-${sanitize(d.source)}`)
    .attr("fill", "none")
    .attr("stroke", d => colorScale(d.source))
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round")
    .attr("cursor", "pointer")
    .attr("d", d => lineGenerator(d.values));

// Animation
  paths.each(function() {
    const totalLength = this.getTotalLength();

    d3.select(this)
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);
  });


// Interactions

  paths
    .on("mouseover", function(event, d) {

      d3.selectAll(".energy-line")
        .style("opacity", 0.2);

      d3.select(this)
        .style("opacity", 1)
        .transition()
        .duration(150)
        .style("stroke-width", 4);
    })

    .on("mousemove", function(event, d) {

      const [mouseX] = d3.pointer(event);

      const rawYear = xScale.invert(mouseX);

      const clampedYear = Math.max(
        xMin,
        Math.min(xMax, rawYear)
      );

      const yearData = d.values.reduce((prev, curr) =>
        Math.abs(curr.year - clampedYear) < Math.abs(prev.year - clampedYear)
          ? curr
          : prev
      );

      const tooltip = d3.select("#tooltip");

      tooltip
        .style("opacity", 1)
        .html(`
          <strong>${d.source}</strong><br/>
          Year: ${yearData.year}<br/>
          Value: ${yearData.value.toFixed(2)}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");

      focusLine
        .attr("x1", xScale(yearData.year))
        .attr("x2", xScale(yearData.year))
        .style("opacity", 1);
    })

    .on("mouseout", function() {

      d3.selectAll(".energy-line")
        .style("opacity", 1)
        .transition()
        .duration(150)
        .style("stroke-width", 3);

      d3.select("#tooltip").style("opacity", 0);

      focusLine.style("opacity", 0);
    });
}

// Helper Sanitize for Class Names

function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "");
}