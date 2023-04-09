var currentYear = 2002,
    color = Cesium.Color.GREY,                              // grey (default)
    shade1 = Cesium.Color.fromCssColorString("#FF0000"),    // red
    shade2 = Cesium.Color.fromCssColorString("#FF5500"),    // orange
    shade3 = Cesium.Color.fromCssColorString("#FFAA00"),    // dark yellow
    shade4 = Cesium.Color.fromCssColorString("#FEFF00"),    // yellow
    shade5 = Cesium.Color.fromCssColorString("#A9FF00"),    // lime green
    shade6 = Cesium.Color.fromCssColorString("#00FF00"),    // green
    shade7 = Cesium.Color.fromCssColorString("#008800");    // dark green

// returns color in hex format as a string. default is grey.
function literacy2color(literacy) {
    "use strict";
    // check range
    if (literacy <= 0.1429) {
        color = shade1;
    } else if (literacy <= 0.2858) {
        color = shade2;
    } else if (literacy <= 0.4287) {
        color = shade3;
    } else if (literacy <= 0.5716) {
        color = shade4;
    } else if (literacy <= 0.7144) {
        color = shade5;
    } else if (literacy <= 0.8572) {
        color = shade6;
    } else if (literacy <= 1) {
        color = shade7;
    }
    return color;
}

window.onload = function () {
    "use strict";
    
    // create and add Cesium globe
    var viewer = new Cesium.Viewer('cesiumContainer', {
        timeline: false,
        animation: false
    });

    // create and add terrain and water mask
    /*var terrainProvider = new Cesium.CesiumTerrainProvider({
        url : '//assets.agi.com/stk-terrain/world',
        requestWaterMask: true
    });
    viewer.terrainProvider = terrainProvider;*/
    
    // load polygons
    var polygonDataSource = new Cesium.GeoJsonDataSource().load('../data/polygons/polygons.geojson', {
        stroke:         Cesium.Color.HOTPINK,
        fill:           Cesium.Color.PINK,
        strokeWidth:    3
        //clampToGround:  true
    });
    viewer.dataSources.add(polygonDataSource);
    
    // load thematic data (from JSON file)
    var promise2002 = Cesium.loadJson('../data/themes/2006.json');
    
    // create cylinders from thematic data
    promise2002.then(function (thematicData) {
        // add cylinders
        polygonDataSource.then(function (polygonDataSource) {
            var polygons = polygonDataSource.entities.values, // array containing the polygons
                i,              // iterator for for-loop below
                id,             // ISO3166-2 id
                cylinder,       // cylinder
                lat,            // latitude
                long,           // longitude
                label,          // label
                currentPolygon, // the current polygon during the iteration
                data,           // reference to the thematic data
                literacy,       // literacy percentage (values 0-1)
                cLength;        // lenght of the cylinder
            
            // loop over all polygons
            for (i = 0; i < polygons.length; i++) {
                currentPolygon = polygons[i];
                id = currentPolygon.properties.id;
                data = thematicData[id];
                
                literacy = data.literacy;

                // get positions
                lat = currentPolygon.properties.lat;
                long = currentPolygon.properties.long;
                
                // add default cylinder for all polygons
                cylinder = viewer.entities.add({
                    name : currentPolygon.name,
                    position: new Cesium.Cartesian3.fromDegrees(long, lat, 0),
                    cylinder : {
                        length : 0,
                        topRadius : 40000.0,
                        bottomRadius : 40000.0,
                        material : Cesium.Color.GREY,
                        outline : false,
                        show: false
                    }
                });
                
                // add default label for all polygons
                label = new Cesium.LabelGraphics({
                        text: currentPolygon.name,
                        font: '12pt SoberanaSans',
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 1,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        //translucencyByDistance: new Cesium.NearFarScalar(1.8e6, 1, 1.5e7, 0),
                        //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000),
                        scaleByDistance: new Cesium.NearFarScalar(1.5e3, 5, 1.5e7, 0.1),
                        show: true
                    });
                    cylinder.label = label;

                // adapt cylinder properties when data available
                if (literacy !== null) {
                    cLength = data.population/5;
                    
                    cylinder = viewer.entities.add({
                        name : currentPolygon.name,
                        position: new Cesium.Cartesian3.fromDegrees(long, lat, cLength/2),
                        cylinder : {
                            length : cLength,
                            topRadius : 40000.0,
                            bottomRadius : 40000.0,
                            material : literacy2color(literacy),
                            outline : false
                        }
                    });
                    
                    //Set up the label.
                    label = new Cesium.LabelGraphics({
                        eyeOffset: new Cesium.Cartesian3(0.0, cLength/2, 0.0),
                    });
                    cylinder.label = label;
                    
                } else {
                    // todo
                }
                

                //Set up the label.
                /*label = new Cesium.LabelGraphics();
                label.text = new Cesium.ConstantProperty(name);
                label.font = new Cesium.ConstantProperty('12pt SoberanaSans');
                label.fillColor = new Cesium.ConstantProperty(Cesium.Color.WHITE);
                label.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK);
                label.outlineWidth = new Cesium.ConstantProperty(1);
                label.style = new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE)
                label.show = true;
                entity.label = label;*/
            }
        });
    });
    
    // zoom to entities
    viewer.flyTo(polygonDataSource);
};

function adaptCylinders(thematicData) {
    
}

// adapt thematic data to the year chosen
function yearChange() {
    "use strict";
    currentYear = parseInt(document.getElementById("dropdownList").value, 10);
    alert(currentYear);
    
    // load thematic data (from JSON file)
    var promiseData = Cesium.loadJson('../data/themes/2002.json');
    
    // update cylinder properties according to thematic data
    promiseData.then(function (thematicData) {
        // iterate cylinders
        var cylinders = viewer.entities.values, // array containing the cylinders
            i,                  // iterator for for-loop below
            id,                 // ISO3166-2 id
            cylinder,           // cylinder
            lat,                // latitude
            long,               // longitude
            label,              // label
            currentCylinder,    // the current cylinder during the iteration
            data,               // reference to the thematic data
            literacy,           // literacy percentage (values 0-1)
            cLength;            // lenght of the cylinder

        // loop over all polygons
        for (i = 0; i < cylinders.length; i++) {
            currentCylinder = cylinders[i];
            id = currentCylinder.properties.id;
            data = thematicData[id];

            literacy = data.literacy;

            // get positions
            lat = currentCylinder.properties.lat;
            long = currentCylinder.properties.long;

            // add literacy property if available
            if (literacy !== null) {
                cLength = data.population/5;

                cylinder = viewer.entities.add({
                    name : currentPolygon.name,
                    position: new Cesium.Cartesian3.fromDegrees(long, lat, cLength/2),
                    cylinder : {
                        length : cLength,
                        topRadius : 40000.0,
                        bottomRadius : 40000.0,
                        material : literacy2color(literacy),
                        outline : false
                    }
                });
            } else {
                // todo
            }


            //Set up the label.
            /*label = new Cesium.LabelGraphics();
            label.text = new Cesium.ConstantProperty(name);
            label.font = new Cesium.ConstantProperty('12pt SoberanaSans');
            label.fillColor = new Cesium.ConstantProperty(Cesium.Color.WHITE);
            label.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK);
            label.outlineWidth = new Cesium.ConstantProperty(1);
            label.style = new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE)
            label.show = true;
            entity.label = label;*/
        }
    });
}