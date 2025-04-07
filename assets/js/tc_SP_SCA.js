// Importación de D3.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Función principal para dibujar el gráfico
export async function tc_SP_SCA(index) {
    // Definición de márgenes, ancho y alto
    const margin = { top: 10, right: 0, bottom: 40, left:80 };
    const width = 260 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Define el contenedor según el dispositivo
    const containerId = window.innerWidth <= 767 ? "#p02-mob" : "#p02-desk";
    
    // Crear SVG
    const svg = d3.select(containerId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "d3-plot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Tooltip
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

    // Carga de datos
    const data = await d3.dsv(",", "../assets/csv/total/tc_SP_SCA.csv", function(d) {
        return {
            Question: d.Question,
            "1": +d["1"],
            "2": +d["2"],
            "3": +d["3"],
            "4": +d["4"],
            "5": +d["5"]
        };
    });

    // Escalas
    const y = d3.scaleBand()
        .rangeRound([0, height], .3)
        .paddingInner(0.1)
        .paddingOuter(0.2);

    const x = d3.scaleLinear()
        .rangeRound([0, width]);

    const color = d3.scaleOrdinal()
        .range(["blue", "orange", "yellow", "orange", "blue"])
        .domain(["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"]);

    // Ejes
    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d => Math.abs(d));

    const yAxis = d3.axisLeft(y);

    // Transformación de datos
    data.forEach(function(d) {
        d["Strongly disagree"] = +d["1"];
        d["Disagree"] = +d["2"];
        d["Neither agree nor disagree"] = +d["3"];
        d["Agree"] = +d["4"];
        d["Strongly agree"] = +d["5"];
        let x0 = -1 * (d["Neither agree nor disagree"] + d["Disagree"] + d["Strongly disagree"]);
        let idx = 0;
        d.boxes = color.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name], N: +d.N, n: +d[idx += 1], data: d };
        });
    });

    // Dominios
    const min_val = d3.min(data, d => d.boxes[0].x0);
    const max_val = d3.max(data, d => d.boxes[4].x1);
    x.domain([min_val * 1.1, 0]);
    y.domain(data.map(d => d.Question));

    // Dibujar ejes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Crear barras
    const vakken = svg.selectAll(".question")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", d => `translate(0,${y(d.Question)})`);

    // Barras principales
    const bars = vakken.selectAll("rect")
        .data(d => d.boxes)
        .enter().append("g")
        .attr("class", "subbar");

    bars.append("rect")
        .attr("height", y.bandwidth())
        .attr("x", d => x(d.x0))
        .attr("width", d => x(d.x1) - x(d.x0))
        .style("fill", d => color(d.name))
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            d3.select(this).style("opacity", 0.8);
        })
        .on("mousemove", function(event, d) {
            tooltip
                .html(`Cuenca: ${d.data.Question}<br>
                       Permanente: ${d.data["1"]}%<br>
                       Estacional: ${d.data["2"]}%<br>
                       Intermitente: ${d.data["3"]}%`)
                .style("left", `${event.pageX + 30}px`)
                .style("top", `${event.pageY + 30}px`);
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
            d3.select(this).style("opacity", 1);
        });

    // Fondo alternado
    vakken.insert("rect", ":first-child")
        .attr("height", y.bandwidth())
        .attr("x", 1)
        .attr("width", width)
        .attr("fill-opacity", 0.5)
        .style("fill", "#F5F5F5")
        .attr("class", (d, i) => i % 2 === 0 ? "even" : "uneven");


// Linea que diferencia entre cuencas 
// Añade este array de configuración al inicio de tu función (después de definir margin):
const specialQuestions = [
    { id: "010", color: "#FFD37F", position: "top" },    // 
    { id: "047", color: "#FFFF73", position: "bottom" }, // 
    { id: "073", color: "#BAE1A6", position: "bottom" }, // 
    { id: "104", color: "#73DFFF", position: "bottom" }, // 
    { id: "129", color: "#73DFFF", position: "bottom" }  //  
];

// Reemplaza el bloque de líneas rojas con este código:
specialQuestions.forEach(config => {
    vakken.filter(d => d.Question === config.id)
        .append("rect")
        .attr("x", 0)
        .attr("y", config.position === "top" ? 1 : y.bandwidth() - 2)
        .attr("width", width)
        .attr("height", 2)
        .style("fill", config.color)
        .style("shape-rendering", "crispEdges");
});


    // Línea vertical central
    svg.append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y2", height)
        .style("stroke", "transparent");

    // Etiquetas
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "12")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 25)
        .attr("x", -margin.top - 180)
        .text("Cuencas (cod BNA)");

    svg.append("text")
        .attr("x", -10)
        .attr("y", 585)
        .attr("text-anchor", "center")
        .style("font-size", "14px")
        .attr("font-family", "Arial")
        .text("Cobertura de nieve (%)");
}