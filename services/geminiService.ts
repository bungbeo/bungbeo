
import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

export const generateVideoFromImage = async (
  imageBytes: string,
  settings: GenerationSettings,
  onProgress: (status: string) => void
): Promise<string> => {
  // Always create a new instance to get the latest API Key
  const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });

  try {
    onProgress("Initiating video generation...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: settings.prompt || 'Transform this image into a fluid cinematic video',
      image: {
        imageBytes: imageBytes,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: settings.resolution,
        aspectRatio: settings.aspectRatio
      }
    });

    const statusMessages = [
      "Still processing frames...",
      "Synthesizing motion...",
      "Refining lighting and textures...",
      "Applying cinematic effects...",
      "Almost ready...",
      "Generating final MP4..."
    ];

    let messageIndex = 0;
    while (!operation.done) {
      onProgress(statusMessages[messageIndex % statusMessages.length]);
      messageIndex++;
      
      // Wait 10 seconds between polls
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (pollError: any) {
        if (pollError.message?.includes("Requested entity was not found")) {
           throw new Error("API Key session expired. Please re-select your key.");
        }
        throw pollError;
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Failed to retrieve generated video link.");
    }

    // Append API key for download
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error: any) {
    console.error("Video generation failed:", error);
    throw error;
  }
};
