// Importar D3.js desde CDN
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Función asincrónica para cargar y dibujar el gráfico
export async function c_SCA_y_t_area(watershed) {
    // Ruta para el archivo CSV
    var text_ini = "../assets/csv/year/SCA_y_t_area_BNA_";
    var text_end =  ".csv";
    var watershed_selected = text_ini.concat(watershed).concat(text_end);

    // Obtener los datos CSV
    let data = await d3.csv(watershed_selected);

    // **Nuevo código para interpretar los valores de Sen_slope**
    data.forEach(d => {
        // Extraer el prefijo y el número
        let prefix = d.Sen_slope.charAt(0);
        let value = parseInt(d.Sen_slope.slice(1));

        // Convertir a número real
        if (prefix === 'n') {
            d.Sen_slope_num = -value;
        } else if (prefix === 'p') {
            d.Sen_slope_num = value;
        } else {
            d.Sen_slope_num = 0; // Asumimos que '00' representa cero
        }

        // Convertir Area a número
        d.Area = +d.Area;
    });

    // Definir las dimensiones y márgenes del gráfico
    const margin = { top: 80, right: 0, bottom: 80, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Crear el elemento SVG
    var svg = d3.select("#p05")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100) // Ajustar si es necesario
        .attr("height", height + margin.top + margin.bottom + 50)
        .attr("id", "d3-plot")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Crear el tooltip
    var tooltip = d3.select("#p05")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");

    // Define las nuevas etiquetas
    var labels = ["<-10", "-9 - -8", "-8 - -7", "-7 - -6", "-6 - -5", "-5 - -4", "-4 - -3", "-3 - -2", "-2 - -1", "-1 - 0", "0 - 1", "1 - 2", "2 - 3", "3 - 4", "4 - 5", "5 - 6", "6 - 7", "7 - 8", "8 - 9", "9 - 10", ">10"];

    // Crear un array de categorías para el eje X
    var categories = [
        { label: "<-10", range: [-10, -9] },
        { label: "-9 - -8", range: [-9, -8] },
        { label: "-8 - -7", range: [-8, -7] },
        { label: "-7 - -6", range: [-7, -6] },
        { label: "-6 - -5", range: [-6, -5] },
        { label: "-5 - -4", range: [-5, -4] },
        { label: "-4 - -3", range: [-4, -3] },
        { label: "-3 - -2", range: [-3, -2] },
        { label: "-2 - -1", range: [-2, -1] },
        { label: "-1 - 0", range: [-1, 0] },
        { label: "0 - 1", range: [0, 1] },
        { label: "1 - 2", range: [1, 2] },
        { label: "2 - 3", range: [2, 3] },
        { label: "3 - 4", range: [3, 4] },
        { label: "4 - 5", range: [4, 5] },
        { label: "5 - 6", range: [5, 6] },
        { label: "6 - 7", range: [6, 7] },
        { label: "7 - 8", range: [7, 8] },
        { label: "8 - 9", range: [8, 9] },
        { label: "9 - 10", range: [9, 10] },
        { label: ">10", range: [10, Infinity] }
    ];

    // Asignar cada dato a una categoría
    data.forEach(d => {
        let category = categories.find(cat => d.Sen_slope_num >= cat.range[0] && d.Sen_slope_num < cat.range[1]);
        d.category = category ? category.label : "Otros";
    });

    // Agrupar los datos por categoría y sumar las áreas usando d3.rollups
    var dataGroupedArray = d3.rollups(
        data,
        v => d3.sum(v, d => d.Area),
        d => d.category
    );

    // Convertir a un array de objetos con 'key' y 'value'
    var dataGrouped = dataGroupedArray.map(([key, value]) => ({ key, value }));

    // Ordenar los datos según el orden de las etiquetas
    dataGrouped.sort((a, b) => labels.indexOf(a.key) - labels.indexOf(b.key));

    // Escala X
    var x = d3.scaleBand()
        .range([0, width])
        .domain(labels)
        .padding(0.2);

    // Añadir eje X con etiquetas personalizadas
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Escala Y
    var y = d3.scaleLinear()
        .domain([0, 1.05 * d3.max(dataGrouped, function(d) { return d.value; })])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Escala de colores
    const myColor = d3.scaleThreshold()
        .domain([-10, -9, -8, -7, -6, -5, -4, -3, -2, -1,
                  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10])
        .range([
            "#FF0000", "#FF0303", "#FF1E1F", "#FE393A", "#FE5456", "#FD6F72", "#FD8B8D",
            "#FCA6A9", "#FCC1C5", "#FBDCE0", "#FBF7FC", "#DFDEFC", "#C4C4FD", "#A8ABFD",
            "#8D92FD", "#7178FE", "#565FFE", "#3A46FE", "#1F2CFF", "#0313FF",
            "#0000FF"
        ]);

    // Barras con tooltip
    svg.selectAll("mybar")
        .data(dataGrouped)
        .enter()
        .append("rect")
        .attr("x", d => x(d.key))
        .attr("width", x.bandwidth())
        .attr("fill", d => {
            // Obtener el valor medio del rango de cada categoría
            let category = categories.find(cat => cat.label === d.key);
            let midValue = (category.range[0] + category.range[1]) / 2;
            // Ajustar para infinitos
            if (!isFinite(midValue)) {
                midValue = category.range[0] === -Infinity ? -11 : 11;
            }
            return myColor(midValue);
        })
        .attr("height", d => height - y(0))
        .attr("y", d => y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            // Convertir el valor del área a un número entero
            var area = Math.round(d.value);

            tooltip
                .style("opacity", 1)
                .html("Tendencia: " + d.key + "<br>" + "Superficie: " + area  + " km²" )
                .style("left", (event.pageX + 30) + "px")
                .style("top", (event.pageY + 30) + "px");

            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mousemove", function(event, d) {
            tooltip
                .style("left", (event.pageX + 30) + "px")
                .style("top", (event.pageY + 30) + "px");
        })
        .on("mouseout", function(d) {
            tooltip
                .style("opacity", 0);

            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        })
        .transition()
        .duration(800)
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value))
        .delay((d, i) => i * 100);

    // Etiqueta title
    var x_title = 0;

    svg.append("text")
        .attr("text-anchor", "start")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .attr("x", x_title)
        .attr("y", -25)
        .text("5. Superficie por tendencia anual");

    // Etiqueta Subtítulo
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("font-family", "Arial")
        .attr("font-size", "16px")
        .style("fill", "grey")
        .attr("x", x_title)
        .attr("y", -5)
        .text("Cuenca: "+ watershed);

    // Etiqueta del eje X
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("x", width / 2)
        .attr("y", height + 70) // Ajustar para que no se superponga
        .text("Tendencia (%/año)");

    // Etiqueta del eje Y
    // Texto "Superficie (km"
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", -height / 2 + 20)
        .text("Superficie (km");

    // Texto "2)" en superíndice
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("font-family", "Arial")
        .attr("font-size", "10")  // Tamaño más pequeño para el superíndice
        .attr("transform", "rotate(-90)")
        .attr("y", -70 - 3)  // Posición ajustada para el superíndice
        .attr("x", -height / 2 + 20 + 60)  // Posición ajustada para el superíndice
        .text("2");

    // Texto ")" en tamaño normal
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("font-family", "Arial")
        .attr("font-size", "13")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", -height / 2 + 20 + 65)  // Posición ajustada para seguir al superíndice
        .text(")");

    // Animación
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value))
        .delay((d, i) => i * 100);

    // Crear un botón de exportación dentro del SVG
    var button = svg.append("foreignObject")
        .attr("width", 30) // ancho del botón
        .attr("height", 40) // alto del botón
        .attr("x", width - 25) // posiciona el botón en el eje x
        .attr("y", -48) // posiciona el botón en el eje Y
        .append("xhtml:body")
        .html('<button type="button" style="width:100%; height:100%; border: 0px; border-radius:5px; background-color: transparent;"><img src="../assets/img/descarga.png" alt="descarga" width="20" height="20"></button>')
        .on("click", function() {
            var csvData = "Category,Area\n" + dataGrouped.map(d => d.key + "," + d.value).join("\n");

            var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var fileName = "Superficie_Por_Tendencia_Anual_" + watershed + ".csv";

            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
}
