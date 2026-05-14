//panel.map.originMarkerEdit: Lưu shape gốc khi edit. Ẩn đi khi bắt đầu edit và hiện khi edit bị hủy. Tránh trường hợp dang edit click lên đối tượng gốc sinh ra lỗi
Ext.define('Public.controller.PublicMap', {
    extend: 'Ext.app.Controller',

    views: ['PublicMap'],

    init: function () {
        this.control
            ({
                'publicmap':
                {
                    afterrender: this.onAfterRender,
                    bindData: this.bindData,
                    clearMap: this.clearAllMarker,
                    appendTrackingTab: function (mapPanel, trackingType) {
                        var me = this;
                        switch (trackingType) {
                            case 'cameraTracking':
                                me.appendTrackingTab(mapPanel, trackingType, 300, 'Danh sách camera theo dõi', function (prefix, data, videoMode) {
                                    return HTDP.Public.Global.buildCamInfo(prefix, data, videoMode, 300, 230);
                                }, function (id, interval) {
                                    return HTDP.Public.Global.buildCamInterval(id, interval);
                                }, function (prefix, id) {
                                    return HTDP.Public.Global.buildVideoStreamRun(prefix, id);
                                });
                                break;
                            case 'trafficTracking':
                                me.appendTrackingTab(mapPanel, trackingType, 170, 'Kẹt xe', function (prefix, data, videoMode) {
                                    return HTDP.Public.Global.buildBienBaoInfo(prefix, data, videoMode, 300, 110);
                                }, null, null, false, {
                                        canExpand: false,
                                        canTracking: false
                                    });
                                break;
                        }
                    },
                    removeTrackingTab: function (mapPanel) {
                        var tabPanel = mapPanel.down('tabpanel');
                        if (tabPanel) {
                            if (tabPanel.items.length === 0) {
                                tabPanel.close();
                            }
                        }
                    }
                }
            });
    },

    onAfterRender: function (panel) {
        var me = this;
        panel.map = me.initMap(panel);

        panel.map.setLogo('./images/poweredby.png');
        $("[src*='poweredby.png']").prop("width", "50");
        $("[src*='poweredby.png']").prop("height", "50");

        //Read cookies
        var name = 'HTDP_colorSettings' + "=";
        var ca = document.cookie.split(';');
        var cookie = null;
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) {
                cookie = c.substring(name.length, c.length);
                break;
            }
        }

        if (cookie) {
            panel.colorSettings = JSON.parse(cookie);
        }
        else {
            panel.colorSettings = {
                normal: {
                    FillColor: '#F5EA0D',
                    FillOpacity: 0.7,
                    StrokeColor: '#EB9F00',
                    StrokeOpacity: 0.7,
                    StrokeWidth: 5,
                    LineStyle: 1,
                    ModeRender: false
                },
                edit: {
                    FillColor: '#F5EA0D',
                    FillOpacity: 0.7,
                    StrokeColor: '#F90A0F',
                    StrokeOpacity: 0.7,
                    StrokeWidth: 5,
                    LineStyle: 1
                }
            }
        }


        //moLayer=true: Vẽ bằng layer
        panel.modeLayer = panel.colorSettings.normal.ModeRender;

        if (panel.map) {
            //Init context menu
            panel.ctxMenu = new ContextMenu(panel.map, 200);
            panel.openContextMenu = function (ptViewMnu, arrMnuItem, ptRealFn) {
                panel.closeContextMenu();
                panel.ctxMenu.open(ptViewMnu, arrMnuItem, ptRealFn);
            };
            panel.closeContextMenu = function () {
                panel.ctxMenu.close();
            };

            vietbando.event.addListener(panel.map, 'click', function (params) {
                panel.closeContextMenu();
                panel.map.menuIsOpen = false;
                if (params.overlay) {
                    var obj = params.overlay;
                    var latlng = obj.getCenter();
                    var map = panel.map;
                    if (map.infoWindow) {
                        map.infoWindow.close();
                    }
                    var contentBuilder = function (params) {
                        var builder = [];
                        builder.push('<table style="width:400px">');
                        builder.push('<tr><th colspan="2"><span style="text-align: left; color:darkred; font-weight: bold; display: block; padding: 5px; font-size: 14px;">Thông tin</span></th></tr>');
                        for (var j = 0; j < params.length; j++) {
                            builder.push('<tr>');
                            builder.push('<td style="width:140px"><b>' + (params[j].Title ? params[j].Title : '') + '</b></td>');
                            builder.push('<td>' + (params[j].Value ? params[j].Value : 'Không có dữ liệu') + '</td>');
                            builder.push('</tr>');
                        }
                        builder.push('</table>');
                        return builder.join('');
                    }

                    if (obj.getOptions() && obj.getOptions().description) {
                        var content = contentBuilder([{
                            Title: 'Mô tả',
                            Value: obj.getOptions().description
                        }]);
                        map.infoWindow = new vbd.InfoWindow({
                            content: content,
                            position: params.LatLng
                        });
                        map.infoWindow.open(map);
                    }
                }

            });

            vietbando.event.addListener(panel.map, 'drag', function (params) {
                panel.closeContextMenu();
            });

            panel.detailWindow = Ext.create('Ext.window.Window', {
                border: false,
                closable: true,
                preventBorder: true,
                constrain: true,
                renderTo: panel.id,
                width: 350,
                maxHeight: 600,
                autoHeight: true,
                frame: false,
                layout: 'fit',
                title: _t('Thông tin chi tiết'),
                style: 'opacity:0.95;',
                closeAction: 'hide',
                isDirty: false,

                resizable: true,
                collapsible: true,
                titleCollapse: true,
                collapseMode: 'header',
                collapseDirection: 'top',
                animCollapse: true,
                collapseToolText: _t('Thu gọn cửa sổ'),
                expandToolText: _t('Mở rộng cửa sổ'),
                closeToolText: _t('Đóng cửa sổ'),
                items: [
                    {
                        xtype: 'propertygrid',
                        border: false,
                        width: 300,
                        autoScroll: true,
                        source: { Description: true },
                        hideHeaders: true,
                        listeners:
                        {
                            'beforeedit':
                            {
                                fn: function () {
                                    return false;
                                }
                            }
                        }
                    }]
            });
        }

        panel.fireEvent('aftermaprender', panel);
    },
    clearAllMarker: function (panel) {
        if (panel && panel.map) {
            var view = panel.up('managegrid');

            view.down('#btnDone').setVisible(false);
            view.down('#btnCancel').setVisible(false);

            Ext.Array.each(panel.map.hoverMarker, function (marker) {
                if (marker) {
                    marker.setMap(null);
                }
            });

            if (panel.map.selectedMarker) {
                panel.map.selectedMarker.setMap(null);
                panel.map.selectedMarker = null;
            }

            if (panel.map.hoverMarker) {
                Ext.Array.each(panel.map.hoverMarker, function (marker) {
                    if (marker) {
                        marker.setMap(null);
                    }
                });
                panel.map.hoverMarker = [];
            }

        }
    },
    initMap: function (panel) {
        var me = this;
        if (panel && vietbando) {
            var renderPanel = panel.down('#mapRenderPanel');

            var mapId = 'map-' + renderPanel.id;
            renderPanel.update('<div id="' + mapId + '" style="width: 100%;height: 100%;position: absolute;"></div>');

            var trafficHtml = '<div class="widget-layer-traffic">';
            trafficHtml += '	<ul class="">';
            trafficHtml += '		<span>Nhanh</span>';
            trafficHtml += '		<li class="layer-1 layer-traffic tooltip-viewport-top" title=" >10km/h "></li>';
            trafficHtml += '		<li class="layer-2 layer-traffic tooltip-viewport-top" data-toggle="tooltip" title=" <5 - < 10 km/h (15 phút) "></li>';
            trafficHtml += '		<li class="layer-3 layer-traffic tooltip-viewport-top" data-toggle="tooltip" title=" <5 km/h (15 phút) "></li>';
            trafficHtml += '		<li class="layer-4 layer-traffic tooltip-viewport-top" data-toggle="tooltip" title=" <5 km/h (30 phút) "></li>';
            trafficHtml += '		<span>Chậm</span>';
            trafficHtml += '	</ul>		';
            trafficHtml += '</div>';
            $('#' + mapId).append(trafficHtml);

            $('.tooltip-viewport-top').tooltip({ placement: 'top' });

            panel.on('resize', function () {
                if (panel.map) {
                    panel.map.resize();
                    if (!panel.map.firstResize) {
                        panel.map.firstResize = true;
                        //panel.map.zoomFit();
                        map.setZoom(14);
                        map.setCenter(new vbd.LatLng(10.774963999124353, 106.6933822631836));
                    }

                    var zoomControl = panel.map.getZoomControl();
                    zoomControl.setPosition(vbd.ControlPosition.TOP_RIGHT);
                    zoomControl.setOffset(new vbd.Size(panel.getWidth() - 50, 15));
                }
            });

            if (vietbando) {
                vietbando.srcImg = '/CDN/API/ApiNew/images/';
            }

            /*Init base layer*/
            var baseLayer = new vietbando.Layer(
                {
                    url: VDMS_DATA.MapURL.DEFAULT, format: function (agrs) {
                        //agrs=0:url,1:x,2:y,3:z
                        return agrs[0].replace('{z}', agrs[3]).replace('{x}', agrs[1]).replace('{y}', agrs[2]);
                    }
                });

            baseLayer.name = 'BaseLayer';

            /*Init map*/
            var mapProp = {
                minZoom: 2,
                maxZoom: 19,
                layer: baseLayer

            };
            var map = new vbd.Map(document.getElementById(mapId), mapProp);

            var zoomControl = map.getZoomControl();
            zoomControl.setPosition(vbd.ControlPosition.TOP_RIGHT);
            zoomControl.setOffset(new vbd.Size(panel.getWidth() - 50, 15));
            //// btnStreetView
            //var div = '<div class="button-street-view map-button-right map-button-first" ><i class="fa fa-street-view"></i></div>';
            //renderPanel.getEl().dom.appendChild($(div)[0]);

            //$('.button-street-view').click(function ()
            //{
            //    window.open(Document.Global.getApplicationRoot() + 'Main/streetview.aspx', '_blank');
            //});

            // btnUserLocation
            var div = '<div class="button-user-location map-button-right map-button-first" ><i class="fa fa-location-arrow"></i></div>';
            renderPanel.getEl().dom.appendChild($(div)[0]);

            $('.button-user-location').click(function () {
                HTDP.Utils.getUserLocation(function (position) {
                    if (position) {
                        var geoJson = '{ "type": "Point", "coordinates": [' + position.coords.longitude + ' ,' + position.coords.latitude + '] }';
                        var marker = map.createMarkerFrom(geoJson,
                            {
                                width: 11,
                                height: 11,
                                offsetX: 5,
                                offsetY: 11
                            });
                        marker.setMap(map);
                        map.panTo(marker.getPosition());
                        panel.userMarker = marker;
                        vbd.event.addListener(marker, 'rightclick', function (m) {
                            if (panel.map.searchInfoWindow) {
                                panel.map.searchInfoWindow.close();
                            }
                            //panel.map.searchMarker.setMap(null);

                            //panel.ctxMenu.open(containerpanel.map.searchMarker.getPoint(), arr, container.map.searchMarker.getPosition());
                            var arrCMItem = new Array();
                            arrCMItem.push(
                                [
                                    'cmfromhere',
                                    _t('Từ điểm này'),
                                    '',
                                    function (pt) {
                                        if (panel.map.addSearchFromPlace) panel.map.addSearchFromPlace(pt, { Title: '' });
                                        panel.closeContextMenu();
                                    }
                                ]);

                            arrCMItem.push(
                                [
                                    'cmtohere',
                                    _t('Đến điểm này'),
                                    '',
                                    function (pt) {
                                        if (panel.map.addSearchToPlace) panel.map.addSearchToPlace(pt,
                                            { Title: '' });
                                        panel.closeContextMenu();
                                    }
                                ]
                            );

                            arrCMItem.push(
                                [
                                    'cmdelete',
                                    _t('Xoá điểm này'),
                                    '',
                                    function (pt) {
                                        panel.userMarker.setMap(null);
                                        panel.closeContextMenu();
                                    }
                                ]);

                            panel.openContextMenu(m.Point, arrCMItem, panel.userMarker.getPosition());
                        });
                    }
                });
            });
            map.hoverMarker = [];
            map.layers = {
            };
            map.layers.baseLayers = [baseLayer];
            map.layers.overlayLayers = [];

            //overlay
            map.Overlay = new vietbando.Layer({
                url: Document.Global.getApplicationRoot() + VDMS_DATA.MapURL.OVERLAYBASE, format: function (agrs) {
                    var baseUrl = agrs[0];
                    var x = agrs[1];
                    var y = agrs[2];
                    var z = agrs[3];

                    var url = baseUrl.replace('{z}', z).replace('{x}', x).replace('{y}', y);
                    var layers = "",
                        strokes = "",
                        fills = "",
                        props = "";

                    for (var i = 0; i < map.layers.overlayLayers.length; i++) {
                        layers += map.layers.overlayLayers[i].Name + '|';
                        strokes += map.layers.overlayLayers[i].StrokeColors + '|';
                        fills += map.layers.overlayLayers[i].FillColors + '|';
                        props += map.layers.overlayLayers[i].GeoFields + '|';
                    }

                    if (layers) url += '&Layers=' + layers;
                    if (strokes) url += '&Strokes=' + strokes;
                    if (fills) url += '&Fills=' + fills;
                    if (props) url += '&Props=' + props;

                    url += '&t=' + new Date().getTime();

                    return url;
                }
            });

            map.Overlay.name = 'OverlayLayer';
            map.Overlay.map = map;
            map.Overlay.setMap(map);
            map.layers.baseLayers.push(map.Overlay);

            //Single Overlay Layer for each layer
            if (!map.layers.singleOverlay) map.layers.singleOverlay = [];
            if (!map.layers.multiOverlay) map.layers.multiOverlay = [];

            //Phong: Thêm trường hợp type là share_overlay hoặc share_mapnik
            map.addSingleOverlayLayer = function (layer, mymap, autoRefreshFunc, renderFunction) {
                if (!layer.MapUrl)
                    return;
                var singleLayer = new vietbando.Layer({
                    url: layer.MapUrl, format: renderFunction ? renderFunction : function (agrs) {
                        var baseUrl = agrs[0];
                        var x = agrs[1];
                        var y = agrs[2];
                        var z = agrs[3];

                        var url = baseUrl.replace('{z}', z).replace('{x}', x).replace('{y}', y);
                        var server = layer.Server;
                        var maps = layer.MapName;
                        url = url + '&server=' + server;
                        url = url + '&maps=' + maps;
                        url = url + "&t=" + new Date().getTime();

                        return url;
                    }
                });
                var singleLayerName = 'SINGLEOVERLAY_' + (layer.MapName || layer.LayerName);
                singleLayer.Name = singleLayerName;
                for (var j = 0; j < Object.keys(layer).length; j++)
                {
                    if (Object.keys(layer)[j] === 'Name') continue;
                    singleLayer[Object.keys(layer)[j]] = layer[Object.keys(layer)[j]];
                }
                singleLayer.name = singleLayerName;
                singleLayer.map = mymap;
                singleLayer.setMap(mymap);
                var isExist = mymap.layers.singleOverlay.findIndex(s => s.Name === singleLayerName);
                //Check if exists     

                if (layer.Content && typeof (layer.Content) == 'string') {
                    singleLayer.Content = Ext.decode(layer.Content);

                    if (singleLayer.Content && singleLayer.Content.Config) {
                        singleLayer.Content = singleLayer.Content.Config;
                    }

                    if (Ext.isArray(singleLayer.Content)) {
                        singleLayer.Content = singleLayer.Content[0];
                    }
                }

                if (singleLayer.AutoRefresh || (singleLayer.Content && singleLayer.Content.AutoRefresh)) {
                    var layerTimeout = 5000;

                    if (singleLayer.TimeoutRefresh || (singleLayer.Content && singleLayer.Content.TimeoutRefresh)) {
                        layerTimeout = singleLayer.TimeoutRefresh || singleLayer.Content.TimeoutRefresh;
                    }

                    if (autoRefreshFunc)
                        singleLayer.autoRefreshFunc = autoRefreshFunc;

                    var refreshOverlay = function (mySingleLayer, interval) {
                        clearTimeout(mySingleLayer.timeout);

                        mySingleLayer.timeout = setTimeout(function () {
                            mymap.refreshLayerByName(mySingleLayer);
                            if (mySingleLayer.autoRefreshFunc) mySingleLayer.autoRefreshFunc();

                            refreshOverlay(mySingleLayer, interval);
                        }, interval);
                    }

                    refreshOverlay(singleLayer, layerTimeout);
                } else {
                    mymap.refreshLayerByName(singleLayer);
                }
                if (isExist < 0) {
                    //push if new
                    mymap.layers.singleOverlay.push(singleLayer);
                }
                else {
                    mymap.layers.singleOverlay[isExist] = singleLayer;
                }

            };

            map.removeSingleOverlayLayer = function (layer) {
                for (var i = 0; i < map.layers.singleOverlay.length; i++) {
                    var name = 'SINGLEOVERLAY_' + (layer.MapName || layer.LayerName);
                    if (map.layers.singleOverlay[i].Name === name) {
                        if (map.layers.singleOverlay[i].timeout) {
                            clearTimeout(map.layers.singleOverlay[i].timeout);
                        }
                        map.layers.singleOverlay[i].setMap(null);
                        map.layers.singleOverlay.splice(i, 1);
                    }
                }
            };

            map.addGroupOverlayLayer = function (layer, _map, autoRefreshFunc) {
                var buildOverlay = function (data) {
                    for (var i = 0; i < map.layers.multiOverlay.length; i++) {
                        if (map.layers.multiOverlay[i].Name == data.MapName) {
                            map.layers.multiOverlay[i] = {
                                Name: data.MapName,
                                LayerName: data.LayerName,
                                ViewProperties: layer.ViewProperties ? layer.ViewProperties : [
                                    { "DisplayName": "Dữ liệu", "ColumnName": "Title" }
                                ]
                            };

                            if (!map.manualRefresh) {
                                map.refreshLayerByName(map.MapnikOverlay);
                            }

                            return;
                        }
                    }

                    map.layers.multiOverlay.push(
                        {
                            Name: layer.MapName,
                            LayerName: layer.LayerName,
                            ViewProperties: layer.ViewProperties ? layer.ViewProperties : [
                                { "DisplayName": "Dữ liệu", "ColumnName": "Title" }
                            ]
                        });

                    if (!map.manualRefresh) {
                        map.refreshLayerByName(map.MapnikOverlay);
                    }

                    if (layer.Content) {
                        if (typeof (layer.Content) == 'string') {
                            layer.Content = Ext.decode(layer.Content);
                        }

                        if (layer.Content.Config) layer.Content = layer.Content.Config;

                        if (Ext.isArray(layer.Content)) layer.Content = layer.Content[0];
                    }

                    if (layer.AutoRefresh || (layer.Content && layer.Content.AutoRefresh)) {
                        var layerTimeout = 5000;
                        if (layer.TimeoutRefresh || layer.Content.TimeoutRefresh) {
                            layerTimeout = layer.TimeoutRefresh || layer.Content.TimeoutRefresh;
                        }

                        if (typeof (map.MapnikOverlay.minTimeout) === 'undefined') {
                            map.MapnikOverlay.minTimeout = 600000;
                        }

                        if (map.MapnikOverlay.minTimeout > layerTimeout) {
                            map.MapnikOverlay.minTimeout = layerTimeout;
                        }

                        if (autoRefreshFunc)
                            map.MapnikOverlay.autoRefreshFunc = autoRefreshFunc;
                        var refreshOverlay = function (interval) {
                            clearTimeout(map.MapnikOverlay.timeout);
                            //map.MapnikOverlay.timeout = setTimeout(function ()
                            //{
                            //    map.refreshLayerByName(map.MapnikOverlay);
                            //    if (map.MapnikOverlay.autoRefreshFunc) map.MapnikOverlay.autoRefreshFunc();

                            //    refreshOverlay(interval);
                            //},
                            //interval);
                        }

                        refreshOverlay(map.MapnikOverlay.minTimeout);
                    } else {
                        map.refreshLayerByName(map.MapnikOverlay);
                    }
                };

                if (!map.groupOverlayUrl) {
                    VDMS.Web.Library.AJAX.LayerAjax.GetMapnikRenderUrl(true, function (res) {
                        if (res && res.value) {
                            map.groupOverlayUrl = res.value;
                            map.MapnikOverlay = new vietbando.Layer({
                                url: res.value, format: function (agrs) {
                                    var baseUrl = agrs[0];
                                    var x = agrs[1];
                                    var y = agrs[2];
                                    var z = agrs[3];

                                    var url = baseUrl.replace('{z}', z).replace('{x}', x).replace('{y}', y);

                                    var server = layer.Server;
                                    var maps = "";

                                    for (var i = 0; i < map.layers.multiOverlay.length; i++) {
                                        maps += map.layers.multiOverlay[i].Name + '|';
                                    }

                                    url = url + '&server=' + server;
                                    url = url + '&maps=' + maps;
                                    url += '&t=' + new Date().getTime();

                                    return url;
                                }
                            });

                            map.MapnikOverlay.name = 'MapnikOverlayLayer';
                            map.MapnikOverlay.map = map;
                            map.MapnikOverlay.setMap(map);

                            buildOverlay(layer);
                        }
                    });
                }
                else {
                    buildOverlay(layer);
                }
            };

            map.removeGroupOverlayLayer = function (layer) {
                for (var i = 0; i < map.layers.multiOverlay.length; i++) {
                    if (map.layers.multiOverlay[i].Name == layer.MapName) {
                        map.layers.multiOverlay.splice(i, 1);
                    }
                }

                if (!map.manualRefresh) {
                    map.refreshLayerByName(map.MapnikOverlay);
                }
            };

            map.addOverlayInfo = function (layer, strokes, fills, props, viewProperties) {
                for (var i = 0; i < map.layers.overlayLayers.length; i++) {
                    if (map.layers.overlayLayers[i].Name == layer) {
                        map.layers.overlayLayers[i] = {
                            Name: layer,
                            StrokeColors: strokes,
                            FillColors: fills,
                            GeoFields: props,
                            ViewProperties: viewProperties ? viewProperties : null
                        };

                        if (!map.manualRefresh) {
                            map.refreshLayerByName(map.Overlay);
                        }

                        return;
                    }
                }

                map.layers.overlayLayers.push(
                    {
                        Name: layer,
                        StrokeColors: strokes,
                        FillColors: fills,
                        GeoFields: props,
                        ViewProperties: viewProperties ? viewProperties : null
                    });

                if (!map.manualRefresh) {
                    map.refreshLayerByName(map.Overlay);
                }
            };

            map.removeOverlayInfo = function (layer) {
                for (var i = 0; i < map.layers.overlayLayers.length; i++) {
                    if (map.layers.overlayLayers[i].Name == layer) {
                        map.layers.overlayLayers.splice(i, 1);
                    }
                }

                if (!map.manualRefresh) {
                    map.refreshLayerByName(map.Overlay);
                }
            };

            //Manage Markers Layer
            if (!map.layers.markerLayers)
                map.layers.markerLayers = [];

            map.addMarkerLayer = function (layer) {
                if (layer && layer.Markers && layer.Markers.length > 0) {
                    //Remove if exists
                    map.removeMarkerLayer(layer.Name);

                    for (var i = 0; i < layer.Markers.length; i++) {
                        layer.Markers[i].setMap(map);
                    }

                    if (layer.Content) {
                        if (typeof (layer.Content) == 'string') {
                            layer.Content = Ext.decode(layer.Content);
                        }

                        if (layer.Content && layer.Content.AutoRefresh) {
                            var refreshFn = function () {
                                layer.timeout = setTimeout(function () {
                                    if (layer.buildData)
                                        layer.buildData();
                                    refreshFn();
                                }, layer.Content.TimeoutRefresh ? layer.Content.TimeoutRefresh : 300000);
                            }
                            refreshFn();
                        } else {
                            mymap.refreshLayerByName(singleLayer);
                        }
                    }

                    map.layers.markerLayers.push(layer);
                }
            };

            map.removeMarkerLayer = function (name) {
                if (map.layers.markerLayers && map.layers.markerLayers.length > 0) {
                    for (var i = 0; i < map.layers.markerLayers.length; i++) {
                        if (map.layers.markerLayers[i].Name === name) {
                            if (map.layers.markerLayers[i].timeout) {
                                clearTimeout(map.layers.markerLayers[i].timeout);
                            }

                            var mks = map.layers.markerLayers[i].Markers;
                            if (mks && mks.length > 0) {
                                for (var j = 0; j < mks.length; j++) {
                                    mks[j].setMap(null);
                                }
                            }
                            map.layers.markerLayers.splice(i, 1);
                        }
                    }
                }
            };

            map.refreshLayerByName = function (layer) {
                if (layer) layer.refresh();
            };

            map.openNodeInfo = function (node, latlng, panTo) {
                if (node && node.Layer && node.Id) {
                    if (map.currentMarker)
                        map.currentMarker.clearLayers();

                    VDMS.Web.Library.AJAX.LayerAjax.GetLayerDataByNodeId(node.Layer, node.Id, function (data) {

                        var source = {};
                        if (data && data.value) {
                            data = data.value;
                            var props = data[0];
                            if (!data[1].Tables[0]) {
                                Public.Global.Message('Thông báo', 'Dữ liệu không có thông tin bản đồ', 2000, {
                                    type: 'warning',
                                    layout: 'topRight'
                                });
                                return;
                            }
                            var geoData = data[1].Tables[0].Rows[0];

                            var wktParser = new jsts.io.WKTParser();
                            var geojsonWriter = new jsts.io.GeoJSONWriter();
                            var geoj = geojsonWriter.write(wktParser.read(geoData.Shape));
                            var viewProperties = null;
                            var propsData = {};
                            if (panel.map.layers.overlayLayers && panel.map.layers.overlayLayers.length > 0) {
                                for (var h = 0; h < panel.map.layers.overlayLayers.length; h++) {
                                    if (panel.map.layers.overlayLayers[h].Name === node.Layer) {
                                        viewProperties = panel.map.layers.overlayLayers[h].ViewProperties;
                                        break;
                                    }
                                }
                            }
                            if (panel.map.layers.singleOverlay && panel.map.layers.singleOverlay.length > 0) {
                                for (var h = 0; h < panel.map.layers.singleOverlay.length; h++) {
                                    if (panel.map.layers.singleOverlay[h].LayerName === node.Layer) {
                                        viewProperties = panel.map.layers.singleOverlay[h].ViewProperties;
                                        break;
                                    }
                                }
                            }
                            if (panel.map.layers.multiOverlay && panel.map.layers.multiOverlay.length > 0) {
                                for (var h = 0; h < panel.map.layers.multiOverlay.length; h++) {
                                    if (panel.map.layers.multiOverlay[h].LayerName === node.Layer) {
                                        viewProperties = panel.map.layers.multiOverlay[h].ViewProperties;
                                        break;
                                    }
                                }
                            }
                            for (var j = 0; j < props.Rows.length; j++) {
                                if (!Ext.isEmpty(props.Rows[j].PropertyValue)) {
                                    if (viewProperties) {
                                        for (var k = 0; k < viewProperties.length; k++) {
                                            if (viewProperties[k].ColumnName === props.Rows[j].ColumnName) {
                                                propsData[viewProperties[k].DisplayName] = props.Rows[j].PropertyValue;
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        propsData[props.Rows[j].ColumnName] = props.Rows[j].PropertyValue;
                                    }

                                    if (!node[props.Rows[j].ColumnName]) {
                                        node[props.Rows[j].ColumnName] = props.Rows[j].PropertyValue;
                                    }
                                }
                            }

                            var sourceConfig = {};
                            source = me.buildSource(node.Layer, propsData, sourceConfig);
                            var grid = panel.detailWindow.down('propertygrid');
                            grid.setSource(source);

                            //var pt = new vbd.LatLng(latlng.lat(), latlng.lng());
                            var pt;
                            switch (geoj.type) {
                                case 'Point':
                                    pt = new vbd.LatLng(geoj.coordinates[1], geoj.coordinates[0]);
                                    break;
                                default:
                                    pt = new vbd.LatLng(latlng.lat(), latlng.lng());
                                    break;
                            }
                            var lines = node.Title.length / 38;
                            var titleHeight = (lines < 1 ? 1 : lines) * 32;
                            var maxWidth = panel.getWidth() > 768 ? 350 : 300;
                            var maxHeight = (Object.keys(source).length * 50 + 50);
                            maxHeight = Math.min(maxHeight, 400);
                            panel.map.infoWindow = new vbd.InfoWindow({
                                content: '<span style="width: ' + maxWidth + 'px;height: ' + titleHeight + 'px; text-align: center; font-weight: bold; display: block; padding: 5px; font-size: 14px;">' + node.Title + '</span><div style="display: block; width: ' + maxWidth + 'px;height:' + maxHeight + 'px;" id="Detail_' + node.Id + '"></div>',
                                position: pt
                            });
                            panel.map.infoWindow.open(panel.map);
                            var gridProp = Ext.create('Ext.grid.property.Grid',
                                {
                                    border: true,
                                    hideHeaders: true,
                                    width: maxWidth,
                                    maxHeight: maxHeight,
                                    autoScroll: true,
                                    source: source,
                                    sourceConfig: sourceConfig,
                                    style: 'border-top: 1px solid #2196f3;',
                                    listeners:
                                    {
                                        'render': function (grid) {
                                            grid.getColumns()[0].setWidth(150);
                                            grid.getColumns()[1].setConfig('cellWrap', true);
                                            grid.getColumns()[1].setConfig('variableRowHeight', true);
                                            grid.getColumns()[1].tdCls = 'grid-props-wrap';
                                        },
                                        'beforeedit':
                                        {
                                            fn: function () {
                                                return false;
                                            }
                                        }
                                    },
                                    renderTo: 'Detail_' + node.Id
                                });

                        }
                        else {
                            source['Dữ liệu'] = 'Không có thông tin';
                        }
                    });
                }
            };
            map.openTrackingInfoWindow = function (data, latlng, mapPanel) {
                if (data.hasOwnProperty('ID')) {
                    data['Id'] = data['ID'];
                }
                data['Title'] = data['Title'] ? data['Title'] : (data['AreaDesc'] ? data['AreaDesc'] : '');
                data.Latlng = latlng;
                data.VideoUrl = data.VideoUrl ? data.VideoUrl : 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8';
                data.VideoStreaming = data.VideoStreaming !== null ? data.VideoStreaming : true;
                var id = data.Id;
                var infoId = 'marker-info-tracking-' + id;

                if (map.infoWindowTracking) {
                    map.infoWindowTracking.close();
                }

                var winHtml = [];
                var size = HTDP.Public.Global.detectSize(300, 170, 200, 200);
                winHtml.push('<div style="width:' + size[0] + 'px;height:' + size[1] + 'px" class="marker-info" id="' + infoId + '">');
                winHtml.push('</div>');

                map.infoWindowTracking = new vbd.InfoWindow({
                    position: latlng,
                    content: winHtml.join('')
                });
                map.infoWindowTracking.open(panel.map);
                var cameraPlayer = Ext.create('Public.view.CameraPlayer', {
                    data: data,
                    width: size[0] + 'px',
                    height: size[1] + 'px',
                    canExpand: false,
                    canTracking: false,
                    //camId: id,
                    renderTo: infoId,
                    trackingContainer: 'trafficTracking',
                    mapPanel: mapPanel,
                    buildHtml: function (prefix, object, videoMode) {
                        return HTDP.Public.Global.buildBienBaoInfo(prefix, object, videoMode, 300, 110);
                    }
                });
                vbd.event.addListener(map.infoWindowTracking, 'closeclick', function (param) {
                    cameraPlayer.close();
                });
            }

            map.openLayerInfo = function (content, latlng) {
                if (map.currentMarker)
                    map.currentMarker.clearLayers();

                panel.map.infoWindow = new vbd.InfoWindow({
                    content: content,
                    position: latlng
                });
                panel.map.infoWindow.open(panel.map);
            };

            //SwitchBaseLayer
            map.switchMapLayer = function (data, state) {
                var map = this;
                var url = VDMS_DATA.MapURL.DEFAULT;

                if (data && data.Url)
                    url = data.Url;

                map.layers.baseLayers[0].setUrl(url);
                map.setCenter(map.getCenter(), map.getZoom());
            };

            map.createMarkerFrom = function (geojson, opt) {
                var marker;

                var panel = Ext.ComponentQuery.query('publicmap')[0];

                var geo = Ext.decode(geojson);

                if (!geo) return;

                var defaultStyle =
                    {
                        url: "images/blink1.gif",
                        width: 9,
                        height: 9,
                        strokeColor: panel.colorSettings.normal.StrokeColor,
                        strokeWidth: panel.colorSettings.normal.StrokeWidth,
                        strokeOpacity: panel.colorSettings.normal.StrokeOpacity,
                        fillColor: panel.colorSettings.normal.FillColor,
                        fillOpacity: panel.colorSettings.normal.FillOpacity,
                        strokeDasharray: panel.colorSettings.normal.LineStyle == 1 ? null : "5, 5, 1, 5",
                        offsetX: 4,
                        offsetY: 9
                    };

                var style = Ext.apply(defaultStyle, opt, {});

                switch (geo.type) {
                    case 'Point':
                        var searchAroundMarkerOpt = new vbd.MarkerOptions();
                        if (style.customMarker) {
                            searchAroundMarkerOpt.icon = new vbd.Icon({
                                url: "", size: new vbd.Size(style.width, style.height)
                            });
                            searchAroundMarkerOpt.anchorPoint = new vbd.Point(style.offsetX, style.offsetY);
                            searchAroundMarkerOpt.content = style.customMarker;
                            searchAroundMarkerOpt.position = new vbd.LatLng(geo.coordinates[1], geo.coordinates[0])
                            marker = new vbd.CustomMarker(searchAroundMarkerOpt);
                        }
                        else {
                            searchAroundMarkerOpt.icon = new vbd.Icon({ url: style.url, size: new vbd.Size(style.width, style.height) });
                            searchAroundMarkerOpt.position = new vbd.LatLng(geo.coordinates[1], geo.coordinates[0]);
                            marker = new vbd.Marker(searchAroundMarkerOpt);
                        }
                        break;
                    case 'LineString':
                        var latLngs = [];

                        for (var j = 0; j < geo.coordinates.length; j++) {
                            latLngs.push(new vbd.LatLng(geo.coordinates[j][1], geo.coordinates[j][0]));
                        }
                        marker = new vbd.Polyline({
                            path: latLngs, strokeColor: style.strokeColor, strokeOpacity: style.strokeOpacity, strokeWidth: style.strokeWidth, strokeDasharray: style.strokeDasharray
                        });
                        break;
                    case 'MultiLineString':
                        var latLngs = [];

                        for (var j = 0; j < geo.coordinates.length; j++) {
                            for (var k = 0; k < geo.coordinates[j].length; k++) {
                                latLngs.push(new vbd.LatLng(geo.coordinates[j][k][1], geo.coordinates[j][k][0]));
                            }

                        }
                        marker = new vbd.Polyline({
                            path: latLngs, strokeColor: style.strokeColor, strokeOpacity: style.strokeOpacity, strokeWidth: style.strokeWidth, strokeDasharray: style.strokeDasharray
                        });
                        break;
                    case 'Polygon':
                        var latLngs = [];

                        for (var i = 0; i < geo.coordinates.length; i++) {
                            for (var j = 0; j < geo.coordinates[i].length; j++) {
                                latLngs.push(new vbd.LatLng(geo.coordinates[i][j][1], geo.coordinates[i][j][0]));
                            }
                        }
                        marker = new vbd.Polygon({
                            paths: latLngs, strokeColor: style.strokeColor, strokeOpacity: style.strokeOpacity, strokeWidth: style.strokeWidth, fillColor: style.fillColor, fillOpacity: style.fillOpacity, strokeDasharray: style.strokeDasharray
                        });
                        break;
                    case 'MultiPolygon':
                        var latLngs = [];
                        for (var i = 0; i < geo.coordinates.length; i++) {
                            geo.coordinates[i] = Ext.Array.flatten(geo.coordinates[i]);
                            for (var j = 0; j < geo.coordinates[i].length; j++) {
                                latLngs.push(new vbd.LatLng(geo.coordinates[i][j][1], geo.coordinates[i][j][0]));
                            }
                        }
                        marker = new vbd.Polygon({ paths: latLngs, strokeColor: style.strokeColor, strokeOpacity: style.strokeOpacity, strokeWidth: style.strokeWidth, fillColor: style.fillColor, fillOpacity: style.fillOpacity, strokeDasharray: style.strokeDasharray });
                        break;
                }

                me.bindEventMarker(marker);

                return marker;
            };

            map.panToObj = function (shape) {
                if (!shape) return;

                if (shape.CLASS_NAME == 'Polyline' || shape.CLASS_NAME == 'Polygon' || shape.CLASS_NAME == 'Rectangle') {
                    map.zoomFitEx(shape.getPath().toArray());
                }
                else if (shape.CLASS_NAME == 'Point') {
                    map.panToObj(shape.getPosition());
                }
            }

            // Init FindPath
            map.initFindPath = function ()
            {
                var map = this;
                if (!map.findPathObj)
                {
                    map.findPathObj = new FindPath({ map: map, addMarkerOnMap: true });
                }
            };

            map.removeOverlayInfo = function (layer)
            {
                for (var i = 0; i < map.arrOverlayInfo.length; i++)
                {
                    if (map.arrOverlayInfo[i].Name == layer)
                    {
                        map.arrOverlayInfo.splice(i, 1);
                    }
                }

                map.refreshLayerByName(map.Overlay);
            };

            map.removeOverlay = function (overlay)
            {
                //Check if an id or and object
                var removeOverlay = null;
                var indexRemove = -1;

                //Find by marker id
                if (typeof (overlay) === 'string')
                {
                    for (var i = 0; i < map.arrOverlays.length; i++)
                    {
                        if (map.arrOverlays[i].markerId === overlay)
                        {
                            indexRemove = i;
                            removeOverlay = map.arrOverlays[i];
                            break;
                        }
                    }
                }
                //Find by marker object
                else if (typeof (overlay) === 'object' && map.arrOverlays)
                {
                    for (var i = 0; i < map.arrOverlays.length; i++)
                    {
                        if (map.arrOverlays[i] === overlay)
                        {
                            indexRemove = i;
                            removeOverlay = overlay;
                            break;
                        }
                    }
                }

                if (removeOverlay && indexRemove > -1)
                {
                    //Fire event
                    panel.fireEvent('overlayremoved', panel, map, removeOverlay);
                    removeOverlay.setMap(null);
                    removeOverlay = null;
                    map.arrOverlays.splice(indexRemove, 1);
                }

                console.log('Remove overlay');
            }

            map.clearArrObj = function (arrObj)
            {
                var map = this;
                if (arrObj != null)
                {
                    for (var i = 0; i < arrObj.length; i++)
                    {
                        if (arrObj[i] != null && VMap.GeoJSON.isValidType(arrObj[i]))
                        {
                            if (arrObj[i].Buffering)
                            {
                                panel.fireEvent('deletingGeo', panel, arrObj[i].Buffering);

                                map.removeOverlay(arrObj[i].Buffering);
                                arrObj[i].Buffering = null;
                            }

                            panel.fireEvent('deletingGeo', panel, arrObj[i]);

                            map.removeOverlay(arrObj[i]);
                            arrObj[i] = null;
                        }
                    }
                }
                arrObj = new Array();
                return arrObj;
            };

            map.clearControlPoint = function ()
            {
                var map = this;
                map.arrControlPoint = map.clearArrObj(map.arrControlPoint);
                map.arrAPControlPoint = map.clearArrObj(map.arrAPControlPoint);

                map.nControlPoint = 0;
                map.nAPControlPoint = 0;
            };

            map.addArrOverlays = function (arr)
            {
                var map = this;

                for (var i = 0; i < arr.length; i++)
                {
                    if (arr[i] != null)
                    {
                        if (typeof (arr[i].beforeAddOverlay) === 'function')
                        {
                            arr[i].beforeAddOverlay();
                        }

                        arr[i].setMap(map);

                        if (typeof (arr[i].afterAddOverlay) === 'function')
                        {
                            arr[i].afterAddOverlay();
                        }
                    }
                }
            }

            //Register map event
            var timeout = null;
            var me = this;
            vietbando.event.addListener(map, 'mousemove', function (params) {
                var panel = Ext.ComponentQuery.query('publicmap')[0];


                if (!panel.colorSettings.normal.ModeRender) return;
                if (panel.map.isSearching) return;

                var mee = me;
                if (timeout) {
                    clearTimeout(timeout);
                }


                if (panel.map.menuIsOpen) {
                    return;
                }

                if (panel.map.hoverMarker && !panel.map.moveOnMarker) {
                    if (panel.map.hoverMarker) {
                        Ext.Array.each(panel.map.hoverMarker, function (marker) {
                            if (marker) {
                                marker.setMap(null);
                            }
                        });
                        panel.map.hoverMarker = [];
                    }
                }
            });

            vietbando.event.addListener(map, 'click', function (params) {
                var panelMap = Ext.ComponentQuery.query('publicmap')[0];
                var map = panelMap.map;
                if (!map) return;
                if (panelMap.closeContextMenu) panelMap.closeContextMenu();
                if (panelMap.clearControlPoint) panelMap.clearControlPoint();
                if (panel.map.infoWindow) {
                    panel.map.infoWindow.close();
                    panel.map.infoWindow = null;
                }

                //Select overlay object
                var layers = '',
                    shareLayers = [];
                for (var i = 0; i < map.layers.overlayLayers.length; i++) {
                    layers = map.layers.overlayLayers[i].Name + '|' + layers;
                    if (map.layers.overlayLayers[i].Type !== 'SHARE_OVERLAY') {
                        layers = map.layers.overlayLayers[i].Name + '|' + layers;
                    } else {
                        shareLayers.push({
                            Token: map.layers.overlayLayers[i].Token,
                            ServerUrl: map.layers.overlayLayers[i].ServerUrl,
                            LayerName: map.layers.overlayLayers[i].Name
                        });
                    }
                }

                var dbLayers = [];
                if (map.layers.singleOverlay && map.layers.singleOverlay.length > 0) {
                    for (var i = 0; i < map.layers.singleOverlay.length; i++) {
                        if (map.layers.singleOverlay[i].Content.LayerType !== 'SHARE_MAPNIK' && map.layers.singleOverlay[i].Content.LayerType !== 'SHARE_OVERLAY') {
                            layers = map.layers.singleOverlay[i].LayerName + '|' + layers;
                        } else {
                            shareLayers.push({
                                Token: map.layers.singleOverlay[i].Token,
                                ServerUrl: map.layers.singleOverlay[i].ServerInfo,
                                LayerName: map.layers.singleOverlay[i].LayerName
                            });
                        }
                        if (HTDP.Public.Global.INFO_LAYER.indexOf(map.layers.singleOverlay[i].LayerName) === -1) {
                            dbLayers.push(map.layers.singleOverlay[i].LayerName);
                        }
                    }
                }
                if (layers.length) {
                    for (var i = 0; i < map.layers.multiOverlay.length; i++) {
                        layers = map.layers.multiOverlay[i].LayerName + '|' + layers;
                        dbLayers.push(map.layers.multiOverlay[i].LayerName);
                    }

                    if (dbLayers.length > 0) {
                        for (var i = 0; i < dbLayers.length; i++) {
                            HTDP.Library.AJAX.HTDPAjax.GetObjectsByLngLat(dbLayers[i], params.LatLng.lng(), params.LatLng.lat(), map.getZoom(), 12, 1, function (data) {
                                //var contentBuilder = function (params, time)
                                //{
                                //    var builder = [];
                                //    builder.push('<table style="width:400px">');
                                //    builder.push('<tr><th colspan="2"><span style="text-align: left; color:darkred; font-weight: bold; display: block; padding: 5px; font-size: 14px;">Cảnh báo kẹt xe (' + time + ')</span></th></tr>');
                                //    for (var j = 0; j < params.length; j++)
                                //    {
                                //        builder.push('<tr style="' + (params[j].Style ? params[j].Style : '') + '">');
                                //        builder.push('<td style="width:140px"><b>' + (params[j].Title ? params[j].Title : '') + '</b></td>');
                                //        builder.push('<td>' + (params[j].Value ? params[j].Value : 'Không có dữ liệu') + '</td>');
                                //        builder.push('</tr>');
                                //    }
                                //    builder.push('</table>');
                                //    return builder.join('');
                                //}
                                if (data && data.value && data.value.length > 0) {
                                    data = data.value[0];
                                    var object = JSON.parse(data);
                                    if (object) {
                                        if (object.Shape && object.Shape.Shape && object.Shape.Shape.coordinates) {
                                            var poly = new vbd.Polygon({ paths: object.Shape.Shape.coordinates });

                                            var realLatLng = poly.getBounds().getCenter();
                                            map.openTrackingInfoWindow(object, realLatLng, panelMap);
                                        } else {
                                            map.openTrackingInfoWindow(object, params.LatLng, panelMap);
                                        }
                                    }
                                }
                            });
                        }
                    }

                    VDMS.Web.Library.AJAX.LayerAjax.GetObjectByLatLng(layers, map.getZoom(), params.LatLng.lng(), params.LatLng.lat(), function (rs) {
                        var values = rs.value;
                        if (values != null && values.length) {
                            var node = values[0];
                            map.openNodeInfo(node, params.LatLng);
                        }
                    });
                    //me.getInfo(panelMap, params.LatLng);
                }

                function showSimpleView(node)
                {
                    if (panel)
                    {
                        if (panel.simpleView)
                        {
                            panel.simpleView.destroy();
                        }

                        panel.simpleView = Ext.create('Shared.view.SimpleDetailPanel', {
                            nodeInfo: node,
                            currentmarker: map.currentGeometry,
                            defaultAlign: me.defaultConfig && me.defaultConfig.detailViewPosition ? me.defaultConfig.detailViewPosition : 'br-br',

                            isDirty: false,
                            listeners:
                            {
                                beforeshow: function (win, e)
                                {
                                    if (!win.isDirty && Ext.getVersion().major == 4)
                                    {
                                        setTimeout(function ()
                                        {
                                            if (win.rendered)
                                            {
                                                // lam gi do
                                            }
                                        }, 500);
                                    }
                                }
                            }
                        }).show();
                    }
                };

                if (shareLayers.length > 0) {
                    VDMS.Web.Library.AJAX.ShareLayerAjax.GetShareMapInfo(shareLayers, map.getZoom(), params.LatLng.lat(), params.LatLng.lng(), function (rs) {
                        if (rs && rs.value && rs.value.IsSuccess) {
                            var data = rs.value.List[0];

                            var node = data.Node[0];
                            var geo = data.Loc;

                            if (geo && geo.Coords) {
                                if (map.currentGeometry != null) {
                                    map.currentGeometry.setMap(null);
                                    map.currentGeometry = null;
                                }

                                map.arrCurrentGeometries = map.clearArrObj(map.arrCurrentGeometries);
                                map.clearControlPoint();

                                //find way to get share icon
                                var iconUrl = '';
                                var shareLayer = map.layers.singleOverlay.filter(f => f.LayerName == node.Layer);
                                if (shareLayer && shareLayer.length > 0) {
                                    shareLayer = shareLayer[0];
                                    if (shareLayer.IconUrl)
                                        iconUrl = shareLayer.IconUrl;
                                }
                                //var iconUrl = (node.Layer) ? Document.Global.getApplicationRoot() + 'app/render/GetLayerIcon.ashx?LayerName=' + node.Layer.toUpperCase() : '';

                                var marker = map.createMarkerFrom(geo.Coords,
                                    {
                                        customMarker: Ext.String.format('<div class="VDMS-Marker-Wrap-Select"><img src="{0}" /></div>', iconUrl),
                                        width: 32,
                                        height: 32,
                                        offsetX: 14,
                                        offsetY: 32,
                                        strokeColor: 'red',
                                        strokeWidth: 3,
                                        fillColor: 'green',
                                        strokeOpacity: 0.5,
                                        fillOpacity: 0.05
                                    });
                                map.currentGeometry = marker;

                                map.arrCurrentGeometries.push(map.currentGeometry);
                                map.addArrOverlays(map.arrCurrentGeometries);

                            }
                            //Show window Detail
                            if (node) {
                                showSimpleView(node);
                            };

                        }
                        else if (rs.error && rs.error.Message && rs.error.Message.indexOf('Access denied') > -1) {
                            Document.Global.Message(_t('Thông báo'), _t('Bạn không có quyền xem dữ liệu của đối tượng này'), 2000,
                                {
                                    type: 'warning',
                                    layout: 'topRight'
                                });
                        }
                        else if (rs.error) {
                            Document.Global.Message(_t('Thông báo'), _t('Hệ thống có lỗi xảy ra. Chi tiết: ') + '<i>' + JSON.stringify(rs.error) + '</i>', 2000,
                                {
                                    type: 'error',
                                    layout: 'topRight'
                                });
                        }
                        else {
                            Document.Global.Message(_t('Thông báo'), '<i>' + _t('Không có thông tin') + '</i>', 2000,
                                {
                                    type: 'info',
                                    layout: 'topRight'
                                });
                        }
                    });
                }
            });

            return map;
        }
        else {
            console.log('Panel or Vietbando API is not ready.');
            return null;
        }
    },
    bindData: function (panel, data, callback, isSearching) {
        if (panel && panel.map) {
            panel.fireEvent('clearMap', panel);

            //Remove all OverlayeInfo
            panel.map.layers.overlayLayers = [];
            panel.map.refreshLayerByName(panel.map.Overlay);

            panel.map.hoverMarker = [];

            if (typeof (callback) == 'function') {
                callback();
            }

            panel.map.isSearching = isSearching;

            //Chỉ vẽ marker khi tìm kiếm
            if (!panel.map.isSearching && panel.colorSettings.normal.ModeRender) return;

            if (data && data.length) {
                var geoData = [];
                for (var i = 0; i < data.length; i++) {
                    var row = data[i];

                    for (var f in row) {
                        if (row.hasOwnProperty(f)) {
                            if (f.indexOf('SolarGeometry') > -1) {
                                geoData.push({
                                    geo: row[f],
                                    data: row
                                });
                            }
                        }
                    }
                    if (panel.down('#mapToolbar')) panel.down('#mapToolbar').show();
                }

                for (var i = 0; i < geoData.length; i++) {
                    if (geoData[i].geo) {
                        var iconUrl = HTDP.Global.getAppPath('app/render/GetLayerIcon.ashx?layername=' + geoData[i].data.Layer.toUpperCase());
                        var marker = panel.map.createMarkerFrom(geoData[i].geo, {
                            customMarker: Ext.String.format('<div class="VDMS-Marker-Wrap"><img src="{0}" /></div>', iconUrl),
                            width: 32,
                            height: 32,
                            offsetX: 15,
                            offsetY: 32
                        });
                        marker.data = geoData[i].data;

                        marker.setMap(panel.map);
                        panel.map.hoverMarker.push(marker);

                    }
                }
            }
        }
    },
    bindEventMarker: function (marker) {
        var me = this;
        var panel = Ext.ComponentQuery.query('publicmap')[0];

        vietbando.event.addListener(marker, 'click', function (params) {
            if (params.Me) {
                panel.map.originMarkerEdit = params.Me;
                if (panel.map.selectedMarker) {
                    panel.map.selectedMarker.setMap(null);
                    panel.map.selectedMarker = null;
                }

                var iconUrl = HTDP.Global.getAppPath('app/render/GetLayerIcon.ashx?layername=' + params.Me.data.Layer.toUpperCase());
                panel.map.selectedMarker = panel.map.createMarkerFrom(JSON.stringify(params.Me.toGeoJSON().geometry), {
                    customMarker: Ext.String.format('<div class="VDMS-Marker-Wrap"><img src="{0}" /></div>', iconUrl),
                    width: 32,
                    height: 32,
                    offsetX: 15,
                    offsetY: 32
                });
                panel.map.selectedMarker.data = params.Me.data;
                panel.map.selectedMarker.setMap(panel.map);
                panel.map.selectedMarker.setActive(true);

                panel.fireEvent('onMarkerClick', panel, panel.map.originMarkerEdit);
            }
        });

        vietbando.event.addListener(marker, 'mouseover', function (params) {
            if (params.Me) {
                panel.map.moveOnMarker = true;
                var grid = panel.up('managegrid');
                if (grid) {
                    var lbSelectedObj = grid.down('#lbSelectedObj');

                    var msg = _t('Đang di chuyển lên đối tượng: ') + '<span style="color: rgb(255, 237, 0)">' + params.Me.data.Title + '</span>';

                    lbSelectedObj.setText(msg);
                }
            }
        });

        vietbando.event.addListener(marker, 'mouseout', function (params) {

            if (params.Me) {
                panel.map.moveOnMarker = false;
                var grid = panel.up('managegrid');
                if (grid) {
                    var msg = _t('Không có đối tượng nào được chọn.');

                    var lbSelectedObj = panel.up('managegrid').down('#lbSelectedObj');
                    lbSelectedObj.setText(_t(msg));
                }
            }
        });

        vietbando.event.addListener(marker, 'dblclick', function (params) {
            if (params.Me) {
                var m = params.Me;
                panel.fireEvent('onMarkerDoubleClick', panel, m);
            }
        });

        vietbando.event.addListener(marker, 'rightclick', function (params) {
        });
    },
    getInfo: function (panelMap, pt) {
        var map = panelMap.map;
        if (!map) return;
        if (panelMap.closeContextMenu) panelMap.closeContextMenu();
        if (panelMap.clearControlPoint) panelMap.clearControlPoint();

        //Select overlay object
        var layers = '';
        for (var i = 0; i < map.layers.overlayLayers.length; i++) {
            layers = map.layers.overlayLayers[i].Name + '|' + layers;
        }

        VDMS.Web.Library.AJAX.LayerAjax.GetObjectByLatLng(layers, map.getZoom(), pt.lng(), pt.lat(), function (rs) {
            var data = rs.value;
            if (data != null && data.length == 2) {
                var node = data[0];

                if (node && panelMap.detailWindow) {
                    //panelMap.detailWindow.show();
                    panelMap.detailWindow.showAt(panelMap.getWidth() + panelMap.detailWindow.getX() - panelMap.detailWindow.getWidth() - 50, panelMap.getY() + 16);
                    var detailview = panelMap.detailWindow.down('detailview');
                    detailview.fireEvent('initControls', detailview, node, false);

                    if (panelMap.detailWindow.isCollapsingOrExpanding == 0) {
                        panelMap.detailWindow.expand();
                    }
                };
            }
        });
    },
    buildSource: function (layer, propsData, sourceConfig) {
        var source = {};
        var position = '';
        position = propsData['Number'] ? propsData['Number'] : '';
        position += propsData['Street'] ? (position.length > 0 ? ', ' : '') + propsData['Street'] : '';
        position += propsData['Ward'] ? (position.length > 0 ? ', ' : '') + propsData['Ward'] : '';
        position += propsData['District'] ? (position.length > 0 ? ', ' : '') + propsData['District'] : '';
        position += propsData['Province'] ? (position.length > 0 ? ', ' : '') + propsData['Province'] : '';

        for (var key in propsData) {
            if (propsData.hasOwnProperty(key)) {
                if (!Ext.isEmpty(propsData[key])) {
                    if (key !== 'Number' && key !== 'Street' && key !== 'Ward' && key !== 'District' && key !== 'Province') {
                        source[key] = propsData[key];
                        // HACK html content
                        sourceConfig[key] = { renderer: function (v) { return v; } };
                    }
                }
            }
        }
        if (!Ext.isEmpty(position)) {
            source['Vị trí'] = position;
        }
        return source;
    },
    appendTrackingTab: function (mapPanel, tabItemId, viewAllColumnHeight, title, buildHtml, buildInterval, buildVideoStreamRun, canDeleteItem, playerOpts) {
        if (!mapPanel.down('#trackingContainer')) {
            var size = HTDP.Public.Global.detectSize(350, 170, 200, 170);
            mapPanel.add({
                xtype: 'tabpanel',
                animCollapse: false,
                title: _t('Danh sách kẹt xe và camera'),
                itemId: 'trackingContainer',
                header: false,
                region: 'south',
                height: size[1] + 'px',
                tabPosition: 'top',
                //tabRotation: '90',
                split: true,
                closeAction: 'destroy',
                collapsible: true,
                collapsed: true,
                resizable: false,
                scrollable: false,
                items: [],
                listeners: {
                    afterrender: function (panel) {
                        panel.getTabBar().hide();
                        if (!panel.buttonTabs) {
                            panel.buttonTabs = [];
                        }

                    },
                    add: function (panel, container, pos) {
                        var btnItemId = container.getItemId() + 'Btn';
                        if (!panel.buttonTabs) {
                            panel.buttonTabs = [];
                        }
                        var buttonTab = panel.buttonTabs.filter(function (btn) {
                            return btn.itemId === btnItemId;
                        });
                        if (!buttonTab || buttonTab.length === 0) {
                            panel.buttonTabs.push({
                                xtype: 'button',
                                text: container.getTitle(),
                                itemId: btnItemId,
                                toggleGroup: 'btnTabs',
                                enableToggle: true,
                                allowDepress: false,
                                activeTab: container,
                                listeners: {
                                    toggle: function (btn, state) {
                                        if (state) {
                                            panel.setActiveItem(btn.activeTab);
                                        }
                                    }
                                }
                            });
                        }

                        for (var i = 0; i < panel.buttonTabs.length; i++) {
                            for (var j = 0; j < panel.items.length; j++) {
                                var tbar = panel.items.items[j].getDockedItems()[0];
                                var btn = tbar.down('#' + panel.buttonTabs[i].itemId);

                                if (!btn) {
                                    tbar.insert(0, panel.buttonTabs[i]);
                                }
                            }
                        }
                    },
                    remove: function (panel, component) {
                        var btnItemId = component.getItemId() + 'Btn';
                        for (var i = 0; i < panel.items.length; i++) {
                            var comp = panel.items.items[i];
                            if (comp) {
                                var btnComp = comp.down('#' + btnItemId);
                                if (btnComp) {
                                    btnComp.destroy();
                                }
                            }
                        }
                    }
                }
            });
        }

        if (!mapPanel.down('#trackingContainer').down('#' + tabItemId)) {
            var container = mapPanel.down('#trackingContainer');
            container.add({
                xtype: 'cameratracking',
                mapPanel: mapPanel,
                itemId: tabItemId,
                columnHeight: viewAllColumnHeight,
                layout: 'fit',
                title: _t(title),
                scrollable: true,
                canDeleteItem: canDeleteItem != null ? canDeleteItem : true,
                buildHtml: buildHtml,
                buildInterval: buildInterval,
                buildVideoStreamRun: buildVideoStreamRun,
                playerOpts: playerOpts
            });
            if (tabItemId === 'trafficTracking') {
                var trafficTracking = container.down('#trafficTracking');
                if (trafficTracking) {
                    trafficTracking.interval = HTDP.Public.Global.buildTrafficInterval();
                }
            }
            container.setActiveItem(container.items.length - 1);
        }
    },
});