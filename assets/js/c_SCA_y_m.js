import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Función para dibujar el gráfico 
export async function c_SCA_y_m(watershed) {
    // set the dimensions and margins of the graph
    const margin = { top: 80, right: 0, bottom: 60, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    // Si el ancho de la ventana es <= 768px, usará el contenedor móvil, de lo contrario el de escritorio.
    const containerId = window.innerWidth <= 767 ? "#p14-mob" : "#p14-desk";

  // Crear un nuevo SVG y agregarlo al cuerpo del documento
  const svg = d3.select(containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);




    // Text to create .csv file
    const text_ini = "../assets/csv/yearMonth/SCA_y_m_BNA_";
    const text_end =  ".csv";
    // .csv file
    const watershed_selected = text_ini.concat(watershed).concat(text_end);
    // Read the data

const data = await d3.csv(watershed_selected, d => ({
    ...d,
    Elevation: Math.round(d.Elevation), // redondear a numeros enteros la elevación
    SCA: +d.SCA,
    CCA: +d.CCA,

  }));
    // Labels
    const myGroups = Array.from(new Set(data.map(d => d.Year)));
    const myVars = Array.from(new Set(data.map(d => d.Month)));
   
    // Build X scales and axis:
    const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(myGroups)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 10)
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(5))
        .selectAll("text") 
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(myVars)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 10)
        .call(d3.axisLeft(y).tickSize(5))
        .select(".domain").remove();

    const colorScaleThreshold = d3
        .scaleThreshold()
        .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
        .range(["#FFFFE6", "#FFFFB4", "#FFEBBE", "#FFD37F", "#FFAA00", "#E69800", "#70A800", "#00A884", "#0084A8", "#004C99"]);

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

    var mouseover = function(d) {
        tooltip
          .style("opacity", 1);
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1);
    };

    var mousemove = function (event, d) {
        var SCA = Number(d.SCA); 
        var CCA = Number(d.CCA); // era una cadena y habla que pasarla a numero
        tooltip
            .html(  "Cobertura: " + SCA.toFixed(1) + " %"  + "<br>" 
                 + "Nube: " + CCA.toFixed(1) +  " %" +"<br>"
                 +  "Mes: " + d.Month + "<br>"
                 +  "Año: " + d.Year + "<br>")
            .style("left", (event.pageX + 30) + "px") 
            .style("top", (event.pageY) + "px");
    };

    var mouseleave = function(d) {
        tooltip
          .style("opacity", 0);
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8);
    };

    // Add the squares
    svg.selectAll()
        .data(data, d => `${d.Year}:${d.Month}`)
        .enter()
        .append("rect")
            .attr("class", "graph-rect") 
            .attr("x", d => x(d.Year))
            .attr("y", d => y(d.Month))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill",function (d) { return colorScaleThreshold(d.SCA); })
            .style("stroke-width", 1)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

    // Add the slider container

// Coordenadas donde quieres el slider (ajústalas)
const sliderX = 130; // Ejemplo: centro horizontal
const sliderY = 300; // Ejemplo: debajo del gráfico

// Contenedor del slider
const sliderGroup = svg.append("foreignObject")
    .attr("x", sliderX)
    .attr("y", sliderY)
    .attr("width", 320)
    .attr("height", 50);

sliderGroup.append("xhtml:div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px")
    .html(`
        <input type="range" id="ccaSlider2" min="0" max="100" value="30" style="width: 150px">
        <span id="sliderLabel2" style="font-family: Arial; font-size: 14px;">Nubosidad > : 30%</span>
        <div style="width: 15px; height: 15px; background: black; border: 1px solid #999"></div>
    `);

// Función de actualización
function updateGraph() {
    const sliderValue = +d3.select("#ccaSlider2").property("value");
    d3.select("#sliderLabel2").text(`Nubosidad > : ${sliderValue}%`);  
    
    svg.selectAll(".graph-rect") // Usar clase específica
        .style("fill", d => (d.CCA > sliderValue) ? "black" : colorScaleThreshold(d.SCA));
}

// Ejecutar al inicio
updateGraph(); // <--- ¡Clave para inicializar!

// Evento del slider
d3.select("#ccaSlider2").on("input", updateGraph);



    // Etiqueta title
    svg.append("text")
        .attr("text-anchor", "center")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .attr("x", 0)
        .attr("y", -35)
        .text("11. Cobertura de nieve promedio por año y mes");

    // Etiqueta Sub titulo
    svg.append("text")
        .attr("text-anchor", "center")
        .attr("font-family", "Arial")
        .attr("font-size", "16px")
        .style("fill", "grey")
        .attr("x", 32)
        .attr("y", -10)
        .text("Cuenca: "+ watershed);

    // Etiqueta del eje X
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("x", width / 2 + 15)
        .attr("y", height + 40)
        .text("Año");

    // Etiqueta del eje Y
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("x", -100)
        .text("Meses");

    // Crear un botón de exportación dentro del SVG
    var button = svg.append("foreignObject")
        .attr("width", 30) // ancho del botón
        .attr("height", 40) // alto del botón
        .attr("x", width - 25) // posiciona el botón en el eje x
        .attr("y",-48) // posiciona el botón en el eje Y
        .append("xhtml:body")
        .html('<button type="button" style="width:100%; height:100%; border: 0px; border-radius:5px; background-color: transparent;"><img src="../assets/img/descarga.png" alt="descarga" width="20" height="20"></button>')
        .on("click", function() {
            var columnNames = Object.keys(data[0]); 

            // Crea una nueva fila con los nombres de las columnas y agrega tus datos
            var csvData = [columnNames].concat(data.map(row => Object.values(row))).join("\n");
            
            var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var fileName = "Cobertura_De_Nieve_Por_Año_y_Mes_" + watershed + ".csv";
            
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
}
