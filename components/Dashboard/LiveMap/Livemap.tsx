"use client"

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, LocateFixed, Search, X, Train, MapPin, Clock, Route } from "lucide-react"
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';

interface TrainData {
    current_day: number;
    current_lat: number;
    current_lng: number;
    current_station: string;
    current_station_name: string;
    days_ago: number;
    departure_minutes: number;
    curr_distance: number;
    halt_mins: number;
    mins_since_dep: number;
    next_arrival_minutes: number;
    next_day: number;
    next_distance: number;
    next_lat: number;
    next_lng: number;
    next_station: string;
    next_station_name: string;
    train_name: string;
    train_number: string;
    type: string;
}

interface ApiResponse {
    success: boolean;
    data: TrainData[];
}

const Livemap = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [trains, setTrains] = useState<TrainData[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [currentTrain, setCurrentTrain] = useState<TrainData | null>(null);
    const isInitialLoad = useRef(true);

    // Calculate bearing between two coordinates
    const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
        const bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    };

    // Convert trains to GeoJSON with bearing calculation
    const trainsToGeoJSON = (records: TrainData[]): GeoJSON.FeatureCollection => {
        return {
            type: 'FeatureCollection',
            features: records
                .filter(train => 
                    train.current_lat && 
                    train.current_lng && 
                    typeof train.current_lat === 'number' &&
                    typeof train.current_lng === 'number' &&
                    !isNaN(train.current_lat) &&
                    !isNaN(train.current_lng)
                )
                .map(train => {
                    let bearing = 0;
                    if (train.next_lat && train.next_lng &&
                        typeof train.next_lat === 'number' && 
                        typeof train.next_lng === 'number' &&
                        !isNaN(train.next_lat) && 
                        !isNaN(train.next_lng)) {
                        bearing = calculateBearing(
                            train.current_lat,
                            train.current_lng,
                            train.next_lat,
                            train.next_lng
                        );
                    }

                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [train.current_lng, train.current_lat]
                        },
                        properties: {
                            ...train,
                            bearing: bearing,
                            highlighted: searchQuery.length === 5 && train.train_number === searchQuery
                        }
                    } as GeoJSON.Feature;
                })
        };
    };

    // Filter trains based on search
    const filteredTrains = trains.filter(train => {
        if (searchQuery === '' || searchQuery.length !== 5 || !/^\d{5}$/.test(searchQuery)) {
            return false;
        }
        return train.train_number === searchQuery;
    });

    // Fetch train data
    const fetchTrainData = async (isBackground = false) => {
        try {
            if (isInitialLoad.current && !isBackground) {
                setLoading(true);
            } else {
                setBackgroundLoading(true);
            }

            const response = await fetch('https://railradar.in/api/v1/trains/live-map', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': "rri_eyJleHAiOjE3NTk4OTkwMTcwODIsImlhdCI6MTc1OTgxMjYxNzA4MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiQVJCcFM3dzhYazZFIn0=_NDA1YmZjZTA5YWJmN2U0ZDVmNTVjN2UzZWVmNDM2NDdhMDM3YzNhOTkxNzMyYTEzODAzOWY2YjNlNzM1YzU3YQ==",
                    "Referer": "https://railradar.in/",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            if (data.success && data.data) {
                setTrains(data.data);
                console.log(`Loaded ${data.data.length} trains`);
            }
        } catch (error) {
            console.error('Error fetching train data:', error);
        } finally {
            setLoading(false);
            setBackgroundLoading(false);
            isInitialLoad.current = false;
        }
    };

    // Helper functions for train info panel
    const formatNumber = (value: unknown, fractionDigits: number = 1): string => {
        if (typeof value === 'number' && isFinite(value)) {
            return value.toFixed(fractionDigits);
        }
        const parsed = typeof value === 'string' ? Number(value) : NaN;
        return isFinite(parsed) ? parsed.toFixed(fractionDigits) : '—';
    };

    const getMinutesElapsedLabel = (minutes: unknown): string => {
        if (typeof minutes === 'number' && isFinite(minutes)) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
        return 'N/A';
    };

    const getDistanceToNextKm = (train: TrainData): string => {
        const next = train.next_distance;
        const from = train.curr_distance;
        if (typeof next === 'number' && isFinite(next) && typeof from === 'number' && isFinite(from)) {
            return (next - from).toFixed(1);
        }
        return '—';
    };

    const formatMinutesAsClock = (minutes: unknown): string => {
        const mins = typeof minutes === 'number' ? minutes : Number(minutes);
        if (!isFinite(mins)) return 'N/A';
        const normalized = ((mins % 1440) + 1440) % 1440;
        const hours = Math.floor(normalized / 60);
        const remainder = Math.floor(normalized % 60);
        const hh = String(hours).padStart(2, '0');
        const mm = String(remainder).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    // Create train icon images
    const createTrainIcon = (color: string, strokeColor: string, size: number = 32) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        // Draw arrow pointing up (will be rotated by map)
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(size / 2, 2);
        ctx.lineTo(size - 6, size - 2);
        ctx.lineTo(size / 2, size - 8);
        ctx.lineTo(6, size - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        return canvas;
    };

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

        if (!mapboxgl.accessToken) {
            console.error('Mapbox access token not found');
            setLoading(false);
            return;
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [78.9629, 20.5937],
            zoom: 4
        });

        map.current.on('load', () => {
            if (!map.current) return;

            // Add train icons
            const icons = [
                { id: 'train-default', color: '#7ce4f2', stroke: '#002459' },
                { id: 'train-premium', color: '#FF0000', stroke: '#8B0000' },
                { id: 'train-memu', color: '#A9A9A9', stroke: '#696969' },
                { id: 'train-highlighted', color: '#FFD700', stroke: '#FF4500' }
            ];

            icons.forEach(icon => {
                const canvas = createTrainIcon(icon.color, icon.stroke);
                map.current!.addImage(icon.id, canvas as any);
            });

            // Add GeoJSON source
            map.current.addSource('trains', {
                type: 'geojson',
                data: trainsToGeoJSON(trains),
                cluster: true,
                clusterMaxZoom: 10,
                clusterRadius: 50
            });

            // Cluster circles
            map.current.addLayer({
                id: 'trains-clusters',
                type: 'circle',
                source: 'trains',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#0090ff',
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20, 100,
                        30, 750,
                        40
                    ],
                    'circle-opacity': 0.7,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            // Cluster count
            map.current.addLayer({
                id: 'trains-cluster-count',
                type: 'symbol',
                source: 'trains',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 14
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });

            // Individual train symbols
            map.current.addLayer({
                id: 'trains-symbols',
                type: 'symbol',
                source: 'trains',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': [
                        'case',
                        ['boolean', ['get', 'highlighted'], false],
                        'train-highlighted',
                        [
                            'match',
                            ['get', 'type'],
                            ['MEMU'],
                            'train-memu',
                            ['Vande Bharat', 'Rajdhani', 'Tejas', 'Shatabdi', 'Jan Shatabdi', 'Duronto', 'Humsafar', 'Garib Rath', 'Sampark Kranti', 'Double Decker', 'Amrit Bharat'],
                            'train-premium',
                            'train-default'
                        ]
                    ],
                    'icon-size': [
                        'case',
                        ['boolean', ['get', 'highlighted'], false],
                        1.5,
                        0.8
                    ],
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': false
                }
            });

            // Hover popup
            map.current.on('mouseenter', 'trains-symbols', (e) => {
                if (!map.current) return;
                map.current.getCanvas().style.cursor = 'pointer';
                
                const feature = e.features?.[0];
                if (feature && feature.properties) {
                    const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
                    
                    if (popupRef.current) {
                        popupRef.current.remove();
                    }
                    
                    popupRef.current = new mapboxgl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 15
                    })
                        .setLngLat(coordinates)
                        .setHTML(`
                            <div style="padding: 4px 8px;">
                                <p style="margin: 0; font-weight: bold;">${feature.properties.train_number} - ${feature.properties.train_name}</p>
                            </div>
                        `)
                        .addTo(map.current!);
                }
            });

            map.current.on('mouseleave', 'trains-symbols', () => {
                if (!map.current) return;
                map.current.getCanvas().style.cursor = '';
                if (popupRef.current) {
                    popupRef.current.remove();
                }
            });

            // Click to select train
            map.current.on('click', 'trains-symbols', (e) => {
                const feature = e.features?.[0];
                if (feature && feature.properties) {
                    const found = trains.find(t => 
                        t.train_number === feature.properties!.train_number && 
                        t.current_day === feature.properties!.current_day
                    );
                    setCurrentTrain(found || null);
                }
            });

            // Zoom into clusters on click
            map.current.on('click', 'trains-clusters', (e) => {
                if (!map.current) return;
                const features = map.current.queryRenderedFeatures(e.point, {
                    layers: ['trains-clusters']
                });
                const clusterId = features[0].properties!.cluster_id;
                const source = map.current.getSource('trains') as mapboxgl.GeoJSONSource;
                
                source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err || !map.current) return;
                    map.current.easeTo({
                        center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
                        zoom: zoom
                    });
                });
            });

            map.current.on('mouseenter', 'trains-clusters', () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });

            map.current.on('mouseleave', 'trains-clusters', () => {
                if (map.current) map.current.getCanvas().style.cursor = '';
            });
        });

        // Resize handler
        const handleResize = () => {
            if (map.current) {
                map.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (popupRef.current) popupRef.current.remove();
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update GeoJSON source when trains change
    useEffect(() => {
        if (map.current && map.current.getSource('trains')) {
            const source = map.current.getSource('trains') as mapboxgl.GeoJSONSource;
            source.setData(trainsToGeoJSON(trains));
        }
    }, [trains, searchQuery]);

    // Keep selected train in sync with refreshed data
    useEffect(() => {
        if (!currentTrain) return;
        const updatedTrain = trains.find(t => 
            t.train_number === currentTrain.train_number && 
            t.current_day === currentTrain.current_day
        );
        if (updatedTrain) {
            setCurrentTrain(updatedTrain);
        } else {
            setCurrentTrain(null);
        }
    }, [trains]);

    // Fetch data on mount and set up auto-refresh
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTrainData();
            const interval = setInterval(() => {
                fetchTrainData(true);
            }, 30000);
            return () => clearInterval(interval);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Search + map fit/zoom logic
    useEffect(() => {
        if (!map.current || filteredTrains.length === 0 || searchQuery.length !== 5) return;

        const validTrains = filteredTrains.filter(train =>
            train.current_lat && train.current_lng &&
            typeof train.current_lat === 'number' &&
            typeof train.current_lng === 'number' &&
            !isNaN(train.current_lat) &&
            !isNaN(train.current_lng)
        );

        if (validTrains.length === 1) {
            const train = validTrains[0];
            map.current.flyTo({
                center: [train.current_lng, train.current_lat],
                zoom: 12,
                duration: 1500
            });
        } else if (validTrains.length > 1) {
            const coordinates = validTrains.map(train => [train.current_lng, train.current_lat] as [number, number]);
            const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
            coordinates.forEach(coord => bounds.extend(coord));

            map.current.fitBounds(bounds, {
                padding: { top: 50, bottom: 200, left: 100, right: 400 },
                duration: 1500,
                maxZoom: 15
            });
        }
    }, [filteredTrains, searchQuery]);

    return (
        <div className="relative w-full h-[calc(100vh-4rem)]">
            {/* Map container */}
            <div ref={mapContainer} className="h-full" />

            <div className="absolute top-4 left-4 z-10 gap-4 flex flex-col">
                <button
                    onClick={() => fetchTrainData(true)}
                    disabled={backgroundLoading}
                    className="flex-1 px-3 py-2 bg-white text-blue-500 rounded-lg hover:text-blue-700 text-sm cursor-pointer shadow-lg"
                    title="Refresh Data"
                >
                    <RefreshCw className={backgroundLoading ? "animate-spin" : ""} />
                </button>

                <button
                    onClick={() => {
                        if (map.current) {
                            map.current.flyTo({
                                center: [78.9629, 20.5937],
                                zoom: 4,
                                duration: 1500
                            });
                        }
                    }}
                    className="flex-1 px-3 py-2 bg-white text-blue-500 rounded-lg hover:text-blue-700 text-sm cursor-pointer shadow-lg"
                    title="Reset map view"
                >
                    <LocateFixed />
                </button>
            </div>

            {/* Search panel */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Live Trains</h3>
                    {backgroundLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                </div>
                <div className="flex flex-row justify-center items-center gap-2">
                    <input
                        type="text"
                        placeholder="Enter 5-digit train number..."
                        value={inputValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,5}$/.test(value)) {
                                setInputValue(value);
                            }
                        }}
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        className="p-2 bg-blue-400 text-white rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-blue-600"
                        onClick={() => setSearchQuery(inputValue)}
                    >
                        <Search />
                    </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    {searchQuery.length === 5 ?
                        `Found ${filteredTrains.length} train(s) for ${searchQuery}` :
                        searchQuery.length > 0 ?
                            `Enter ${5 - searchQuery.length} more digit(s)` :
                            `Total ${trains.length} trains loaded`
                    }
                </div>

                {/* Train Info Panel */}
                {currentTrain && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Train className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Train Details</h3>
                            </div>
                            <button
                                onClick={() => setCurrentTrain(null)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                title="Close train details"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Train Name & Number with Type Tag */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                                <div className="flex flex-col gap-2">
                                    <div className="w-full flex flex-row justify-between text-center items-center">
                                        <div className="text-sm text-blue-700 font-medium">#{currentTrain.train_number}</div>
                                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                                            {currentTrain.type}
                                        </span>
                                    </div>
                                    <div className="font-semibold text-blue-900">{currentTrain.train_name}</div>
                                </div>
                            </div>

                            {/* Journey Progress from Source */}
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Route className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                        <div className="text-sm font-semibold text-purple-900">From Source</div>
                                    </div>
                                    <Link href={`/dashboard/train?train=${currentTrain.train_number}`} className="cursor-pointer">
                                        <button className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition duration-300 shadow-sm cursor-pointer">
                                            View Schedule
                                        </button>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                    <div className="bg-white/60 p-2 rounded">
                                        <div className="text-purple-600 font-medium w-full">Distance</div>
                                        <div className="text-purple-900 font-semibold">{formatNumber(currentTrain.curr_distance, 1)} km</div>
                                    </div>
                                    <div className="bg-white/60 p-2 rounded">
                                        <div className="text-purple-600 font-medium w-full">Duration</div>
                                        <div className="text-purple-900 font-semibold">{getMinutesElapsedLabel(currentTrain.mins_since_dep)}</div>
                                    </div>
                                    <div className="bg-white/60 p-2 rounded">
                                        <div className="text-purple-600 font-medium w-full">Day</div>
                                        <div className="text-purple-900 font-semibold">{typeof currentTrain.current_day === 'number' ? currentTrain.current_day : '—'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Current & Next Station */}
                            <div className="bg-gradient-to-r from-green-50 to-orange-50 p-3 rounded-lg border border-gray-200">
                                <div className="mb-3 pb-3 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <div className="text-xs font-semibold text-green-700">CROSSED STATION</div>
                                    </div>
                                    <div className="ml-6">
                                        <div className="text-sm font-semibold text-gray-900">{currentTrain.current_station_name}</div>
                                        <div className="text-xs text-gray-600 font-mono">{currentTrain.current_station}</div>
                                        <div className="mt-1 text-xs text-green-700">
                                            Crossed at: <span className="font-semibold">{formatMinutesAsClock(currentTrain.departure_minutes)}</span>
                                        </div>
                                        {typeof currentTrain.halt_mins === 'number' && currentTrain.halt_mins > 0 && (
                                            <div className="mt-1 text-xs text-green-700">
                                                Halt: <span className="font-semibold">{currentTrain.halt_mins} mins</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                        <div className="text-xs font-semibold text-orange-700">NEXT STATION</div>
                                    </div>
                                    <div className="ml-6">
                                        <div className="text-sm font-semibold text-gray-900">{currentTrain.next_station_name}</div>
                                        <div className="text-xs text-gray-600 font-mono">{currentTrain.next_station}</div>
                                        <div className="mt-1 flex items-center gap-3 text-xs">
                                            <div className="text-gray-600">
                                                Distance: <span className="font-semibold">{getDistanceToNextKm(currentTrain)} km</span>
                                            </div>
                                            <div className="text-gray-600">
                                                ETA: <span className="font-semibold">{formatMinutesAsClock(currentTrain.next_arrival_minutes)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading indicator */}
            {loading && isInitialLoad.current && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="bg-white p-4 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <div className="mt-2 text-sm">Loading trains...</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Livemap;
