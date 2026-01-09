
import React from 'react';
import { DownloadIcon, BackIcon, SparklesIcon, LoadingIcon, EditIcon } from './icons';

interface ResultDisplayProps {
  originalImage: string;
  generatedImage: string;
  onRestart: () => void;
  onRedo: () => void;
  onGenerateHD: () => void;
  isHDLoading: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, generatedImage, onRestart, onRedo, onGenerateHD, isHDLoading }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'stylized-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-400 mb-4">Original</h3>
          <img src={originalImage} alt="Original user upload" className="rounded-2xl shadow-lg w-full object-contain max-h-[60vh]" />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold text-pink-500 mb-4">Stylized</h3>
          <img src={generatedImage} alt="AI generated stylized" className="rounded-2xl shadow-lg w-full object-contain max-h-[60vh] border-2 border-pink-500" />
        </div>
      </div>
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          <DownloadIcon className="w-5 h-5" />
          Download
        </button>
        <div className="relative group">
           <button
            onClick={onGenerateHD}
            disabled={isHDLoading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-violet-900 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isHDLoading ? (
              <>
                <LoadingIcon className="w-5 h-5 animate-spin"/>
                Generating HD...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Download HD
              </>
            )}
          </button>
          <div className="absolute bottom-full mb-2 w-60 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Generates a 2K resolution image. Requires selecting your own API key from a paid Google Cloud project.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline ml-1">Learn more</a>
          </div>
        </div>
        <button
          onClick={onRedo}
          className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          <EditIcon className="w-5 h-5" />
          Tweak & Redo
        </button>
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          <BackIcon className="w-5 h-5" />
          Start Over
        </button>
      </div>
    </div>
  );
};
