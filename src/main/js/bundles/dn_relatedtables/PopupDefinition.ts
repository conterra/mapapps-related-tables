///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import PopupTemplate from "@arcgis/core/PopupTemplate";
import CustomContent from "@arcgis/core/popup/content/CustomContent";
import Feature from "@arcgis/core/widgets/Feature";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Field from "@arcgis/core/layers/support/Field";

import type { PopupWidgetFactory } from "./PopupWidgetFactory";
import type { QueryController } from "./QueryController";
import type { MapWidgetModel } from "map-widget/MapWidgetModel";

export default class PopupDefinition {
    private popupWidgetFactory: PopupWidgetFactory;
    private queryController: QueryController;
    private mapWidgetModel: MapWidgetModel;
    private properties: Record<string, any>;
    private objectIdField?: any;

    constructor(
        popupWidgetFactory: PopupWidgetFactory,
        queryController: QueryController,
        mapWidgetModel: MapWidgetModel,
        properties: Record<string, any>
    ) {
        this.popupWidgetFactory = popupWidgetFactory;
        this.queryController = queryController;
        this.mapWidgetModel = mapWidgetModel;
        this.properties = properties;
    }

    resolvePopupTemplate(layerOrSublayer: any): Promise<PopupTemplate | undefined> {
        const properties = this.properties;
        let url = layerOrSublayer.url;
        const layerId = layerOrSublayer.layerId;
        if (layerId !== undefined) {
            url = url + "/" + layerId;
        }
        const queryController = this.queryController;
        return queryController.getMetadata(url).then((metadata) => {
            if (metadata.fields) {
                const displayField = metadata.displayField;
                const objectIdField = this.getObjectIdField(metadata.fields).name;

                const customContentWidget = this.getCustomContent(layerOrSublayer, displayField, objectIdField);

                let content: any[] = [];
                if (layerOrSublayer.popupTemplate?.content?.length) {
                    content = [...content, ...layerOrSublayer.popupTemplate.content];
                }
                if (properties.content?.length) {
                    content = [...content, ...properties.content];
                }
                content = [...content, ...[customContentWidget]];
                if (layerOrSublayer.popupTemplate?.footerContent?.length) {
                    content = [...content, ...layerOrSublayer.popupTemplate.footerContent];
                }
                if (properties.footerContent?.length) {
                    content = [...content, ...properties.footerContent];
                }

                return new PopupTemplate({
                    outFields: ["*"],
                    title: layerOrSublayer.popupTemplate?.title || properties.title || "{" + displayField + "}",
                    content: content
                });
            }
        });
    }

    private getCustomContent(layerOrSublayer: any, displayField: string, objectIdField: string): CustomContent {
        return new CustomContent({
            outFields: ["*"],
            creator: (event: any) => {
                const graphic = event.graphic as __esri.Graphic;
                const widget = this.popupWidgetFactory.getWidget() as any;
                widget.startup();

                const vm = widget.getVM();

                const sourceLayer = (graphic as any).sourceLayer || layerOrSublayer;
                displayField = displayField || sourceLayer.displayField;
                objectIdField = objectIdField || sourceLayer.objectIdField;
                const objectId = graphic.attributes[objectIdField];
                widget.set("relatedRecordsData", []);
                vm.watch("selectedRelatedRecordsData", async (selectedRelatedRecordsData: any) => {
                    const domNode = vm.$refs.featureWidgets;
                    // remove all children of domNode
                    let child = domNode.lastElementChild;
                    while (child) {
                        domNode.removeChild(child);
                        child = domNode.lastElementChild;
                    }
                    if (selectedRelatedRecordsData.id !== null && selectedRelatedRecordsData.relatedRecords.length) {
                        const relationshipId = selectedRelatedRecordsData.id;
                        const relatedRecords = selectedRelatedRecordsData.relatedRecords;

                        const relationshipTemplates = sourceLayer?.popupTemplate?.relationshipTemplates ||
                            this.properties.relationshipTemplates;
                        let relatedRecordTemplate =
                            relationshipTemplates ? relationshipTemplates[relationshipId] : null;

                        if (relatedRecordTemplate?.useRelatedLayerTemplate && relatedRecordTemplate?.relatedLayerId) {
                            const relatedLayerId = relatedRecordTemplate.relatedLayerId;
                            const relatedLayer = this.getLayerById(relatedLayerId);
                            if (relatedLayer && (relatedLayer as any).popupTemplate) {
                                const content =
                                    (relatedLayer as any).popupTemplate.content.filter((content: any) => content.type !== "custom");
                                relatedRecordTemplate = {
                                    title: relatedRecordTemplate.title || (relatedLayer as any).popupTemplate.title,
                                    content: content
                                };
                            }
                        }
                        relatedRecords.forEach((record: any) => {
                            const g = this.getGraphic(record, relatedRecordTemplate);
                            return new Feature({
                                graphic: g,
                                container: domNode
                            });
                        });
                    }
                });

                this.getRelatedRecordsData(sourceLayer, objectId, widget).then((relatedRecordsData) => {
                    widget.set("relatedRecordsData", relatedRecordsData);
                    const firstRelatedRecordsData = relatedRecordsData[0];
                    widget.set("selectedRelatedRecordsData", firstRelatedRecordsData);
                });
                return widget.domNode;
            }
        });
    }

