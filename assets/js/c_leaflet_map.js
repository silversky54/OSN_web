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
  const isMobile = window.innerWidth <= 767;
  const containerId = isMobile ? "p02-mob" : "p02-desk";
  
  // Para escritorio usamos la celda específica; para móvil usamos la celda que contiene el div p02-mob
  let parentContainer;
  if (isMobile) {
    const originalCell = document.getElementById("p02-mob");
    if (!originalCell) {
      console.error('No se encontró el div p02-mob en la versión móvil.');
      return;
    }
    parentContainer = originalCell.parentElement;
  } else {
    parentContainer = document.querySelector('td[colspan="20"][VALIGN="Top"]');
  }
  
  if (!parentContainer) {
    console.error("No se encontró el contenedor padre para el mapa.");
    return;
  }
  
  // Remover el contenedor existente (si lo hay)
  const existingMapContainer = document.getElementById(containerId);
  if (existingMapContainer) {
    existingMapContainer.remove();
  }
  
  // Si ya existe un mapa, limpiarlo: quitar capas, controles y leyendas
  if (currentMap) {
    if (leftLayer) currentMap.removeLayer(leftLayer);
    if (rightLayer) currentMap.removeLayer(rightLayer);
    if (sideBySideControl) sideBySideControl.remove();
    ({ stLegend, spLegend } = removeExistingLegends(currentMap, stLegend, spLegend));
    currentMap.remove();
    currentMap = null;
  }
  
  // Crear un nuevo contenedor para el mapa
  const newMapContainer = document.createElement('div');
  newMapContainer.id = containerId;
  newMapContainer.className = "map-container"; // Define esta clase en tu CSS según necesites
  newMapContainer.style.width = "100%";
  newMapContainer.style.height = "600px";
  if (!isMobile) {
    newMapContainer.style.border = "2px solid black";
  }
  
  // Insertar el nuevo contenedor en el mismo lugar de la celda
  parentContainer.appendChild(newMapContainer);
  
  // Inicializar el mapa Leaflet en el contenedor recién creado
  currentMap = L.map(containerId);
  
  // Agregar la capa base
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
  }).addTo(currentMap);
  
  // Forzar el recalculo del tamaño del mapa
  currentMap.invalidateSize();
  
  // Rutas para los archivos TIFF
// Rutas actualizadas
const isGitHub = window.location.host.includes('github.io');
const basePath = window.location.origin + (isGitHub ? '/OSN' : '');

const text_ini_sp = `${basePath}/OSN/assets/vec/sp/Andes_MCD10A1_SP_`;
const text_end_sp = ".tif";
const text_ini_st = `${basePath}/OSN/assets/vec/st/Andes_MCD10A1_ST_`;
const text_end_st = ".tif";
  
  const watershed_selected_sp = text_ini_sp.concat(watershed).concat(text_end_sp);
  const watershed_selected_st = text_ini_st.concat(watershed).concat(text_end_st);
  
  // Función para cargar el GeoJSON filtrado y ajustar el mapa
  async function loadGeoJson(currentMap, watershed) {
    try {
      const response = await fetch(`${basePath}/OSN/assets/vec/Cuencas_BNA_Oficial.geojson`);
      const data = await response.json();
      
      const filteredFeatures = data.features.filter(
        feature => feature.properties.COD_CUEN === watershed
      );
      
      const filteredGeoJson = {
        type: "FeatureCollection",
        features: filteredFeatures
      };
      
      const geoJsonLayer = L.geoJSON(filteredGeoJson, {
        style: function(feature) {
          return {
            color: '#A9A9A9',
            weight: 2,
            opacity: 1,
            fillColor: '#ffffff',
            fillOpacity: 0.3
          };
        },
        onEachFeature: function(feature, layer) {
          layer.on('mouseover', function(e) {
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
      
      currentMap.fitBounds(geoJsonLayer.getBounds());
    } catch (error) {
      console.error('Error al cargar el GeoJSON:', error);
    }
  }
  
  // Cargar el GeoJSON
  loadGeoJson(currentMap, watershed);
  
  // Usar Promise.all para cargar ambas capas antes de crear el control side-by-side
  Promise.all([
    loadGeoRasterLayer(watershed_selected_st, currentMap, valueToSTColor),
    loadGeoRasterLayer(watershed_selected_sp, currentMap, valueToSPColor)
  ])
    .then(([layerST, layerSP]) => {
      if (!layerST || !layerSP) {
        throw new Error("Una de las capas no se cargó correctamente.");
      }
      leftLayer = layerST;
      rightLayer = layerSP;
      leftLayer.addTo(currentMap);
      rightLayer.addTo(currentMap);
      // Retrasar un poco la creación del control para asegurarnos de que ambos contenedores estén listos
      setTimeout(() => {
        sideBySideControl = L.control.sideBySide(leftLayer, rightLayer).addTo(currentMap);
      }, 100);
      currentMap.fitBounds(calculateBounds(layerST.options.georaster));
    })
    .catch(err => console.error('Error cargando las capas:', err));
  
  // Agregar leyendas y el título centrado
  ({ stLegend, spLegend } = addLegendsToMap(currentMap));
  addCenteredTitle(currentMap, watershed);
}
