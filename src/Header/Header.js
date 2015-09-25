define([
    "dojo/_base/declare",
    "dojo/topic",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    "dojo/text!./templates/Header.html",

    "dijit/form/Button"
], function(
    declare, topic,
    WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
    template,
    Button
) {
    var theDijit = {
        templateString: template,
        widgetsInTemplate: true,

        constructor: function(args) {
        },

        postCreate: function() {
            this._initButtons();
        },

        setSearchButtonText: function (lblText) {
            this.searchButton.set("label", lblText);
        },

        _initButtons: function() {
            this.backButton.on("click", function(evt) {
                console.log("backButton clicked");
                window.location.href="/index.html";
            });

            this.searchButton.on("click", function(evt) {
                console.log("searchButton clicked");
                topic.publish(HeaderWidget.searchButtonClickedTopic);
            });
        }
    };

    var HeaderWidget = declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], theDijit);

    HeaderWidget.searchButtonClickedTopic = "headerWidgetSearchButtonClickedTopic";

    return HeaderWidget;
});