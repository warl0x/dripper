
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultDisplay } from './components/ResultDisplay';
import { fileToBase64 } from './utils/fileUtils';
import { stylizeImage, enhanceImageQuality } from './services/geminiService';
import { Gallery } from './components/Gallery';

const subStyles = [
  {
    id: 'pop-art',
    name: 'Pop Art',
    description: "Bold, edgy, and cartoon-inspired. The classic stylizer.",
    prompt: "Please edit this photo by adding vibrant, cartoonish, graffiti-style illustrations over and around the person. The style should be bold, edgy, and pop-art inspired. Incorporate elements like dripping paint effects, abstract shapes, bold black outlines, and playful doodles. The art should seamlessly blend with the photo without completely obscuring the person. Do not change the person in the photo, only add art.",
    defaultParams: { intensity: 2, engagement: 2, dripLevel: 2, colorPalette: 'vibrant' }
  },
  {
    id: 'stencil',
    name: 'Stencil Art',
    description: "Clean, high-contrast, layered look like spray-painted stencils.",
    prompt: "Please edit this photo in the style of clean, high-contrast stencil art. Use solid shapes and layered colors, as if created with spray paint and stencils. The art should feel graphic and impactful. The art should be added on top of and around the person without changing them.",
    defaultParams: { intensity: 2, engagement: 1, dripLevel: 1, colorPalette: 'monochrome' }
  },
  {
    id: 'wildstyle',
    name: 'Wildstyle',
    description: "Complex, interlocking letters and abstract shapes. Energetic and chaotic.",
    prompt: "Please edit this photo by adding energetic 'Wildstyle' graffiti. The art should feature complex, interlocking, and abstract letterforms that are dense and dynamic, with arrows and spikes. The overall feeling should be chaotic and vibrant. The art should be added on top of and around the person without changing them.",
    defaultParams: { intensity: 3, engagement: 3, dripLevel: 3, colorPalette: 'neon' }
  },
  {
    id: 'tagging',
    name: 'Tagging',
    description: "Focuses on stylized signatures and calligraphic text.",
    prompt: "Please edit this photo by adding graffiti 'tags'. The style should focus on fluid, stylized, calligraphic signatures and quick linework. The artwork should be more about the flow of text than complex illustrations. The art should be added on top of and around the person without changing them.",
    defaultParams: { intensity: 1, engagement: 1, dripLevel: 2, colorPalette: 'vibrant' }
  },
  {
    id: 'doodle-wear',
    name: 'Doodle-wear',
    description: "Draws art directly onto clothes, like a custom fabric print.",
    prompt: "Please edit this photo by drawing cartoonish illustrations exclusively on the clothing worn by the person. These illustrations should look like a seamless part of the fabric's design or print. Use bold, clean black outlines. IMPORTANT: Do NOT add any illustrations, doodles, text, or effects to the background, the person's skin, or any objects other than their clothes. The original photo, person, and background should remain unchanged, with the only modification being the new art on the clothing.",
    defaultParams: { intensity: 2, engagement: 1, dripLevel: 1, colorPalette: 'vibrant' }
  },
  {
    id: 'sticker-bomb',
    name: 'Sticker Bomb',
    description: "Overlapping, chaotic layers of colorful stickers and decals.",
    prompt: "Please edit this photo by covering it in a 'sticker bomb' style. Add numerous, overlapping, colorful, and diverse graffiti-style stickers, decals, and logos on and around the person. The stickers should have bold outlines and a slightly worn, layered look. Do not change the person, only add the sticker art.",
    defaultParams: { intensity: 3, engagement: 3, dripLevel: 1, colorPalette: 'vibrant' }
  },
  {
    id: 'cosmic-flow',
    name: 'Cosmic Flow',
    description: "Ethereal swirls of nebulae, stars, and galactic patterns.",
    prompt: "Please edit this photo by infusing it with a 'cosmic flow' style. Weave ethereal, swirling nebulae, distant stars, and glowing galactic patterns around the person. The art should feel magical and celestial, using soft glows and transparent layers. Do not change the person, just embed them within this cosmic art.",
    defaultParams: { intensity: 2, engagement: 2, dripLevel: 1, colorPalette: 'cosmic' }
  },
  {
    id: 'glitch-art',
    name: 'Glitch Art',
    description: "Digital distortion, pixelation, and futuristic datamosh effects.",
    prompt: "Please edit this photo by applying a 'glitch art' aesthetic. Introduce digital distortions like pixelation, RGB color shifts, scan lines, and datamoshing effects. The art should look like a futuristic, corrupted digital file, deconstructing parts of the image in a visually interesting way. Do not completely obscure the person.",
    defaultParams: { intensity: 2, engagement: 1, dripLevel: 1, colorPalette: 'cyberpunk' }
  },
  {
    id: 'melting-eyes',
    name: 'Melting Eyes',
    description: "A psychedelic effect with rainbow colors dripping from the eyes.",
    prompt: "Please edit this photo to create a psychedelic 'melting eyes' effect. The person's eyes should appear to be melting and dripping down their face in vibrant, flowing rainbow colors. The effect should be artistic and trippy, but the rest of the person's face and the background should remain mostly unchanged and recognizable. The drips should be colorful and look like liquid paint.",
    defaultParams: { intensity: 2, engagement: 2, dripLevel: 3, colorPalette: 'neon' }
  }
];

