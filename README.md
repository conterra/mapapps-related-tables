# Related Tables
The Related Tables bundle adds a new popup to the app to display data from related tables.

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_relatedtables4/index.html

![Screenshot Sample App](https://github.com/conterra/mapapps-contentviewer-relates/blob/master/screenshot.png)

The Related Tables bundle for Linie 3 can be found in the 3.x branch:
https://github.com/conterra/mapapps-related-tables/tree/3.x

## Installation Guide
**Requirement: map.apps 4.6.0**

1. Add the dn_relatedtables bundle to your app.
2. Use the related-tables-popup as selected popupTemplate for each layer that has related tables.

```
"layers": [
    {
        "url": "https://services.conterra.de/arcgis/rest/services/mapapps/stoerung_relates/MapServer",
        "type": "AGS_DYNAMIC",
        "title": "Störungen",
        "sublayers": [
            {
                "id": 0,
                "title": "Störungen",
                "visible": true,
                "popupTemplate": {
                    "popupType": "related-tables-popup"
                }
            }
        ]
    }
]
```

### Configurable Components of dn_relatedtables:

#### PopupDefinitionFactory:
```
"PopupDefinitionFactory": {
    "hideFields": [
        "OBJECTID",
        "objectid",
        "shape"
    ],
    "relationNameReplacer": [
        {
            "name": "Aktivitäten",
            "newName": "Störungsaktivitäten"
        }
    ]
}
```

| Property                        | Type    | Possible Values                                                       | Default                     | Description                                                                                                                            |
|---------------------------------|---------|-----------------------------------------------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| hideFields                      | Array   |                                                                       | ```[]```                    | List of hided fields                                                                                                                   |
| relationNameReplacer            | Array   |                                                                       | ```[]```                    | List of name replacer                                                                                                                  |

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
