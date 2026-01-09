
import React from 'react';
import { TrashIcon } from './icons';

interface GalleryProps {
  images: string[];
  onClear: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onClear }) => {
  return (
    <section className="w-full max-w-6xl mx-auto mt-12 mb-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold text-gray-300">Your Creations</h2>
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Clear gallery"
        >
          <TrashIcon className="w-4 h-4" />
          Clear
        </button>
      </div>
      <div className="bg-gray-800/50 p-4 rounded-xl">
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {images.map((imgSrc, index) => (
            <div key={index} className="flex-shrink-0 group relative">
              <img
                src={imgSrc}
                alt={`Stylized image ${index + 1}`}
                className="w-40 h-40 object-cover rounded-lg shadow-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300"
              />
            </div>
          ))}
          {images.length === 0 && <p className="text-gray-500">Your stylized images will appear here.</p>}
        </div>
      </div>
    </section>
  );
};
