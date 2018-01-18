/*
 * Copyright (C) 2017 con terra GmbH (info@conterra.de)
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
    "dojo/_base/declare", "dojo/DeferredList", "dojo/_base/array", "apprt-request", "ct/array", "ct/_when"
], function (declare, DeferredList, d_array, apprt_request, ct_array, ct_when) {

    return declare([], {

        findRelatedRecords: function (content, mapModelNodeId) {
            var objectid = content.OBJECTID || content.objectid;
            var objectIds = [objectid];

            var url = this.getLayerUrl(mapModelNodeId);
            var layerId = this.getLayerId(mapModelNodeId);
            return ct_when(this.getMetadata(mapModelNodeId), function (metadata) {
                var relationships = this.relationships = metadata.relationships;
                var requests = d_array.map(relationships, function (relationship) {
                    var relatedTableId = relationship && relationship.id;
                    return apprt_request(url + "/" + layerId + "/queryRelatedRecords", {
                        query: {
                            objectIds: objectIds,
                            relationshipId: relatedTableId,
                            outFields: "*",
                            returnGeometry: true,
                            returnCountOnly: false,
                            f: 'json'
                        },
                        handleAs: 'json'
                    });
                });
                return new DeferredList(requests);
            }, this);
        },

        getRelatedMetadata: function (mapModelNodeId) {
            var url = this.getLayerUrl(mapModelNodeId);
            var layerId = this.getLayerId(mapModelNodeId);
            return ct_when(this.getMetadata(mapModelNodeId), function (metadata) {
                var relationships = this.relationships = metadata.relationships;
                var requests = d_array.map(relationships, function (relationship) {
                    var relatedTableId = relationship && relationship.id;
                    return apprt_request(url + "/" + relatedTableId, {
                        query: {
                            f: 'json'
                        },
                        handleAs: 'json'
                    });
                });
                return new DeferredList(requests);
            }, this);
        },

        getLayerId: function (mapModelNodeId) {
            var layer = this._mapModel.getNodeById(mapModelNodeId);
            return layer.layer.layerId;
        },

        getLayerUrl: function (mapModelNodeId) {
            var layer = this._mapModel.getNodeById(mapModelNodeId);
            var service = layer.parent.service;
            return service.serviceUrl;
        },

        getMetadata: function (mapModelNodeId) {
            var url = this.getLayerUrl(mapModelNodeId);
            var layerId = this.getLayerId(mapModelNodeId);

            return apprt_request(url + "/" + layerId, {
                query: {
                    f: 'json'
                },
                handleAs: 'json'
            });
        }
    });
});