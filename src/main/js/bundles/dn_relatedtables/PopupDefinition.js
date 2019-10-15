/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import ct_when from "ct/_when";
import ct_array from "ct/array";

export default class CustomPopupDefinition {

    constructor(popupWidgetFactory, queryController, properties) {
        this.popupWidgetFactory = popupWidgetFactory;
        this.queryController = queryController;
        this.properties = properties;
    }

    resolvePopupTemplate(layerOrSublayer) {
        let that = this;
        let url = layerOrSublayer.url;
        let layerId = layerOrSublayer.layerId;
        if (layerId) {
            url = url + "/" + layerId;
        }
        let queryController = this.queryController;
        return ct_when(queryController.getMetadata(url), (metadata) => {
            if (metadata.fields) {
                let fields = metadata.fields;
                let fieldNames = fields.map(f => f.name);
                let displayField = metadata.displayField;
                let objectIdField = ct_array.arraySearchFirst(metadata.fields, {
                    type: "esriFieldTypeOID"
                }).name;
                return {
                    fields: fieldNames,
                    title: "{" + displayField + "}",
                    content({graphic}) {
                        if (fields) {
                            let widget = layerOrSublayer._$popup_widget;
                            if (!widget) {
                                widget = layerOrSublayer._$popup_widget = that.popupWidgetFactory.getWidget();
                                widget.startup();
                            }

                            let sourceLayer = graphic.sourceLayer;
                            displayField = displayField || sourceLayer.displayField;
                            objectIdField = objectIdField || sourceLayer.objectIdField;
                            let objectId = graphic.attributes[objectIdField];

                            let title = graphic.attributes[displayField];
                            let items = that.lookupFieldNamesToAttributes(fields, graphic.attributes);
                            widget.set("title", title);
                            widget.set("items", items);
                            widget.set("relatedRecordsTabs", []);

                            ct_when(that.getRelatedRecordsTabs(graphic.sourceLayer, objectId, widget), (relatedRecordsTabs) => {
                                widget.set("relatedRecordsTabs", relatedRecordsTabs);
                            });
                            return widget;
                        }
                    }
                };
            }
        });
    }

    getRelatedRecordsTabs(sourceLayer, objectId, widget) {
        let url = sourceLayer.url;
        let layerId = sourceLayer.layerId;
        if (layerId) {
            url = url + "/" + layerId;
        }
        widget.set("loading", true);

        let queryController = this.queryController;
        return ct_when(queryController.getMetadata(url), (metadata) => {
            return ct_when(queryController.getRelatedMetadata(url, metadata), (relatedMetadata) => {
                return ct_when(queryController.findRelatedRecords(objectId, url, metadata), (results) => {
                    let relatedRecordsTabs = [];
                    if (!results) {
                        widget.set("loading", false);
                        return relatedRecordsTabs;
                    }
                    results.forEach((result, i) => {
                        let tabs = [];
                        let metadata = relatedMetadata[i];
                        let fields = result.fields;
                        let relatedRecordGroups = result.relatedRecordGroups;
                        relatedRecordGroups.forEach((relatedRecordGroup) => {
                            relatedRecordGroup.relatedRecords.forEach((record) => {
                                let attributes = record.attributes;
                                let items = this.lookupFieldNamesToAttributes(fields, attributes);
                                const objectIdField = this.getObjectIdField(metadata.fields);
                                tabs.push({
                                    id: metadata.id + "_" + attributes[objectIdField.name],
                                    title: attributes[metadata.displayField],
                                    items: items
                                });
                            });
                        });
                        relatedRecordsTabs.push({
                            id: metadata.id,
                            title: metadata.name,
                            tabs: tabs,
                            active: null
                        });
                    });
                    widget.set("loading", false);
                    return relatedRecordsTabs;
                });
            })
        });
    }

    lookupFieldNamesToAttributes(fields, attributes) {
        let result = [];
        fields.forEach((field) => {
            if (!this.properties.hideFields.includes(field.name)) {
                result.push({
                    name: field.alias,
                    value: attributes[field.name]
                });
            }
        });
        return result;
    }

    getObjectIdField(fields) {
        return fields.find((field) => {
            return field.type === "esriFieldTypeOID";
        });
    }

    cleanupPopupTemplate(layer) {
        let widget = layer._$popup_widget;
        delete layer._$popup_widget;
        widget && widget.destroyRecursive();
    }

}
