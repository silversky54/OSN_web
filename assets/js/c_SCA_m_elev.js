import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Función para dibujar el gráfico
export async function c_SCA_m_elev(watershed) {
    // Set the dimensions and margins of the graph
    const margin = { top: 80, right: 80, bottom: 60, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select("#p13")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Append the slider
    const sliderContainer = d3.select("#p13")
        .append("div")
        .attr("class", "slider-container");
        var valueini = 30
    sliderContainer.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", valueini)
        .attr("class", "slider")
        .attr("id", "ccaSlider");

    sliderContainer.append("span")
        .attr("id", "sliderValue")
        .text("Nubes : 0%");

    // Text to create .csv file
    const text_ini = "../assets/csv/month/SCA_m_elev_BNA_";
    const text_end = ".csv";
    // .csv file
    const watershed_selected = text_ini.concat(watershed).concat(text_end);

    // Read the data
    const data = await d3.csv(watershed_selected);

    // Labels
    const myGroups = Array.from(new Set(data.map(d => d.Month)));
    const myVars = Array.from(new Set(data.map(d => d.Elevation)));

    // Build X scales and axis:
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.05);

    svg.append("g")
        .style("font-size", 12)
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".0f")).tickSize(3));

    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.05);

    const yAxis = d3.axisLeft(y)
        .tickValues(y.domain().filter(function (d, i) { return !(i % 5); }));

    svg.append("g").call(yAxis);

    // Build color scale
    const colorScaleThreshold = d3.scaleThreshold()
        .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
        .range(["#FFFFE6", "#FFFFB4", "#FFEBBE", "#FFD37F", "#FFAA00", "#E69800", "#70A800", "#00A884", "#0084A8", "#004C99"]);

    // Create a tooltip
    const tooltip = d3.select("#p13")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Tres funciones que cambian la información sobre herramientas cuando el usuario pasa el cursor/mueve/sale de una celda
    var mouseover = function (d) {
        tooltip.style("opacity", 1);
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);
    };

    var mousemove = function (event, d) {
        var SCA = Number(d.SCA); // Convertir a número
        var CCA = Number(d.CCA); // Convertir a número
        tooltip
            .html("Elevación: " + d.Elevation + " (msnm)" + "<br>"
                + "Cobertura: " + SCA.toFixed(1) + " %" + "<br>"
                + "Nube: " + CCA.toFixed(1) + " %" + "<br>"
                + "Mes: " + Math.floor(d.Month + 1)) // Redondear al número entero más cercano
            .style("left", (event.pageX + 30) + "px")
            .style("top", (event.pageY) + "px");
    };

    var mouseleave = function (d) {
        tooltip.style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8);
    };

    // Dibujar el gráfico
    svg.selectAll()
        .data(data, function (d) { return d.Month + ':' + d.Elevation; })
        .enter()
        .append("rect")
        .attr("class", "graph-rect")
        .attr("x", function (d) { return x(d.Month); })
        .attr("y", function (d) { return y(d.Elevation); })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) { return colorScaleThreshold(d.SCA); }) // Aplicar escala de color aquí
        .style("stroke-width", 1)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Add title to graph SCA promedio por mes (2000-2022) por elevacion
    // Etiqueta title
    svg.append("text")
        .attr("text-anchor", "center")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .attr("x", 0)
        .attr("y", -25)
        .text("11. Cobertura de nieve por elevación");

    // Etiqueta SUb titulo
    svg.append("text")
        .attr("text-anchor", "center")
        .attr("font-family", "Arial")
        .attr("font-size", "16px")
        .style("fill", "grey")
        .attr("x", + 35)
        .attr("y", -10)
        .text("Cuenca: " + watershed);

    // Etiqueta del eje X
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("x", width / 2 + 15)
        .attr("y", height + 40)
        .text("Mes");

    // Etiqueta del eje Y
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -80)
        .text("Elevación (msnm)");

    // Legend
    // Crea un grupo SVG para la leyenda
    const legendGroup = svg.append("g");
    let legX = 340
    let legY = 30

    const legendColors = ["#004C99", "#0084A8", "#00A884", "#70A800", "#E69800", "#FFAA00", "#FFD37F", "#FFEBBE", "#FFFFB4", "#FFFFE6"];
    const legendLabels = ["90 - 100", "80 - 90", "70 - 80", "60 - 70", "50 - 60", "40 - 50", "30 - 40", "20 - 30", "10 - 20", "0 - 10"];

    legendColors.forEach((color, i) => {
        legendGroup.append("rect")
            .attr("x", legX)
            .attr("y", legY + i * 15)
            .attr('height', 15)
            .attr('width', 15)
            .style("fill", color);

        legendGroup.append("text")
            .attr("x", legX + 20)
            .attr("y", legY + 7.5 + i * 15)
            .text(legendLabels[i])
            .style("font-size", "10px")
            .attr("font-family", "Arial")
            .attr("alignment-baseline", "middle");
    });


    // control deslizante (slider)
    function updateGraph() {
      const sliderValue = +d3.select("#ccaSlider").property("value");
      d3.select("#sliderValue").text(`Nubes : ${sliderValue}%`);
  
      svg.selectAll(".graph-rect")
          .style("fill", function (d) {
              const SCA = Number(d.SCA);
              const CCA = Number(d.CCA);
              return (CCA > sliderValue) ? "black" : colorScaleThreshold(SCA);
          });
  }
  updateGraph();
    // Agregar evento de actualización al control deslizante
    d3.select("#ccaSlider").on("input", updateGraph);


// Crear un botón de exportación dentro del SVG
var button = svg.append("foreignObject")
    .attr("width", 30) // ancho del botón
    .attr("height", 40) // alto del botón
    .attr("x", width + 30) // posiciona el botón en el eje x
    .attr("y",-48) // posiciona el botón en el eje Y
    .append("xhtml:body")
    .html('<button type="button" style="width:100%; height:100%; border: 0px; border-radius:5px; background-color: transparent;"><img src="../assets/img/descarga.png" alt="descarga" width="20" height="20"></button>')
    .on("click", function() {
        var columnNames = Object.keys(data[0]); 

        // Crea una nueva fila con los nombres de las columnas y agrega tus datos
        var csvData = [columnNames].concat(data.map(row => Object.values(row))).join("\n");
        
        var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var fileName = "Cobertura_De_Nieve_Por_Elevación_" + watershed + ".csv";
        
        var link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });










}

