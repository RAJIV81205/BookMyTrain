"use client"

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, RefreshCwOff, LocateFixed } from "lucide-react"
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
    distance_from_source_km: number;
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
    const [trains, setTrains] = useState<TrainData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [currentTrain, setCurrentTrain] = useState<TrainData | null>(null);
    const isInitialLoad = useRef(true);

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
                    'X-Api-Key': "             rri_eyJleHAiOjE3NTg5NTc0MzEwNjcsImlhdCI6MTc1ODg3MTAzMTA2NywidHlwZSI6ImludGVybmFsIiwicm5kIjoiVWRIbjFXekJvTlFhIn0=_YjYzMjQ5OWUzZDEwN2M0ZjRhYjA2NzY2ZjE4YzkyMTZiNmM5YWU0YTZkN2Y0NDRjOWYyNGU1MTc1YWVhZWQyYQ==",
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


        // Apply highlighting effects
        if (isHighlighted && searchQuery.length == 5) {

            el.style.filter = 'drop-shadow(0 0 12px rgba(255, 215, 0, 1)) drop-shadow(0 0 20px rgba(255, 69, 0, 0.6))';
            el.style.transform = 'scale(1.3)'; // Make highlighted trains bigger
        }

        // Insert your SVG with rotation and highlighting
        el.innerHTML = `
                      <svg height="32px" width="32px" version="1.1" id="Layer_1" 
                   xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
               viewBox="0 0 511.998 511.998" xml:space="preserve" 
              style="transform: rotate(${rotation}deg); transition: all 0.3s ease;">
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
            popup.setLngLat([train.current_lng, train.current_lat]).addTo(map.current!);
        });

        // Hide popup when not hovering
        el.addEventListener('mouseleave', () => {
            popup.remove();
        });

        // Optional: still show popup on click if you want
        el.addEventListener('click', () => {
            setCurrentTrain(train);
        });

        return el;
    };

    // Update markers on map
    useEffect(() => {
        if (!map.current) return;

        // Wait for map to be fully loaded
        const updateMarkers = () => {
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
            <div ref={mapContainer} className="w-full h-screen" />

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
                <input
                    type="text"
                    placeholder="Enter 5-digit train number..."
                    value={searchQuery}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits and limit to 5 characters
                        if (/^\d{0,5}$/.test(value)) {
                            setSearchQuery(value);
                        }
                    }}
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 text-sm text-gray-600">
                    {searchQuery.length === 5 ?
                        `Found ${filteredTrains.length} train(s) for ${searchQuery}` :
                        searchQuery.length > 0 ?
                            `Enter ${5 - searchQuery.length} more digit(s)` :
                            `Total ${trains.length} trains loaded`
                    }
                </div>
                <div className="flex gap-2 mt-2">

                </div>
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
