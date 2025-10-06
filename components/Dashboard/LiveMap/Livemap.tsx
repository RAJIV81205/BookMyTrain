"use client"

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, LocateFixed, Search, X, Train, MapPin, Clock, Route } from "lucide-react"
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';


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
    const markers = useRef<mapboxgl.Marker[]>([]);
    const activePopups = useRef<mapboxgl.Popup[]>([]);
    const [trains, setTrains] = useState<TrainData[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [currentTrain, setCurrentTrain] = useState<TrainData | null>(null);
    const isInitialLoad = useRef(true);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Filter trains based on search - only filter if search query is exactly 5 digits
    const filteredTrains = trains.filter(train => {
        // Only filter if search query is exactly 5 digits (train number)
        if (searchQuery === '' || searchQuery.length !== 5 || !/^\d{5}$/.test(searchQuery)) {
            return false; // Don't show any filtered results for incomplete searches
        }
        return train.train_number === searchQuery;
    });

    // Initialize map
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
                style: 'mapbox://styles/mapbox/streets-v12', // Satellite imagery with labels
                center: [78.9629, 20.5937], // Center of India
                zoom: 4
            });


            map.current.on('load', () => {
                console.log('Map loaded successfully');
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            setLoading(false);
        }

        return () => {
            // Clean up popups
            clearAllPopups();
            
            // Clean up markers
            markers.current.forEach(marker => marker.remove());
            markers.current = [];

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
                    'X-Api-Key': "         rri_eyJleHAiOjE3NTk3NTkxODY5ODEsImlhdCI6MTc1OTY3Mjc4Njk4MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoidjlIRUsxS2FLTlBkIn0=_MWRlMmNlNjYwZjljYjY3YTBmMDZkZmEwZmYzYjJmYWZhZjQ4NjBiNjg5NWY2NDFkNzZmZTgxNmQxZGJjMmE4Yg==",
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

    // Clear all active popups
    const clearAllPopups = () => {
        activePopups.current.forEach(popup => {
            if (popup.isOpen()) {
                popup.remove();
            }
        });
        activePopups.current = [];
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

    // Create marker element
    const createMarkerElement = (train: TrainData, isHighlighted: boolean = false) => {
        const el = document.createElement('div');
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.background = 'none'; // Remove background if using SVG

        // Calculate rotation based on train direction
        let rotation = 0;
        if (train.next_lat && train.next_lng &&
            typeof train.next_lat === 'number' && typeof train.next_lng === 'number' &&
            !isNaN(train.next_lat) && !isNaN(train.next_lng)) {

            const bearing = calculateBearing(
                train.current_lat,
                train.current_lng,
                train.next_lat,
                train.next_lng
            );
            rotation = bearing;
        }

        // Define premium trains
        const premiumTrains = [
            "Vande Bharat",
            "Rajdhani",
            "Tejas",
            "Shatabdi",
            "Jan Shatabdi",
            "Duronto",
            "Humsafar",
            "Garib Rath",
            "Sampark Kranti",
            "Double Decker",
            "Amrit Bharat"
        ];

        let fillColor: string;
        let strokeColor: string;
        let strokeWidth: string;

        // Special case: MEMU trains -> gray
        if (train.type === "MEMU") {
            fillColor = "#A9A9A9";   // Gray fill
            strokeColor = "#696969"; // Dark gray border
            strokeWidth = "10";

            // Premium trains -> red
        } else if (premiumTrains.includes(train.type)) {
            fillColor = "#FF0000";   // Red fill
            strokeColor = "#8B0000"; // Darker red border
            strokeWidth = "12";

            // Default highlighting logic
        } else {
            fillColor = isHighlighted && searchQuery.length == 5 ? "#FFD700" : "#7ce4f2";
            strokeColor = isHighlighted && searchQuery.length == 5 ? "#FF4500" : "#002459";
            strokeWidth = isHighlighted && searchQuery.length == 5 ? "15" : "10";
        }


        // Build the SVG style with rotation and highlighting effects
        let svgStyle = `transform: rotate(${rotation}deg); transition: all 0.3s ease;`;

        if (isHighlighted && searchQuery.length == 5) {
            svgStyle += ` filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1)) drop-shadow(0 0 20px rgba(255, 69, 0, 0.6)); transform: rotate(${rotation}deg) scale(2);`;
        }

        // Insert your SVG with rotation and highlighting
        el.innerHTML = `
                      <svg height="32px" width="32px" version="1.1" id="Layer_1" 
                   xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
               viewBox="0 0 511.998 511.998" xml:space="preserve" 
              style="${svgStyle}">
                  <g>
               <path fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"
                    d="M370.758,122.728v389.27L261.384,388.412c-3.178-2.436-7.592-2.436-10.77,0L141.24,511.998v-389.27
             L250.614,1.834c3.178-2.445,7.592-2.445,10.77,0L370.758,122.728z"/>
                </g>
            </svg>

    `;
        // Create the popup instance outside the event handlers so it can be reused
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        }).setHTML(`
        <div>
            <p>${train.train_number} - ${train.train_name}</p>
        </div>
    `);

        // Show popup on hover
        el.addEventListener('mouseenter', () => {
            // Clear any existing popups before showing new one
            clearAllPopups();
            popup.setLngLat([train.current_lng, train.current_lat]).addTo(map.current!);
            activePopups.current.push(popup);
        });

        // Hide popup when not hovering (only if not highlighted)
        el.addEventListener('mouseleave', () => {
            if (!isHighlighted || searchQuery.length !== 5) {
                popup.remove();
                // Remove from active popups array
                activePopups.current = activePopups.current.filter(p => p !== popup);
            }
        });

        // Optional: still show popup on click if you want
        el.addEventListener('click', () => {
            setCurrentTrain(train);
        });

        // Store popup reference on element for later access
        (el as any).popup = popup;
        (el as any).isHighlighted = isHighlighted;

        return el;
    };

    // Update markers on map
    useEffect(() => {
        if (!map.current) return;

        // Wait for map to be fully loaded
        const updateMarkers = () => {
            // Clear existing popups first
            clearAllPopups();
            
            // Clear existing markers
            markers.current.forEach(marker => marker.remove());
            markers.current = [];

            // Add markers for ALL trains (not just filtered ones)
            trains.forEach(train => {
                if (train.current_lat && train.current_lng &&
                    typeof train.current_lat === 'number' &&
                    typeof train.current_lng === 'number' &&
                    !isNaN(train.current_lat) &&
                    !isNaN(train.current_lng)) {

                    try {
                        // Check if this train should be highlighted
                        const isHighlighted = filteredTrains.some(filteredTrain =>
                            filteredTrain.train_number === train.train_number
                        ) && searchQuery.trim() !== '';

                        const el = createMarkerElement(train, isHighlighted);

                        const marker = new mapboxgl.Marker(el)
                            .setLngLat([train.current_lng, train.current_lat])
                            .addTo(map.current!);

                        // Auto-show popup for highlighted trains
                        if (isHighlighted && searchQuery.length === 5) {
                            setTimeout(() => {
                                (el as any).popup.setLngLat([train.current_lng, train.current_lat]).addTo(map.current!);
                                activePopups.current.push((el as any).popup);
                            }, 500); // Delay to ensure marker is fully added to map
                        }

                        markers.current.push(marker);
                    } catch (error) {
                        console.warn(`Failed to create marker for train ${train.train_number}:`, error);
                    }
                }
            });

            // Handle different numbers of filtered results
            if (filteredTrains.length >= 1 && filteredTrains.length <= 10 && searchQuery.trim() !== '') {
                const validTrains = filteredTrains.filter(train =>
                    train.current_lat && train.current_lng &&
                    typeof train.current_lat === 'number' &&
                    typeof train.current_lng === 'number' &&
                    !isNaN(train.current_lat) &&
                    !isNaN(train.current_lng)
                );

                if (validTrains.length === 1) {
                    // Single train: center and zoom to it
                    const train = validTrains[0];
                    map.current!.flyTo({
                        center: [train.current_lng, train.current_lat],
                        zoom: 12,
                        duration: 1500
                    });
                } else if (validTrains.length > 1) {
                    // Multiple trains: fit all in frame
                    const coordinates = validTrains.map(train => [train.current_lng, train.current_lat]);

                    // Calculate bounds
                    const lngs = coordinates.map(coord => coord[0]);
                    const lats = coordinates.map(coord => coord[1]);

                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);

                    // Create bounds with some padding
                    const bounds = new mapboxgl.LngLatBounds([minLng, minLat], [maxLng, maxLat]);

                    map.current!.fitBounds(bounds, {
                        padding: { top: 50, bottom: 200, left: 100, right: 400 }, // Extra padding on right for search panel
                        duration: 1500,
                        maxZoom: 15 // Prevent zooming too close when trains are very close together
                    });
                }
            }
        };

        if (map.current.isStyleLoaded()) {
            updateMarkers();
        } else {
            map.current.on('load', updateMarkers);
        }
    }, [filteredTrains, trains, searchQuery]);

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
        <div className="relative w-full h-screen">
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
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="font-semibold text-blue-900">{currentTrain.train_name}</div>
                                        <div className="text-sm text-blue-700 font-medium">#{currentTrain.train_number}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                                        {currentTrain.type}
                                    </span>
                                </div>
                            </div>

                            {/* Journey Progress from Source */}
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Route className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                    <div className="text-sm font-semibold text-purple-900">From Source</div>
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
