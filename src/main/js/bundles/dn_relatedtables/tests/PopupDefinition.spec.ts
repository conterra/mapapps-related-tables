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

import { assert } from "chai";
import * as sinon from "sinon";
import PopupDefinition from "../PopupDefinition";
import { PopupWidgetFactory } from "../PopupWidgetFactory";
import { QueryController } from "../QueryController";

describe("PopupDefinition", () => {
    let popupDefinition: PopupDefinition;
    let mockPopupWidgetFactory: sinon.SinonStubbedInstance<PopupWidgetFactory>;
    let mockQueryController: sinon.SinonStubbedInstance<QueryController>;
    let mockMapWidgetModel: any;
    let properties: Record<string, any>;

    beforeEach(() => {
        // Create mocks for dependencies
        mockPopupWidgetFactory = sinon.createStubInstance(PopupWidgetFactory);
        mockQueryController = sinon.createStubInstance(QueryController);

        mockMapWidgetModel = {
            map: {
                findLayerById: sinon.stub()
            }
        };

        properties = {
            content: [],
            footerContent: [],
            title: "Test Title",
            filterAttributesMode: "allow",
            filterAttributesList: [],
            relationNameReplacer: []
        };

        popupDefinition = new PopupDefinition(
            mockPopupWidgetFactory,
            mockQueryController,
            mockMapWidgetModel,
            properties
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("Constructor", () => {
        it("should initialize with provided dependencies", () => {
            assert.isDefined(popupDefinition);
        });
    });

    describe("resolvePopupTemplate", () => {
        it("should resolve popup template with valid metadata", async () => {
            const layerOrSublayer = {
                url: "https://example.com/layer",
                popupTemplate: {
                    content: [{ type: "text", text: "Existing content" }],
                    footerContent: [{ type: "text", text: "Footer content" }],
                    title: "Layer Title"
                }
            };

            const mockMetadata = {
                fields: [
                    { name: "OBJECTID", type: "esriFieldTypeOID" },
                    { name: "NAME", type: "esriFieldTypeString" }
                ],
                displayField: "NAME"
            };

            const mockWidget = {
                startup: sinon.stub(),
                getVM: sinon.stub().returns({
                    watch: sinon.stub(),
                    $refs: { featureWidgets: document.createElement('div') }
                }),
                set: sinon.stub(),
                domNode: document.createElement('div')
            };

            mockQueryController.getMetadata.resolves(mockMetadata);
            mockPopupWidgetFactory.getWidget.returns(mockWidget as any);

            const result = await popupDefinition.resolvePopupTemplate(layerOrSublayer);

            assert.isDefined(result);
            assert.equal(result?.title, "Layer Title");
            assert.isArray(result?.content);
            assert.isTrue((result?.content as any[])?.length > 0);
        });

        it("should handle sublayer with layerId", async () => {
            const layerOrSublayer = {
                url: "https://example.com/layer",
                layerId: 1
            };

            const mockMetadata = {
                fields: [
                    { name: "OBJECTID", type: "esriFieldTypeOID" },
                    { name: "NAME", type: "esriFieldTypeString" }
                ],
                displayField: "NAME"
            };

            const mockWidget = {
                startup: sinon.stub(),
                getVM: sinon.stub().returns({
                    watch: sinon.stub(),
                    $refs: { featureWidgets: document.createElement('div') }
                }),
                set: sinon.stub(),
                domNode: document.createElement('div')
            };

            mockQueryController.getMetadata.resolves(mockMetadata);
            mockPopupWidgetFactory.getWidget.returns(mockWidget as any);

            const result = await popupDefinition.resolvePopupTemplate(layerOrSublayer);

            assert.isDefined(result);
            sinon.assert.calledWith(mockQueryController.getMetadata, "https://example.com/layer/1");
        });

        it("should return undefined when metadata has no fields", async () => {
            const layerOrSublayer = {
                url: "https://example.com/layer"
            };

            const mockMetadata = {};

            mockQueryController.getMetadata.resolves(mockMetadata);

            const result = await popupDefinition.resolvePopupTemplate(layerOrSublayer);

            assert.isUndefined(result);
        });

        it("should use properties title when no layer title is provided", async () => {
            const layerOrSublayer = {
                url: "https://example.com/layer"
            };

            const mockMetadata = {
                fields: [
                    { name: "OBJECTID", type: "esriFieldTypeOID" },
                    { name: "NAME", type: "esriFieldTypeString" }
                ],
                displayField: "NAME"
            };

            const mockWidget = {
                startup: sinon.stub(),
                getVM: sinon.stub().returns({
                    watch: sinon.stub(),
                    $refs: { featureWidgets: document.createElement('div') }
                }),
                set: sinon.stub(),
                domNode: document.createElement('div')
            };

            mockQueryController.getMetadata.resolves(mockMetadata);
            mockPopupWidgetFactory.getWidget.returns(mockWidget as any);

            const result = await popupDefinition.resolvePopupTemplate(layerOrSublayer);

            assert.isDefined(result);
            assert.equal(result?.title, "Test Title");
        });
    });

    describe("filterAttributes", () => {
        it("should filter attributes using allowlist mode", () => {
            properties.filterAttributesMode = "allow";
            properties.filterAttributesList = ["field1", "field2"];

            const attributes = {
                field1: "value1",
                field2: "value2",
                field3: "value3",
                field4: "value4"
            };

            // Access private method through type assertion
            const result = (popupDefinition as any).filterAttributes(attributes);

            assert.deepEqual(result, {
                field1: "value1",
                field2: "value2"
            });
            // Ensure original attributes are not modified
            assert.property(attributes, "field3");
        });

        it("should filter attributes using denylist mode", () => {
            properties.filterAttributesMode = "deny";
            properties.filterAttributesList = ["field3", "field4"];

            const attributes = {
                field1: "value1",
                field2: "value2",
                field3: "value3",
                field4: "value4"
            };

            const result = (popupDefinition as any).filterAttributes(attributes);

            assert.deepEqual(result, {
                field1: "value1",
                field2: "value2"
            });
        });

        it("should return all attributes when filterAttributesList is empty", () => {
            properties.filterAttributesMode = "allow";
            properties.filterAttributesList = [];

            const attributes = {
                field1: "value1",
                field2: "value2",
                field3: "value3"
            };

            const result = (popupDefinition as any).filterAttributes(attributes);

            assert.deepEqual(result, attributes);
        });

        it("should handle empty attributes object", () => {
            properties.filterAttributesMode = "allow";
            properties.filterAttributesList = ["field1"];

            const attributes = {};

            const result = (popupDefinition as any).filterAttributes(attributes);

            assert.deepEqual(result, {});
        });
    });

    describe("replaceRelationName", () => {
        it("should replace relation name when replacer is configured", () => {
            properties.relationNameReplacer = [
                { name: "oldName", newName: "New Name" },
                { name: "anotherOld", newName: "Another New" }
            ];

            const result = (popupDefinition as any).replaceRelationName("oldName");

            assert.equal(result, "New Name");
        });

        it("should return original name when no replacer is found", () => {
            properties.relationNameReplacer = [
                { name: "differentName", newName: "Different New" }
            ];

            const result = (popupDefinition as any).replaceRelationName("originalName");

            assert.equal(result, "originalName");
        });

        it("should handle empty relationNameReplacer array", () => {
            properties.relationNameReplacer = [];

            const result = (popupDefinition as any).replaceRelationName("someName");

            assert.equal(result, "someName");
        });
    });

    describe("getObjectIdField", () => {
        it("should find and return the object ID field", () => {
            const fields = [
                { name: "NAME", type: "esriFieldTypeString" },
                { name: "OBJECTID", type: "esriFieldTypeOID" },
                { name: "VALUE", type: "esriFieldTypeInteger" }
            ];

            const result = (popupDefinition as any).getObjectIdField(fields);

            assert.equal(result.name, "OBJECTID");
            assert.equal(result.type, "esriFieldTypeOID");
        });

        it("should return undefined when no object ID field exists", () => {
            const fields = [
                { name: "NAME", type: "esriFieldTypeString" },
                { name: "VALUE", type: "esriFieldTypeInteger" }
            ];

            const result = (popupDefinition as any).getObjectIdField(fields);

            assert.isUndefined(result);
        });

        it("should handle empty fields array", () => {
            const fields: any[] = [];

            const result = (popupDefinition as any).getObjectIdField(fields);

            assert.isUndefined(result);
        });
    });

    describe("getLayerById", () => {
        it("should find layer by ID without sublayer", () => {
            const mockLayer = { id: "testLayer" };
            mockMapWidgetModel.map.findLayerById.returns(mockLayer);

            const result = (popupDefinition as any).getLayerById("testLayer");

            assert.equal(result, mockLayer);
            sinon.assert.calledWith(mockMapWidgetModel.map.findLayerById, "testLayer");
        });

        it("should find sublayer when layerId contains slash", () => {
            const mockSublayer = { id: 1 };
            const mockLayer = {
                id: "testLayer",
                findSublayerById: sinon.stub().returns(mockSublayer)
            };
            mockMapWidgetModel.map.findLayerById.returns(mockLayer);

            const result = (popupDefinition as any).getLayerById("testLayer/1");

            assert.equal(result, mockSublayer);
            sinon.assert.calledWith(mockLayer.findSublayerById, 1);
        });

        it("should return undefined for non-string input", () => {
            const result = (popupDefinition as any).getLayerById(123);

            assert.isUndefined(result);
        });

        it("should return undefined when layer is not found", () => {
            mockMapWidgetModel.map.findLayerById.returns(undefined);

            const result = (popupDefinition as any).getLayerById("nonExistentLayer");

            assert.isUndefined(result);
        });
    });

    describe("sortRelatedRecords", () => {
        it("should sort records by single field ascending", () => {
            const relatedRecords = [
                { attributes: { name: "Charlie", value: 3 } },
                { attributes: { name: "Alice", value: 1 } },
                { attributes: { name: "Bob", value: 2 } }
            ];
            const orderByFields = [{ field: "name", order: "ASC" }];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.name, "Alice");
            assert.equal(relatedRecords[1].attributes.name, "Bob");
            assert.equal(relatedRecords[2].attributes.name, "Charlie");
        });

        it("should sort records by single field descending", () => {
            const relatedRecords = [
                { attributes: { value: 1 } },
                { attributes: { value: 3 } },
                { attributes: { value: 2 } }
            ];
            const orderByFields = [{ field: "value", order: "DESC" }];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.value, 3);
            assert.equal(relatedRecords[1].attributes.value, 2);
            assert.equal(relatedRecords[2].attributes.value, 1);
        });

        it("should handle multiple sort fields", () => {
            const relatedRecords = [
                { attributes: { category: "A", value: 2 } },
                { attributes: { category: "A", value: 1 } },
                { attributes: { category: "B", value: 1 } }
            ];
            const orderByFields = [
                { field: "category", order: "ASC" },
                { field: "value", order: "DESC" }
            ];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.category, "A");
            assert.equal(relatedRecords[0].attributes.value, 2);
            assert.equal(relatedRecords[1].attributes.category, "A");
            assert.equal(relatedRecords[1].attributes.value, 1);
            assert.equal(relatedRecords[2].attributes.category, "B");
        });

        it("should handle null and undefined values", () => {
            const relatedRecords = [
                { attributes: { value: null } },
                { attributes: { value: 2 } },
                { attributes: { value: undefined } },
                { attributes: { value: 1 } }
            ];
            const orderByFields = [{ field: "value", order: "ASC" }];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            // Null/undefined values should be placed at the end for ASC
            assert.equal(relatedRecords[0].attributes.value, 1);
            assert.equal(relatedRecords[1].attributes.value, 2);
        });

        it("should handle numeric strings correctly", () => {
            const relatedRecords = [
                { attributes: { value: "10" } },
                { attributes: { value: "2" } },
                { attributes: { value: "20" } }
            ];
            const orderByFields = [{ field: "value", order: "ASC" }];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.value, "2");
            assert.equal(relatedRecords[1].attributes.value, "10");
            assert.equal(relatedRecords[2].attributes.value, "20");
        });

        it("should handle year strings correctly", () => {
            const relatedRecords = [
                { attributes: { year: "2025" } },
                { attributes: { year: "2024" } },
                { attributes: { year: "2021" } },
                { attributes: { year: "1995" } }
            ];
            const orderByFields = [{ field: "year", order: "ASC" }];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.year, "1995");
            assert.equal(relatedRecords[1].attributes.year, "2021");
            assert.equal(relatedRecords[2].attributes.year, "2024");
            assert.equal(relatedRecords[3].attributes.year, "2025");
        });

        it("should handle year strings in descending order", () => {
            const relatedRecords = [
                { attributes: { year: "2025" } },
                { attributes: { year: "2024" } },
                { attributes: { year: "2021" } },
                { attributes: { year: "1995" } }
            ];
            const orderByFields = [{ field: "year", order: "DESC" }];

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.year, "2025");
            assert.equal(relatedRecords[1].attributes.year, "2024");
            assert.equal(relatedRecords[2].attributes.year, "2021");
            assert.equal(relatedRecords[3].attributes.year, "1995");
        });

        it("should default to ASC when order is not specified", () => {
            const relatedRecords = [
                { attributes: { value: 3 } },
                { attributes: { value: 1 } },
                { attributes: { value: 2 } }
            ];
            const orderByFields = ["value"]; // string format without order

            (popupDefinition as any).sortRelatedRecords(relatedRecords, orderByFields);

            assert.equal(relatedRecords[0].attributes.value, 1);
            assert.equal(relatedRecords[1].attributes.value, 2);
            assert.equal(relatedRecords[2].attributes.value, 3);
        });
    });

    describe("getGraphic", () => {
        it("should create graphic with provided template", () => {
            const relatedRecord = {
                attributes: { id: 1, name: "Test" },
                fields: [
                    { name: "id", type: "esriFieldTypeOID" },
                    { name: "name", type: "esriFieldTypeString" }
                ]
            };

            const relatedRecordTemplate = {
                title: "Custom Title",
                content: [{ type: "text", text: "Custom content" }]
            };

            const result = (popupDefinition as any).getGraphic(relatedRecord, relatedRecordTemplate);

            assert.isDefined(result);
            assert.isDefined(result.layer);
            assert.deepEqual(result.attributes, { id: 1, name: "Test" });
            assert.equal(result.popupTemplate, relatedRecordTemplate);
        });

        it("should create default template when none provided", () => {
            const relatedRecord = {
                title: "Record Title",
                attributes: { id: 1, name: "Test" },
                fields: [
                    { name: "id", type: "esriFieldTypeOID", alias: "ID" },
                    { name: "name", type: "esriFieldTypeString", alias: "Name" }
                ]
            };

            const result = (popupDefinition as any).getGraphic(relatedRecord, null);

            assert.isDefined(result);
            assert.equal(result.popupTemplate.title, "Record Title");
            assert.isArray(result.popupTemplate.content);
            assert.equal(result.popupTemplate.content[0].type, "fields");
        });

        it("should filter attributes when creating graphic", () => {
            properties.filterAttributesMode = "allow";
            properties.filterAttributesList = ["name"];

            const relatedRecord = {
                attributes: { id: 1, name: "Test", extra: "Remove" },
                fields: [
                    { name: "id", type: "esriFieldTypeOID" },
                    { name: "name", type: "esriFieldTypeString" }
                ]
            };

            const relatedRecordTemplate = {
                title: "Test",
                content: []
            };

            const result = (popupDefinition as any).getGraphic(relatedRecord, relatedRecordTemplate);

            assert.deepEqual(result.attributes, { name: "Test" });
            assert.notProperty(result.attributes, "id");
            assert.notProperty(result.attributes, "extra");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle missing displayField gracefully", async () => {
            const layerOrSublayer = {
                url: "https://example.com/layer"
            };

            const mockMetadata = {
                fields: [
                    { name: "OBJECTID", type: "esriFieldTypeOID" }
                ]
                // No displayField
            };

            const mockWidget = {
                startup: sinon.stub(),
                getVM: sinon.stub().returns({
                    watch: sinon.stub(),
                    $refs: { featureWidgets: document.createElement('div') }
                }),
                set: sinon.stub(),
                domNode: document.createElement('div')
            };

            // Create a separate PopupDefinition without properties.title for this test
            const propertiesWithoutTitle = {
                content: [],
                footerContent: [],
                filterAttributesMode: "allow",
                filterAttributesList: [],
                relationNameReplacer: []
            };

            const popupDefinitionWithoutTitle = new PopupDefinition(
                mockPopupWidgetFactory,
                mockQueryController,
                mockMapWidgetModel,
                propertiesWithoutTitle
            );

            mockQueryController.getMetadata.resolves(mockMetadata);
            mockPopupWidgetFactory.getWidget.returns(mockWidget as any);

            const result = await popupDefinitionWithoutTitle.resolvePopupTemplate(layerOrSublayer);

            assert.isDefined(result);
            // Should use placeholder when displayField is undefined and no other title is provided
            assert.equal(result?.title, "{undefined}");
        });

        it("should handle widget creation failure gracefully", async () => {
            const layerOrSublayer = {
                url: "https://example.com/layer"
            };

            const mockMetadata = {
                fields: [
                    { name: "OBJECTID", type: "esriFieldTypeOID" },
                    { name: "NAME", type: "esriFieldTypeString" }
                ],
                displayField: "NAME"
            };

            // Create a separate PopupDefinition without properties.title for this test
            const propertiesWithoutTitle = {
                content: [],
                footerContent: [],
                filterAttributesMode: "allow",
                filterAttributesList: [],
                relationNameReplacer: []
            };

            const popupDefinitionWithoutTitle = new PopupDefinition(
                mockPopupWidgetFactory,
                mockQueryController,
                mockMapWidgetModel,
                propertiesWithoutTitle
            );

            mockQueryController.getMetadata.resolves(mockMetadata);
            mockPopupWidgetFactory.getWidget.throws(new Error("Widget creation failed"));

            // The template should still be created successfully
            const result = await popupDefinitionWithoutTitle.resolvePopupTemplate(layerOrSublayer);

            assert.isDefined(result);
            assert.equal(result?.title, "{NAME}");

            // The error would only occur when the creator function is called
            const customContent = (result?.content as any[])?.[0];
            assert.isDefined(customContent);
            assert.equal(customContent.constructor.name, "CustomContent");

            // Test that the creator function throws the error
            const mockEvent = {
                graphic: {
                    attributes: { OBJECTID: 1, NAME: "Test" },
                    sourceLayer: layerOrSublayer
                }
            };

            try {
                customContent.creator(mockEvent);
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.equal((error as Error).message, "Widget creation failed");
            }
        });
    });
});

