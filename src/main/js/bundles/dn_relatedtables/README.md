# dn_relatedtables

The Related Tables bundle adds a new popup to the app to display data from related tables.

## Usage


1. Add the dn_relatedtables bundle to your app.
2. Use the related-tables-popup as selected popupTemplate for each layer that has related tables.
3. Configure the content of the popupTemplate as described in the documentation: https://docs.conterra.de/en/mapapps/latest/apps/configuring-apps/popups.html#_designing_popup_content

⚠️**Attention the new version 6.x has a different configuration than the previous version 5**
The relationship templates are now configured via the relationship-IDs and not via the IDs of the linked layers as before.

```javascript
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
                    // default popup content
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
                    ],
                    // popup templates for related records
                    "relationshipTemplates": {
                        // template for relationship with id 0
                        "0": {
                            "title": "{Aktivität} von {Name}",
                            "content": [
                                {
                                    "type": "fields",
                                    "fieldInfos": [
                                        {
                                            "fieldName": "Name",
                                            "label": "Bearbeiter"
                                        },
                                        {
                                            "fieldName": "Aktivität",
                                            "label": "Aktivität"
                                        },
                                        {
                                            "fieldName": "Datum",
                                            "label": "Bearbeitungsdatum"
                                        }
                                    ]
                                },
                                {
                                    "type": "media",
                                    "mediaInfos": [
                                        {
                                            "title": "<b>Chart sample without sense</b>",
                                            "type": "pie-chart",
                                            "value": {
                                                "fields": [
                                                    "Störung_ID",
                                                    "Aktivität"
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    // footer content
                    "footerContent": [
                        {
                            "type": "text",
                            "text": "<hr/>\ncreated by <b>con terra</b>"
                        }
                    ]
                }
            }
        ]
    }
]
```

### Sample configuration that shows how to restrict the displayed relationships
```json
{
    "id": "koeln",
    "url": "https://geoportal.stadt-koeln.de/arcgis/rest/services/basiskarten/kgg/MapServer",
    "type": "AGS_DYNAMIC",
    "title": "Stadt Köln",
    "sublayers": [
        {
            "id": 3,
            "title": "Stadtteile",
            "popupTemplate": {
                "popupType": "related-tables-popup",
                "customActions": [
                    "maximize-popup"
                ],
                "title": "Stadtteil {name}",
                "content": [
                    {
                        "type": "fields",
                        "fieldInfos": [
                            {
                                "fieldName": "st_area(shape)",
                                "label": "Fläche",
                                "format": {
                                    "places": 2,
                                    "digitSeparator": true
                                }
                            }
                        ]
                    }
                ],
                // only show relationships 1 and 4
                "displayedRelationships": [1, 4],
                "relationshipTemplates": {
                    "1": {
                        "title": "{name}",
                        "content": [
                            {
                                "type": "fields",
                                "fieldInfos": [
                                    {
                                        "fieldName": "stadtbezirk",
                                        "label": "Stadtbezirk"
                                    },
                                    {
                                        "fieldName": "st_area(shape)",
                                        "label": "Fläche",
                                        "format": {
                                            "places": 2,
                                            "digitSeparator": true
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    "4": {
                        "title": "{name}",
                        "content": [
                            {
                                "type": "fields",
                                "fieldInfos": [
                                    {
                                        "fieldName": "st_area(shape)",
                                        "label": "Fläche",
                                        "format": {
                                            "places": 2,
                                            "digitSeparator": true
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },
                "footerContent": [
                    {
                        "type": "text",
                        "text": "<hr/>\nDaten der <b>Stadt Köln</b>"
                    }
                ]
            }
        }
    ]
}
```

