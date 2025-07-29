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

/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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

import { assert } from "chai";
import { QueryController } from "../QueryController";

class TestFactory {
    static createQueryController() {
        return new QueryController();
    }

    static createMockMetadata(options: {
        relationships?: any[];
    } = {}) {
        return {
            relationships: options.relationships || []
        };
    }

    static createMockSourceLayer(options: {
        displayedRelationships?: number[];
    } = {}) {
        return {
            popupTemplate: {
                displayedRelationships: options.displayedRelationships
            }
        };
    }

    static createMockRelationship(id: number, name: string) {
        return {
            id,
            name,
            relatedTableId: id + 10
        };
    }
}

describe("QueryController", () => {

    let queryController: QueryController;

    beforeEach(() => {
        queryController = TestFactory.createQueryController();
    });

    describe("Core Functionality", () => {

        it("should create a query controller instance", () => {
            assert.isNotNull(queryController);
            assert.isFunction(queryController.findRelatedRecords);
        });

        it("should return null when no relationships exist", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: []
            });

            const result = queryController.findRelatedRecords(
                123,
                "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                metadata
            );

            assert.isNull(result);
        });

        it("should store relationships for processing", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: [
                    TestFactory.createMockRelationship(1, "Relationship1"),
                    TestFactory.createMockRelationship(2, "Relationship2")
                ]
            });

            // This will trigger the processing but the actual request will fail in test environment
            // We're testing the relationship filtering logic
            try {
                queryController.findRelatedRecords(
                    123,
                    "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                    metadata
                );
            } catch (_e) {
                // Expected to fail in test environment without proper network setup
            }

            const relationships = (queryController as any).relationships;
            assert.equal(relationships.length, 2);
            assert.equal(relationships[0].id, 1);
            assert.equal(relationships[1].id, 2);
        });
    });

    describe("Relationship Filtering", () => {

        it("should filter relationships based on popup template configuration", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: [
                    TestFactory.createMockRelationship(1, "Relationship1"),
                    TestFactory.createMockRelationship(2, "Relationship2"),
                    TestFactory.createMockRelationship(3, "Relationship3")
                ]
            });

            const sourceLayer = TestFactory.createMockSourceLayer({
                displayedRelationships: [1, 3]
            });

            try {
                queryController.findRelatedRecords(
                    123,
                    "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                    metadata,
                    sourceLayer as any
                );
            } catch (_e) {
                // Expected to fail in test environment
            }

            // Verify that only displayed relationships are stored
            const relationships = (queryController as any).relationships;
            assert.equal(relationships.length, 2);
            assert.equal(relationships[0].id, 1);
            assert.equal(relationships[1].id, 3);
        });

        it("should use all relationships when no filter is configured", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: [
                    TestFactory.createMockRelationship(1, "Relationship1"),
                    TestFactory.createMockRelationship(2, "Relationship2")
                ]
            });

            try {
                queryController.findRelatedRecords(
                    123,
                    "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                    metadata
                );
            } catch (_e) {
                // Expected to fail in test environment
            }

            const relationships = (queryController as any).relationships;
            assert.equal(relationships.length, 2);
        });

        it("should handle source layer without popup template", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: [
                    TestFactory.createMockRelationship(1, "Relationship1")
                ]
            });

            const sourceLayer = {
                // No popupTemplate property
            };

            try {
                queryController.findRelatedRecords(
                    123,
                    "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                    metadata,
                    sourceLayer as any
                );
            } catch (_e) {
                // Expected to fail in test environment
            }

            const relationships = (queryController as any).relationships;
            assert.equal(relationships.length, 1);
        });

        it("should handle popup template without displayedRelationships", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: [
                    TestFactory.createMockRelationship(1, "Relationship1"),
                    TestFactory.createMockRelationship(2, "Relationship2")
                ]
            });

            const sourceLayer = {
                popupTemplate: {
                    // No displayedRelationships property
                }
            };

            try {
                queryController.findRelatedRecords(
                    123,
                    "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                    metadata,
                    sourceLayer as any
                );
            } catch (_e) {
                // Expected to fail in test environment
            }

            const relationships = (queryController as any).relationships;
            assert.equal(relationships.length, 2);
        });
    });

    describe("Error Handling", () => {

        it("should handle empty object ID gracefully", () => {
            const metadata = TestFactory.createMockMetadata({
                relationships: [
                    TestFactory.createMockRelationship(1, "TestRelationship")
                ]
            });

            // Should still return a promise even with invalid object ID
            const result1 = queryController.findRelatedRecords(
                null as any,
                "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                metadata
            );

            const result2 = queryController.findRelatedRecords(
                undefined as any,
                "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                metadata
            );

            // Both should return a result (Promise) even with invalid input
            assert.isNotNull(result1);
            assert.isNotNull(result2);
        });

        it("should handle metadata without relationships property", () => {
            const metadata = {} as any; // Missing relationships property

            const result = queryController.findRelatedRecords(
                123,
                "https://example.com/arcgis/rest/services/TestService/MapServer/0",
                metadata
            );

            // Should return null when relationships are not defined
            assert.isNull(result);
        });
    });
});
