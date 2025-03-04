'use client';

import { useState } from 'react';
import { ImageEntry } from '@/types';

interface UploadFormProps {
  onUploadSuccess: (image: ImageEntry) => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    // 画像ファイルのみを許可
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロードできます');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFile(null);
        if (e.target instanceof HTMLFormElement) {
          e.target.reset();
        }
        onUploadSuccess(result.data);
      } else {
        setError(result.error || 'アップロードに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました。再度お試しください。');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">画像をアップロード</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="block cursor-pointer text-blue-600 hover:text-blue-800"
          >
            画像を選択
            <span className="block text-sm text-gray-600 mt-1">
              またはここにドラッグ＆ドロップ
            </span>
          </label>
          
          {file && (
            <div className="mt-2 text-sm text-gray-700">
              選択済み: {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={!file || isUploading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            !file || isUploading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </form>
    </div>
  );
}
