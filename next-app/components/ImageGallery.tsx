'use client';

import { useState } from 'react';
import { ImageEntry } from '@/types';
import Image from 'next/image';

interface ImageGalleryProps {
  images: ImageEntry[];
  onDelete: (id: string) => void;
}

export default function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('この画像を削除しますか？')) {
      setIsDeleting(id);
      try {
        const response = await fetch(`/api/images/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          onDelete(id);
          if (selectedImage?.id === id) {
            setSelectedImage(null);
          }
        } else {
          alert('画像の削除に失敗しました。');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('エラーが発生しました。再度お試しください。');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">画像ギャラリー</h2>
      
      {images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          アップロードされた画像はありません
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative rounded overflow-hidden cursor-pointer ${
                  isDeleting === image.id ? 'opacity-50' : 'opacity-100'
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="object-cover w-full h-40"
                  />
                </div>
                <div className="p-2 text-sm truncate">{image.filename}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  disabled={isDeleting === image.id}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-semibold">{selectedImage.filename}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-h-[70vh] mx-auto"
              />
            </div>
            <div className="bg-gray-100 p-4 text-sm">
              <div>
                <span className="font-semibold">アップロード日時:</span> {formatDate(selectedImage.uploadedAt)}
              </div>
              <div>
                <span className="font-semibold">サイズ:</span> {formatFileSize(selectedImage.size)}
              </div>
              <div>
                <span className="font-semibold">タイプ:</span> {selectedImage.contentType}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
