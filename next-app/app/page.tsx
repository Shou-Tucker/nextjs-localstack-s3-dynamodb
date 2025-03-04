'use client';

import { useEffect, useState } from 'react';
import UploadForm from '@/components/UploadForm';
import ImageGallery from '@/components/ImageGallery';
import { ImageEntry } from '@/types';

export default function Home() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/images');
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data);
      } else {
        setError(result.error || '画像の読み込みに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました。再度お試しください。');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadSuccess = (newImage: ImageEntry) => {
    setImages((prevImages) => [newImage, ...prevImages]);
  };

  const handleDelete = (id: string) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">画像を読み込み中...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-center">
                <p className="text-xl">エラーが発生しました</p>
                <p className="mt-2">{error}</p>
                <button
                  onClick={fetchImages}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  再読み込み
                </button>
              </div>
            </div>
          ) : (
            <ImageGallery images={images} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}
