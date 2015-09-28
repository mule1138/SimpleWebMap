# SimpleWebMap
Simple web map app using the Esri JSAPI. Provides a template of a modular, Dojo based application with some guidance on how to interact with the map.

## The App
The map allows users to find the municipal courthouse that services a location within St. Louis County, Missouri. There are two ways to provide the location:

1. Click on the map within a municipality boundary
2. Go to the search page and enter an address or location

The data for the two layers on the map are provied by St. Louis County.
* [Municipal Boundaries](http://maps.stlouisco.com/arcgis/rest/services/OpenData/OpenData/FeatureServer/5)
* [Municipal Courthouses](https://services.arcgis.com/bkrWlSKcjUDFDtgw/arcgis/rest/services/MunicipalCourtLocations/FeatureServer/0)
