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

                let content = [];
                if (layerOrSublayer.popupTemplate?.content?.length) {
                    content = [...content, ...layerOrSublayer.popupTemplate.content];
                }
                content = [...content, ...[customContentWidget]];
                if (layerOrSublayer.popupTemplate?.footerContent?.length) {
                    content = [...content, ...layerOrSublayer.popupTemplate.footerContent];
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

                const sourceLayer = graphic.sourceLayer || layerOrSublayer;
                displayField = displayField || sourceLayer.displayField;
                objectIdField = objectIdField || sourceLayer.objectIdField;
                const objectId = graphic.attributes[objectIdField];
                widget.set("relatedRecordsData", []);
                vm.watch("selectedRelatedRecordsData", (selectedRelatedRecordsData) => {
                    const domNode = vm.$refs.featureWidgets;
                    // remove all children of domNode
                    let child = domNode.lastElementChild;
                    while (child) {
                        domNode.removeChild(child);
                        child = domNode.lastElementChild;
                    }
                    const relationshipId = selectedRelatedRecordsData.id;
                    const relatedRecords = selectedRelatedRecordsData.relatedRecords;
                    const relatedRecordTemplates = sourceLayer?.popupTemplate?.relatedRecordTemplates;
                    const relatedRecordTemplate =
                        relatedRecordTemplates ? relatedRecordTemplates[relationshipId] : null;
                    relatedRecords.forEach((record) => {
                        const g = this._getGraphic(record, relatedRecordTemplate);
                        return new Feature({
                            graphic: g,
                            container: domNode
                        });
                    });
                });

                this._getRelatedRecordsData(sourceLayer, objectId, widget).then((relatedRecordsData) => {
                    widget.set("relatedRecordsData", relatedRecordsData);
                    const firstRelatedRecordsData = relatedRecordsData[0];
                    widget.set("selectedRelatedRecordsData", firstRelatedRecordsData);
                });
                return widget.domNode;
            }
        });
    }

    _getGraphic(relatedRecord, relatedRecordTemplate) {
        if (!relatedRecordTemplate) {
            relatedRecordTemplate = {
                title: relatedRecord.title,
                content: [{
                    type: "fields", fieldInfos: relatedRecord.fields.map((field) => {
                        return {
                            fieldName: field.name, label: field.alias || field.name
                        };
                    })
                }]
            };
        }
        const layer = new FeatureLayer({
            source: [],
            fields: relatedRecord.fields
        });
        const filteredAttributes = this._filterAttributes(relatedRecord.attributes);
        return {
            layer: layer, attributes: filteredAttributes, popupTemplate: relatedRecordTemplate
        };
    }

    _filterAttributes(attributes) {
        const clonedAttributes = Object.assign({}, attributes);
        const props = this.properties;
        const filterModeIsAllowlist = props.filterModeIsAllowlist;
        const filterList = props.filterList;

        // Use allowlist filtering
        if (filterList.length && filterModeIsAllowlist) {
            for (const [key, value] of Object.entries(clonedAttributes)) {
                // delete all attributes that are not included in the filterList
                if (!filterList.includes(key)) {
                    delete clonedAttributes[key];
                }
            }
        }

        // Use denylist filtering
        if (filterList.length && !filterModeIsAllowlist) {
            for (const [key, value] of Object.entries(clonedAttributes)) {
                // delete all attributes that are included in the filterList
                if (filterList.includes(key)) {
                    delete clonedAttributes[key];
                }
            }
        }

        return clonedAttributes;
    }

    _getRelatedRecordsData(sourceLayer, objectId, widget) {
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
                    .findRelatedRecords(objectId, url, metadata)
                    .then((results) => {
                        const relatedRecordsData = [];
                        if (!results) {
                            widget.set("loading", false);
                            return relatedRecordsData;
                        }
                        results.forEach((result, i) => {
                            const relatedRecords = [];
                            const metadata = relatedMetadata[i];
                            const objectIdField = this.objectIdField = this._getObjectIdField(metadata.fields);

                            const relatedRecordGroups = result.relatedRecordGroups;
                            relatedRecordGroups.forEach((relatedRecordGroup) => {
                                relatedRecordGroup.relatedRecords.forEach((record) => {
                                    const attributes = record.attributes;
                                    relatedRecords.push({
                                        id: metadata.id + "_" + attributes[objectIdField.name],
                                        title: attributes[metadata.displayField],
                                        attributes: attributes,
                                        fields: metadata.fields.map((field) => Field.fromJSON(field))
                                    });
                                });
                            });
                            relatedRecordsData.push({
                                id: metadata.id,
                                title: this._replaceRelationName(metadata.name),
                                relatedRecords: relatedRecords
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

    _getObjectIdField(fields) {
        return fields.find((field) => field.type === "esriFieldTypeOID");
    }

}
