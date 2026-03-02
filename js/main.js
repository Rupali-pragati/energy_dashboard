// Global Configuration

// Core Renewable Energy Sources
const energySources = [
  "Hydroelectric power",
  "Wind, wave, tidal [note1]",
  "Solar photovoltaic",
  "Biogas",
  "Liquid bio-fuels"
];

// Color scale (consistent across charts)
const colorScale = d3.scaleOrdinal()
  .domain(energySources)
  .range(d3.schemeTableau10);


// Load & Parse Data

d3.csv("data/renewable_cleaned.csv").then(data => {
  window.fullData = data;
  window.energySources = energySources;
  window.colorScale = colorScale;
  console.log("First row:", data[0]);
  console.log("All columns:", Object.keys(data[0]));
  // Parse numeric fields
  data.forEach(d => {
    d.Year = +d.Year;
    
    energySources.forEach(source => {
      d[source] = +d[source];
    });
    console.log("Sample row after parsing:", data[0]);
    console.log("All Year values:", data.map(d => d.Year));

   d["Percentage from renewable sources and waste"] =
  +d["Percentage from renewable sources and waste"];
  });

  console.log("Parsed row sample:", data[0]);
  console.log("Years extracted:", data.map(d => d.Year));
//   Extract Unique Years

  const years = Array.from(new Set(data.map(d => d.Year)))
    .sort((a, b) => a - b);

  console.log("Years array:", years);

 
//    Initialize Charts (Explicit Dependency Passing)

  initLineChart(data, energySources, colorScale);
  initBarChart(data, energySources, colorScale);
  initPercentageChart(data);

//   Populate Dropdown

  populateDropdown(years, data);

})
.catch(error => {
  console.error("Error loading CSV:", error);
});

// Dropdown Logic
function populateDropdown(years, data) {

  const dropdown = d3.select("#yearDropdown");

  // Bind years
  dropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Default select latest year
  const latestYear = years[years.length - 1];
  dropdown.property("value", latestYear);

  // Initial bar chart update
  updateBarChart(latestYear);

//  Dropdown Event Listener
   

  dropdown.on("change", function() {
    const selectedYear = +this.value;
    updateBarChart(selectedYear);
  });
}