### Sample configuration using related layers for popupTemplate configuration
```json
 "layers": [
    {
        "id": "stoerungen",
        "url": "https://services.conterra.de/arcgis/rest/services/mapapps/stoerung_relates/MapServer",
        "type": "AGS_DYNAMIC",
        "title": "Störungen",
        "sublayers": [
            {
                "id": 0,
                "title": "Störungen",
                "popupTemplate": {
                    "popupType": "related-tables-popup",
                    "customActions": [
                        "maximize-popup"
                    ],
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
                    ],
                    "relationshipTemplates": {
                        "0": {
                            // use popupTemplate of layer "status", sublayer 0
                            "useRelatedLayerTemplate": true,
                            "relatedLayerId": "status/0"
                        }
                    },
                    "footerContent": [
                        {
                            "type": "text",
                            "text": "<hr/>\ncreated by <b>con terra</b>"
                        }
                    ]
                }
            }
        ]
    },
    {
        "id": "status",
        "url": "https://services.conterra.de/arcgis/rest/services/mapapps/stoerung_relates/MapServer",
        "type": "AGS_DYNAMIC",
        "title": "Status",
        "sublayers": [
            {
                "id": 0,
                "title": "Status",
                "popupTemplate": {
                    "content": [
                        {
                            "type": "fields",
                            "fieldInfos": [
                                {
                                    "fieldName": "Name",
                                    "label": "Bearbeiter"
                                },
                                {
                                    "fieldName": "Aktivität",
                                    "label": "Aktivität"
                                },
                                {
                                    "fieldName": "Datum",
                                    "label": "Bearbeitungsdatum"
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

### Sample configuration using externel related popupTemplate configuration

#### 1. Configure related popupTemplate in RelatedTablePopupTemplates component factory

```json
"dn_relatedtables": {
    "RelatedTablePopupTemplates": [
        {
            "type": "stoerungen-related",
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
            ],
            "relationshipTemplates": {
                "0": {
                    "title": "{Aktivität} von {Name}",
                    "content": [
                        {
                            "type": "fields",
                            "fieldInfos": [
                                {
                                    "fieldName": "Name",
                                    "label": "Bearbeiter"
                                },
                                {
                                    "fieldName": "Aktivität",
                                    "label": "Aktivität"
                                },
                                {
                                    "fieldName": "Datum",
                                    "label": "Bearbeitungsdatum"
                                }
                            ]
                        },
                        {
                            "type": "media",
                            "mediaInfos": [
                                {
                                    "title": "<b>Chart sample without sense</b>",
                                    "type": "pie-chart",
                                    "value": {
                                        "fields": [
                                            "Störung_ID",
                                            "Aktivität"
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            "footerContent": [
                {
                    "type": "text",
                    "text": "<hr/>\ncreated by <b>con terra</b>"
                }
            ],
            "relationNameReplacer": [
                {
                    "name": "Aktivitäten",
                    "newName": "Störungsaktivitäten"
                }
            ],
            "filterAttributesMode": "deny",
            "filterAttributesList": [
                "OBJECTID"
            ]
        }
    ]
}
```

#### 2. Use the previous defined popupTemplate for one ore more layers

```json
{
    "id": "stoerungen_externe_config",
    "url": "https://services.conterra.de/arcgis/rest/services/mapapps/stoerung_relates/MapServer",
    "type": "AGS_DYNAMIC",
    "title": "Störungen - Externe Konfiguration",
    "sublayers": [
        {
            "id": 0,
            "title": "Störungen",
            "renderer": {
                "type": "simple",
                "symbol": {
                    "type": "simple-marker",
                    "color": [
                        255,
                        0,
                        0,
                        0.6
                    ],
                    "size": 16,
                    "outline": {
                        "color": [
                            0,
                            0,
                            0,
                            0.4
                        ],
                        "width": 0.5
                    }
                }
            },
            "popupTemplate": {
                "popupType": "stoerungen-related"
            }
        }
    ]
}
```

### Configurable Components of dn_relatedtables:

#### Config:

```json
"dn_relatedtables": {
    "Config": {
        "relationNameReplacer": [
            {
                "name": "Aktivitäten",
                "newName": "Störungsaktivitäten"
            }
        ],
        "filterAttributesMode": "deny",
        "filterAttributesList": [
            "OBJECTID"
        ]
    }
}
```

Filter properties affect only the relational data. These do not have to be configured if you define your own templates via the relationshipTemplates property.

| Property             | Type    | Possible Values                                              | Default    | Description                                                                                                                                                       |
| -------------------- | ------- | ------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| relationNameReplacer | Array   |                                                              | ```[]```   | List of name replacer. "name": Name of the related entity, "newName": Name to be used for the display of the related entity.                                      |
| filterAttributesMode | Boolean | ```deny``` &#124; ```allow```                                | ```deny``` | Switches between allowlist and denylist filtering. On ```allow```, only listed attributes are displayed. On ```deny```, only listed attributes are not displayed. |
| filterAttributesList | Array   | ```String``` Name of attributes provided by the used service | ```[]```   | List of attributes used for filtering.                                                                                                                            |

#### RelatedTablePopupTemplates:

```json
"dn_relatedtables": {
    "RelatedTablePopupTemplates": [
        {
            "type": "any-id",
            "title": "Title",
            "content": [],
            "relationshipTemplates": {},
            "footerContent": [],
            "relationNameReplacer": [],
            "filterAttributesMode": "deny",
            "filterAttributesList": []
        }
    ]
}
```
