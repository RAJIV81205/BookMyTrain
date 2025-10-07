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
          // Clear previous markers and layers
          markersRef.current.forEach(m => m.remove())
          markersRef.current = []

          if (map.getSource('route-line')) {
            map.removeLayer('route-line')
            map.removeSource('route-line')
          }

          // Add markers with popups
          points.forEach((p) => {
            const el = document.createElement('div')
            el.style.width = '12px'
            el.style.height = '12px'
            el.style.borderRadius = '50%'
            el.style.background = ORANGE
            el.style.boxShadow = '0 0 0 2px white'
            el.style.cursor = 'pointer'
            el.title = `${p.code} - ${p.name}`

            const popup = new mapboxgl.Popup({ offset: 15, closeButton: false })
              .setHTML(`
                <div style="padding: 4px 8px; font-size: 13px;">
                  <div style="font-weight: 600; color: #111827;">${p.name}</div>
                  <div style="font-size: 12px; color: #6b7280;">${p.code}</div>
                </div>
              `)

            const marker = new mapboxgl.Marker(el)
              .setLngLat([p.lng, p.lat])
              .setPopup(popup)
              .addTo(map)

            // Show popup on hover
            el.addEventListener('mouseenter', () => popup.addTo(map))
            el.addEventListener('mouseleave', () => popup.remove())

            markersRef.current.push(marker)
          })

          // Add line if we have at least two points
          if (points.length >= 2) {
            const line: GeoJSON.Feature<GeoJSON.LineString> = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: points.map(p => [p.lng, p.lat])
              }
            }

            map.addSource('route-line', {
              type: 'geojson',
              data: line
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
                'line-width': 4
              }
            })

            // Fit bounds to route
            const bounds = new mapboxgl.LngLatBounds()
            points.forEach(p => bounds.extend([p.lng, p.lat]))
            map.fitBounds(bounds, { padding: 60, duration: 800, maxZoom: 10 })
          }

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