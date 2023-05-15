# Related Tables

The Related Tables bundle adds a new popup to the app to display data from related tables.

![Screenshot App](https://github.com/conterra/mapapps-related-tables/blob/master/screenshot.JPG)

The Related Tables bundle for Linie 3 can be found in the 3.x branch:
https://github.com/conterra/mapapps-related-tables/tree/3.x

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_relatedtables4/index.html

## Installation Guide
**Requirement: map.apps 4.9.0**

[dn_relatedtables Documentation](https://github.com/conterra/mapapps-related-tables/tree/master/src/main/js/bundles/dn_relatedtables)

⚠️**Attention the new version 6.x has a different configuration than the previous version 5**
The relationship templates are now configured via the relationship-IDs and not via the IDs of the linked layers as before.

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
