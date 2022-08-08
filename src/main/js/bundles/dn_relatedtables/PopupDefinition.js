/*
 * Copyright (C) 2022 con terra GmbH (info@conterra.de)
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

import PopupTemplate from "esri/PopupTemplate";
import CustomContent from "esri/popup/content/CustomContent";
import Feature from "esri/widgets/Feature";
import FeatureLayer from "esri/layers/FeatureLayer";
import Field from "esri/layers/support/Field";

export default class PopupDefinition {

    constructor(popupWidgetFactory, queryController, properties) {
        this.popupWidgetFactory = popupWidgetFactory;
        this.queryController = queryController;
        this.properties = properties;
    }

    resolvePopupTemplate(layerOrSublayer) {
        let url = layerOrSublayer.url;
        const layerId = layerOrSublayer.layerId;
        if (layerId !== undefined) {
            url = url + "/" + layerId;
        }
        const queryController = this.queryController;
        return queryController.getMetadata(url).then((metadata) => {
            if (metadata.fields) {
                const displayField = metadata.displayField;
                const objectIdField = this._getObjectIdField(metadata.fields).name;

                const customContentWidget = this._getCustomContent(layerOrSublayer, displayField, objectIdField);

                let content;
                if (layerOrSublayer.popupTemplate?.content?.length) {
                    content = [...layerOrSublayer.popupTemplate.content, ...[customContentWidget]];
                } else {
                    content = [customContentWidget];
                }

                return new PopupTemplate({
                    outFields: ["*"],
                    title: layerOrSublayer.popupTemplate?.title || "{" + displayField + "}",
                    content: content
                });
            }
        });
    }

    _getCustomContent(layerOrSublayer, displayField, objectIdField) {
        return new CustomContent({
            outFields: ["*"],
            creator: ({graphic}) => {
                const widget = this.popupWidgetFactory.getWidget();
                widget.startup();

                const vm = widget.getVM();
                const featureWidget = new Feature({
                    graphic: null,
                    container: vm.$refs.featureWidget
                });
                vm.$on('related-record-changed', (relatedRecord) => {
                    featureWidget.graphic = this._getGraphic(relatedRecord);
                });

                const sourceLayer = graphic.sourceLayer || layerOrSublayer;
                displayField = displayField || sourceLayer.displayField;
                objectIdField = objectIdField || sourceLayer.objectIdField;
                const objectId = graphic.attributes[objectIdField];
                widget.set("relatedRecordsData", []);

                this._getRelatedRecordsData(sourceLayer, objectId, widget).then((relatedRecordsData) => {
                    widget.set("relatedRecordsData", relatedRecordsData);
                    widget.set("selectedRelatedRecordsData", relatedRecordsData[0]);
                    const g = this._getGraphic(relatedRecordsData[0].active);
                    featureWidget.graphic = g;
                });
                return widget.domNode;
            }
        });
    }

    _getGraphic(relatedRecord) {
        const layer = new FeatureLayer({
            source: [],
            fields: relatedRecord.fields
        });
        return {
            layer: layer,
            attributes: Object.assign({}, relatedRecord.attributes),
            popupTemplate: {
                //title: relatedRecord.title,
                content: [
                    {
                        type: "fields",
                        fieldInfos: relatedRecord.fields.map((field) => {
                            return {
                                fieldName: field.name,
                                label: field.alias || field.name
                            };
                        })
                    }
                ]
            }
        };
    }

    _getRelatedRecordsData(sourceLayer, objectId, widget) {
        const props = this.properties;
        const enableFiltering = props.enableFiltering;
        const filterMode = props.filterModeIsAllowlist;
        const filterArray = props.filterList;

        let url = sourceLayer.url;
        const layerId = sourceLayer.layerId;
        if (layerId !== undefined) {
            url = url + "/" + layerId;
        }
        widget.set("loading", true);

        const queryController = this.queryController;
        return queryController.getMetadata(url)
            .then((metadata) => queryController.getRelatedMetadata(url, metadata)
                .then((relatedMetadata) => queryController
                    .findRelatedRecords(objectId, url, metadata, filterMode, filterArray)
                    .then((results) => {
                        const relatedRecordsData = [];
                        if (!results) {
                            widget.set("loading", false);
                            return relatedRecordsData;
                        }
                        results.forEach((result, i) => {
                            const relatedRecords = [];
                            const metadata = relatedMetadata[i];
                            const objectIdField = this._getObjectIdField(metadata.fields);

                            // Use allowlist filtering
                            if (enableFiltering && filterMode) {
                                for (const [key, value] of Object.entries(metadata.fields)) {
                                    // If attribute is not in allowlist and is not the objectIdField discard attribute
                                    if (!filterArray.includes(value.name)) {
                                        if (value.name === objectIdField.name) {
                                            //do nothing
                                        } else {
                                            metadata.fields.forEach(function (field, index) {
                                                if (field.name === value.name) {
                                                    metadata.fields.splice(index, 1);
                                                }
                                            });
                                        }
                                    }
                                }
                            }

                            // Use denylist filtering
                            if (enableFiltering && !filterMode) {
                                for (const [key, value] of Object.entries(metadata.fields)) {
                                    // if attribute is in the denylist and not the objectIdField discard attribute
                                    if (filterArray.includes(value.name)) {
                                        metadata.fields.forEach(function (field, index) {
                                            if (field.name === value.name && value.name !== "OBJECTID") {
                                                metadata.fields.splice(index, 1);
                                            }
                                        });
                                    }
                                }
                            }

                            const relatedRecordGroups = result.relatedRecordGroups;
                            relatedRecordGroups.forEach((relatedRecordGroup) => {
                                relatedRecordGroup.relatedRecords.forEach((record) => {
                                    const attributes = record.attributes;
                                    relatedRecords.push({
                                        id: metadata.id + "_" + attributes[objectIdField.name],
                                        title: attributes[this._replaceDisplayField(metadata)],
                                        attributes: attributes,
                                        fields: metadata.fields.map((field) => Field.fromJSON(field)),
                                        objectIdField: objectIdField
                                    });
                                });
                            });
                            relatedRecordsData.push({
                                id: metadata.id,
                                title: this._replaceRelationName(metadata.name),
                                relatedRecords: relatedRecords,
                                active: relatedRecords[0]
                            });
                        });
                        widget.set("loading", false);
                        return relatedRecordsData;
                    })
                )
            );
    }

    _replaceRelationName(name) {
        const relationNameReplacer = this.properties.relationNameReplacer;
        const replacerObject = relationNameReplacer.find((replacer) => replacer.name === name);
        if (replacerObject) {
            return replacerObject.newName;
        } else {
            return name;
        }
    }

    _replaceDisplayField(metadata) {
        const displayfieldReplacer = this.properties.displayfieldReplacer;
        const replacerObject = displayfieldReplacer.find((replacer) => replacer.name === metadata.name);
        if (replacerObject) {
            return replacerObject.newField;
        } else {
            return metadata.displayField;
        }
    }

    _getObjectIdField(fields) {
        return fields.find((field) => field.type === "esriFieldTypeOID");
    }

}
