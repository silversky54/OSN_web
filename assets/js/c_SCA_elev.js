import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Función async para cargar los datos
async function loadData(watershed_selected) {
  const csvData = await d3.csv(watershed_selected);
  const data = csvData.map(d => ({
    group: "Tred",
    Elevation: Math.round(d.Elevation),
    SCA: +d.SCA,
    CCA: +d.CCA
  }));
  return data;
}

export async function c_SCA_elev(watershed) {

  // set the dimensions and margins of the graph
  const margin = {top: 68, right: 100, bottom: 70, left:40};
  const width = 120 - margin.left - margin.right ;
  const height = 400 - margin.top - margin.bottom;

    // Si el ancho de la ventana es <= 768px, usará el contenedor móvil, de lo contrario el de escritorio.
    const containerId = window.innerWidth <= 767 ? "#p07-mob" : "#p07-desk";
  // Crear un nuevo SVG y agregarlo al cuerpo del documento
  const svg = d3.select(containerId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  const mainGroup = svg.append("g")
    .attr("id", "mainGroup") // Asigna un identificador único
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Text to create .csv file
  const text_ini = "../assets/csv/elev/MCD_SCA_elev_BNA_";
  const text_end = ".csv";

  // .csv file
  const watershed_selected = text_ini.concat(watershed).concat(text_end);

  //Read the data 
  const data = await loadData(watershed_selected);
  var group = "Trend"
  // Labels of row and columns
  const myGroups = Array.from(new Set(data.map(d => d.group)));
  const myVars = Array.from(new Set(data.map(d => d.Elevation)));

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([0, width])
    .domain(myGroups)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0).tickFormat(function (d) { return ''; }))
    .select(".domain").remove();

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([height, 0])
    .domain(myVars)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 7)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove();

  const colorScaleThreshold = d3
    .scaleThreshold()
    .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    .range(["#FFFFE6", "#FFFFB4", "#FFEBBE", "#FFD37F", "#FFAA00", "#E69800", "#70A800", "#00A884", "#0084A8", "#004C99"])

  // create a tooltip
  const tooltip = d3.select(containerId)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function (event, d) {
    var SCA = Number(d.SCA); // era una cadena y habla que pasarla a numero
    var CCA = Number(d.CCA); // era una cadena y habla que pasarla a numero
    tooltip
        .html( "Elevación: " + d.Elevation + " (msnm)" + "<br>" 
             + "Persistencia: " + SCA.toFixed(1) +  " %" +"<br>"  //tofixed es para definir la cantiada de decimales al mostrar.
             + "Nube: " + CCA.toFixed(1) +  " %" )
        .style("left", (event.pageX + 30) + "px") 
        .style("top", (event.pageY) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // Crear una escala de color para CCA
  const colorScaleCCA = d3.scaleThreshold()
    .domain([50])
    .range(["black", colorScaleThreshold]);

  // Function to draw the squares
  function drawSquares(useThreshold) {
    mainGroup.selectAll("*").remove(); // Remove all content from the main SVG group
    mainGroup.selectAll() // Make sure to add the squares to the main SVG group
      .data(data, function (d) { return d.group + ':' + d.Elevation; })
      .enter()
      .append("rect")
      .attr("x", function (d) { return x(d.group); })
      .attr("y", function (d) { return y(d.Elevation); })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) { 
        return useThreshold && d.CCA > 50 ? colorScaleCCA(d.CCA) : colorScaleThreshold(d.SCA); 
      })
      .style("stroke-width", 1)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  }

  // Draw the initial squares without using the CCA threshold
  drawSquares(false);

  // Add a checkbox that toggles the CCA threshold when clicked
  d3.select("#mainGroup")
    .append("input")
    .attr("type", "checkbox")
    .on("change", function() {
      drawSquares(this.checked); // Call drawSquares with the state of the checkbox
    });


    svg.append("text")
    .attr("font-family", "Arial")
    .style("fill", "black")
    .attr("font-size", "10px")
    .attr("text-anchor", "end")
    .attr("x", width/2 + 70)
    .attr("y", height + margin.top + 15)  
    .attr("transform", `rotate(0)`) // Rotar el texto
    .text("(2000-2024)");

  // Crea un grupo SVG para la leyenda
  const legendGroup = svg.append("g");



  // Legend
  
  let legX = 50
  let legY = 130

  legendGroup.append("text")
  .attr("x", legX)
  .attr("y", legY-15)
  .text("Nieve (%)")
  .style("font-size", "12px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#004C99")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+15)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#0084A8")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+30)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#00A884")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+45)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#70A800")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+60)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#E69800")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+75)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFAA00")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+90)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFD37F")
  
  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+105)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFEBBE")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+120)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFFFB4")

  legendGroup.append("rect")
  .attr("x", legX)
  .attr("y", legY+135)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "#FFFFE6")

/*
  
  svg.append("rect")
  .attr("x", legX)
  .attr("y", legY+135+28)
  .attr('height', 15)
  .attr('width', 15)
  .style("fill", "black")


  svg.append("text")
  .attr("x", legX+10)
  .attr("y", legY+7+15+15+15+15+15+15+15+15+30)
  .text("Nube (%)")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")


  svg.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15+15+15+30)
  .text(">50")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")
*/

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7)
  .text("90 - 100")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15)
  .text("80 - 90")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15)
  .text("70 - 80")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15)
  .text("60 - 70")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15)
  .text("50 - 60")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15)
  .text("40 - 50")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15)
  .text("30 - 40")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15)
  .text("20 - 30")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15+15)
  .text("10 - 20")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")

  legendGroup.append("text")
  .attr("x", legX+20)
  .attr("y", legY+7+15+15+15+15+15+15+15+15+15)
  .text("0 - 10")
  .style("font-size", "10px")
  .attr("font-family", "Arial")
  .attr("alignment-baseline", "middle")



}



