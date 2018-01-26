# ContentViewer Relates Bundle
The ContentViewer Relates Bundle expands the ContentViewer to display data from related tables.

Sample App
------------------
https://demos.conterra.de/mapapps/resources/apps/downloads_contentviewerrelates/index.html

Installation Guide
------------------
**Requirement: map.apps 3.x**

Simply add the dn_contentviewerrelates bundle to your app.

Development Guide
------------------
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

##### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
