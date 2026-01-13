"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Station = {
  stnName: string
  stnCode: string
  arrival: string
  departure: string
  halt: string
  distance: string
  day: string
  platform: string
  coordinates?: {
    latitude: number
    longitude: number
  } | null
}

interface TrainMapProps {
  isOpen: boolean
  onClose: () => void
  route: Station[]
  trainNumber: string
  intermediateStations: string[]
}

const ORANGE = '#f97316' // Tailwind orange-500
const BLUE = '#2563eb' // Tailwind blue-600

const TrainMap: React.FC<TrainMapProps> = ({ isOpen, onClose, route }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const accessToken = useMemo(() => process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '', [])

  // Resolve coordinates from API response
  useEffect(() => {
    if (!isOpen) return
    if (!accessToken) {
      setError('Mapbox access token is missing')
      setLoading(false)
      return
    }

    let cancelled = false

    const initialize = async () => {
      try {
        setLoading(true)
        setError('')

        // Extract coordinates from stations
        const points: { name: string; code: string; lat: number; lng: number }[] = []

        for (const station of route) {
          if (station.coordinates &&
              typeof station.coordinates.latitude === 'number' &&
              typeof station.coordinates.longitude === 'number' &&
              isFinite(station.coordinates.latitude) &&
              isFinite(station.coordinates.longitude)) {
            points.push({
              name: station.stnName,
              code: station.stnCode,
              lat: station.coordinates.latitude,
              lng: station.coordinates.longitude
            })
          }
        }

        if (cancelled) return

        // 2) Init map if needed
        mapboxgl.accessToken = accessToken
        if (!mapRef.current && containerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: points.length ? [points[0].lng, points[0].lat] : [78.9629, 20.5937],
            zoom: points.length ? 6 : 4
          })
        }

        const map = mapRef.current!

        const addDataToMap = () => {
          // Clear previous layers and sources
          if (map.getSource('route-line')) {
            map.removeLayer('route-line')
            map.removeSource('route-line')
          }
          if (map.getSource('stations')) {
            if (map.getLayer('stations-circle')) map.removeLayer('stations-circle')
            if (map.getLayer('stations-label')) map.removeLayer('stations-label')
            map.removeSource('stations')
          }

          // Create GeoJSON for stations
          const stationsGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: 'FeatureCollection',
            features: points.map(p => ({
              type: 'Feature',
              properties: {
                name: p.name,
                code: p.code
              },
              geometry: {
                type: 'Point',
                coordinates: [p.lng, p.lat]
              }
            }))
          }

          // Add stations source and layers
          map.addSource('stations', {
            type: 'geojson',
            data: stationsGeoJSON
          })

          map.addLayer({
            id: 'stations-circle',
            type: 'circle',
            source: 'stations',
            paint: {
              'circle-radius': 6,
              'circle-color': ORANGE,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          })

          map.addLayer({
            id: 'stations-label',
            type: 'symbol',
            source: 'stations',
            layout: {
              'text-field': ['get', 'code'],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 11,
              'text-offset': [0, 1.5],
              'text-anchor': 'top'
            },
            paint: {
              'text-color': '#111827',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.5
            }
          })

          // Add line if we have at least two points
          if (points.length >= 2) {
            const lineGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: points.map(p => [p.lng, p.lat])
              }
            }

            map.addSource('route-line', {
              type: 'geojson',
              data: lineGeoJSON
            })

            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route-line',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': BLUE,
                'line-width': 3
              }
            })

            // Fit bounds to route
            const bounds = new mapboxgl.LngLatBounds()
            points.forEach(p => bounds.extend([p.lng, p.lat]))
            map.fitBounds(bounds, { padding: 60, duration: 800, maxZoom: 10 })
          }

          // Add popup on click
          map.on('click', 'stations-circle', (e) => {
            if (!e.features || !e.features[0]) return
            const feature = e.features[0]
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number]
            const { name, code } = feature.properties as { name: string; code: string }

            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 4px 8px; font-size: 13px;">
                  <div style="font-weight: 600; color: #111827;">${name}</div>
                  <div style="font-size: 12px; color: #6b7280;">${code}</div>
                </div>
              `)
              .addTo(map)
          })

          // Change cursor on hover
          map.on('mouseenter', 'stations-circle', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'stations-circle', () => {
            map.getCanvas().style.cursor = ''
          })

          setLoading(false)
        }

        if (map.isStyleLoaded()) {
          addDataToMap()
        } else {
          map.once('load', addDataToMap)
        }
      } catch (e) {
        setError('Failed to initialize map')
        setLoading(false)
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, route, accessToken])

  // Cleanup map when modal closes/unmounts
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      mapRef.current.remove()
      mapRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white w-[95vw] h-[85vh] max-w-6xl rounded-lg shadow-xl overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700 cursor-pointer"
            title="Close"
          >
            Close
          </button>
        </div>
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-red-600 text-sm px-6">
            {error}
          </div>
        ) : (
          <div className="w-full h-full">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 px-4 py-2 rounded shadow">Loading map…</div>
              </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainMap