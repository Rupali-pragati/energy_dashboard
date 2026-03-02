// Core Renewable Energy Sources
const energySources = [
  "Hydroelectric power",
  "Wind, wave, tidal [note1]",
  "Solar photovoltaic",
  "Biogas",
  "Liquid bio-fuels"
];

// Consistent color scale
const colorScale = d3.scaleOrdinal()
  .domain(energySources)
  .range(d3.schemeTableau10);

// Loading & Parse Data

d3.csv("data/renewable_cleaned.csv").then(data => {

  // Parse numeric fields
  data.forEach(d => {

    d.Year = +d.Year;

    energySources.forEach(source => {
      d[source] = +d[source] || 0;   // Prevent NaN
    });

    d["Percentage from renewable sources and waste"] =
      +d["Percentage from renewable sources and waste"] || 0;
  });

  // Sort by Year (IMPORTANT for growth calculation)
  data.sort((a, b) => a.Year - b.Year);
  window.fullData = data;
  window.energySources = energySources;
  window.colorScale = colorScale;

  console.log("Parsed first row:", data[0]);
  console.log("Columns:", Object.keys(data[0]));


// DATA AGGREGATION

  // Total renewable per year
  data.forEach(d => {
    d.TotalRenewable =
      d["Hydroelectric power"] +
      d["Wind, wave, tidal [note1]"] +
      d["Solar photovoltaic"] +
      d["Biogas"] +
      d["Liquid bio-fuels"];
  });

  // Year-over-year growth (safe calculation)
  for (let i = 1; i < data.length; i++) {

    const prev = data[i - 1].TotalRenewable;
    const current = data[i].TotalRenewable;

    if (prev !== 0) {
      data[i].GrowthRate = ((current - prev) / prev) * 100;
    } else {
      data[i].GrowthRate = 0;
    }
  }

  data[0].GrowthRate = 0;

  console.log("Aggregation check:", data[data.length - 1]);

// Extract Unique Years

  const years = Array.from(new Set(data.map(d => d.Year)))
    .sort((a, b) => a - b);

  console.log("Years array:", years);
  

// Initialize Charts

  initLineChart(data, energySources, colorScale);
  initBarChart(data, energySources, colorScale);
  initPercentageChart(data);

  const latest = data[data.length - 1];

document.getElementById("kpiTotal").innerText =
  latest.TotalRenewable.toFixed(2) + " TWh";

document.getElementById("kpiGrowth").innerText =
  latest.GrowthRate.toFixed(2) + " %";

// Populate Dropdown

  populateDropdown(years, data);

})
.catch(error => {
  console.error("Error loading CSV:", error);
});

//  Dropdown Logic

function populateDropdown(years, data) {

  const dropdown = d3.select("#yearDropdown");

  dropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Default select latest year
  const latestYear = years[years.length - 1];
  dropdown.property("value", latestYear);

  updateBarChart(latestYear);

  dropdown.on("change", function() {
    const selectedYear = +this.value;
    updateBarChart(selectedYear);
  });
}