/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
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

    constructor(popupWidgetFactory, queryController, mapWidgetModel, properties) {
        this.popupWidgetFactory = popupWidgetFactory;
        this.queryController = queryController;
        this.mapWidgetModel = mapWidgetModel;
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
            creator: ({ graphic }) => {
                const widget = this.popupWidgetFactory.getWidget();
                widget.startup();

                const vm = widget.getVM();

                const sourceLayer = graphic.sourceLayer || layerOrSublayer;
                displayField = displayField || sourceLayer.displayField;
                objectIdField = objectIdField || sourceLayer.objectIdField;
                const objectId = graphic.attributes[objectIdField];
                widget.set("relatedRecordsData", []);
                vm.watch("selectedRelatedRecordsData", async (selectedRelatedRecordsData) => {
                    const domNode = vm.$refs.featureWidgets;
                    // remove all children of domNode
                    let child = domNode.lastElementChild;
                    while (child) {
                        domNode.removeChild(child);
                        child = domNode.lastElementChild;
                    }
                    if(selectedRelatedRecordsData.id !== null && selectedRelatedRecordsData.relatedRecords.length) {
                        const relationshipId = selectedRelatedRecordsData.id;
                        const relatedRecords = selectedRelatedRecordsData.relatedRecords;

                        const relationshipTemplates = sourceLayer?.popupTemplate?.relationshipTemplates;
                        let relatedRecordTemplate =
                            relationshipTemplates ? relationshipTemplates[relationshipId] : null;

                        if (relatedRecordTemplate?.useRelatedLayerTemplate && relatedRecordTemplate?.relatedLayerId) {
                            const relatedLayerId = relatedRecordTemplate.relatedLayerId;
                            const relatedLayer = this._getLayerById(relatedLayerId);
                            const content =
                                relatedLayer.popupTemplate.content.filter((content) => content.type !== "custom");
                            relatedRecordTemplate = {
                                title: relatedRecordTemplate.title || relatedLayer.popupTemplate.title,
                                content: content
                            };
                        }
                        relatedRecords.forEach((record) => {
                            const g = this._getGraphic(record, relatedRecordTemplate);
                            return new Feature({
                                graphic: g,
                                container: domNode
                            });
                        });
                    }
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
        const filterAttributesMode = props.filterAttributesMode;
        const filterAttributesList = props.filterAttributesList;

        // Use allowlist filtering
        if (filterAttributesList.length && filterAttributesMode === "allow") {
            for (const [key, value] of Object.entries(clonedAttributes)) {
                // delete all attributes that are not included in the filterAttributesList
                if (!filterAttributesList.includes(key)) {
                    delete clonedAttributes[key];
                }
            }
        }

        // Use denylist filtering
        if (filterAttributesList.length && filterAttributesMode === "deny") {
            for (const [key, value] of Object.entries(clonedAttributes)) {
                // delete all attributes that are included in the filterAttributesList
                if (filterAttributesList.includes(key)) {
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
            .then((metadata) => queryController.getRelatedMetadata(url, metadata, sourceLayer)
                .then((relatedMetadata) => queryController
                    .findRelatedRecords(objectId, url, metadata, sourceLayer)
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
                                        id: metadata.relationshipId + "_" + attributes[objectIdField.name],
                                        title: attributes[metadata.displayField],
                                        attributes: attributes,
                                        fields: metadata.fields.map((field) => Field.fromJSON(field))
                                    });
                                });
                            });
                            if (relatedRecords.length) {
                                relatedRecordsData.push({
                                    id: metadata.relationshipId,
                                    title: this._replaceRelationName(metadata.name),
                                    relatedRecords: relatedRecords
                                });
                            }
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

    _getLayerById(layerIdPath) {
        if (typeof layerIdPath !== "string") {
            return undefined;
        }

        const mapWidgetModel = this.mapWidgetModel;

        const parts = layerIdPath.split("/");
        const layerId = parts[0];
        const sublayerId = parts[1];

        const layer = mapWidgetModel?.map?.findLayerById(layerId);
        if (!sublayerId) {
            return layer;
        }

        return layer.findSublayerById(parseInt(sublayerId, 10));
    }

}
