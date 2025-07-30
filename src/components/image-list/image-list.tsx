"use client";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";

interface url  {imageurl:string}

export default function ImageList() {
  const customerID = "wagner123";
  const [urls, setUrls] = useState([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    const formData = new FormData();
    formData.append("customerID", customerID);

    async function getUrls() {
      const response = await fetch("/api/get-images-urls", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      setUrls(result);
    }
    getUrls();
  }, []);

  return (
    <div>
      {urls.map((url:url, index) => (
        <Image
          className="p-2 hover:cursor-zoom-in"
          key={url.imageurl}
          onClick={() => setPreviewSrc(url.imageurl)}
          src={url.imageurl} 
          alt={`Image ${index + 1}`}
          width={400}
          height={400}
          
        />
      ))}

      {/* Fullscreen Preview */}
      {previewSrc && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center z-50">
          <Image
            src={previewSrc}
            alt="Full screen preview"
            width={800}
            height={800}
            className="max-w-full max-h-full"
            onClick={() => setPreviewSrc(null)}
          />
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full"
            onClick={() => setPreviewSrc(null)}
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
