"use client";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCtLeDVA1bbNBWKelC-8_8xv7WjgcDNMFk";

export default function imageSelectorMain({ address }: { address: string }) {
  const initialZipCode = "T2P 2M3";
const [geocodeOptions, setGeocodeOptions] = useState<google.maps.GeocoderResult[]>([]);
  const mapElementRef = useRef<HTMLDivElement | null>(null); // DOM node
  const mapInstanceRef = useRef<google.maps.Map | null>(null); // actual map
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [showGeocodeSelector, setShowGeocodeSelector] = useState(false);

  const initMap = () => {
    if (!window.google?.maps?.Geocoder || !mapElementRef.current) return;

    const geocoder = new window.google.maps.Geocoder();
    const defaultCenter = { lat: 0, lng: 0 };

    const map = new window.google.maps.Map(mapElementRef.current, {
      zoom: mapZoom ?? 20,
      mapTypeId: "hybrid",
      tilt: 0,
      heading: 0,
      center: mapCenter ?? defaultCenter,
    });

    mapInstanceRef.current = map;

    if (!mapCenter) {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results) {
          if (results.length === 1) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            setMapCenter({
              lat: location.lat(),
              lng: location.lng(),
            });
          } else {
            setGeocodeOptions(results);
            setShowGeocodeSelector(true);
          }
        }
      });
    }

    map.addListener("idle", () => {
      const center = map.getCenter();
      if (center) {
        setMapCenter({ lat: center.lat(), lng: center.lng() });
      }
      setMapZoom(map.getZoom() ?? 20);
    });
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google?.maps) {
        initMap();
        return;
      }

      const existingScript = document.querySelector(
        `script[src^="https://maps.googleapis.com/maps/api/js"]`
      );
      if (existingScript) {
        existingScript.addEventListener("load", initMap);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps) initMap();
      };
      document.head.appendChild(script);
    };

    if (typeof window !== "undefined") {
      loadGoogleScript();
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
      setMapSnapshot(null);
      clearDrawing();
      setTimeout(() => {
        initMap();
      }, 0);
      return;
    }

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
    const canvas = await html2canvasFn(container, {
      useCORS: true,
      allowTaint: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Blob creation failed.");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "map-drawing.png");
      formData.append("customerID", "wagner123");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Image URL:", result.url);
      alert("Upload complete! 🎉");
    }, "image/png");
  };

  return (
    <div className={`relative w-[500px] h-[500px]`}>
      <div className={` flex flex-nowrap absolute top-2 right-2 z-10 px-4 py-2`}>
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

      <div id="map-container" className={`relative w-full max-w-[500px] h-[500px] `}>
        {!mapSnapshot ? (
          <div
            ref={mapElementRef}
            className="w-[500px] h-[500px] absolute top-0 left-0 z-0"
          />
        ) : (
          <Image
          width={500}
          height={500}
            src={mapSnapshot}
            alt="Captured Map View"
            className={`w-full h-[500px] object-cover `}
          />
        )}

        {mapSnapshot && (
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={500}
            className="absolute top-0 left-0 pointer-events-auto cursor-pointer"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        )}

        {showGeocodeSelector && (
          <div className="absolute top-4 left-4 z-20 bg-white shadow-md rounded max-w-md w-[90%] sm:w-[400px]">
            <h2 className="text-lg font-bold mb-2 px-4 pt-4">
              Select a Location
            </h2>
            <ul>
              {geocodeOptions.map((result, i) => {
                const formattedAddress = result.formatted_address;
                return (
                  <li
                    key={i}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      const loc = result.geometry.location;
                      if (mapInstanceRef.current && loc) {
                        mapInstanceRef.current.setCenter(loc);
                        setMapCenter({ lat: loc.lat(), lng: loc.lng() });
                        setShowGeocodeSelector(false);
                      }
                    }}
                  >
                    {formattedAddress}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
