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

import PopupWidget from "./template/PopupWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";

import type { InjectedReference } from "apprt-core/InjectedReference";
import type { MessagesReference } from "./nls/bundle";

export class PopupWidgetFactory {
    private vm?: Vue;

    private _i18n: InjectedReference<MessagesReference>;

    getWidget(): Vue {
        const vm = this.vm = new Vue(PopupWidget);
        vm.i18n = this._i18n!.get().ui;

        return VueDijit(vm, { class: "relatedTablesPopup" });
    }
}
