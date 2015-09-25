define([
    "dojo/_base/declare",
    "dojo/topic",
    "put-selector/put",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/Controller.html",

    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",

    "esri/map",
    "esri/dijit/PopupMobile",
    "esri/geometry/Extent",
    "esri/geometry/Point",
    "esri/SpatialReference",

    "mapJS/MapController/MapController",
    "mapJS/Header/Header",
    "mapJS/AddressSearch/AddressSearch"
], function(
    declare, topic, put,
    WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
    template,
    BorderContainer, ContentPane,
    Map, PopupMobile, Extent, Point, SpatialReference,
    MapController, Header, AddressSearch
) {
    var theDijit = {
        templateString: template,
        widgetsInTemplate: true,
        mapController: null,
        searchShowing: false,

        constructor: function() {
            this.initialExent = new Extent({
                xmax: -10020539.740375254,
                xmin: -10117156.144127589,
                ymax: 4692998.474681494,
                ymin: 4633224.718562567,
                spatialReference: {
                    wkid: 102100
                }
            });
        },

        postCreate: function() {
            this._initTopics();
            this._initHeader();
            this._initMap();
            this._initAddressSearch();
        },

        destroy: function() {

        },

        startup: function() {
            this.mainContainer.startup();
        },

        setSearchPoint: function(location) {
            this.mapController.queryForCourtByPoint(location);
        },

        _initTopics: function() {
            var _this = this;
            topic.subscribe(Header.searchButtonClickedTopic, function() {
                _this._showSearch(arguments);
            });
            topic.subscribe(AddressSearch.searchLocationSelectedTopic, function() {
                _this._showSearchLocation(arguments);
            });
        },

        _initHeader: function() {
            this.header = new Header({}, this.headerTarget);
        },

        _initAddressSearch: function() {
            this.addressSearch = new AddressSearch({
                searchExent: this.initialExent
            }, put("div"));
            put(this.mapPane.domNode, this.addressSearch.domNode);
        },

        _initMap: function() {
            var popup = new PopupMobile(null, put("div"));

            this.map = new Map(this.mapPane.domNode, {
                basemap: "streets",
                extent: this.initialExent,
                infoWindow: popup
            });

            this.map.on("load", function(map) {
                this.mapController = new MapController(map);
            });
        },

        _showSearch: function() {
            if (this.searchShowing) {
                put(this.addressSearch.domNode, ".hide");
                this.searchShowing = false;
                this.header.setSearchButtonText("Search");
            } else {
                put(this.addressSearch.domNode, "!hide");
                this.searchShowing = true;
                this.header.setSearchButtonText("&nbsp;Map&nbsp;");
            }
        },

        _showSearchLocation: function(location) {
            this._showSearch();
        }
    };

    return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], theDijit);
});