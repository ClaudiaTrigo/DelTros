
// CONFIGURACIÓ INICIAL DEL MAPA

const map = L.map("map").setView([40.0, -3.7], 6);

// Color de fons del contenidor del mapa
document.querySelector("#map").style.backgroundColor = "#89b4f5ff";

// Variables globals
let geojson; // Guardarem aquí les províncies
let proveedoresPorProvincia = {}; // Dades dels proveïdors


// CARREGAR PROVEÏDORS

fetch("proveedores.json")
    .then((res) => res.json())
    .then((data) => {
        proveedoresPorProvincia = data;
        carregarProvincies(); // Només carreguem les províncies quan tinguem els proveïdors
    })
    .catch((error) => console.error("Error carregant proveedors:", error));


// CARREGAR PROVÍNCIES (GeoJSON)

function carregarProvincies() {
fetch("spain-provinces.geojson")
    .then((res) => res.json())
    .then((data) => {
        geojson = L.geoJson(data, {
            style: estilBase,
            onEachFeature: gestionaProvincia,
        }).addTo(map);
    })
    .catch((error) =>
    console.error("Error carregant spain-provinces.geojson:", error)
    );
}

// ESTILS DEL MAPA

function estilBase() {
    return {
        fillColor: "#faf2e4",
        weight: 1.2,
        color: "#b2a388ff",
            fillOpacity: 0.9
    };
}

function ressaltarProvincia(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 2,
        color: "#7b4a2cff",     
        fillColor: "#fdbf7dff", 
    });
    layer.bringToFront();
}

function reiniciarEstil(e) {
    geojson.resetStyle(e.target);
}

// INTERACCIÓ AMB LES PROVÍNCIES

function gestionaProvincia(feature, layer) {
    const provincia =
        feature.properties.name || feature.properties.provincia || "Desconeguda";
    layer.on({
        mouseover: (e) => ressaltarProvincia(e),
        mouseout: (e) => reiniciarEstil(e),
        click: () => mostrarProveidors(provincia, layer),
    });
}

// POPUP DE PROVEÏDORS

function mostrarProveidors(provincia, layer) {
    const llista = proveedoresPorProvincia[provincia] || [];

    const contingut = `
        <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 14px;">
        <h4 style="margin-bottom: 6px; color:#7b4a2cff;">${provincia}</h4>
        ${
            llista.length
            ? `<ul style="padding-left: 18px; margin: 0;">
                ${llista
                    .map(
                    (p) =>
                        `<li><b>${p.nombre}</b> – ${p.tipo}<br>
                        <a href="${p.web}" target="_blank" style="color:#b2a388ff;padding-top:5px">Visita la web</a></li>`
                    )
                    .join("")}
                </ul>`
            : "<p style='color:#666;'>No hi ha proveïdors registrats en aquesta zona.</p>"
        }
        </div>
    `;

    layer.bindPopup(contingut, { maxWidth: 250 }).openPopup();
}
