import { useState } from 'react';

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
  if (selectedFile) {
    setFile(selectedFile);
  }

  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // Prepare the file for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append("customerID", "wagner123");


      // Call endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload success:', result);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-[500px] h-[500px] bg-sky-100 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center space-y-6">
  <label className="cursor-pointer relative inline-block">
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="hidden"
    />
    <div className="px-6 py-3 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-sky-200 transition duration-300 ease-in-out">
      📸 Select Image
    </div>
  </label>

  <button
    onClick={handleUpload}
    disabled={!file || uploading}
    className={`px-6 py-3 rounded-md shadow-md text-white font-semibold transition duration-300 ease-in-out ${
      uploading || !file
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
  >
    {uploading ? "Uploading..." : "Upload to Vercel Blob"}
  </button>
</div>
  );
}