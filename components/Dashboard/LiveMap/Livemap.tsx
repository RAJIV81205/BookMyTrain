"use client"

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TrainData {
    train_number: string;
    train_name: string;
    current_lat: number;
    current_lng: number;
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
    const isInitialLoad = useRef(true);

    // Filter trains based on search
    const filteredTrains = trains.filter(train =>
        searchQuery === '' ||
        train.train_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        train.train_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                style: 'mapbox://styles/mapbox/light-v11',
                center: [78.9629, 20.5937], // Center of India
                zoom: 5
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

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
                    'X-Api-Key': "rri_eyJleHAiOjE3NTg3Nzk5NzY4NzksImlhdCI6MTc1ODY5MzU3Njg3OSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiQmh6NDltenFFbk9TIn0=_OTI5YTllZGI3NzVhMjU0NDQxMWVmOThmMGQ5Yjc4MmQzOGRlNTI3MDZjMGE4ZWIzYTYwMzQyMTgxODAzM2JlOA==",
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

    // Create marker element
    const createMarkerElement = (train : TrainData) => {
        const el = document.createElement('div');
        el.style.cssText = `
        width: 20px;
        height: 20px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

        // Create the popup instance outside the event handlers so it can be reused
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        }).setHTML(`
        <div style="padding: 8px;">
            <strong>${train.train_number}</strong><br>
            ${train.train_name}<br>
            <small>${train.type}</small>
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
            popup.setLngLat([train.current_lng, train.current_lat]).addTo(map.current!);
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

            // Add markers for filtered trains
            filteredTrains.forEach(train => {
                if (train.current_lat && train.current_lng &&
                    typeof train.current_lat === 'number' &&
                    typeof train.current_lng === 'number' &&
                    !isNaN(train.current_lat) &&
                    !isNaN(train.current_lng)) {

                    try {
                        const el = createMarkerElement(train);
                        const marker = new mapboxgl.Marker(el)
                            .setLngLat([train.current_lng, train.current_lat])
                            .addTo(map.current!);

                        markers.current.push(marker);
                    } catch (error) {
                        console.warn(`Failed to create marker for train ${train.train_number}:`, error);
                    }
                }
            });
        };

        if (map.current.isStyleLoaded()) {
            updateMarkers();
        } else {
            map.current.on('load', updateMarkers);
        }
    }, [filteredTrains]);

    // Fetch data on mount and set up auto-refresh
    useEffect(() => {
        const timer = setTimeout(() => {
            if (map.current) {
                fetchTrainData(); // Initial load
                const interval = setInterval(() => fetchTrainData(true), 30000); // Background refresh every 30 seconds
                return () => clearInterval(interval);
            }
        }, 100); // Small delay to ensure map is ready

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full h-screen">
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-full" />

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
                    placeholder="Search trains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 text-sm text-gray-600">
                    Showing {filteredTrains.length} of {trains.length} trains
                </div>
                <button
                    onClick={() => fetchTrainData(true)} // Always use background refresh for manual refresh
                    disabled={backgroundLoading}
                    className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                    {backgroundLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Loading indicator - only show on initial load */}
            {loading && isInitialLoad.current && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
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
