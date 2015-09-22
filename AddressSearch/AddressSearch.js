define([
    "dojo/_base/declare",
    "dojo/topic",
    "put-selector/put",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/AddressSearch.html",

    "dojox/form/BusyButton",

    "esri/geometry/Extent",
    "esri/request"
], function(
    declare, topic, put,
    WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template,
    BusyButton,
    Extent, esriRequest
) {
    var theDijit = {
        templateString: template,
        widgetsInTemplate: true,

        constructor: function(args) {
            this.searchExtent = new Extent({
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
            this._initSearchButton();
        },

        _initSearchButton: function() {
            var _this = this;
            this.searchButton.on("click", function(evt) {
                console.log("searchButton clicked");
                var searchString = _this.searchInput.get("value");
                _this._doGeocodeSearch(searchString);
            });
        },

        _doGeocodeSearch: function(searchString) {
            var _this = this;
            var content = {
                callbackParamName: "callback",
                text: searchString,
                extent: this.searchExtent,
                f: "json"
            };

            esriRequest({
                url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find",
                content: content,
                handleAs: "json"
            }).then(function(response) {
                console.log(response);
                _this.searchButton.cancel();
                if (response.locations.length > 0)
                {
                    var geometry = response.locations[0].feature.geometry;
                    console.log("response geometry: ", geometry);
                    topic.publish(AddressSearch.searchLocationSelectedTopic, geometry);
                }
            }, function(err) {
                console.log("Geocode query failed: ", err);
                _this.searchButton.cancel();
            });
        }
    };

    var AddressSearch =  declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], theDijit);

    AddressSearch.searchLocationSelectedTopic = "addressSearchSearchLocationSelectedTopic";
    return AddressSearch;
});