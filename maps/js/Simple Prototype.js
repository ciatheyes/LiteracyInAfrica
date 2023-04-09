window.onload = function() {
    // create and add Cesium globe
    var viewer = new Cesium.Viewer('cesiumContainer');

	// create and add terrain and water mask
	/*var terrainProvider = new Cesium.CesiumTerrainProvider({
		url : '//assets.agi.com/stk-terrain/world',
		requestWaterMask: true
	});
	viewer.terrainProvider = terrainProvider;*/

	// load geojson South Africa
	var dataSourceZA = new Cesium.GeoJsonDataSource();
	dataSourceZA.load('../data/south_africa2010.geojson').then(function() {
        //Get the array of entities
        var entities = dataSourceZA.entities.values;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            var name = entity.name;

            //Make sure it's a polygon and doesn't already have a position.
            if (!entity.position && entity.polygon) {
                var center = Cesium.BoundingSphere.fromPoints(entity.polygon.positions).center;
                Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
                entity.position = new Cesium.ConstantPositionProperty(center);
            }

            // add cylinder
            var cylinder = viewer.entities.add({
                name : 'cylinder',
                position: new Cesium.ConstantPositionProperty(entity.position),
                cylinder : {
                    length : 300000.0,
                    topRadius : 40000.0,
                    bottomRadius : 40000.0,
                    material : Cesium.Color.RED,
                    outline : false
                }
            });

            //Set up the label.
            var label = new Cesium.LabelGraphics();
            label.text = new Cesium.ConstantProperty(name);
            /*label.font = new Cesium.ConstantProperty('12pt SoberanaSans');
            label.fillColor = new Cesium.ConstantProperty(Cesium.Color.WHITE);
            label.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK);
            label.outlineWidth = new Cesium.ConstantProperty(1);
            label.style = new Cesium.ConstantProperty(Cesium.LabelStyle.FILL_AND_OUTLINE)*/
            label.show = true;
            entity.label = label;
        }
    })
    viewer.dataSources.add(dataSourceZA);

	// load geojson Ghana
	/*viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../data/ghana2010.geojson', {
    		stroke: Cesium.Color.BLACK,
    		fill: Cesium.Color.BLUE,
    		strokeWidth: 3,
    		markerSymbol: '?'
    		//clampToGround: true
    }));*/

    // load geojson Nigeria
    /*viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../data/nigeria2010.geojson', {
        		stroke: Cesium.Color.BLACK,
        		fill: Cesium.Color.GREEN,
        		strokeWidth: 3,
        		markerSymbol: '?'
        		//clampToGround: true
    }));*/
	
	// zoom to entities
	viewer.zoomTo(viewer.entities);
}