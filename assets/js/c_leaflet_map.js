// Importaciones necesarias ./tools
import { loadGeoRasterLayer } from './tools/rasterLoader.js';
import { valueToSTColor, valueToSPColor } from './tools/colors.js';
import { calculateBounds } from './tools/bounds.js';
import { addLegendsToMap, removeExistingLegends } from './tools/legendManagement.js';
import { addCenteredTitle } from './tools/watershedTitle.js';

// Variables globales para almacenar el estado del mapa y las capas
let currentMap = null; 
let leftLayer = null; 
let rightLayer = null; 
let sideBySideControl = null; 
let stLegend = null; 
let spLegend = null; 
export async function c_map_location_leaf(watershed) {
    const mapContainer = document.getElementById('p02');

    if (currentMap) {
        // Eliminar las capas anteriores si existen
        if (leftLayer) {
            currentMap.removeLayer(leftLayer);
            leftLayer = null;
        }
        if (rightLayer) {
            currentMap.removeLayer(rightLayer);
            rightLayer = null;
        }

        // Eliminar el control sideBySide anterior si existe
        if (sideBySideControl) {
            sideBySideControl.remove();
            sideBySideControl = null;
        }

        // Eliminar las leyendas anteriores si existen
        ({ stLegend, spLegend } = removeExistingLegends(currentMap, stLegend, spLegend));

        currentMap.remove();
        currentMap = null;
        mapContainer.remove();

        const newMapContainer = document.createElement('div');
        newMapContainer.id = 'p02';
        newMapContainer.style.height = '800px';
        newMapContainer.style.width = '1000px';

        const tableCell = document.querySelector('td[colspan="20"][VALIGN="Top"]');
        tableCell.appendChild(newMapContainer);
    }

    currentMap = L.map("p02");

    const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
    }).addTo(currentMap);
        
// TIFF files
    const text_ini_sp = "/assets/vec/sp/Andes_MCD10A1_SP_";
    const text_end_sp = ".tif";
    const text_ini_st = "/assets/vec/st/Andes_MCD10A1_ST_";
    const text_end_st = ".tif";

    const watershed_selected_sp = text_ini_sp.concat(watershed).concat(text_end_sp);
    const watershed_selected_st = text_ini_st.concat(watershed).concat(text_end_st);

    async function loadGeoJson(currentMap, watershed) {
        try {
            const response = await fetch('/assets/vec/Cuencas_BNA_Oficial.geojson');
            const data = await response.json();
            
            // Filtrar las características que coinciden con el COD_CUEN del watershed seleccionado
            const filteredFeatures = data.features.filter(feature => feature.properties.COD_CUEN === watershed);
    
            // Crear un nuevo FeatureCollection con solo las características filtradas
            const filteredGeoJson = {
                type: "FeatureCollection",
                features: filteredFeatures
            };
    
            // Agregar el GeoJSON filtrado al mapa con el estilo deseado
            const geoJsonLayer = L.geoJSON(filteredGeoJson, {
                style: function (feature) {
                    return {
                        color: '#A9A9A9',  // Color del borde negro
                        weight: 2,         // Grosor del borde
                        opacity: 1,
                        fillColor: '#ffffff',  // Color de relleno blanco
                        fillOpacity: 0.3
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.on('mouseover', function (e) {
                        const properties = feature.properties;
                        const name = properties.NOM_CUEN;
                        const area = properties.Area_km2 ? parseFloat(properties.Area_km2).toFixed(2) : 'No Disponible';
                        const tooltipContent = `
                            <strong>Cuenca Código BNA: </strong> ${properties.COD_CUEN}<br>
                            <strong>Cuenca Nombre: </strong> ${name}<br>
                            <strong>Área: </strong> ${area} km²
                        `;
                        layer.bindTooltip(tooltipContent).openTooltip(e.latlng);
                    });
    
                    layer.on('mouseout', function() {
                        layer.closeTooltip();
                    });
                }
            }).addTo(currentMap);
    
            // Ajustar el mapa para mostrar solo el área del polígono filtrado
            currentMap.fitBounds(geoJsonLayer.getBounds());
    
        } catch (error) {
            console.error('Error al cargar el GeoJSON:', error);
        }
    }
    
    // Llamar a la función loadGeoJson pasando el mapa y el watershed seleccionado
    loadGeoJson(currentMap, watershed);
    


    // Cargar y agregar la capa ST a la izquierda
    loadGeoRasterLayer(watershed_selected_st, currentMap, valueToSTColor)
        .then(layer => {
            leftLayer = layer;
            leftLayer.addTo(currentMap);
            // Solo establecer el control sideBySide si la capa derecha ya se ha cargado
            if (rightLayer) {
                sideBySideControl = L.control.sideBySide(leftLayer, rightLayer).addTo(currentMap);
            }
        });

    // Cargar y agregar la capa SP a la derecha
    loadGeoRasterLayer(watershed_selected_sp, currentMap, valueToSPColor)
        .then(layer => {
            rightLayer = layer;
            rightLayer.addTo(currentMap);
            // Solo establecer el control sideBySide si la capa izquierda ya se ha cargado
            if (leftLayer) {
                sideBySideControl = L.control.sideBySide(leftLayer, rightLayer).addTo(currentMap);
            }
        });

    // Esperar a que al menos una de las capas se cargue para ajustar los límites del mapa
    Promise.any([
        loadGeoRasterLayer(watershed_selected_st, currentMap, valueToSTColor),
        loadGeoRasterLayer(watershed_selected_sp, currentMap, valueToSPColor)
    ]).then(layer => {
        currentMap.fitBounds(calculateBounds(layer.options.georaster));
    });

    // Agregar las leyendas para ST y SP
    ({ stLegend, spLegend } = addLegendsToMap(currentMap));

    // Agregar el título centrado en la parte superior del mapa
    addCenteredTitle(currentMap, watershed);
}
