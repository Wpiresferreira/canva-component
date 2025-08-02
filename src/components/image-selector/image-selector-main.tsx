"use client";
import { CameraIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCtLeDVA1bbNBWKelC-8_8xv7WjgcDNMFk";

export default function ImageSelectorMain({ address }: { address: string }) {
  const [geocodeOptions, setGeocodeOptions] = useState<
    google.maps.GeocoderResult[] | null
  >([]);
  const mapElementRef = useRef<HTMLDivElement | null>(null); // DOM node
  const mapInstanceRef = useRef<google.maps.Map | null>(null); // actual map
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [showGeocodeSelector, setShowGeocodeSelector] = useState(false);

  const initMap = async () => {
    if (!window.google?.maps?.Geocoder || !mapElementRef.current) return;

    const geocoder = new window.google.maps.Geocoder();

    const map = new window.google.maps.Map(mapElementRef.current, {
      zoom: mapZoom ?? 20,
      mapTypeId: "hybrid",
      tilt: 0,
      heading: 0,
      center: mapCenter,
      disableDefaultUI: true,
    });

    //////////////////////////////////////////////////////////////////////////
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.MARKER,
        ],
      },
      circleOptions: {
        fillColor: "rgba(255,0,0)",
        fillOpacity: 0.8,
        strokeWeight: 0,
        clickable: false,
        editable: false,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: "rgba(255,0,0)",
        fillOpacity: 0.8,
        strokeWeight: 0,
        clickable: false,
        editable: false,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: "rgba(255,0,0)",
        fillOpacity: 0.8,
        strokeWeight: 0,
        clickable: false,
        editable: false,
        zIndex: 1,
      },
    });

    drawingManager.setMap(map);

    //////////////////////////////////////////////////////////////////////////

    mapInstanceRef.current = map;

    if (!mapCenter) {
      geocoder.geocode({ address }, (results, status) => {
        console.log(results);
        if (!results) {
          setGeocodeOptions(null);
          setShowGeocodeSelector(true);
        }

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing`;
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
    <div className="relative w-full max-w-md mx-auto h-[500px]">
      <div className={`flex flex-nowrap absolute top-2 right-2 z-10 px-4 py-2`}>
        <button
          onClick={saveDrawing}
          className="flex gap-2 mx-2 px-4 py-2 text-white rounded bg-sky-700 hover:bg-sky-500"
        >
          <CameraIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      <div
        id="map-container"
        className={`relative w-full max-w-[500px] h-[500px] `}
      >
        <div
          ref={mapElementRef}
          className="w-full h-[500px] absolute top-0 left-0 z-0"
        />

        {showGeocodeSelector && (
          <div className="absolute top-4 left-4 z-20 bg-white shadow-md rounded max-w-md w-[90%] sm:w-[400px]">
            <h2 className="text-lg font-bold mb-2 px-4 pt-4">
              Select a Location
            </h2>
            <ul>
              {geocodeOptions ? (
                geocodeOptions.map((result, i) => {
                  const formattedAddress = result.formatted_address;
                  return (
                    <li
                      key={i}
                      className="px-4 py-2 hover:bg-gray-100"
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
                })
              ) : (
                <li className="px-4 py-2 hover:bg-gray-100">
                  Address not found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
