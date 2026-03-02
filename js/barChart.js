let barSvg, barXScale, barYScale, barWidth, barHeight;

// using INIT FUNCTION
function initBarChart(data, energySources, colorScale) {

  const margin = { top: 50, right: 20, bottom: 80, left: 70 };

  const fullWidth = 900;
  const fullHeight = 500;

  barWidth = fullWidth - margin.left - margin.right;
  barHeight = fullHeight - margin.top - margin.bottom;

  const container = d3.select("#barChart");

  barSvg = container
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X Scale
  barXScale = d3.scaleBand()
    .domain(energySources)
    .range([0, barWidth])
    .padding(0.25);

  // Y Scale
  barYScale = d3.scaleLinear()
    .range([barHeight, 0]);

  // X Axis
  barSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(barXScale))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");

  // Y Axis
  barSvg.append("g")
    .attr("class", "y-axis");

  // Y Axis Label
  barSvg.append("text")
    .attr("class", "y-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -55)
    .attr("x", -barHeight / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Energy Production (TWh)");

  // Chart Title
  barSvg.append("text")
    .attr("class", "bar-title")
    .attr("x", barWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold");
}


//  Using UPDATE FUNCTION
function updateBarChart(selectedYear) {

  const filteredData = window.fullData.find(d => d.Year === selectedYear);

  const formattedData = window.energySources.map(source => ({
    source: source,
    value: filteredData[source]
  }));

  const yMax = d3.max(formattedData, d => d.value);

  barYScale.domain([0, yMax]).nice();

  // Update Y Axis
  barSvg.select(".y-axis")
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .call(d3.axisLeft(barYScale));

  //  JOINing Data
  const bars = barSvg.selectAll(".bar")
    .data(formattedData, d => d.source);

  // ENTER
  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => barXScale(d.source))
    .attr("width", barXScale.bandwidth())
    .attr("y", barHeight)
    .attr("height", 0)
    .attr("fill", d => window.colorScale(d.source))
    .merge(bars)
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("x", d => barXScale(d.source))
    .attr("width", barXScale.bandwidth())
    .attr("y", d => barYScale(d.value))
    .attr("height", d => barHeight - barYScale(d.value));

  bars.exit().remove();


// VALUE LABELS ABOVE BARS
  const labels = barSvg.selectAll(".value-label")
    .data(formattedData, d => d.source);

  labels.enter()
    .append("text")
    .attr("class", "value-label")
    .attr("text-anchor", "middle")
    .attr("x", d => barXScale(d.source) + barXScale.bandwidth() / 2)
    .attr("y", barHeight)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .merge(labels)
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("x", d => barXScale(d.source) + barXScale.bandwidth() / 2)
    .attr("y", d => barYScale(d.value) - 5)
    .text(d => d.value.toFixed(2));

  labels.exit().remove();


// TITLE
  barSvg.select(".bar-title")
    .text(`Energy Breakdown in ${selectedYear}`);
}