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

import PopupDefinition from "./PopupDefinition";

import type { InjectedReference } from "apprt-core/InjectedReference";
import type { PopupWidgetFactory } from "./PopupWidgetFactory";
import type { QueryController } from "./QueryController";
import type { MapWidgetModel } from "map-widget/MapWidgetModel";

export class PopupDefinitionFactory {
    private _properties: InjectedReference<Record<string, any>>;
    private _popupWidgetFactory: InjectedReference<PopupWidgetFactory>;
    private _queryController: InjectedReference<QueryController>;
    private _mapWidgetModel: InjectedReference<MapWidgetModel>;

    createPopupDefinition(type: string): PopupDefinition {
        if (type !== this._properties!.type) {
            throw new Error(`unsupported type ${type}`);
        }
        return new PopupDefinition(
            this._popupWidgetFactory, this._queryController, this._mapWidgetModel, this._properties
        );
    }

    getTypes(): string[] {
        return [this._properties!.type];
    }
}
