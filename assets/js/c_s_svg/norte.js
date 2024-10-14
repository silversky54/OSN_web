import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export async function p0n() {
    const margin = { top: -10, right: 100, bottom: 0, left: 0 };
    const width = 320; // Convertido de pt a px
    const height = 460; // Convertido de pt a px    
  
    // Crear un nuevo SVG y agregarlo al cuerpo del documento
    const svg = d3.select("#p0n").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "d3-plot")
      .append("g");
  
    // llamado de svg
    const data = await d3.xml("/assets/img/norte.svg");
  
    // Importar el SVG al DOM
    let importedNode = document.importNode(data.documentElement, true);
    svg.node().appendChild(importedNode);
      // Crear un tooltip
  let tooltip = d3.select("body").append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("background", "white") // Agregar fondo blanco
  .style("border", "solid") // Agregar borde
  .style("border-width", "1px") // Ancho del borde
  .style("border-radius", "5px") // Radio del borde
  .style("padding", "10px"); // Espacio interior

// Lista de títulos de los paths a seleccionar
const titles = ["010", "023", "024", "030", "038", "043", "045", "047"];

// Seleccionar solo los paths cuyo título está en la lista
d3.selectAll('path')
  .filter(function() {
    return titles.includes(d3.select(this).attr('title'));
  })
  .style("stroke", "black") // Bordes negros por defecto
  .style("stroke-width", "0.5px") // Ancho de los bordes por defecto más delgado
  .on("mouseover", function(event, d) {
    tooltip.style("visibility", "visible");
    d3.select(this)
      .style("stroke", "red") // Cambiar bordes a rojos en mouseover
      .style("stroke-width", "2px"); // Hacer los bordes más grandes en mouseover

    var cuencaID = d3.select(this).attr('title'); // Extraer el ID de la cuenca desde el atributo 'title'
    d3.selectAll('.bar-' + cuencaID).style("fill", "yellow"); // Resaltar las barras correspondientes
  })
  .on("mousemove", function(event, d) {
    tooltip
      .html("Codigo BNA: " + d3.select(this).attr('title') + "<br>" +
            "Nombre De La Cuenca: " + d3.select(this).attr('subtitle'))
      .style("top", (event.pageY - 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  })
  .on("mouseout", function(event, d) {
    tooltip.style("visibility", "hidden");
    d3.select(this)
      .style("stroke", "black") // Volver a los bordes negros en mouseout
      .style("stroke-width", "0.5px"); // Volver al ancho de los bordes por defecto en mouseout

    var cuencaID = d3.select(this).attr('title'); // Extraer el ID de la cuenca desde el atributo 'title'
    d3.selectAll('.bar-' + cuencaID).style("fill", function(d) { return d3.select(this).attr('original-color'); }); // Volver al color original
  })
  .on("click", function(event, d) {
    // Obtener el título del polígono
    let title = d3.select(this).attr('title');
    
    // Redirigir al usuario a la página de cuencas con el título del polígono como parámetro
    window.location.href = "cuencas.html?cuenca=" + title;
  });



  const Centro = { color: "#FFFFA6", text: "Macrozona Centro", x: 0, y: 0, height: 900 / 3 };

  const rectWidth = 20;

  function drawRectangle(rectangle) {
    svg.append("rect")
      .attr("x", rectangle.x)
      .attr("y", rectangle.y)
      .attr("width", rectWidth)
      .attr("height", rectangle.height)
      .attr("fill", rectangle.color);

    svg.append("text")
      .attr("x", rectangle.x + rectWidth / 2)
      .attr("y", rectangle.y + rectangle.height / 2)
      .text(rectangle.text)
      .attr("fill", "black")
      .attr("font-size", "20px")
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90,${rectangle.x + rectWidth / 2},${rectangle.y + rectangle.height / 2})`);
  }

  drawRectangle(Centro);
}