const DEFAULT_STYLE = subStyles.find(s => s.id === 'pop-art')!;
const DEFAULT_PROMPT = DEFAULT_STYLE.prompt;

const palettes = [
  { id: 'vibrant', name: 'Vibrant', colors: ['#FF007F', '#00FFFF', '#39FF14'], prompt: 'Use a bright, saturated color palette like hot pink, electric blue, and lime green.' },
  { id: 'neon', name: 'Neon', colors: ['#BF00FF', '#00E5FF', '#FDFD96'], prompt: 'Use a glowing neon color palette with electric purple, cyan, and bright yellow.' },
  { id: 'monochrome', name: 'Monochrome', colors: ['#FFFFFF', '#808080', '#000000'], prompt: 'Use a monochrome color palette, focusing on black, white, and shades of gray for a high-contrast look.' },
  { id: 'warm', name: 'Warm Tones', colors: ['#FF4500', '#FFD700', '#DC143C'], prompt: 'Use a warm color palette with fiery reds, oranges, and yellows.' },
  { id: 'cool', name: 'Cool Tones', colors: ['#0000FF', '#008080', '#8A2BE2'], prompt: 'Use a cool color palette with deep blues, teals, and purples.' },
  { id: 'pastel', name: 'Pastel', colors: ['#FFB6C1', '#C1FFC1', '#AEC6CF'], prompt: 'Use a soft pastel color palette with gentle shades like baby pink, mint green, and light blue.'},
  { id: 'earthy', name: 'Earthy', colors: ['#8B4513', '#556B2F', '#F4A460'], prompt: 'Use an earthy color palette with natural tones like terracotta brown, olive green, and sandy beige.'},
  { id: 'sunset', name: 'Sunset', colors: ['#FF4E50', '#FC913A', '#F9D423'], prompt: 'Use a sunset-inspired color palette with a gradient of warm colors like vibrant red, deep orange, and golden yellow.'},
  { id: 'retro-wave', name: 'Retro Wave', colors: ['#F92C86', '#05D9E8', '#2A1A5D'], prompt: 'Use a retro 80s synthwave color palette, with bright magenta, cyan, and dark indigo.'},
  { id: 'forest-spirit', name: 'Forest Spirit', colors: ['#0A4F01', '#5A3A22', '#AEF3E7'], prompt: 'Use an enchanted forest color palette, with deep greens, earthy browns, and a hint of magical glowing teal.'},
  { id: 'oceanic-deep', name: 'Oceanic Deep', colors: ['#003B46', '#07575B', '#66A5AD'], prompt: 'Use an oceanic color palette with shades of deep sea blue, teal, and hints of lighter cyan.'},
  { id: 'cosmic', name: 'Cosmic', colors: ['#4C0070', '#8E00B6', '#E400F9'], prompt: 'Use a cosmic color palette with deep purples, glowing magenta, and electric violets.'},
  { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#00F2FF', '#F900F9', '#3A0088'], prompt: 'Use a cyberpunk color palette with glowing cyan, neon magenta, and deep electric purple.'}
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ dataUrl: string; fileData: { base64: string; mimeType: string; } } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [subStyle, setSubStyle] = useState<string>('pop-art');
  const [intensity, setIntensity] = useState<number>(2);
  const [engagement, setEngagement] = useState<number>(2);
  const [dripLevel, setDripLevel] = useState<number>(2);
  const [colorPalette, setColorPalette] = useState<string>('vibrant');
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>('');
  const [graffitiText, setGraffitiText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHDLoading, setIsHDLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enhanceQuality, setEnhanceQuality] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Stylizing your image...');

  React.useEffect(() => {
    try {
      const savedImages = localStorage.getItem('stylizedGallery');
      if (savedImages) {
        setGalleryImages(JSON.parse(savedImages));
      }
    } catch (error) {
      console.error("Failed to load images from local storage:", error);
      localStorage.removeItem('stylizedGallery');
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      setOriginalImage({ dataUrl, fileData: { base64, mimeType } });
      setGeneratedImage(null);
    } catch (err) {
      setError("Failed to load image. Please try another file.");
      console.error(err);
    }
  }, []);

  const buildFinalPrompt = useCallback(() => {
    let finalPrompt = prompt;

    // Intensity
    if (intensity === 1) {
      finalPrompt += " Make the graffiti effects subtle and minimal, like a few well-placed accents rather than a full takeover.";
    } else if (intensity === 3) {
      finalPrompt += " Make the graffiti effects extreme, dense, and chaotic, covering a large portion of the image with overlapping layers of art and color.";
    }
    
    // Engagement
    if (engagement === 1) {
      finalPrompt += " The graffiti and doodles should exist purely in the background and not interact with the person. They should seem completely separate from the subject.";
    } else if (engagement === 3) {
      finalPrompt += " The graffiti and doodle creatures should look like they are actively engaging and interacting with the person. For example, a doodle character could be sitting on their shoulder, peeking from behind them, or paint drips could be originating from their hands or clothes.";
    }

    // Drip Effect
    if (dripLevel === 1) {
        finalPrompt += " Avoid using any dripping paint effects for a cleaner look.";
    } else if (dripLevel === 3) {
        finalPrompt += " Generously apply dripping paint effects throughout the image, on the graffiti, the background, and even on the person's clothes to give it a wet, fresh paint look.";
    }

    // Color Palette
    const selectedPalette = palettes.find(p => p.id === colorPalette);
    if (selectedPalette) {
      finalPrompt += ` ${selectedPalette.prompt}`;
    }

    // Graffiti Text
    if (graffitiText.trim()) {
        finalPrompt += ` Incorporate the following text into the artwork in a cool graffiti style: "${graffitiText.trim()}".`;
    }

    // Background
    if (backgroundPrompt.trim()) {
        finalPrompt += ` Also, please change the background of the image entirely to: "${backgroundPrompt.trim()}". The person and the graffiti should remain, but placed in this new environment.`;
    }

    return finalPrompt;
  }, [prompt, intensity, engagement, dripLevel, colorPalette, graffitiText, backgroundPrompt]);

  const handleGenerate = async () => {
    if (!originalImage) return;
    setError(null);
    setLoadingMessage('Preparing to stylize...');
    setIsLoading(true);
    try {
      let imageToStylize = { ...originalImage.fileData };

      if (enhanceQuality) {
        setLoadingMessage('Enhancing image quality (Step 1/2)...');
        const enhancedData = await enhanceImageQuality(imageToStylize.base64, imageToStylize.mimeType);
        imageToStylize = enhancedData;
        setLoadingMessage('Applying graffiti style (Step 2/2)...');
      } else {
        setLoadingMessage('Stylizing your image...');
      }
      
      const finalPrompt = buildFinalPrompt();
      const result = await stylizeImage(imageToStylize.base64, imageToStylize.mimeType, finalPrompt);
      setGeneratedImage(result);

      setGalleryImages(prevImages => {
        const updatedImages = [result, ...prevImages];
        const trimmedImages = updatedImages.slice(0, 20); // Limit gallery to 20 images
        try {
            localStorage.setItem('stylizedGallery', JSON.stringify(trimmedImages));
        } catch (e) {
            console.error("Failed to save gallery to local storage", e);
        }
        return trimmedImages;
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHD = async () => {
    if (!originalImage) return;
    setIsHDLoading(true);
    setError(null);

    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
      
      const finalPrompt = buildFinalPrompt();
      const hdImageUrl = await stylizeImage(originalImage.fileData.base64, originalImage.fileData.mimeType, finalPrompt, true);
      
      const link = document.createElement('a');
      link.href = hdImageUrl;
      link.download = 'stylized-image-HD.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      let errorMessage = "An unknown error occurred during HD generation.";
      if (err instanceof Error) {
        if (err.message.includes("Requested entity was not found")) {
            errorMessage = "HD generation failed. Please select a valid API key from a paid project and try again.";
        } else {
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsHDLoading(false);
    }
  };
  
  const handleRestart = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
    setPrompt(DEFAULT_PROMPT);
    setSubStyle('pop-art');
    setIntensity(DEFAULT_STYLE.defaultParams.intensity);
    setEngagement(DEFAULT_STYLE.defaultParams.engagement);
    setDripLevel(DEFAULT_STYLE.defaultParams.dripLevel);
    setColorPalette(DEFAULT_STYLE.defaultParams.colorPalette);
    setBackgroundPrompt('');
    setGraffitiText('');
    setIsLoading(false);
    setIsHDLoading(false);
    setEnhanceQuality(false);
    setLoadingMessage('Stylizing your image...');
  };
  
  const handleRedo = () => {
    setGeneratedImage(null);
    setError(null);
  };

  const handleSubStyleChange = (styleId: string) => {
    const selectedStyle = subStyles.find(s => s.id === styleId);
    if (!selectedStyle) return;

    setSubStyle(styleId);
    setPrompt(selectedStyle.prompt);
    setIntensity(selectedStyle.defaultParams.intensity);
    setEngagement(selectedStyle.defaultParams.engagement);
    setDripLevel(selectedStyle.defaultParams.dripLevel);
    setColorPalette(selectedStyle.defaultParams.colorPalette);
  };

  const handleClearGallery = () => {
    setGalleryImages([]);
    localStorage.removeItem('stylizedGallery');
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }
    if (generatedImage && originalImage) {
      return <ResultDisplay 
        originalImage={originalImage.dataUrl} 
        generatedImage={generatedImage} 
        onRestart={handleRestart} 
        onRedo={handleRedo}
        onGenerateHD={handleGenerateHD} 
        isHDLoading={isHDLoading} 
      />;
    }
    if (originalImage) {
      return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-300">Your Photo</h2>
            <img src={originalImage.dataUrl} alt="User upload preview" className="rounded-2xl shadow-lg max-w-full h-auto max-h-[50vh]" />
            
            <div className="w-full space-y-6">
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-400">Graffiti Style</label>
                <div className="flex flex-wrap gap-3">
                  {subStyles.map(style => (
                    <button
                      key={style.id}
                      onClick={() => handleSubStyleChange(style.id)}
                      className={`flex flex-col text-left p-3 rounded-lg border-2 transition-all duration-200 flex-grow basis-40 ${subStyle === style.id ? 'border-pink-500 bg-gray-800' : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'}`}
                      aria-pressed={subStyle === style.id}
                    >
                      <h3 className="font-bold text-gray-200">{style.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                  <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-400">
                      Art Style Prompt (tweak if you like!)
                  </label>
                  <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full p-4 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                  />
              </div>
               <div>
                  <label htmlFor="graffitiText" className="block mb-2 text-sm font-medium text-gray-400">
                      Add Graffiti Text (optional)
                  </label>
                  <input
                      type="text"
                      id="graffitiText"
                      value={graffitiText}
                      onChange={(e) => setGraffitiText(e.target.value)}
                      placeholder="e.g., 'Creative', 'Style', your name..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                  />
              </div>
              <div>
                  <label htmlFor="backgroundPrompt" className="block mb-2 text-sm font-medium text-gray-400">
                      Change Background To... (optional)
                  </label>
                  <input
                      type="text"
                      id="backgroundPrompt"
                      value={backgroundPrompt}
                      onChange={(e) => setBackgroundPrompt(e.target.value)}
                      placeholder="e.g., 'a neon-lit city at night', 'a tropical beach'"
                      className="w-full p-3 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition"
                  />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-400">Color Palette</label>
                <div className="flex flex-wrap gap-2">
                  {palettes.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setColorPalette(p.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200 ${colorPalette === p.id ? 'border-pink-500 bg-gray-800' : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'}`}
                      aria-pressed={colorPalette === p.id}
                    >
                      <div className="flex -space-x-1">
                        {p.colors.map(color => <div key={color} className="w-5 h-5 rounded-full border-2 border-gray-900" style={{ backgroundColor: color }}></div>)}
                      </div>
                      <span className="text-sm font-medium text-gray-300">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full space-y-6 bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label htmlFor="intensity" className="block mb-2 text-sm font-medium text-gray-400">
                  Graffiti Intensity
                </label>
                <input
                  id="intensity"
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  aria-label="Graffiti intensity slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>Subtle</span>
                  <span>Balanced</span>
                  <span>Extreme</span>
                </div>
              </div>

              <div>
                <label htmlFor="engagement" className="block mb-2 text-sm font-medium text-gray-400">
                  Doodle Engagement
                </label>
                <input
                  id="engagement"
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={engagement}
                  onChange={(e) => setEngagement(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  aria-label="Doodle engagement slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>Ignoring</span>
                  <span>Aware</span>
                  <span>Interacting</span>
                </div>
              </div>
               <div>
                <label htmlFor="dripLevel" className="block mb-2 text-sm font-medium text-gray-400">
                  Drip Effect
                </label>
                <input
                  id="dripLevel"
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={dripLevel}
                  onChange={(e) => setDripLevel(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  aria-label="Drip effect slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>None</span>
                  <span>Some</span>
                  <span>Lots</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex items-start gap-3">
                  <input
                    id="enhanceQuality"
                    type="checkbox"
                    checked={enhanceQuality}
                    onChange={(e) => setEnhanceQuality(e.target.checked)}
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-500 bg-gray-700 text-pink-600 accent-pink-500 focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="enhanceQuality" className="cursor-pointer font-medium text-gray-200">
                      Enhance Input Image Quality
                    </label>
                    <p className="text-xs text-gray-400">
                      Improves sharpness and detail before stylizing. Recommended for low-res photos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
                <button
                    onClick={handleGenerate}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto"
                >
                    Stylize!
                </button>
                 <button
                    onClick={handleRestart}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto"
                >
                    Choose Different Photo
                </button>
            </div>
        </div>
      );
    }
    return <ImageUploader onImageUpload={handleImageUpload} />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="text-center my-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            GRAF DOODLE
          </span>
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Upload a photo, and let AI transform it with edgy, cartoon-style graffiti art.
        </p>
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>

      {galleryImages.length > 0 && (
        <Gallery images={galleryImages} onClear={handleClearGallery} />
      )}

      {error && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in" role="alert">
            <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;