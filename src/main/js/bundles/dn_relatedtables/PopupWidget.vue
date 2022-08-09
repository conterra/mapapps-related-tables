<!--

    Copyright (C) 2022 con terra GmbH (info@conterra.de)

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
        <div class="relatedTablesTitle subheading mb-2">
            {{ i18n.relatedRecords }}
        </div>
        <v-progress-linear
            v-if="loading"
            :indeterminate="true"
        />
        <v-divider />
        <v-autocomplete
            v-if="relatedRecordsData.length > 1"
            v-model="selectedRelatedRecordsData"
            :items="relatedRecordsData"
            :label="i18n.relation"
            :menu-props="{ contentClass: 'relatedTableMenu' }"
            return-object
            hide-details
            dense
            item-text="title"
            class="my-2"
        />
<!--        <v-autocomplete-->
<!--            v-model="selectedRelatedRecordsData.active"-->
<!--            :items="selectedRelatedRecordsData.relatedRecords"-->
<!--            :label="i18n.relatedRecord"-->
<!--            :menu-props="{ contentClass: 'relatedTableMenu' }"-->
<!--            return-object-->
<!--            hide-details-->
<!--            dense-->
<!--            item-text="title"-->
<!--            class="my-2"-->
<!--            @change="$emit('related-record-changed', $event)"-->
<!--        />-->
<!--        <div ref="featureWidget" />-->
        <v-data-table
            :headers="fields"
            :items="features"
            header-text="alias"
            header-key="name"
            hide-actions
        >
            <template v-slot:items="props">
                <td v-for="field in fields" :key="field.name">{{ props.item[field.name] }}</td>
            </template>
        </v-data-table>
    </v-container>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import moment from "moment";

    export default {
        mixins: [Bindable],
        data() {
            return {
                loading: true,
                selectedRelatedRecordsData: {
                    active: null,
                    relatedRecords: []
                },
                relatedRecordsData: [],
                enableFiltering: false,
                filterModeIsAllowlist: false,
                filterList: []
            };
        },
        computed: {
            fields() {
                const result = [];
                const relatedRecords = this.selectedRelatedRecordsData?.relatedRecords;
                if (relatedRecords.length) {
                    const fields = relatedRecords[0].fields;
                    fields.forEach(field => {
                        if (this.enableFiltering && this.filterModeIsAllowlist) {
                            if (this.filterList.includes(field.name)) {
                                result.push(field);
                            }
                        } else if (this.enableFiltering && !this.filterModeIsAllowlist) {
                            if (!this.filterList.includes(field.name)) {
                                result.push(field);
                            }
                        } else {
                            result.push(field);
                        }
                    });
                }
                return result;
            },
            features() {
                const result = [];
                const relatedRecords = this.selectedRelatedRecordsData?.relatedRecords;
                if (relatedRecords.length) {
                    relatedRecords.forEach(relatedRecords => {
                        const attributes =  this.lookupFieldNamesToAttributes(this.fields, relatedRecords.attributes);
                        result.push(attributes);
                    });
                }
                return result;
            }
        },
        methods: {
            isUrl: function (string) {
                return (
                    new RegExp(
                        "^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$"
                    )
                ).test(string);
            },
            lookupFieldNamesToAttributes(fields, attributes) {
                const clonedAttributes = Object.assign({}, attributes);
                for (const [key, value] of Object.entries(clonedAttributes)) {
                    const field = fields.find((f) => f.name === key);
                    if (field && field.domain && field.domain.codedValues) {
                        const codedValues = field.domain.codedValues;
                        clonedAttributes[key] = this.getCodedValue(value, codedValues);
                    }
                    if (field && field.type === "date") {
                        clonedAttributes[key] = this.getDate(value);
                    }
                }
                return clonedAttributes;
            },
            getCodedValue(value, codedValues) {
                const v = codedValues.find((codedValue) => value === codedValue.code);
                if (v) {
                    return v.name;
                } else {
                    return value;
                }
            },
            getDate(value) {
                const date = moment(value);
                return date.format('dddd, Do MMMM YYYY HH:mm');
            }
        }
    };
</script>
