import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function c_map_location(watershed) {
    
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = 330; // Convertido de 247pt a px
    const height = 1180; // Convertido de 1024pt a px
  
    // Crear un nuevo SVG y agregarlo al cuerpo del documento
    const svg = d3.select("#p01").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "d3-plot")
      .append("g");
  
    // llamado de svg
    const data = await d3.xml("../assets/img/bna_cuencas_selecionadas.svg");
  
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
    const titles = ["010", "023", "024", "030", "038", "043", "045", "047", "051", "052", "054", "057", "060", "071", "073", "081", "083", "091", "094", "101", "103", "104", "105", "106", "107", "108", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129"];

    // Seleccionar solo los paths cuyo título está en la lista
    d3.selectAll('path')
      .filter(function() {
        return titles.includes(d3.select(this).attr('title'));
      })
      .style("stroke", function() {
        return d3.select(this).attr('title') === watershed ? "red" : "black"; // Si el título coincide con 'watershed', el borde es rojo. De lo contrario, es negro.
      })
      .style("stroke-width", function() {
        return d3.select(this).attr('title') === watershed ? "1px" : "0.5px"; // Si el título coincide con 'watershed', el ancho del borde es 1px. De lo contrario, es 0.5px.
      })
      .on("mouseover", function(event, d) {
        tooltip.style("visibility", "visible");
        d3.select(this)
          .style("stroke", "red") // Cambiar bordes a rojos en mouseover
          .style("stroke-width", "2px"); // Hacer los bordes más grandes en mouseover
      })
      .on("mousemove", function(event, d) {
        tooltip
          .html("Codigo BNA: " + d3.select(this).attr('title')  + "<br>" +
                "Nombre De La Cuenca: " + d3.select(this).attr('subtitle'))
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("visibility", "hidden");
        d3.select(this)
          .style("stroke", "black") // Volver a los bordes negros en mouseout
          .style("stroke-width", function() {
            return d3.select(this).attr('title') === watershed ? "1px" : "0.5px"; // Si el título coincide con 'watershed', el ancho del borde es 1px. De lo contrario, es 0.5px.
          });
      })
      .on("click", function(event, d) {
        // Obtener el título del polígono
        let title = d3.select(this).attr('title');
        
        // Redirigir al usuario a la página de cuencas con el título del polígono como parámetro
        window.location.href = "cuencas.html?cuenca=" + title;
      });
}
