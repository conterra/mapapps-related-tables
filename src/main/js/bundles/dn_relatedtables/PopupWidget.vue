<template>
    <v-card class="relatedTablesPopup">
        <v-card-title class="primary title">{{ title }}</v-card-title>
        <v-progress-linear v-if="loading" :active="loading" :indeterminate="true" class="pa-0 ma-0"></v-progress-linear>
        <v-tabs v-model="active" slider-color="primary">
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
                <v-card flat>
                    <v-data-table :headers="headers" :items="items" hide-actions>
                        <template slot="items" slot-scope="props">
                            <td class>{{ props.item.name }}</td>
                            <td class>{{ props.item.value }}</td>
                        </template>
                    </v-data-table>
                </v-card>
            </v-tab-item>
            <v-tab-item v-for="relatedRecordsTab in relatedRecordsTabs" :key="relatedRecordsTab.id">
                <v-card flat>
                    <v-tabs v-model="relatedRecordsTab.active">
                        <v-tab
                            v-for="tab in relatedRecordsTab.tabs"
                            :key="tab.id"
                            ripple
                        >
                            {{ tab.title }}
                        </v-tab>
                        <v-tab-item v-for="tab in relatedRecordsTab.tabs" :key="tab.id">
                            <v-card flat>
                                <v-data-table :headers="headers" :items="tab.items" hide-actions>
                                    <template slot="items" slot-scope="props">
                                        <td class>{{ props.item.name }}</td>
                                        <td class>{{ props.item.value }}</td>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-tab-item>
                    </v-tabs>
                </v-card>
            </v-tab-item>
        </v-tabs>
    </v-card>
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
        }
    };
</script>
