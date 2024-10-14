import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function p0c() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = 560; // Convertido de pt a px
    const height = 460; // Convertido de pt a px    

    // Crear un nuevo SVG y agregarlo al cuerpo del documento
    const svg = d3.select("#p0c").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "d3-plot")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top}) scale(1.5)`); // Aplicar zoom fijo

    // Llamado de svg
    const data = await d3.xml("/assets/img/centro-sur.svg");

    // Importar el SVG al DOM
    let importedNode = document.importNode(data.documentElement, true);
    svg.node().appendChild(importedNode);

    // Crear un tooltip
    let tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "white") // Fondo blanco
      .style("border", "solid") // Borde
      .style("border-width", "1px") // Ancho del borde
      .style("border-radius", "5px") // Radio del borde
      .style("padding", "10px"); // Espacio interior

    // Lista de títulos de los paths a seleccionar
    const titles = ["051", "052", "054", "057", "060", "071", "073", "081", "083", "091", "094", "101", "103", "104"];

    // Seleccionar y modificar los paths
    d3.selectAll('path')
      .filter(function() {
        return titles.includes(d3.select(this).attr('title'));
      })
      .style("stroke", "black")
      .style("stroke-width", "0.5px")
      .on("mouseover", function(event, d) {
        tooltip.style("visibility", "visible");
        d3.select(this)
          .style("stroke", "red")
          .style("stroke-width", "2px");
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
          .style("stroke", "black")
          .style("stroke-width", "0.5px");
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
