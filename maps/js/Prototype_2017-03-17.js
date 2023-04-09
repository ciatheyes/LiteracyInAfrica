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

var currentYear;

var polygonDataSource;

function loadPolygons() {
    "use strict";
	// load geojson South Africa
	polygonDataSource = new Cesium.GeoJsonDataSource().load('../data/polygons/polygons.geojson', {
        stroke:         Cesium.Color.HOTPINK,
		fill:           Cesium.Color.PINK,
		strokeWidth:    3
		//clampToGround:  true
	});
    viewer.dataSources.add(polygonDataSource);
	
	// zoom to entities
	viewer.zoomTo(polygonDataSource);
}

// calculate polygon centers and add cylinders
function createCylinders() {
    "use strict";
	var polygons = polygonDataSource.entities.values;
    var i, entity, name, cylinder, center, label, iterator, currentPolygon;
    
    // loop over all polygons
	for (i = 0; i < polygons.length; i++) {
    //polygons.forEach(function(iterator) {
    //for (iterator in polygons) {
		currentPolygon = polygons[i];
        name = currentPolygon.name;
        console.log(currentPolygon);

		//Make sure it's a polygon and doesn't already have a position.
		if (!currentPolygon.position && currentPolygon.polygon) {
			center = Cesium.BoundingSphere.fromPoints(currentPolygon.polygon.positions).center;
			Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
			currentPolygon.position = new Cesium.ConstantPositionProperty(center);
		}

		// add cylinder
		cylinder = viewer.entities.add({
			name : 'cylinder',
			position: new Cesium.ConstantPositionProperty(currentPolygon.position),
			cylinder : {
				length : 300000.0,
				topRadius : 40000.0,
				bottomRadius : 40000.0,
				material : Cesium.Color.RED,
				outline : false
			}
		});

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
}

// adapt thematic data to year chosen
function yearChange() {
    "use strict";
    currentYear = parseInt(document.getElementById("dropdownList").value, 10);
}

window.onload = function () {
    "use strict";
    var polygonDataSource;
	currentYear = 2002;
	loadPolygons();
    createCylinders();
};