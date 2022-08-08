# dn_relatedtables

The Related Tables bundle adds a new popup to the app to display data from related tables.

## Usage

1. Add the dn_relatedtables bundle to your app.
2. Use the related-tables-popup as selected popupTemplate for each layer that has related tables.
3. Configure the content of the popupTemplate as described in the documentation: https://docs.conterra.de/en/mapapps/latest/apps/configuring-apps/popups.html#_designing_popup_content

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
                    "popupType": "related-tables-popup",
                    "title": "Störung",
                    "content": [
                        {
                            "type": "fields",
                            "fieldInfos": [
                                {
                                    "fieldName": "details",
                                    "label": "Details"
                                },
                                {
                                    "fieldName": "melder",
                                    "label": "Melder"
                                },
                                {
                                    "fieldName": "status",
                                    "label": "Status"
                                },
                                {
                                    "fieldName": "zeitpunkt",
                                    "label": "Zeitpunkt",
                                    "format": {
                                        "dateFormat": "day-short-month-year"
                                    }
                                },
                                {
                                    "fieldName": "kommentar",
                                    "label": "Kommentar"
                                }
                            ]
                        }
                    ]
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
    "relationNameReplacer": [
        {
            "name": "Aktivitäten",
            "newName": "Störungsaktivitäten"
        }
    ],
    "displayfieldReplacer": [
        {
            "name": "Aktivitäten",
            "newField": "Name"
        }
    ],
    "enableFiltering": false,
    "filterModeIsAllowlist": false,
    "filterList": []
}
```

| Property              | Type    | Possible Values                                                | Default     | Description                                                                                                                                                        |
|-----------------------|---------|----------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| relationNameReplacer  | Array   |                                                                | ```[]```    | List of name replacer. "name": Name of the related entity, "newName": Name to be used for the display of the related entity                                        |
| displayfieldReplacer  | Array   |                                                                | ```[]```    | List of displayField replacer. "name": Name of the related entity, "newName": Attribute name of the related entity to be used for the display of the dataset names |
| enableFiltering       | Boolean | ```true``` &#124; ```false```                                  | ```false``` | Enables/Disables the filtering of the related table content to only display selected attributes                                                                    |
| filterModeIsAllowlist | Boolean | ```true``` &#124; ```false```                                  | ```false``` | Switches between allowlist and denylist filtering. On ```true```, only listed attributes are displayed. On ```false```, only listed attributes are not displayed   |
| filterList            | Array   | ```String``` Titles of attributes provided by the used service | ```[]```    | List of attributes used for filtering. The objectID-field cannot be filtered                                                                                       |
