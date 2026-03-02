d3.csv("renewable_cleaned.csv").then(function(data) {

    data.forEach(function(d) {
        d.Year = +d.Year;
        d["Hydroelectric power"] = +d["Hydroelectric power"];
        d["Wind, wave, tidal"] = +d["Wind, wave, tidal"];
        d["Solar photovoltaic"] = +d["Solar photovoltaic"];
        d["Landfill gas"] = +d["Landfill gas"];
        d["Biogas"] = +d["Biogas"];
        d["Liquid bio-fuels"] = +d["Liquid bio-fuels"];
        d["Energy from renewable & waste sources"] = +d["Energy from renewable & waste sources"];
        d["Percentage from renewable sources and waste"] = +d["Percentage from renewable sources and waste"];
    });

    console.log(data);

});