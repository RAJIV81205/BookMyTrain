"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import stnInfo from "@/lib/constants/stations.json";

type Station = {
  stnName: string;
  stnCode: string;
  arrival: string;
  departure: string;
  halt: string;
  distance: string;
  day: string;
  platform: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
};

interface TrainMapProps {
  isOpen: boolean;
  onClose: () => void;
  route: Station[];
  intermediateStations: string[];
}

const ORANGE = "#f97316";
const BLUE = "#2563eb";
const GRAY = "#6b7280";

const TrainMap: React.FC<TrainMapProps> = ({
  isOpen,
  onClose,
  route,
  intermediateStations,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntermediate, setShowIntermediate] = useState(true);

  const allStations = stnInfo.station;
  const accessToken = useMemo(
    () => process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!accessToken) {
      setError("Mapbox access token missing");
      return;
    }

    let cancelled = false;

    const init = () => {
      setLoading(true);
      setError("");

      /** ------------------------------------------------
       * 1) Build stoppage points
       * ------------------------------------------------*/
      const stoppagePoints = route
        .filter((st) => st.coordinates)
        .map((s) => ({
          name: s.stnName,
          code: s.stnCode,
          lat: s.coordinates!.latitude,
          lng: s.coordinates!.longitude,
        }));

      /** ------------------------------------------------
       * 2) Build intermediate points (from JSON lookup)
       * ------------------------------------------------*/
      const intermediatePoints = intermediateStations
        .map((code) => allStations.find((s: any) => s.stnCode === code))
        .filter((s) => s && s.latitude && s.longitude)
        .map((s: any) => ({
          name: s.stnName,
          code: s.stnCode,
          lat: s.latitude,
          lng: s.longitude,
        }));

      /** ------------------------------------------------
       * 3) Build combined points for the polyline
       * ------------------------------------------------*/
      let fullPoints =
        intermediatePoints.length > 0
          ? [...stoppagePoints, ...intermediatePoints]
          : [...stoppagePoints];

      // sort: keep stoppages in order, intermediates in between
      const orderMap: Record<string, number> = {};
      route.forEach((st, i) => (orderMap[st.stnCode] = i));
      intermediateStations.forEach((code, i) => (orderMap[code] = 1000 + i));

      fullPoints.sort(
        (a, b) => (orderMap[a.code] ?? 99999) - (orderMap[b.code] ?? 99999)
      );

      if (cancelled) return;

      /** ------------------------------------------------
       * 4) Initialize map
       * ------------------------------------------------*/
      mapboxgl.accessToken = accessToken;

      if (!mapRef.current && containerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: fullPoints.length
            ? [fullPoints[0].lng, fullPoints[0].lat]
            : [78.9, 20.5],
          zoom: fullPoints.length ? 5 : 4,
        });
      }

      const map = mapRef.current!;

      const drawMap = () => {
        /** Cleanup old layers */
        const layers = [
          "stoppage-circle",
          "stoppage-label",
          "intermediate-circle",
          "route-line",
        ];
        layers.forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });

        const sources = ["stoppage", "intermediate", "route-line"];
        sources.forEach((id) => {
          if (map.getSource(id)) map.removeSource(id);
        });

        /** -----------------------------------------------
         * STOPPAGE STATIONS (markers)
         * -----------------------------------------------*/
        const stoppageGeo: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          type: "FeatureCollection",
          features: stoppagePoints.map((p) => ({
            type: "Feature",
            properties: {
              name: p.name,
              code: p.code,
            },
            geometry: {
              type: "Point",
              coordinates: [p.lng, p.lat],
            },
          })),
        };

        map.addSource("stoppage", { type: "geojson", data: stoppageGeo });

        map.addLayer({
          id: "stoppage-circle",
          type: "circle",
          source: "stoppage",
          paint: {
            "circle-radius": 6,
            "circle-color": ORANGE,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });

        map.addLayer({
          id: "stoppage-label",
          type: "symbol",
          source: "stoppage",
          layout: {
            "text-field": ["get", "code"],
            "text-size": 11,
            "text-anchor": "top",
            "text-offset": [0, 1.5],
          },
          paint: {
            "text-color": "#111",
            "text-halo-color": "#fff",
            "text-halo-width": 1.2,
          },
        });

        /** -----------------------------------------------
         * INTERMEDIATE STATIONS (gray dots when zoomed in)
         * -----------------------------------------------*/
        if (intermediatePoints.length > 0) {
          const interGeo: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: "FeatureCollection",
            features: intermediatePoints.map((p) => ({
              type: "Feature",
              properties: {
                name: p.name,
                code: p.code,
              },
              geometry: {
                type: "Point",
                coordinates: [p.lng, p.lat],
              },
            })),
          };

          map.addSource("intermediate", {
            type: "geojson",
            data: interGeo,
          });

          map.addLayer({
            id: "intermediate-circle",
            type: "circle",
            source: "intermediate",
            minzoom: 8,
            layout: {
              visibility: showIntermediate ? "visible" : "none",
            },
            paint: {
              "circle-radius": 4,
              "circle-color": GRAY,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#fff",
            },
          });
        }

        /** -----------------------------------------------
         * ROUTE POLYLINE (full route)
         * -----------------------------------------------*/

        const lineGeo: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: fullPoints.map((p) => [p.lng, p.lat]),
          },
          properties: {},
        };

        map.addSource("route-line", {
          type: "geojson",
          data: lineGeo,
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route-line",
          paint: {
            "line-color": BLUE,
            "line-width": 3,
          },
        });

        /** Fit bounds */
        const bounds = new mapboxgl.LngLatBounds();
        fullPoints.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 60, duration: 800, maxZoom: 10 });

        setLoading(false);
      };

      if (map.isStyleLoaded()) drawMap();
      else map.once("load", drawMap);
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [isOpen, route, intermediateStations, showIntermediate, accessToken]);

  /** Cleanup map */
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white w-[95vw] h-[85vh] max-w-6xl rounded-lg shadow-xl overflow-hidden">
        {/* Toggle Button */}
        <div className="absolute top-3 left-3 z-20 bg-white px-3 py-2 rounded shadow text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showIntermediate}
              onChange={() => setShowIntermediate(!showIntermediate)}
            />
            Show intermediate stations
          </label>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Close
        </button>

        {/* Map */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            Loading map…
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-600 z-10">
            {error}
          </div>
        )}

        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default TrainMap;
