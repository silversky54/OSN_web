// Importaciones necesarias ./tools
import { loadGeoRasterLayer } from './tools/rasterLoader.js';
import { valueToSTColor, valueToSPColor } from './tools/colors.js';
import { calculateBounds } from './tools/bounds.js';
import { addLegendsToMap, removeExistingLegends } from './tools/legendManagement.js';
import { addCenteredTitle } from './tools/watershedTitle.js';

// Variables globales para almacenar el estado del mapa y las capas
let currentMap = null; // Variable para almacenar el mapa actual
let leftLayer = null; // Variable para almacenar la capa izquierda
let rightLayer = null; // Variable para almacenar la capa derecha
let sideBySideControl = null; // Variable para almacenar el control sideBySide
let stLegend = null; // Variable para almacenar la leyenda ST
let spLegend = null; // Variable para almacenar la leyenda SP
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
        

    const text_ini_sp = "/assets/vec/sp/Andes_MCDS4S5_SP_";
    const text_end_sp = ".tif";
    const text_ini_st = "/assets/vec/st/Andes_MCDS4S5_ST_";
    const text_end_st = ".tif";

    const watershed_selected_sp = text_ini_sp.concat(watershed).concat(text_end_sp);
    const watershed_selected_st = text_ini_st.concat(watershed).concat(text_end_st);

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