    private getGraphic(relatedRecord: any, relatedRecordTemplate: any): any {
        if (!relatedRecordTemplate) {
            relatedRecordTemplate = {
                title: relatedRecord.title,
                content: [{
                    type: "fields", fieldInfos: relatedRecord.fields.map((field: any) => {
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
        const filteredAttributes = this.filterAttributes(relatedRecord.attributes);
        return {
            layer: layer, attributes: filteredAttributes, popupTemplate: relatedRecordTemplate
        };
    }

    private filterAttributes(attributes: Record<string, any>): Record<string, any> {
        const clonedAttributes = Object.assign({}, attributes);
        const props = this.properties;
        const filterAttributesMode = props.filterAttributesMode;
        const filterAttributesList = props.filterAttributesList;

        // Use allowlist filtering
        if (filterAttributesList.length && filterAttributesMode === "allow") {
            for (const [key] of Object.entries(clonedAttributes)) {
                // delete all attributes that are not included in the filterAttributesList
                if (!filterAttributesList.includes(key)) {
                    delete clonedAttributes[key];
                }
            }
        }

        // Use denylist filtering
        if (filterAttributesList.length && filterAttributesMode === "deny") {
            for (const [key] of Object.entries(clonedAttributes)) {
                // delete all attributes that are included in the filterAttributesList
                if (filterAttributesList.includes(key)) {
                    delete clonedAttributes[key];
                }
            }
        }

        return clonedAttributes;
    }

    private getRelatedRecordsData(sourceLayer: any, objectId: string | number, widget: any): Promise<any[]> {
        let url = sourceLayer.url;
        const layerId = sourceLayer.layerId;
        if (layerId !== undefined) {
            url = url + "/" + layerId;
        }
        widget.set("loading", true);

        const queryController = this.queryController;
        return queryController.getMetadata(url)
            .then((metadata) => queryController.getRelatedMetadata(url, metadata, sourceLayer)
                .then((relatedMetadata) => {
                    const findRelatedResult = queryController.findRelatedRecords(objectId, url, metadata, sourceLayer);
                    if (!findRelatedResult) {
                        widget.set("loading", false);
                        return [];
                    }
                    return findRelatedResult.then((results) => {
                        const relatedRecordsData: any[] = [];
                        if (!results) {
                            widget.set("loading", false);
                            return relatedRecordsData;
                        }
                        results.forEach((result: any, i: number) => {
                            const relatedRecords: any[] = [];
                            const metadata = relatedMetadata[i];
                            const objectIdField = this.objectIdField = this.getObjectIdField(metadata.fields);

                            const relatedRecordGroups = result.relatedRecordGroups;
                            relatedRecordGroups.forEach((relatedRecordGroup: any) => {
                                relatedRecordGroup.relatedRecords.forEach((record: any) => {
                                    const attributes = record.attributes;
                                    relatedRecords.push({
                                        id: metadata.relationshipId + "_" + attributes[objectIdField.name],
                                        title: attributes[metadata.displayField],
                                        attributes: attributes,
                                        fields: metadata.fields.map((field: any) => Field.fromJSON(field))
                                    });
                                });
                            });
                            if (relatedRecords.length) {
                                relatedRecordsData.push({
                                    id: metadata.relationshipId,
                                    title: this.replaceRelationName(metadata.name),
                                    relatedRecords: relatedRecords
                                });

                                if (sourceLayer.popupTemplate?.orderByFields) {
                                    const orderByFields = sourceLayer.popupTemplate.orderByFields;
                                    const matchingOrderByFields = orderByFields[metadata.relationshipId];

                                    if (matchingOrderByFields && matchingOrderByFields.length > 0) {
                                        const lastIndex = relatedRecordsData.length - 1;
                                        const currentRelatedRecords = relatedRecordsData[lastIndex].relatedRecords;
                                        this.sortRelatedRecords(currentRelatedRecords, matchingOrderByFields);
                                    }
                                }
                            }
                        });
                        widget.set("loading", false);
                        return relatedRecordsData;
                    });
                })
            );
    }

    private replaceRelationName(name: string): string {
        const relationNameReplacer = this.properties.relationNameReplacer;
        const replacerObject = relationNameReplacer.find((replacer: any) => replacer.name === name);
        if (replacerObject) {
            return replacerObject.newName;
        } else {
            return name;
        }
    }

    private getObjectIdField(fields: any[]): any {
        return fields.find((field: any) => field.type === "esriFieldTypeOID");
    }

    private getLayerById(layerIdPath: string): __esri.Layer | undefined {
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

        return (layer as any).findSublayerById(parseInt(sublayerId, 10));
    }

    private sortRelatedRecords(relatedRecords: any[], orderByFields: any[]): void {
        relatedRecords.sort((a: any, b: any) => {
            for (const orderByField of orderByFields) {
                const fieldName = orderByField.field || orderByField;
                const order = orderByField.order || 'ASC';

                const aValue = a.attributes[fieldName];
                const bValue = b.attributes[fieldName];

                if ((aValue === null || aValue === undefined) && (bValue === null || bValue === undefined)) continue;
                if (aValue === null || aValue === undefined) return order.toUpperCase() === 'DESC' ? -1 : 1;
                if (bValue === null || bValue === undefined) return order.toUpperCase() === 'DESC' ? 1 : -1;

                let comparison = 0;

                const aIsNumber = !isNaN(Number(aValue)) && !isNaN(parseFloat(aValue));
                const bIsNumber = !isNaN(Number(bValue)) && !isNaN(parseFloat(bValue));

                if (aIsNumber && bIsNumber) {
                    const aNum = parseFloat(aValue);
                    const bNum = parseFloat(bValue);
                    comparison = aNum - bNum;
                } else {
                    const aStr = String(aValue);
                    const bStr = String(bValue);
                    comparison = aStr.localeCompare(bStr, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                }

                if (comparison !== 0) {
                    const result = order.toUpperCase() === 'DESC' ? -comparison : comparison;
                    return result;
                }
            }
            return 0;
        });
    }
}
