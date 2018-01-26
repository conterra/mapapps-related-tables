/*
 * Copyright (C) 2018 con terra GmbH (info@conterra.de)
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
define([
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/_base/array",

    "dijit/form/Button",

    "contentviewer/_Content",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",
    "ct/store/ComplexMemory",

    "ct/_when",
    "ct/util/css",
    "ct/_lang",
    "ct/ui/desktop/util"
], function (d_lang, declare, d_aspect, domConstruct, d_array,
             Button,
             Content, DataViewModel, DataView, ComplexMemory,
             ct_when, css, ct_lang, ct_util) {

    return declare([], {

        activate: function () {
            var i18n = this._i18n.get();
            var queryController = this._queryController;
            var properties = this._properties;
            var windowManager = this._windowManager;
            d_aspect.before(Content.prototype, "postCreate", d_lang.partial(this.addRelatedRecordsButtons, i18n, queryController, properties, windowManager));
        },

        addRelatedRecordsButtons: function (i18n, queryController, properties, windowManager) {
            var enclosingWidget = ct_util.findEnclosingWindow(this) || this;
            d_aspect.before(enclosingWidget, "resize", d_lang.hitch(this, function (dim) {
                if (dim) {
                    this.dim = dim;
                }
                return arguments;
            }));

            var that = this;

            if (this.context.source !== "maptip") {
                ct_when(queryController.getRelatedMetadata(this.context.mapModelNodeId || this.context.storeProperties.mapModelNodeId), function (metadatas) {
                    ct_when(queryController.findRelatedRecords(this.content, this.context.mapModelNodeId || this.context.storeProperties.mapModelNodeId), function (results) {
                        var container = null;
                        d_array.forEach(results, function (result, index) {
                            var relatedRecordGroups = result[1].relatedRecordGroups;
                            if (relatedRecordGroups && relatedRecordGroups.length > 0 && index === 0) {
                                container = domConstruct.toDom("<div></div>");
                                var headline = domConstruct.toDom("<div>" + i18n.relatedTables + "</div>");
                                domConstruct.place(container, this.centerPane.domNode, "first");
                                domConstruct.place(headline, container, "first");
                            }
                            var results = [];
                            d_array.forEach(relatedRecordGroups, function (relatedRecordGroup) {
                                d_array.forEach(relatedRecordGroup.relatedRecords, function (record) {
                                    results.push(record.attributes);
                                });
                            });

                            var metadata = metadatas[index][1];
                            results = d_array.map(results, function (result) {
                                result = that.dateAndDomainReplacer._replaceDomainValues(result, metadata);
                                return that.dateAndDomainReplacer._replaceDateValues(result, metadata);
                            });
                            var store = new ComplexMemory({
                                idProperty: "OBJECTID",
                                data: results,
                                metadata: {displayField: metadata.displayField, fields: metadata.fields}
                            });

                            var model = new DataViewModel({
                                store: store
                            });

                            var columns = d_array.map(metadata.fields, function (field) {
                                return {
                                    matches: {
                                        name: field.name
                                    },
                                    title: field.alias
                                }
                            });

                            var dataView = new DataView({
                                showFilter: true,
                                filterDuringKeyUp: true,
                                showPager: true,
                                showViewButtons: false,
                                itemsPerPage: 25,
                                DGRID: {
                                    noDataMessage: "-",
                                    checkboxSelection: false,
                                    columns: columns
                                }
                            });

                            dataView.startup();
                            dataView.set("model", model);

                            var loadButton = new Button({
                                label: metadata.name,
                                class: "showLoadingBtn",
                                onClick: function () {
                                    var windowProperties = {
                                        content: dataView,
                                        title: metadata.name,
                                        marginBox: {
                                            "w": "50%",
                                            "h": "50%"
                                        },
                                        maximizable: true,
                                        closable: true,
                                        draggable: true,
                                        minimizeOnClose: true
                                    };
                                    windowManager.createWindow(windowProperties).show();
                                }
                            });
                            if (container) {
                                loadButton.placeAt(container, "last");
                            }
                            enclosingWidget.resize(this.dim);
                        }, this);
                    }, this);
                }, this)
            }
        }
    });
});