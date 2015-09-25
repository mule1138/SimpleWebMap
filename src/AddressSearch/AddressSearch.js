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
    "esri/tasks/locator"
], function(
    declare, topic, put,
    WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template,
    BusyButton,
    Extent, Locator
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

            this.locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
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
            console.log("searchString: ", searchString);
            var params = {
                address: {
                    singleLine: searchString
                },
                forStorage: false,
                maxLocations: 5,
                searchExtent: this.searchExtent
            };

            var _this = this;
            this.locator.addressToLocations(params).then(function(response) {
                _this.handleLocatorResponse(response);
            }, function(err) {
                _this.searchButton.cancel(err);
            });
        },

        handleLocatorResponse: function(response) {
            console.log("Locator response: ", response);
            this.searchButton.cancel();
            if (response.length > 0)
            {
                var geometry = response[0].location;
                console.log("response geometry: ", geometry);
                topic.publish(AddressSearch.searchLocationSelectedTopic, geometry);
            }
        },

        handleErrorResponse: function(error) {
            console.log("Geocode query error: ", error);
            this.searchButton.cancel();
        },

        noComma: true
    };

    var AddressSearch = declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], theDijit);

    AddressSearch.searchLocationSelectedTopic = "addressSearchSearchLocationSelectedTopic";
    return AddressSearch;
});