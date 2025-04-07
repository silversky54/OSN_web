import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function c_map_location(watershed) {
  const margin = { top: 40, right: 0, bottom: 0, left: 0 };
  const width = 350; // Convertido de pt a px
  const height = 1200; // Convertido de pt a px
 // Define el contenedor según el dispositivo:
    // Si el ancho de la ventana es <= 768px, usará el contenedor móvil, de lo contrario el de escritorio.
    const containerId = window.innerWidth <= 767 ? "#p01-mob" : "#p01-desk";
  // Crear un nuevo SVG y agregarlo al cuerpo del documento
  const svg = d3.select(containerId).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "d3-plot")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Llamado de SVG
  const data = await d3.xml("../assets/img/bna_cuencas_selecionadas.svg");

  // Importar el SVG al DOM
  let importedNode = document.importNode(data.documentElement, true);
  svg.node().appendChild(importedNode);

  // Crear un tooltip
  let tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  // Lista de títulos de los paths a seleccionar
  const titles = ["010", "023", "024", "030", "038", "043", "045", "047", "051", "052", "054", "057", "060", "071", "073", "081", "083", "091", "094", "101", "103", "104", "105", "106", "107", "108", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129"];

  // Seleccionar solo los paths cuyo título está en la lista
  const paths = svg.selectAll('path')
    .filter(function() {
      return titles.includes(d3.select(this).attr('title'));
    })
    .style("stroke", function() {
      return d3.select(this).attr('title') === watershed ? "red" : "black";
    })
    .style("stroke-width", function() {
      return d3.select(this).attr('title') === watershed ? "1px" : "0.5px";
    })
    .each(function() {
      if (d3.select(this).attr('title') === watershed) {
        d3.select(this).style("fill", "red");
      }
    });

  // Event listeners
  paths.on("mouseover", function(event, d) {
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
  .on("mouseout", function(d) {
    tooltip.style("visibility", "hidden");
    d3.select(this)
      .style("stroke", "black")
      .style("stroke-width", function() {
        return d3.select(this).attr('title') === watershed ? "1px" : "0.5px";
      });
  })
  .on("click", function(event, d) {
    let title = d3.select(this).attr('title');

    // Remover el relleno rojo de la cuenca previamente seleccionada
    paths.style("fill", function() {
      return d3.select(this).attr('title') === title ? "red" : null;
    });

    // Añadir el relleno rojo a la cuenca actual
    d3.select(this).style("fill", "red");

    // Redirigir al usuario a la página de cuencas con el título del polígono como parámetro
    window.location.href = "cuencas.html?cuenca=" + title;
  });





 const selectedCuenca = paths.filter(function() {
    return d3.select(this).attr('title') === watershed;
  });

  const cuencaName = selectedCuenca.empty() 
    ? "Seleccione una cuenca" 
    : selectedCuenca.attr("subtitle");
  
  const cuencaCode = selectedCuenca.empty() 
    ? "Código no disponible" 
    : selectedCuenca.attr("title");

  // Texto principal
  const title = svg.append("text")
    .attr("x", 20)
    .attr("y", -30) // Posición relativa al margen
    .style("font-family", "Arial")
    .style("font-size", "14px")
    .style("fill", "black");

  // Línea 1 - Título
  title.append("tspan")
    .style("font-weight", "bold")
    .text("1. Nombre de la Cuenca:");

  // Línea 2 - Nombre
  title.append("tspan")
    .attr("x", 20)
    .attr("dy", "1.5em")
    .text(`• ${cuencaName}`);

  // Línea 3 - Código
  title.append("tspan")
    .attr("x", 20)
    .attr("dy", "1.5em")
    .text(`• Código BNA: ${cuencaCode}`);
 

}
