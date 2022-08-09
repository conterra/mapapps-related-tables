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
const TYPE = "related-tables-popup";
import PopupDefinition from "./PopupDefinition";

export default class PopupDefinitionFactory {

    createPopupDefinition(type) {
        if (type !== TYPE) {
            throw new Error(`unsupported type ${type}`);
        }
        const properties = this._properties;
        this._popupWidgetFactory.enableFiltering = properties.enableFiltering;
        this._popupWidgetFactory.filterModeIsAllowlist = properties.filterModeIsAllowlist;
        this._popupWidgetFactory.filterList = properties.filterList;
        return new PopupDefinition(this._popupWidgetFactory, this._queryController, this._properties);
    }

    getTypes() {
        return [TYPE];
    }
}
