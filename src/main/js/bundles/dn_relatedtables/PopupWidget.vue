<!--

    Copyright (C) 2020 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-container pa-0>
        <span class="relatedTablesTitle">{{ i18n.relatedRecords }}</span>
        <v-progress-linear
            v-if="loading"
            :indeterminate="true"
            class="pa-0 ma-0"
        />
        <v-autocomplete
            v-model="selectedRelatedRecordsData"
            :items="relatedRecordsData"
            :label="i18n.relation"
            :menu-props="{ contentClass: 'relatedTableMenu' }"
            class="mt-3 pb-2 pt-0"
            return-object
            hide-details
            flat
            item-text="title"
        />
        <v-autocomplete
            v-model="selectedRelatedRecordsData.active"
            :items="selectedRelatedRecordsData.relatedRecords"
            :label="i18n.relatedRecord"
            :menu-props="{ contentClass: 'relatedTableMenu' }"
            class="mt-3 pb-2 pt-0"
            return-object
            hide-details
            flat
            item-text="title"
            @change="$emit('related-record-changed', $event)"
        />
        <div ref="featureWidget" />
    </v-container>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

    export default {
        mixins: [Bindable],
        data() {
            return {
                loading: true,
                selectedRelatedRecordsData: {
                    active: null,
                    relatedRecords: []
                },
                relatedRecordsData: []
            };
        },
        computed: {
        }
    };
</script>
