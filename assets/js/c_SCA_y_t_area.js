// Importar D3.js desde CDN
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Función asincrónica para cargar y dibujar el gráfico
export async function c_SCA_y_t_area(watershed) {
  // 1) Dimensiones y contenedor
  const margin = { top: 80, right: 0, bottom: 60, left: 50 };
  const width = 550 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const containerId = window.innerWidth <= 767 ? "#p05-mob" : "#p05-desk";

  const svg = d3.select(containerId)
    .append("svg")
      .attr("width",  width  + margin.left + margin.right + 100)
      .attr("height", height + margin.top  + margin.bottom + 50)
      .attr("id", "d3-plot")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // 2) Cargar CSV
  const path = `../assets/csv/year/MCD_SCA_y_t_area_BNA_${watershed}.csv`;
  let data = await d3.csv(path, d => ({
    raw:       d.Sen_slope,                // "n10","n09",…
    Area:     +d.Area,                     // número
    Sen_slope_num:
      d.Sen_slope === "0" ? 0 :
      d.Sen_slope.startsWith("n") ? -parseInt(d.Sen_slope.slice(1)) :
      parseInt(d.Sen_slope.slice(1))
  }));

  // 3) Mapa directo de etiquetas para el eje X
  const labelMap = {
    n10: "-10]", n09: "(-10, -9]",  n08: "(-9, 8]",  n07: "(-8, -7]",  n06: "(-7,-6]",
    n05: "(-6, -5]",   n04: "(-5,-4]",  n03: "(-4, -3]",  n02: "(-3,-2]",  n01: "(-2, 1]",
    0: "(-1, 1)", 
    p01: "[1, 2)",   p02: "[2, 3)",  p03: "[3, 4)",  p04: "[4, 5",  p05: "[5, 6)",
    p06: "[6, 7)",   p07: "[7, 8)",  p08: "[8, 9)",  p09: "[9, 10)",  p10: "[10",
  };

  // Asignar etiqueta y ordenar
  data.forEach(d => d.label = labelMap[d.raw]);
  data.sort((a, b) => a.Sen_slope_num - b.Sen_slope_num);

  // 4) Escalas
  const x = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Area) * 1.05])
    .range([height, 0]);

  // 5) Ejes
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  // 6) Tooltip
  const tooltip = d3.select(containerId)
    .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background", "white")
      .style("border", "2px solid #666")
      .style("border-radius", "4px")
      .style("padding", "6px");

  // 7) Colores por valor de pendiente
  const myColor = d3.scaleThreshold()
    .domain(d3.range(-10, 11, 1))
    .range([
      "#FF0000", "#FF0303", "#FF1E1F", "#FE393A", "#FE5456",
      "#FD6F72", "#FD8B8D", "#FCA6A9", "#FCC1C5", "#FBDCE0",
      "#FBF7FC", "#DFDEFC", "#C4C4FD", "#A8ABFD", "#8D92FD",
      "#7178FE", "#565FFE", "#3A46FE", "#1F2CFF", "#0313FF",
      "#0000FF"
    ]);

  // 8) Dibujar barras
  svg.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x",     d => x(d.label))
      .attr("width", x.bandwidth())
      .attr("y",     d => y(0))
      .attr("height", 0)
      .attr("fill",  d => myColor(d.Sen_slope_num))
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`Tendencia: ${d.label}<br>Superficie: ${Math.round(d.Area)} km²`)
        .style("left", (event.pageX + 10) + "px")
        .style("top",  (event.pageY + 10) + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top",  (event.pageY + 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .transition()
      .duration(800)
      .attr("y",      d => y(d.Area))
      .attr("height", d => height - y(d.Area))
      .delay((d,i) => i * 50);

  // 9) Etiquetas de texto
  svg.append("text")
    .attr("x", 0).attr("y", -25)
    .attr("font-size", "20px")
    .text("4. Superficie por tendencia anual");

  svg.append("text")
    .attr("x", 22).attr("y", -5)
    .attr("fill", "grey")
    .attr("font-size", "16px")
    .text(`Cuenca: ${watershed}`);

  svg.append("text")
    .attr("x", width/2).attr("y", height + 60)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .text("Tendencia (%/año)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2 + 40).attr("y", -35)
    .attr("text-anchor", "end")
    .attr("font-size", "13px")
    .text("Superficie (km²)");

  // 10) Botón de exportación (igual que antes)
  const button = svg.append("foreignObject")
      .attr("width", 30).attr("height", 40)
      .attr("x", width - 25).attr("y", -48)
    .append("xhtml:body")
      .html(`
        <button style="width:100%;height:100%;background:transparent;border:none;">
          <img src="../assets/img/descarga.png" width="20" height="20" alt="descarga">
        </button>
      `)
      .on("click", () => {
        const csv = "Tendencia,Area\n" +
          data.map(d => `${d.label},${d.Area}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url;
        a.download = `MCD_SCA_y_t_area_BNA_${watershed}.csv`;
        document.body.append(a);
        a.click();
        a.remove();
      });
}
