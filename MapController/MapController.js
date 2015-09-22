define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",

    "esri/InfoTemplate",
    "esri/geometry/Extent",
    "esri/layers/FeatureLayer",
    "esri/dijit/InfoWindow",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/geometry/Point",
    "esri/SpatialReference",

    "mapJS/AddressSearch/AddressSearch"

], function(
    declare, lang, topic,
    InfoTemplate, Extent, FeatureLayer, InfoWindow, Query, QueryTask, Point, SpatialReference,
    AddressSearch
) {
    var theDijit = {
        map: null,

        constructor: function(args) {
            this.map = args.map;

            this.boundaryUrl = "http://maps.stlouisco.com/arcgis/rest/services/OpenData/OpenData/FeatureServer/5";
            this.courtsUrl = "https://services.arcgis.com/bkrWlSKcjUDFDtgw/arcgis/rest/services/MunicipalCourtLocations/FeatureServer/0";

            this._initLayers();

            var _this = this;
            topic.subscribe(AddressSearch.searchLocationSelectedTopic, function() {
                _this._showSearchLocation(arguments);
            });

        },

        queryForCourtByPoint: function(point) {
            // Query to find the municipality
            var boundaryQuery = new Query();
            boundaryQuery.geometry = point;
            boundaryQuery.relationParam = Query.SPATIAL_REL_WITHIN;
            boundaryQuery.outFields = ["MUNICIPALITY"];

            var boundaryQueryTask = new QueryTask(this.boundaryUrl);
            var _this = this;
            boundaryQueryTask.execute(boundaryQuery).then(function(results) {
                if (results.features.length > 0) {
                    console.log("Municipality: ", results.features[0].attributes.MUNICIPALITY);
                    // Query the courts service
                    var courtsQuery = new Query();
                    courtsQuery.where = "Municipali like '%" + results.features[0].attributes.MUNICIPALITY + "%'";
                    courtsQuery.returnGeometry = true;
                    courtsQuery.outFields = ["Municipali", "Address", "City", "State", "Zip_Code"];
                    var courtsQueryTask = new QueryTask(_this.courtsUrl);
                    courtsQueryTask.execute(courtsQuery).then(function(results) {
                        console.log("Court", results.features);
                        if (results.features.length > 0) {
                            var infoTemplate = new InfoTemplate("${Municipali}", "Municipality:<br>${Municipali}<br><br>Address:<br>${Address}<br>${City}, ${State} ${Zip_Code}");
                            results.features.forEach(function(feature) {
                                feature.infoTemplate = infoTemplate;
                            });

                            _this._focusOnCourtFeature(results.features);
                        }
                    }, function(err) {
                        console.log("The courts query failed: ", err);
                    });
                }
            }, function(err) {
                console.log("The boundary query failed: ", err);
            });
        },

        _initLayers: function() {
            var muniBoundaryLayer = this._initBoundaryLayer();
            var muniCourtsLayer = this._initCourtsLayer();

            // Add the feature layers to the map
            this.map.addLayers([muniBoundaryLayer, muniCourtsLayer]);
        },

        _initBoundaryLayer: function() {
            var muniBoundaryLayer = new FeatureLayer(this.boundaryUrl);
            var _this = this;
            muniBoundaryLayer.on("click", function(evt) {
                // console.log(evt);
                _this.queryForCourtByPoint(evt.mapPoint);
            });

            return muniBoundaryLayer;
        },

        _initCourtsLayer: function() {
            var muniCourtsLayer = new FeatureLayer(this.courtsUrl);
            return muniCourtsLayer;
        },

        _focusOnCourtFeature: function(courtFeatures) {
            console.log("Courts: ", courtFeatures);
            this.map.infoWindow.clearFeatures();
            this.map.infoWindow.setFeatures(courtFeatures);
            this.map.infoWindow.select(0);
            var firstFeature = courtFeatures[0];
            var courtLocation = firstFeature.geometry;

            // Center and zoom to the court point
            this.map.centerAndZoom(courtLocation, 15);
            // Open popup with feature infoWindow
            this.map.infoWindow.show(courtLocation);

            // handle feature switching
            this.map.infoWindow.on("selection-change", function() {
                var selectedFeature = this.map.infoWindow.getSelectedFeature();
                var courtLocation = selectedFeature.geometry;
                this.map.infoWindow.show(courtLocation);
            });
        },

        _showSearchLocation: function(location) {
            console.log("_showSearchLocation: ", location[0]);
            var locationPoint = new Point(location[0].x, location[0].y, new SpatialReference({wkid: 4326}));
            this.queryForCourtByPoint(locationPoint);
        }
    };

    return declare(null, theDijit);
});