var LeafMapApi;

(function($) {

	LeafMapApi = function(customOptions) {
		
		var map;
		var initialized = false;
		var streetview_layer;
		var satelliteview_layer;
		var cluster;
		var allMarkers = [];
		var bounds = [];
		var myPosition;
		var trackLocID;
		var myMarker = null;
		var $eventHandler = $('<div></div>');
		var Tools = {
			object: {
				extend: function (options, customOptions) {

					// More elaborate for when options has and inner object
					if (typeof customOptions != 'undefined') {
						for (property in customOptions) {
							if (typeof customOptions[property] == 'object') {
								$.extend(options[property], customOptions[property]);
								delete customOptions[property];
							}
						}
						$.extend(options, customOptions);
					}
					return options;
				}
			},
		};

		var attributionPrefix = 'Created by <a href="http://www.unykvis.com" target="_blank">Unykvis</a> | ';

		var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			// attribution: attributionPrefix + 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
			// maxZoom: 17
			attribution: ''
		});

		var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
			// maxZoom: 17,
			// attribution: attributionPrefix + '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
			attribution: ''
		});

		var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
			maxZoom: 18,
			// attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});

		var options = {
			markersData: [],
			mapIdSelector: 'categmap',
			initDelay: 0,
			maxBounds: [],
			leafMapOptions: {
				center: [38.7436883, -9.1952226],
				minZoom: 2,
				zoom: 18,
				maxZoom: 18,
				scrollWheelZoom: true,
				layers: [Esri_WorldImagery, OpenStreetMap_DE],
				dragging: !L.Browser.mobile,
				maxBoundsViscosity: 0.75
			},
			leafMapFlyOptions: {
				padding: [30, 30],
				// maxZoom: 10,
				duration: 1,
				easeLinearity: 0.25,
				animate: true,
			},
			kmlFile: '',
			leafMarkerIcon: {
				className: 'leaflet-default-marker',
				//iconUrl: "pin-shadow.png",
				// html: "<img src='../images/map/pin.png'/>",
				// iconSize: [30, 35],
				// iconAnchor: [15, 35],
				// popupAnchor: [0, -35]
			},
			showMyMarker: true,
			leafMyMarkerIcon: {
				className: 'leaflet-my-marker',
				//iconUrl: "pin-shadow.png",
				// html: "<img src='../images/map/pin.png'/>",
				iconSize: [26, 26],
				iconAnchor: [13, 26],
				popupAnchor: [0, -26]
			},
			clickDirections: false,
			usePopup: false,
			popupLinkDirections: false,
			popupOptions: {
				maxWidth: 300,
				minWidth: 50,
				autoPan: true,
				keepInView: false,
			},
			myMarkerPopupTmpl: function() {
				return `<div class="marker-title">Está Aqui!</div>`;
			},
			markerPopupTmpl: function (markerData) {
				return (
					`<div class="marker-photo">
						<img src="${markerData.photo}" width="77" height="77" />
					</div>
					<a href="${markerData.link}" class="marker-title">${markerData.title}</a>
					<div class="marker-description">${markerData.descp}</div>`
				);
			},
			useClusters: false,
			clusterOptions: {
				showCoverageOnHover: false,
				spiderfyDistanceMultiplier: 1.2,
				disableClusteringAtZoom: 18,
				spiderLegPolylineOptions: {
					weight: 0,
					opacity: 1
				}
			},
			filterFn: function () { }
		};

		function _closePopup(popup) {
			if (typeof popup != 'undefined') {
			}
			map.closePopup(popup);
		}

		function _setFilterFn(filterFn) {
			if (typeof filterFn != 'undefined') {
				options.filterFn = filterFn;
			}
		}

		function _flyToBounds(newBounds) {
			newBounds = newBounds || bounds;
			map.flyToBounds(newBounds, options.leafMapFlyOptions);
		}

		function _gotoMarker(id) {
			var marker;
			for (var i = 0; i < allMarkers.length; i++) {
				// console.log(allMarkers[i].options.id);
				if (allMarkers[i].options.id == id) {
					// console.log('found marker');
					marker = allMarkers[i];
					break;
				}
			}

			if (marker != null) {
				// console.log(marker);
				//map.panTo(marker._latlng, 19);
				map.flyTo(marker._latlng, options.leafMapFlyOptions.maxZoom, options.leafMapFlyOptions);
				//map.setView(marker._latlng);
				//map.setZoom(19);

				marker.openPopup();

				map.once('moveend', function () {
					//map.setMaxBounds(bounds);
				});

				//setPopupInfo(marker);

				return true;
			}
			return false;
		}

		function _showMarkers(markers) {

			if (markers.length) {
				_removeAllMarkersFromMap();

				bounds = [];

				for (var i = 0; i < markers.length; i++) {
					var marker = markers[i];

					if (options.useClusters) {
						cluster.addLayer(marker);
					}
					else {
						marker.addTo(map);
					}

					bounds.push(marker._latlng);
				}

				var boundsCopy = bounds.slice();

				if (myMarker) {
					boundsCopy.push(myMarker._latlng);
				}

				if (options.useClusters) {
					map.addLayer(cluster);
				}

				_flyToBounds(boundsCopy);
			}
		}

		function _removeAllMarkersFromMap() {
			if (options.useClusters) {
				map.removeLayer(cluster);
				cluster = new L.MarkerClusterGroup(options.clusterOptions); //disableClusteringAtZoom: 19
			} else {
				for (var i = 0; i < allMarkers.length; i++) {
					map.removeLayer(allMarkers[i]);
				}
			}
		}

		function _showAllMarkers() {
			_showMarkers(allMarkers);
		}

		function _updateMarkers(newMarkers) {
			_removeAllMarkersFromMap();
			_createMarkers(newMarkers);
		}

		function _filterMarkers(filterFN) {

			// var filtered = allMarkers.filter(function (marker) {
			// 	return options.filterFn(filter, marker);
			// });

			var filtered = allMarkers.filter(filterFN);

			// console.log(filtered);
			_showMarkers(filtered);
		}

		function _getTrajectoryUrl(context) {
			var url = '';
			if (typeof myPosition != 'undefined') {
				url = 'https://www.google.pt/maps/dir/' + myPosition.lat + ',' + myPosition.lng + '/' + context.options.markerData.lat + ',' + context.options.markerData.lng;
			} else {
				url = 'https://maps.google.com/?q=' + context.options.markerData.lat + ',' + context.options.markerData.lng;
			}
			return url;
		}

		function _createMarkers(markers) {

			allMarkers = [];
			bounds = [];

			for (var i = 0; i < markers.length; i++) {

				var markerData = markers[i];
				// console.log(markerData);

				if (!((markerData.lat <= 90 && markerData.lat >= -90) && (markerData.lng <= 180 && markerData.lng >= -180))) {
					continue;
				}
				if (markerData.lat == 0 && markerData.lng == 0) continue;


				var marker = createMarker(markerData);
				$(marker._icon).addClass('pointer');


				marker.on('click', function (event) {

					var thisMarker = this;
					// console.log(thisMarker);

					$eventHandler.trigger('markerClick', [thisMarker]);

					url = _getTrajectoryUrl(thisMarker);

					if (options.clickDirections) {
						var win = window.open(url, '_blank');
						win.focus();
					}

					if (options.usePopup) {

						if (options.popupLinkDirections) {
							thisMarker.options.markerData.link = url;

							var thisPopup = thisMarker.getPopup();
							thisPopup.setContent('<div class="marker-content">' + options.markerPopupTmpl(thisMarker.options.markerData) + '</div>');
						}
					}
				});

				if (options.usePopup) {
					marker.bindPopup('<div class="marker-content">' + options.markerPopupTmpl(markerData) + '</div>', options.popupOptions);

					marker.on('popupclose', function (event) {
						var thisContext = this;
						$eventHandler.trigger('markerPopupClose', [thisContext]);
					});
				}

				if (options.useClusters) {
					cluster.addLayer(marker);
				} else {
					marker.addTo(map);
					// map.addLayer(marker);
				}

				allMarkers.push(marker);
				bounds.push(marker._latlng);
			}

			// ADD CLUSTER LAYER TO MAP
			if (options.useClusters) {
				map.addLayer(cluster);
			}

			if (bounds.length && !options.showMyMarker) {
				// console.log(bounds);

				if (!initialized) {
					setTimeout(function() {
						_flyToBounds(bounds);
					}, options.initDelay);
				} else {
					_flyToBounds(bounds);
				}
			}
		}

		function createMarker(markerData) {

			var markerOptions = {
				id: markerData.id,
				title: markerData.title,
				alt: markerData.alt,
				markerData: markerData,
				riseOnHover: true,
			};

			if (markerData.pinImg) {
				markerOptions.icon = L.divIcon($.extend(options.leafMarkerIcon, {
					html: "<img src='" + markerData.pinImg + "'/>",
				}));
			}

			return L.marker(new L.LatLng(markerData.lat, markerData.lng), markerOptions);
		}

		function createMyMarker(markerData) {

			var markerOptions = {
				icon: L.divIcon($.extend(options.leafMyMarkerIcon, {
					html: '<div class="mymarker"><div class="pin"></div><div class="pin-effect"></div></div>',
				})),
				riseOnHover: true
			};

			var myMarker = L.marker(new L.LatLng(markerData.lat, markerData.lng), markerOptions);
			if (options.usePopup) {
				myMarker.bindPopup('<div class="marker-content">' + options.myMarkerPopupTmpl() + '</div>', options.popupOptions);
				myMarker.on('popupclose', function (event) {
					var thisContext = this;
					$eventHandler.trigger('markerPopupClose', [thisContext]);
				});
			}
			map.addLayer(myMarker);
			return myMarker;
		}

		var geoLocation = (function () {

			var isInit = false;
			var callbackFNs = [];
			var latLng = null;
			var trackLocID;

			var successCB = function(position) {
				// console.log('getCurrentPosition');
				latLng = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				}

				callbackFNs.forEach(function (callbackFN) {
					return callbackFN(latLng);
				});
			}

			var errorCB = function(error) {
				// console.log('geolocation error: ', error);
				latLng = null;
				callbackFNs.forEach(function (callbackFN) {
					return callbackFN(latLng);
				});
			}

			function init() {
				if (!isInit) {
					if (navigator.geolocation) {

						navigator.geolocation.getCurrentPosition(successCB, errorCB);
						trackLocID = navigator.geolocation.watchPosition(successCB, errorCB);

						isInit = true;
					}
				}
			}

			function getCoordinates(newCallback) {

				var found = callbackFNs.find(function(callbackFN) {
					return callbackFN.toString() == newCallback.toString()
				});

				if (!found) {
					callbackFNs.push(newCallback);
				}

				if (!isInit) {
					init();
				} else {
					newCallback(latLng);
				}
			}

			function removeListener(fn) {
				callbackFNs.forEach(function (callbackFN, index) {
					if (callbackFN.toString() == fn.toString()) {
						// console.log('found listener');
						callbackFNs.splice(index, 1);
						// console.log(callbackFNs.length);
					}
				});
			}

			return {
				init: init,
				getCoordinates: getCoordinates,
				removeListener: removeListener
			}
		})();

		function _init(customOptions) {

			options = Tools.object.extend(options, customOptions);

			if (document.getElementById(options.mapIdSelector)) {

				// DETERMINE AND APPLY MAX ZOOM -------------------------------------
				var maxZoom = options.leafMapOptions.maxZoom;
				options.leafMapOptions.layers.forEach(function (tileLayer) {
					maxZoom = tileLayer.options.maxZoom < maxZoom ? tileLayer.options.maxZoom : maxZoom;
				});

				options.leafMapOptions.maxZoom = maxZoom;
				options.leafMapFlyOptions.maxZoom = options.leafMapFlyOptions.maxZoom < maxZoom ? options.leafMapFlyOptions.maxZoom : maxZoom;
				// ------------------------------------------------------------------

				// APPLY MAX BOUNDS TO MAP ------------------------------------------
				if (options.maxBounds.length == 2) {
					options.leafMapOptions.maxBounds = new L.LatLngBounds(
						new L.LatLng(options.maxBounds[0][0], options.maxBounds[0][1]),
						new L.LatLng(options.maxBounds[1][0], options.maxBounds[1][1])
					);
				}
				// ------------------------------------------------------------------


				// SETUP LEAFLET MAP
				// L.mapbox.accessToken = 'pk.eyJ1IjoiZGF2aWRzZXJvZGlvIiwiYSI6ImNqYnFwNjRrZTBpdjUycXBjOG0wMXR5ZmkifQ._Nu3hFZccYO_g9ug81MfSQ';
				// options.leafMapOptions.renderer = L.canvas();

				map = L.map(options.mapIdSelector, options.leafMapOptions);

				// DEFAULT SELECTED LAYER
				map.addLayer(OpenStreetMap_DE);

				$eventHandler.trigger('mapinit');

				L.control.layers({
					"Satellite": Esri_WorldImagery,
					"Mapa": OpenStreetMap_DE,
				}, null, {
					collapsed: true
				}).addTo(map);


				// KML LAYER ---------------------------------------------------------------------------------------------
				if (options.kmlFile) {
					fetch(options.kmlFile)
						.then(res => res.text())
						.then(kmltext => {
							console.log(kmltext);
							// Create new kml overlay
							const parser = new DOMParser();
							const kml = parser.parseFromString(kmltext, 'text/xml');
							const track = new L.KML(kml);
							map.addLayer(track);

							// Adjust map to show the kml
							const bounds = track.getBounds();
							map.fitBounds(bounds);
						});
				}
				// -------------------------------------------------------------------------------------------------------

				// ADD MY MARKER
				if (options.showMyMarker) {

					geoLocation.getCoordinates(function (latLng) {

						// console.log(latLng);
						if (latLng) {
							myPosition = latLng;

							var boundsCopy = bounds.slice();	// copy

							// CREATE MY MARKER
							if (!myMarker) {
								myMarker = createMyMarker(latLng);
								boundsCopy.push(myMarker._latlng);
								_flyToBounds(boundsCopy);

							} else {
								// UPDATE MY MARKER
								var flyToMinDistance = 100;	// meters
								var newPosition = L.latLng(latLng.lat, latLng.lng);
								var diffMetersDistance = myMarker._latlng.distanceTo(newPosition);

								myMarker.setLatLng(latLng);

								if (diffMetersDistance > flyToMinDistance) {
									boundsCopy.push(myMarker._latlng);
									_flyToBounds(boundsCopy);
								}
							}
						}
					});
				}

				// INSERT MARKERS ----------------------------------------------------------------------------------------

				// CLUSTER
				if (options.useClusters) {
					cluster = new L.MarkerClusterGroup(options.clusterOptions); //disableClusteringAtZoom: 19
				}

				// BUILD LEAFLET MARKERS
				_createMarkers(options.markersData);

				initialized = true;
			}
		}

		function _updateMapSize() {
			if (typeof map != 'undefined') {
				// console.log('called ---------------------------');
				map.invalidateSize();
			}
		}

		_init(customOptions);

		this.gotoMarker = _gotoMarker;
		this.filterMarkers = _filterMarkers;
		this.showAllMarkers = _showAllMarkers;
		this.updateMarkers = _updateMarkers;
		this.setFilterFn = _setFilterFn;
		this.closePopup = _closePopup;
		this.flyToBounds = _flyToBounds;
		this.updateMapSize = _updateMapSize;
		this.on = function (eventTrigger, callback) {
			// console.log(arguments);
			$eventHandler.on(eventTrigger, callback);
			// $eventHandler.on(arguments);
			// $eventHandler.on.apply(null, arguments);
			// return this;
		};
	};
})(jQuery);
