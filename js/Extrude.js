var currentYear = 2002,
    color = Cesium.Color.GREY,                              // grey (default)
    shade1 = Cesium.Color.fromCssColorString("#FF0000"),    // red
    shade2 = Cesium.Color.fromCssColorString("#FF5500"),    // orange
    shade3 = Cesium.Color.fromCssColorString("#FFAA00"),    // dark yellow
    shade4 = Cesium.Color.fromCssColorString("#FEFF00"),    // yellow
    shade5 = Cesium.Color.fromCssColorString("#A9FF00"),    // lime green
    shade6 = Cesium.Color.fromCssColorString("#00FF00"),    // green
    shade7 = Cesium.Color.fromCssColorString("#008800"),    // dark green
    defaultImageryProviderViewModels = Cesium.createDefaultImageryProviderViewModels(),
    selectedImageryProviderViewModel = defaultImageryProviderViewModels.find(function(model) {
        return model.name == 'Natural Earth\u00a0II';
    }),                                                     // custom imagery provider
    viewer = new Cesium.Viewer('cesium-container', {         // create and add Cesium globe
        timeline: false,
        animation: false,
        imageryProviderViewModels: defaultImageryProviderViewModels,
        selectedImageryProviderViewModel: selectedImageryProviderViewModel
    }),
    labelsOn = true,                                        // labels are visible by default
    ageShade1 = Cesium.Color.fromCssColorString("#e51766"),  // dark rosa
    ageShade2 = Cesium.Color.fromCssColorString("#DC23E4"),  // pink
    ageShade3 = Cesium.Color.fromCssColorString("#7B21E5"),  // violet
    ageShade4 = Cesium.Color.fromCssColorString("#1F27E6"),  // blue
    ageShade5 = Cesium.Color.fromCssColorString("#1C8BE7");  // brigh blue

// returns color in hex format as a string. default is grey.
function literacy2color(literacy) {
    "use strict";
    var c = color;
    // check range
    if (literacy <= 0.2000) {
        c = shade1;
    } else if (literacy <= 0.3333) {
        c = shade2;
    } else if (literacy <= 0.4666) {
        c = shade3;
    } else if (literacy <= 0.6000) {
        c = shade4;
    } else if (literacy <= 0.7333) {
        c = shade5;
    } else if (literacy <= 0.8666) {
        c = shade6;
    } else if (literacy <= 1) {
        c = shade7;
    }
    return c;
}

// returns color in hex format as a string. default is grey.
function ageConsidered2color(ageConsidered) {
    "use strict";
    // check value
    switch (ageConsidered) {
        case null:
            return color;
        case "11+":
            return ageShade1;
        case "15-24":
            return ageShade2;
        case "15+":
            return ageShade3;
        case "20+":
            return ageShade4;
        case "adults":
            return ageShade5;
        default:
            return color;
    }
}

// load window content: initialise Cesium globe with default data (year 2002)
window.onload = async function () {
    "use strict";

    // show map description popup
    document.getElementById("description-button").click();
    
    // load polygons
    var polygonDataSource = await new Cesium.GeoJsonDataSource().load('data/polygons/polygons.geojson', {
        stroke:         Cesium.Color.BLACK,
        fill:           Cesium.Color.DIMGREY.withAlpha(0.5),
        strokeWidth:    3
    });
    viewer.dataSources.add(polygonDataSource);

    // style polygons:
    // create variables
    var polygons = polygonDataSource.entities.values, // array containing the polygons
        i,              // iterator for for-loop below
        //cylinder,       // cylinder
        lat,            // latitude
        long,           // longitude
        area,           // area of the polygon
        label,          // label
        currentPolygon; // the current polygon during the iteration

    // loop over all polygons
    for (i = 0; i < polygons.length; i++) {
        currentPolygon = polygons[i];

        // get positions
        lat = currentPolygon.properties.lat;
        long = currentPolygon.properties.long;
        area = currentPolygon.properties.area;

        // replace properties: id, latitude, longitude, literacy, population
        currentPolygon.properties = {
            id:             currentPolygon.properties.id,
            long:           long,
            lat:            lat,
            area:           area,
            literacy:       "no data",
            literacyAge:    "no data",
            literacySource: "no data",
            population:     "no data",
            popDensity:     "no data"
        };

        // add default label for all polygons
        label = new Cesium.LabelGraphics({
            text:                   currentPolygon.name,
            font:                   '12pt SoberanaSans',
            fillColor:              Cesium.Color.WHITE,
            outlineColor:           Cesium.Color.BLACK,
            outlineWidth:           1,
            style:                  Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin:         Cesium.VerticalOrigin.BOTTOM,
            translucencyByDistance: new Cesium.NearFarScalar(1.8e2, 1, 1.5e7, 0),
            //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000),
            scaleByDistance:        new Cesium.NearFarScalar(1.5e3, 5, 1.5e7, 0.01),
            show:                   true
        });
        currentPolygon.label = label;
    }

    // load and display data for year 2002
    document.getElementById("dropdown-list").value = '2002';
    await yearChange();
    
    // zoom to entities
    viewer.flyTo(polygonDataSource);
};

