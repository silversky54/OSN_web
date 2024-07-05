// Importar D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { tc_ca_sca } from './tc_ca_sca.js';
export async function map_nacional() {
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const width = 350; // Convertido de pt a px
  const height = 1200; // Convertido de pt a px

  // Crear un nuevo SVG y agregarlo al cuerpo del documento
  const svg = d3.select("#p01").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "d3-plot")
    .append("g");

  // llamado de svg
  const data = await d3.xml("../assets/img/bna_cuencas_completa.svg");

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

  // Definir los rectángulos y los textos como variables
  const Norte = { color: "#F6DBA6", text: "Macrozona Norte", x: 0, y: 0, height: height / 3 };
  const Centro = { color: "#FFFFA6", text: "Macrozona Centro", x: 0, y: height / 3, height: height / 7 };
  const Sur = { color: "#BAE1A6", text: "Macrozona Sur", x: 0, y: height / 3 + height / 7, height: height / 7 }; // Igual altura que Centro
  const Austral = { color: "#A6ECFF", text: "Macrozona Austral", x: 0, y: height / 3 + 2 * (height / 7), height: height / 3 }; // Ajusta la altura aquí

  // Ancho de los rectángulos
  const rectWidth = 20; // Ajusta este valor según sea necesario

  // Función para dibujar un rectángulo y su texto correspondiente
  function drawRectangle(rectangle) {
    // Agregar el rectángulo
    svg.append("rect")
      .attr("x", rectangle.x)
      .attr("y", rectangle.y)
      .attr("width", rectWidth)
      .attr("height", rectangle.height) // Usar la altura del rectángulo
      .attr("fill", rectangle.color);

    // Agregar el texto
    svg.append("text")
      .attr("x", rectangle.x + rectWidth / 2) // Centrar el texto horizontalmente
      .attr("y", rectangle.y + rectangle.height / 2) // Centrar el texto verticalmente
      .text(rectangle.text)
      .attr("fill", "black") // Color del texto
      .attr("font-size", "20px") // Tamaño del texto
      .attr("dominant-baseline", "middle") // Alineación vertical del texto
      .attr("text-anchor", "middle") // Alineación horizontal del texto
      .attr("transform", `rotate(-90,${rectangle.x + rectWidth / 2},${rectangle.y + rectangle.height / 2})`); // Rotar el texto 90 grados
  }

  // Dibujar los rectángulos y el texto
  drawRectangle(Norte);
  drawRectangle(Centro);
  drawRectangle(Sur);
  drawRectangle(Austral);
}
