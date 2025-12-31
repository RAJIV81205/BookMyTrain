'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import stninfo from '@/lib/constants/stations.json'

// Set your Mapbox access token here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN 

interface Station {
  stnName: string
  stnCode: string
  name_hi: string
  name_gu: string
  district: string
  state: string
  trainCount: string
  latitude: number | string
  longitude: number | string
  address: string
}

const StationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState(78.9629) // Center of India longitude
  const [lat] = useState(20.5937) // Center of India latitude
  const [zoom] = useState(4.5)

  // Convert stations data to GeoJSON format
  const createGeoJSONData = () => {
    const validStations = stninfo.station.filter((station: Station) => {
      const lat = typeof station.latitude === 'string' ? parseFloat(station.latitude) : station.latitude
      const lng = typeof station.longitude === 'string' ? parseFloat(station.longitude) : station.longitude
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })

    return {
      type: 'FeatureCollection' as const,
      features: validStations.map((station: Station) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            typeof station.longitude === 'string' ? parseFloat(station.longitude) : station.longitude,
            typeof station.latitude === 'string' ? parseFloat(station.latitude) : station.latitude
          ]
        },
        properties: {
          stnName: station.stnName,
          stnCode: station.stnCode,
          name_hi: station.name_hi,
          state: station.state,
          district: station.district,
          trainCount: station.trainCount,
          address: station.address
        }
      }))
    }
  }

  useEffect(() => {
    if (map.current) return // Initialize map only once

    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
      minZoom: 4, // Minimum zoom level to prevent zooming out too far
      maxZoom: 18, // Maximum zoom level
      maxBounds: [
        [68.0, 6.0], // Southwest coordinates (longitude, latitude)
        [97.5, 37.5] // Northeast coordinates (longitude, latitude)
      ] // Restrict map bounds to India
    })

    map.current.on('load', () => {
      if (!map.current) return

      const geoJsonData = createGeoJSONData()

      // Add source without clustering
      map.current.addSource('stations', {
        type: 'geojson',
        data: geoJsonData
      })

      // Add all station points as small circles
      map.current.addLayer({
        id: 'station-points',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-color': '#95d1f0', // Red color for railway stations
          'circle-radius': 3, // Small radius
          'circle-stroke-width': 1,
          'circle-stroke-color': '#276fb3',
          'circle-opacity': 0.8
        }
      })

      // Add click event for stations
      map.current.on('click', 'station-points', (e) => {
        if (!e.features?.[0]) return
        const coordinates = (e.features[0].geometry as any).coordinates.slice()
        const properties = e.features[0].properties

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg">${properties?.stnName}</h3>
              <p class="text-sm text-gray-600">Code: ${properties?.stnCode}</p>
              <p class="text-sm text-gray-600">State: ${properties?.state}</p>
              <p class="text-sm text-gray-600">District: ${properties?.district}</p>
              <p class="text-sm text-gray-600">Trains: ${properties?.trainCount}</p>
              <p class="text-xs text-gray-500 mt-2">${properties?.address}</p>
            </div>
          `)
          .addTo(map.current!)
      })

      // Change cursor on hover
      map.current.on('mouseenter', 'station-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'station-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [lng, lat, zoom])

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[500px] rounded-lg"
      />
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h3 className="font-semibold text-sm mb-1">Indian Railway Stations</h3>
        <p className="text-xs text-gray-600">
          Total Stations: {stninfo.station.length.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Click on any red dot to see station details
        </p>
      </div>
    </div>
  )
}

export default StationMap