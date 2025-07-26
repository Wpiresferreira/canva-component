"use client";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import React, { useRef, useEffect, useState } from "react";

const html2canvasFn = (await import("html2canvas-pro")).default;

declare global {
  interface Window {
    google: typeof google;
  }
}

interface SatelliteMapProps {
  address: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCtLeDVA1bbNBWKelC-8_8xv7WjgcDNMFk";
// const GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE";

export default function SatelliteMap({ address }: SatelliteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const [mapZoom, setMapZoom] = useState<number | null>(null);

  const initMap = () => {
    const geocoder = new window.google.maps.Geocoder();
    const defaultCenter = { lat: 0, lng: 0 };

    const map = new window.google.maps.Map(mapRef.current!, {
      zoom: mapZoom ?? 20,
      mapTypeId: "hybrid",
      tilt: 0, // ensures top-down view
      heading: 0,
      center: mapCenter ?? defaultCenter,
    });

    if (!mapCenter) {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          setMapCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
        }
      });
    }

    map.addListener("idle", () => {
      setMapCenter({
        lat: map.getCenter()?.lat() ?? 0,
        lng: map.getCenter()?.lng() ?? 0,
      });
      setMapZoom(map.getZoom() ?? 20);
    });
  };

  useEffect(() => {
    if (!address) return;
    const loadGoogleMapsScript = () => {
      const existingScript = document.querySelector(
        `script[src^="https://maps.googleapis.com/maps/api/js"]`
      );
      if (existingScript) return; // Already loaded

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };

    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript();
    } else {
      initMap();
    }
  }, [address]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mapSnapshot) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setLastPos({ x: offsetX, y: offsetY });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !mapSnapshot) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
      setLastPos({ x: offsetX, y: offsetY });
    }
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearDrawing = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const toggleCaptureView = async () => {
    if (mapSnapshot) {
      // Return to live map view — use stored center & zoom
      setMapSnapshot(null);
      clearDrawing(); // optional cleanup
      setTimeout(() => {
        initMap(); // reinitialize map using current state
      }, 0);
      return;
    }

    // Otherwise, capture the current view
    const container = document.getElementById("map-container");
    if (!container) return;

    const html2canvasFn = (await import("html2canvas-pro")).default;

    const canvas = await html2canvasFn(container, {
      useCORS: true,
      allowTaint: false,
    });

    const dataUrl = canvas.toDataURL("image/png");
    setMapSnapshot(dataUrl);
  };

  const saveDrawing = async () => {
    const container = document.getElementById("map-container");
    if (!container) return;

    const html2canvasFn = (await import("html2canvas-pro")).default;

    if (typeof html2canvasFn !== "function") {
      throw new Error("html2canvas-pro default export is not a function.");
    }

    const canvas = await html2canvasFn(
      document.getElementById("map-container")!,
      {
        useCORS: true,
        allowTaint: false,
      }
    );

    const link = document.createElement("a");
    link.download = "captured_map_drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="relative w-full h-[500px]">
      <div className="flex flex-nowrap absolute top-2 right-2 z-10 px-4 py-2">
        {!mapSnapshot ? (
          <button
            onClick={toggleCaptureView}
            className="flex gap-2 mx-2 px-4 py-2 text-white rounded bg-blue-600"
          >
            <ArrowDownTrayIcon className="w-5 h-5 text-white" />
            Capture Map View
          </button>
        ) : (
          <>
            <button
              onClick={clearDrawing}
              className="flex gap-2 mx-2 px-4 py-2 text-white rounded bg-red-500"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
              Clear Drawing
            </button>
            <button
              onClick={saveDrawing}
              className="flex gap-2 mx-2 px-4 py-2 text-white rounded bg-green-600"
            >
              <DocumentArrowDownIcon className="w-5 h-5 text-white" />
              Save Image with Drawing
            </button>
            <button
              onClick={toggleCaptureView}
              className="flex gap-2 mx-2 px-4 py-2 text-white rounded bg-blue-600"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-white" />
              Return to Google Map
            </button>
          </>
        )}
      </div>

      <div id="map-container" className="relative w-full h-[500px]">
        {!mapSnapshot ? (
          <div
            ref={mapRef}
            className="w-full h-[500px] absolute top-0 left-0 z-0"
          />
        ) : (
          <img
            src={mapSnapshot}
            alt="Captured Map View"
            className="w-full h-[500px] object-cover"
          />
        )}

        {mapSnapshot && (
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={500}
            className="absolute top-0 left-0 cursor-crosshair pointer-events-auto"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        )}
      </div>
    </div>
  );
}
