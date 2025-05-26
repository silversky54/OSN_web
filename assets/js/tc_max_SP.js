import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function tc_max_SP() {

    const margin = { top: 10, right: 0, bottom: 40, left: 30 };
    const width = 180 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Si el ancho de la ventana es <= 768px, usará el contenedor móvil, de lo contrario el de escritorio.
    const containerId = window.innerWidth <= 767 ? "#p07-mob" : "#p07-desk";
  // Crear un nuevo SVG y agregarlo al cuerpo del documento
  const svg = d3.select(containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "d3-plot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Creación del tooltip
       var tooltip = d3.select(containerId)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");

    const data = await d3.csv("/assets/csv/total/MCD_tc_SP_anomalia.csv");

    const y = d3.scaleBand()
        .rangeRound([0, height], .3)
        .paddingInner(0.1) // Agrega un pequeño espacio entre las bandas
        .paddingOuter(0.2); // Agrega espacio adicional en los bordes del eje Y

    const x = d3.scaleLinear()
        .rangeRound([0, width]);

    const color = d3.scaleOrdinal()
                .range(["#c7001e", "#f6a580", "#cccccc", "#92c6db", "#086fad"]);

    color.domain(["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);

    const xAxis = d3.axisBottom(x)
    .ticks(5)
    //.tickFormat(function(d) { return d*(-1); });

    const yAxis = d3.axisLeft(y);

    data.forEach(function(d) {
        d["Strongly disagree"] = +d[1];
        d["Disagree"] = +d[2];
        d["Neither agree nor disagree"] = +d[3];
        d["Agree"] = +d[4];
        d["Strongly agree"] = +d[5];
        let x0 = -1*(d["Neither agree nor disagree"]/2+d["Disagree"]+d["Strongly disagree"]);
        let idx = 0;
        d.boxes = color.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name], N: +d.N, n: +d[idx += 1], data: d };
        });
    });

    const min_val = d3.min(data, function(d) {
        return d.boxes["0"].x0;
    });

    const max_val = d3.max(data, function(d) {
        return d.boxes["4"].x1;
    });

    const buffer = Math.abs(max_val - min_val) * 0.05; // 10% del rango
    x.domain([min_val - buffer, max_val + buffer]).nice(); // Espacio en ambos extremos
  
    y.domain(data.map(function(d) { return d.COD_CUEN; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    const vakken = svg.selectAll(".question")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.COD_CUEN) + ")"; });

    const bars = vakken.selectAll("rect")
        .data(function(d) { return d.boxes; })
        .enter().append("g").attr("class", "subbar");

    bars.append("rect")
        .attr("height", y.bandwidth()* 1) // "sombra a las barras
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .style("fill", function(d) { return color(d.name); })
        .on("mouseover", function(d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mousemove", function(event, d) {
            let cobertura = -(d.data["1"] ? parseFloat(d.data["1"]) : 0) + (d.data["5"] ? parseFloat(d.data["5"]) : 0);
            // Redondea hacia abajo para obtener un número entero
            cobertura = Math.floor(cobertura);
            tooltip
                .html("Cuenca: " + d.data.COD_CUEN + "<br>" + 
                      "Anomalia cobertura: " +  cobertura + " %"
                      )
                .style("left", (event.pageX + 30) + "px")
                .style("top", (event.pageY + 30) + "px");
        })
        
        .on("mouseout", function(d) {
            tooltip
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        });

    vakken.insert("rect", ":first-child")
        .attr("height", y.bandwidth())
        .attr("x", "1")
        .attr("width", width)
        .attr("fill-opacity", "0.5")
        .style("fill", "#F5F5F5")
        .attr("class", function(d,index) { return index % 2 == 0 ? "even" : "uneven"; });


// Linea que diferencia entre cuencas 
// array de configuración al inicio de tu función : id cuenca color y posicion
function generateIDRange(startNum, endNum, color, position) {
    const ids = [];
    for (let i = startNum; i <= endNum; i++) {
        ids.push({
            id: i.toString().padStart(3, '0'), // Formatea a 3 dígitos
            color: color,
            position: position
        });
    }
    return ids;
}

// Configuración de todos los rangos
const specialQuestions = [
    // Rango 010-047 (Amarillo mostaza - derecha)
    ...generateIDRange(10, 47, "#FFD37F", "right"),
    
    // Rango 051-073 (Amarillo brillante - derecha)
    ...generateIDRange(51, 73, "#FFFF73", "right"),
    
    // Rango 081-104 (Verde menta - derecha)
    ...generateIDRange(81, 104, "#BAE1A6", "right"),
    
    // Rango 105-129 (Azul claro - derecha)
    ...generateIDRange(105, 129, "#73DFFF", "right"),
];
specialQuestions.forEach(config => {
    vakken.filter(d => d.COD_CUEN === config.id)
        .append("rect")
        .attr("x", x(0) - 93) //  Centrado en el eje Y (mitad del ancho de 6px)
        .attr("width", 6)
        .attr("height", y.bandwidth())
        .attr("fill", config.color)
        .style("shape-rendering", "crispEdges");
});

    svg.append("g")
        .attr("class", "y axis")
        .append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y2", height);

    svg.append("text")
    .attr("x", 40)
    .attr("y", 585)
    .attr("text-anchor", "center")
    .style("font-size", "14px")
    .attr("font-family","Arial")
    .text("(%) Anomalías");



// CSV Persistencia de nieve 2000-2023,Cambios acumulados 2000-2023, Anomalías Cobertura Maxima 2023


const info = "../assets/csv/total/Cobertura_Area_Nacional.csv";
const T_csv = await d3.csv(info);


// Crear un botón de exportación dentro del SVG
/*
// Crear un botón de exportación dentro del SVG
var button = svg.append("foreignObject")
    .attr("width", 30) // ancho del botón
    .attr("height", 40) // alto del botón
    .attr("x", 125 ) // posiciona el botón en el eje x
    .attr("y", -10 ) // posiciona el botón en el eje Y
    .append("xhtml:body")
    .html('<button type="button" style="width:100%; height:100%; border: 0px; border-radius:5px; background-color: transparent;"><img src="../assets/img/descarga.png" alt="descarga" width="20" height="20"></button>')
    .on("click", function() {
        var columnNames = Object.keys(T_csv[0]); 

        // Crea una nueva fila con los nombres de las columnas y agrega tus datos
        var csvData = [columnNames].concat(T_csv.map(row => Object.values(row))).join("\n");
        
        var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var fileName = "Cobertura_Area_Nacional.csv";
        
        var link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
*/
}