// update polygons according to the thematic data passed down
function updatePolygons(thematicData) {
    "use strict";
    
    var polygons = viewer.dataSources.get(0).entities.values, // array containing the polygons (entities)
        j,                  // iterator
        currentPolygon,     // the current polygon during the iteration
        data,               // reference to the thematic data
        literacy,           // literacy percentage (values 0-1)
        literacyColor,      // placeholder for the polygon color
        population,         // population
        density,            // population density
        extrusion;          // extrusion of the polygon
    
    // iterate polygons
    for (j = 0; j < polygons.length; j++) {
        currentPolygon = polygons[j];
        data = thematicData[currentPolygon.properties.id];    // id is the ISO3166-2 country code
        population = data.population;
        literacy = data.literacy;
        
        // update population data
        if (population !== null) {
            density = population/currentPolygon.properties.area;
            extrusion = density*1000;
            currentPolygon.polygon.extrudedHeight = extrusion;
            currentPolygon.properties.population = population;
            currentPolygon.properties.popDensity = density.toFixed(2);
            
            // move label to top of polygon
            currentPolygon.label.eyeOffset = new Cesium.Cartesian3(0.0, extrusion, 0.0);
        } else {
            currentPolygon.polygon.extrudedHeight = 0.0;
            currentPolygon.properties.population = "no data";
            currentPolygon.properties.popDensity = "no data";
            
            // move label to bottom again
            currentPolygon.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, 0.0);
        }
        
        // update literacy data
        if (literacy !== null) {
            literacyColor = literacy2color(literacy);
            currentPolygon.polygon.material = literacyColor;
            currentPolygon.polygon.outlineColor = literacyColor;
            currentPolygon.properties.literacy = literacy*100 + " %";
            currentPolygon.properties.literacyAge = data.literacyAge;
            currentPolygon.properties.literacySource = data.literacySource;
        } else {
            currentPolygon.polygon.material = Cesium.Color.GREY;
            currentPolygon.polygon.outlineColor = Cesium.Color.GREY;
            currentPolygon.properties.literacy = "no data";
            currentPolygon.properties.literacyAge = "no data";
            currentPolygon.properties.literacySource = "no data";
        }
        
        // update infoBox description
        currentPolygon.description = "\
            <table class=\'cesium-infoBox-defaultTable\'>\
                <tr>\
                    <td>ID</td>\
                    <td>" + currentPolygon.properties.id + "</td>\
                </tr>\
                <tr>\
                    <td>Longitude</td>\
                    <td>" + currentPolygon.properties.long + "</td>\
                </tr>\
                <tr>\
                    <td>Latitude</td>\
                    <td>" + currentPolygon.properties.lat + "</td>\
                </tr>\
                <tr>\
                    <td>Area [km2]</td>\
                    <td>" + currentPolygon.properties.area + "</td>\
                </tr>\
                <tr>\
                    <td>Literacy [%]</td>\
                    <td>" + currentPolygon.properties.literacy + "</td>\
                </tr>\
                <tr>\
                    <td>Literacy: age considered</td>\
                    <td>" + currentPolygon.properties.literacyAge + "</td>\
                </tr>\
                <tr>\
                    <td>Literacy: data source</td>\
                    <td>" + currentPolygon.properties.literacySource + "</td>\
                </tr>\
                <tr>\
                    <td>Population</td>\
                    <td>" + currentPolygon.properties.population + "</td>\
                </tr>\
                <tr>\
                    <td>Population Density [P/km2]</td>\
                    <td>" + currentPolygon.properties.popDensity + "</td>\
                </tr>\
            </table>";
    }
}

// adapt thematic data to the year chosen
async function yearChange() {
    "use strict";
    currentYear = parseInt(document.getElementById("dropdown-list").value, 10);
    
    // load thematic data (from JSON file)
    const response = await fetch('data/themes/' + currentYear + '.json');
    const thematicData = await response.json();
    updatePolygons(thematicData);
}

// toggle labels
function toggleLabels() {
    var polygons = viewer.dataSources.get(0).entities.values,   // array containing the polygons (entities)
        j;
    
    if (labelsOn) {
        // iterate over all polygons and hide labels
        for (j = 0; j < polygons.length; j++) {
            polygons[j].label.show = false;
        }
        // update toggle button text
        document.getElementById("labels").innerText = "Toggle Labels On";
        labelsOn = false;
    } else {
        // iterate over all polygons and show labels
        for (j = 0; j < polygons.length; j++) {
            polygons[j].label.show = true;
        }
        // update toggle button text
        document.getElementById("labels").innerText = "Toggle Labels Off";
        labelsOn = true;
    }
}

// toggle imprint
$(document).ready(function(){
    $('#imprint-button').click(function() {
        $('#imprint').fadeToggle("fast");
    });
});

// toggle legend
$(document).ready(function(){
    $('#legend-button').click(function() {
        $('#legend').fadeToggle("fast");
    });
});

// toggle map description
$(document).ready(function(){
    $('#description-button').click(function() {
        $('#description').fadeToggle("fast");
    });
});
