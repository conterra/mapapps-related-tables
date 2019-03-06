<template>
    <div class="relatedTablesPopup">
        <v-progress-linear
            v-if="loading"
            :active="loading"
            :indeterminate="true"
            class="pa-0 ma-0"/>
        <v-tabs
            v-model="active"
            slider-color="primary">
            <v-tab ripple>
                {{ i18n.attributes }}
            </v-tab>
            <v-tab
                v-for="relatedRecordsTab in relatedRecordsTabs"
                :key="relatedRecordsTab.id"
                ripple
            >
                {{ relatedRecordsTab.title }}
            </v-tab>
            <v-tab-item>
                <v-data-table
                    :headers="headers"
                    :items="items"
                    hide-actions>
                    <template
                        slot="items"
                        slot-scope="props">
                        <td class>{{ props.item.name }}</td>
                        <td
                            v-if="isUrl(props.item.value)"
                            class
                        >
                            <a
                                :href="props.item.value"
                                target="_blank"
                            >
                                {{ props.item.value }}
                            </a>
                        </td>
                        <td
                            v-else
                            class
                        >
                            {{ props.item.value }}
                        </td>
                    </template>
                </v-data-table>
            </v-tab-item>
            <v-tab-item
                v-for="relatedRecordsTab in relatedRecordsTabs"
                :key="relatedRecordsTab.id">
                <v-tabs
                    v-model="relatedRecordsTab.active">
                    <v-tab
                        v-for="tab in relatedRecordsTab.tabs"
                        :key="tab.id"
                        ripple
                    >
                        {{ tab.title }}
                    </v-tab>
                    <v-tab-item
                        v-for="tab in relatedRecordsTab.tabs"
                        :key="tab.id">
                        <v-card flat>
                            <v-data-table
                                :headers="headers"
                                :items="tab.items"
                                hide-actions>
                                <template
                                    slot="items"
                                    slot-scope="props">
                                    <td class>{{ props.item.name }}</td>
                                    <td
                                        v-if="isUrl(props.item.value)"
                                        class
                                    >
                                        <a
                                            :href="props.item.value"
                                            target="_blank"
                                        >
                                            {{ props.item.value }}
                                        </a>
                                    </td>
                                    <td
                                        v-else
                                        class
                                    >
                                        {{ props.item.value }}
                                    </td>
                                </template>
                            </v-data-table>
                        </v-card>
                    </v-tab-item>
                </v-tabs>
            </v-tab-item>
        </v-tabs>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

    export default {
        mixins: [Bindable],
        data() {
            return {
                title: null,
                loading: true,
                items: [],
                headers: [],
                relatedRecordsTabs: [],
                active: null
            };
        },
        methods: {
            isUrl: function (string) {
                return (
                    new RegExp(
                        "^((?:[a-zA-Z\\d]+:(\\/{2,3})?([\\w-]+(:[^@]+)?@)?[\\w]([\\w-]*[\\w])?(\\.[\\w]([\\w-]*[\\w])?)*)|(?:([\\w-]+(:[^@]+)?@)?[\\w]([\\w-]*[\\w])?(\\.[\\w]([\\w-]*[\\w])?)+))((\\/|\\?|#)[\\w/?#[\\]@:$&'()*+,;=.~!%-]*)?$"
                    )
                ).test(string);
            }
        }
    };
</script>
