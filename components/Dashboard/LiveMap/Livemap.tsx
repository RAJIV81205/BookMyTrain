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
    curr_distance: number; // updated field name from API
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
    const highlightMarkers = useRef<mapboxgl.Marker[]>([]); // Only for highlighted trains
    const [trains, setTrains] = useState<TrainData[]>([]);
    const trainsRef = useRef<TrainData[]>([]); // Keep ref for event handlers
    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [currentTrain, setCurrentTrain] = useState<TrainData | null>(null);
    const isInitialLoad = useRef(true);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hoveredTrainId = useRef<string | null>(null);

    // Filter trains based on search - only filter if search query is exactly 5 digits
    const filteredTrains = trains.filter(train => {
        // Only filter if search query is exactly 5 digits (train number)
        if (searchQuery === '' || searchQuery.length !== 5 || !/^\d{5}$/.test(searchQuery)) {
            return false; // Don't show any filtered results for incomplete searches
        }
        return train.train_number === searchQuery;
    });

    // Initialize map with GeoJSON layers
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

        if (!mapboxgl.accessToken) {
            console.error('Mapbox access token not found');
            setLoading(false);
            return;
        }

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [78.9629, 20.5937],
                zoom: 4
            });

            map.current.on('load', () => {
                console.log('Map loaded successfully');

                // Add GeoJSON source for all trains
                map.current!.addSource('trains', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    },
                    cluster: false
                });

                // Add layer for MEMU trains (gray) - first priority
                map.current!.addLayer({
                    id: 'trains-memu',
                    type: 'symbol',
                    source: 'trains',
                    filter: ['==', ['get', 'isMEMU'], true],
                    layout: {
                        'icon-image': 'train-memu',
                        'icon-size': 0.5,
                        'icon-rotate': ['get', 'bearing'],
                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    }
                });

                // Add layer for premium trains (red) - second priority
                map.current!.addLayer({
                    id: 'trains-premium',
                    type: 'symbol',
                    source: 'trains',
                    filter: ['all', ['==', ['get', 'isPremium'], true], ['!=', ['get', 'isMEMU'], true]],
                    layout: {
                        'icon-image': 'train-premium',
                        'icon-size': 0.5,
                        'icon-rotate': ['get', 'bearing'],
                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    }
                });

                // Add layer for default trains (cyan) - last priority
                map.current!.addLayer({
                    id: 'trains-default',
                    type: 'symbol',
                    source: 'trains',
                    filter: ['all', ['!=', ['get', 'isPremium'], true], ['!=', ['get', 'isMEMU'], true]],
                    layout: {
                        'icon-image': 'train-default',
                        'icon-size': 0.5,
                        'icon-rotate': ['get', 'bearing'],
                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    }
                });

                // Create train icons
                createTrainIcons();

                // Add hover and click interactions
                setupMapInteractions();
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            setLoading(false);
        }

        return () => {
            highlightMarkers.current.forEach(marker => marker.remove());
            highlightMarkers.current = [];

            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Fetch train data
    const fetchTrainData = async (isBackground = false) => {
        try {
            // Only show full loading screen on initial load
            if (isInitialLoad.current && !isBackground) {
                setLoading(true);
            } else {
                // All other refreshes are background
                setBackgroundLoading(true);
            }

            const response = await fetch('https://railradar.in/api/v1/trains/live-map', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': "rri_eyJleHAiOjE3NTk5OTk4MTg5ODUsImlhdCI6MTc1OTkxMzQxODk4NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiQ0s2cEZQSFlzR0l2In0=_YjkyYmY1NmRlMmU1ZDY3MjI0MWVkYTU0ZDk0MGQ5NDJhODdmYTJhOTJkMWEzNjEwNjY3YzM3ODdhZTUxNTQ1NQ==",
                    "Referer": "https://railradar.in/",


                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            if (data.success && data.data) {
                setTrains(data.data);
                trainsRef.current = data.data; // Keep ref updated
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

    // Safe number formatting helpers to avoid runtime errors when API fields are missing
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



    // Keep selected train in sync with refreshed data
    useEffect(() => {
        if (!currentTrain) return;
        const updatedTrain = trains.find(t => t.train_number === currentTrain.train_number && t.current_day === currentTrain.current_day);
        if (updatedTrain) {
            // Replace with latest data to reflect live updates
            setCurrentTrain(updatedTrain);
        } else {
            // Clear selection if the train is no longer present in feed
            setCurrentTrain(null);
        }
    }, [trains]);

    // Convert minutes since midnight to HH:MM (24h) clock label
    const formatMinutesAsClock = (minutes: unknown): string => {
        const mins = typeof minutes === 'number' ? minutes : Number(minutes);
        if (!isFinite(mins)) return 'N/A';
        const normalized = ((mins % 1440) + 1440) % 1440; // wrap around
        const hours = Math.floor(normalized / 60);
        const remainder = Math.floor(normalized % 60);
        const hh = String(hours).padStart(2, '0');
        const mm = String(remainder).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    // Calculate bearing between two coordinates
    const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;

        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

        const bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360; // Normalize to 0-360 degrees
    };

    // Create train icon images for the map
    const createTrainIcons = () => {
        if (!map.current) return;

        const createIcon = (fillColor: string, strokeColor: string, strokeWidth: number, name: string) => {
            const svgString = `
                <svg height="32" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.998 511.998">
                    <path fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"
                        d="M370.758,122.728v389.27L261.384,388.412c-3.178-2.436-7.592-2.436-10.77,0L141.24,511.998v-389.27
                        L250.614,1.834c3.178-2.445,7.592-2.445,10.77,0L370.758,122.728z"/>
                </svg>
            `;

            const img = new Image(32, 32);
            img.onload = () => {
                if (!map.current!.hasImage(name)) {
                    map.current!.addImage(name, img);
                }
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        };

        // Default train (cyan)
        createIcon('#7ce4f2', '#002459', 10, 'train-default');

        // Premium train (red)
        createIcon('#FF0000', '#8B0000', 12, 'train-premium');

        // MEMU train (gray)
        createIcon('#A9A9A9', '#696969', 10, 'train-memu');
    };

    // Setup map interactions (hover, click)
    const setupMapInteractions = () => {
        if (!map.current) return;

        const layers = ['trains-default', 'trains-premium', 'trains-memu'];
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        layers.forEach(layerId => {
            // Change cursor on hover
            map.current!.on('mouseenter', layerId, () => {
                map.current!.getCanvas().style.cursor = 'pointer';
            });

            map.current!.on('mouseleave', layerId, () => {
                map.current!.getCanvas().style.cursor = '';
                hoveredTrainId.current = null;
                popup.remove();
            });

            // Show popup on hover
            map.current!.on('mousemove', layerId, (e) => {
                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];
                    const props = feature.properties;

                    if (props && hoveredTrainId.current !== props.train_number) {
                        hoveredTrainId.current = props.train_number;

                        popup
                            .setLngLat(e.lngLat)
                            .setHTML(`
                                <div>
                                    <p>${props.train_number} - ${props.train_name}</p>
                                </div>
                            `)
                            .addTo(map.current!);
                    }
                }
            });

            // Handle click to show train details
            map.current!.on('click', layerId, (e) => {
                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];
                    const props = feature.properties;

                    if (props) {
                        const train = trainsRef.current.find(t =>
                            t.train_number === props.train_number &&
                            t.current_day === props.current_day
                        );
                        if (train) {
                            setCurrentTrain(train);
                        }
                    }
                }
            });
        });
    };

    // Create highlighted marker element (only for search results)
    const createHighlightedMarker = (train: TrainData) => {
        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        let rotation = 0;
        if (train.next_lat && train.next_lng &&
            typeof train.next_lat === 'number' && typeof train.next_lng === 'number' &&
            !isNaN(train.next_lat) && !isNaN(train.next_lng)) {
            rotation = calculateBearing(
                train.current_lat,
                train.current_lng,
                train.next_lat,
                train.next_lng
            );
        }

        const svgStyle = `transform: rotate(${rotation}deg) scale(1.2); filter: drop-shadow(0 0 8px rgba(255, 215, 0, 1)) drop-shadow(0 0 12px rgba(255, 69, 0, 0.6)); transition: all 0.3s ease;`;

        el.innerHTML = `
            <svg height="32px" width="32px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.998 511.998" style="${svgStyle}">
                <path fill="#FFD700" stroke="#FF4500" stroke-width="15"
                    d="M370.758,122.728v389.27L261.384,388.412c-3.178-2.436-7.592-2.436-10.77,0L141.24,511.998v-389.27
                    L250.614,1.834c3.178-2.445,7.592-2.445,10.77,0L370.758,122.728z"/>
            </svg>
        `;

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        }).setHTML(`<div><p>${train.train_number} - ${train.train_name}</p></div>`);

        el.addEventListener('mouseenter', () => {
            popup.setLngLat([train.current_lng, train.current_lat]).addTo(map.current!);
        });

        el.addEventListener('click', () => {
            setCurrentTrain(train);
        });

        return el;
    };

    // Convert trains to GeoJSON
    const trainsToGeoJSON = (trainData: TrainData[]) => {
        const premiumTrains = [
            "Vande Bharat", "Rajdhani", "Tejas", "Shatabdi", "Jan Shatabdi",
            "Duronto", "Humsafar", "Garib Rath", "Sampark Kranti", "Double Decker", "Amrit Bharat"
        ];

        const features = trainData
            .filter(train =>
                train.current_lat && train.current_lng &&
                typeof train.current_lat === 'number' &&
                typeof train.current_lng === 'number' &&
                !isNaN(train.current_lat) &&
                !isNaN(train.current_lng)
            )
            .map(train => {
                let bearing = 0;
                if (train.next_lat && train.next_lng &&
                    typeof train.next_lat === 'number' && typeof train.next_lng === 'number' &&
                    !isNaN(train.next_lat) && !isNaN(train.next_lng)) {
                    bearing = calculateBearing(
                        train.current_lat,
                        train.current_lng,
                        train.next_lat,
                        train.next_lng
                    );
                }

                const isMEMU = train.type === "MEMU";
                const isPremium = premiumTrains.includes(train.type);

                return {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [train.current_lng, train.current_lat]
                    },
                    properties: {
                        train_number: train.train_number,
                        train_name: train.train_name,
                        current_day: train.current_day,
                        bearing: bearing,
                        isPremium: isPremium,
                        isMEMU: isMEMU
                    }
                };
            });

        return {
            type: 'FeatureCollection' as const,
            features
        };
    };

    // Update GeoJSON data and highlighted markers
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const source = map.current.getSource('trains') as mapboxgl.GeoJSONSource;
        if (source) {
            // Update GeoJSON with all trains
            source.setData(trainsToGeoJSON(trains));
        }

        // Clear existing highlight markers
        highlightMarkers.current.forEach(marker => marker.remove());
        highlightMarkers.current = [];

        // Add highlight markers only for filtered trains
        if (filteredTrains.length >= 1 && filteredTrains.length <= 10 && searchQuery.length === 5) {
            const validTrains = filteredTrains.filter(train =>
                train.current_lat && train.current_lng &&
                typeof train.current_lat === 'number' &&
                typeof train.current_lng === 'number' &&
                !isNaN(train.current_lat) &&
                !isNaN(train.current_lng)
            );

            validTrains.forEach(train => {
                const el = createHighlightedMarker(train);
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([train.current_lng, train.current_lat])
                    .addTo(map.current!);
                highlightMarkers.current.push(marker);
            });

            // Handle camera positioning
            if (validTrains.length === 1) {
                const train = validTrains[0];
                map.current!.flyTo({
                    center: [train.current_lng, train.current_lat],
                    zoom: 12,
                    duration: 1500
                });
            } else if (validTrains.length > 1) {
                const coordinates = validTrains.map(train => [train.current_lng, train.current_lat]);
                const lngs = coordinates.map(coord => coord[0]);
                const lats = coordinates.map(coord => coord[1]);

                const bounds = new mapboxgl.LngLatBounds(
                    [Math.min(...lngs), Math.min(...lats)],
                    [Math.max(...lngs), Math.max(...lats)]
                );

                map.current!.fitBounds(bounds, {
                    padding: { top: 50, bottom: 200, left: 100, right: 400 },
                    duration: 1500,
                    maxZoom: 15
                });
            }
        }
    }, [trains, filteredTrains, searchQuery]);



    // Handle map resize when sidebar changes
    useEffect(() => {
        const handleResize = () => {
            if (map.current) {
                // Clear any existing timeout
                if (resizeTimeoutRef.current) {
                    clearTimeout(resizeTimeoutRef.current);
                }

                // Debounce the resize to avoid excessive calls
                resizeTimeoutRef.current = setTimeout(() => {
                    map.current?.resize();
                }, 150);
            }
        };

        // Listen for window resize events (which includes sidebar changes)
        window.addEventListener('resize', handleResize);

        // Also trigger resize after delays to handle initial sidebar state and transitions
        const initialResizeTimer = setTimeout(handleResize, 200);
        const secondaryResizeTimer = setTimeout(handleResize, 500);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(initialResizeTimer);
            clearTimeout(secondaryResizeTimer);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, []);

    // Fetch data on mount and set up auto-refresh
    useEffect(() => {
        let interval: any;
        const timer = setTimeout(() => {
            if (map.current) {
                // Initial load
                fetchTrainData();

                // Background refresh every 30 seconds
                interval = setInterval(() => {
                    fetchTrainData(true);
                }, 30000);
            }
        }, 100); // Small delay to ensure map is ready

        return () => {
            clearTimeout(timer);
            if (interval) clearInterval(interval);
        };
    }, []);


    return (
        <div className="relative w-full h-[calc(100vh-4rem)]">
            {/* Map container */}
            <div ref={mapContainer} className=" h-full" />

            <div className="absolute top-4 left-4 z-10 gap-4 flex flex-col">
                <button
                    onClick={() => fetchTrainData(true)} // Always use background refresh for manual refresh
                    disabled={backgroundLoading}
                    className="flex-1 px-3 py-2 bg-white text-blue-500 rounded-lg hover:text-blue-700 text-sm cursor-pointer"
                    title="Refresh Data"
                >
                    <RefreshCw
                        className={backgroundLoading ? "animate-spin" : ""}
                    />
                </button>

                <button
                    onClick={() => {
                        if (map.current) {
                            map.current.flyTo({
                                center: [78.9629, 20.5937], // Center of India
                                zoom: 4,
                                duration: 1500
                            });
                        }
                    }}
                    className="flex-1 px-3 py-2 bg-white text-blue-500 rounded-lg hover:text-blue-700 text-sm cursor-pointer"
                    title="Reset map view"
                >
                    <LocateFixed />
                </button>


            </div>

            {/* Search panel */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10">
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
                            // Only allow digits and limit to 5 characters
                            if (/^\d{0,5}$/.test(value)) {
                                setInputValue(value);
                            }
                        }}
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        className="p-2 bg-blue-400 text-white rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-blue-600 "
                        onClick={() => setSearchQuery(inputValue)} // update only on button click
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
                                    <div className=" w-full flex flex-row justify-between text-center items-center">
                                        <div className="text-sm text-blue-700 font-medium">#{currentTrain.train_number}</div>
                                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                                            {currentTrain.type}
                                        </span>
                                    </div>
                                    <div className="font-semibold text-blue-900">{currentTrain.train_name}
                                    </div>

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
                                {/* Crossed Station (previous) */}
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

                                {/* Next Station */}
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



            {/* Loading indicator - only show on initial load */}
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
