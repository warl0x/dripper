
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder for development. In the target environment, the key will be present.
  console.warn("API_KEY environment variable not set.");
}

// Default instance for standard calls
const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const enhanceImageQuality = async (base64Image: string, mimeType: string): Promise<{ base64: string, mimeType: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            // A more direct prompt to ensure an image is returned.
            text: "Enhance the quality of this image by increasing its sharpness, clarity, and detail. Your output must be ONLY the enhanced image file. Do not change the content or composition. Do not add any text to your response.",
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];

    // More robust error handling for blocked requests or empty responses.
    if (!candidate) {
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Image enhancement was blocked for safety reasons: ${response.promptFeedback.blockReason}`);
      }
      throw new Error("Image enhancement failed: The model did not return a valid response.");
    }
    
    if (candidate.finishReason && ['SAFETY', 'RECITATION', 'OTHER'].includes(candidate.finishReason)) {
        throw new Error(`Image enhancement failed. Reason: ${candidate.finishReason}.`);
    }
    
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
        };
      }
    }
    
    // If no image is found, include the model's text response for better debugging.
    const textResponse = response.text?.trim();
    let errorMessage = "Failed to enhance image. The model did not return an image.";
    if (textResponse) {
        errorMessage += ` Model response: "${textResponse}"`;
    }
    throw new Error(errorMessage);

  } catch (error) {
    console.error("Error enhancing image quality:", error);
    if (error instanceof Error) {
        // Pass the specific error message along.
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while enhancing image quality.");
  }
};

export const stylizeImage = async (base64Image: string, mimeType: string, prompt: string, isHD: boolean = false): Promise<string> => {
  try {
    const modelName = isHD ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const config = isHD ? { imageConfig: { imageSize: '2K' as const } } : {};
    
    // For gemini-3-pro-image-preview (HD), we must create a new instance
    // to ensure it picks up the user-selected API key.
    const currentAi = isHD ? new GoogleGenAI({ apiKey: process.env.API_KEY! }) : ai;

    const response = await currentAi.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: config,
    });

    const candidate = response.candidates?.[0];

    // More robust error handling for blocked requests or empty responses.
    if (!candidate) {
        if (response.promptFeedback?.blockReason) {
          throw new Error(`Image stylization was blocked for safety reasons: ${response.promptFeedback.blockReason}`);
        }
        throw new Error("Image stylization failed: The model did not return a valid response.");
    }
  
    if (candidate.finishReason && ['SAFETY', 'RECITATION', 'OTHER'].includes(candidate.finishReason)) {
        throw new Error(`Image stylization failed. Reason: ${candidate.finishReason}.`);
    }

    // Iterate through parts to find the image data
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        const base64String = part.inlineData.data;
        const imageMimeType = part.inlineData.mimeType;
        return `data:${imageMimeType};base64,${base64String}`;
      }
    }
    
    // If no image is found, include the model's text response for better debugging.
    const textResponse = response.text?.trim();
    let errorMessage = "No image was generated. The model might have returned a text-only response.";
    if (textResponse) {
        errorMessage += ` Model response: "${textResponse}"`;
    }
    throw new Error(errorMessage);

  } catch (error)
  {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Pass the specific error message along.
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while stylizing the image.");
  }
};
