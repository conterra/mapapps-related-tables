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
import { PopupDefinitionFactory } from "../PopupDefinitionFactory";
import PopupDefinition from "../PopupDefinition";
import { PopupWidgetFactory } from "../PopupWidgetFactory";
import { QueryController } from "../QueryController";

class TestFactory {
    static createPopupDefinitionFactory(properties: any = {}) {
        const factory = new PopupDefinitionFactory();

        const defaultProperties = {
            type: "related-tables-popup",
            relationNameReplacer: [],
            filterAttributesMode: "deny",
            filterAttributesList: [],
            ...properties
        };

        const mockPopupWidgetFactory = new PopupWidgetFactory();
        const mockQueryController = new QueryController();
        const mockMapWidgetModel = {} as any;

        // Use type assertion to bypass private property restrictions for testing
        (factory as any)._properties = defaultProperties;
        (factory as any)._popupWidgetFactory = mockPopupWidgetFactory;
        (factory as any)._queryController = mockQueryController;
        (factory as any)._mapWidgetModel = mockMapWidgetModel;

        return factory;
    }
}

describe("PopupDefinitionFactory", () => {

    describe("Core Functionality", () => {

        it("should create popup definition for supported type", () => {
            const factory = TestFactory.createPopupDefinitionFactory();

            const definition = factory.createPopupDefinition("related-tables-popup");

            assert.instanceOf(definition, PopupDefinition);
        });

        it("should return correct supported types", () => {
            const factory = TestFactory.createPopupDefinitionFactory({
                type: "custom-popup-type"
            });

            const types = factory.getTypes();

            assert.deepEqual(types, ["custom-popup-type"]);
        });

        it("should inject all required dependencies into popup definition", () => {
            const factory = TestFactory.createPopupDefinitionFactory();

            const definition = factory.createPopupDefinition("related-tables-popup");

            // Verify dependencies are properly injected
            assert.isNotNull((definition as any).popupWidgetFactory);
            assert.isNotNull((definition as any).queryController);
            assert.isNotNull((definition as any).mapWidgetModel);
            assert.isNotNull((definition as any).properties);
        });
    });

    describe("Error Handling", () => {

        it("should throw error for unsupported popup type", () => {
            const factory = TestFactory.createPopupDefinitionFactory({
                type: "supported-type"
            });

            assert.throws(() => {
                factory.createPopupDefinition("unsupported-type");
            }, "unsupported type unsupported-type");
        });

        it("should handle missing properties gracefully", () => {
            const factory = new PopupDefinitionFactory();
            // Don't inject properties to simulate missing dependency

            assert.throws(() => {
                factory.createPopupDefinition("any-type");
            });
        });
    });

    describe("Configuration Scenarios", () => {

        it("should handle different relation name replacer configurations", () => {
            const relationNameReplacer = [
                { find: "old_name", replace: "New Name" },
                { find: "another_old", replace: "Another New" }
            ];

            const factory = TestFactory.createPopupDefinitionFactory({
                relationNameReplacer
            });

            const definition = factory.createPopupDefinition("related-tables-popup");

            assert.deepEqual((definition as any).properties.relationNameReplacer, relationNameReplacer);
        });

        it("should handle different filter modes", () => {
            const factory = TestFactory.createPopupDefinitionFactory({
                filterAttributesMode: "allow",
                filterAttributesList: ["field1", "field2"]
            });

            const definition = factory.createPopupDefinition("related-tables-popup");

            assert.equal((definition as any).properties.filterAttributesMode, "allow");
            assert.deepEqual((definition as any).properties.filterAttributesList, ["field1", "field2"]);
        });
    });
});
