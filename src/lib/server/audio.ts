import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import path from "path";
import axios from "axios";

export async function generateSpeech(cenas: any[], voiceName: string, outputPath: string, config: any = {}) {
  const client = new TextToSpeechClient();
  const allAudio: Buffer[] = [];
  const { voicePitch = 0, voiceSpeed = 1.0 } = config;

  console.log(`Generating speech with voice ${voiceName} (Pitch: ${voicePitch}, Speed: ${voiceSpeed})...`);

  for (const cena of cenas) {
    const request = {
      input: { text: cena.narracao },
      voice: { languageCode: 'pt-BR', name: voiceName, ssmlGender: 'NEUTRAL' },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: (cena.velocidade || 1.0) * voiceSpeed,
        pitch: voicePitch
      },
    };

    // @ts-ignore
    const [response] = await client.synthesizeSpeech(request);
    allAudio.push(response.audioContent as Buffer);
  }

  const combinedAudio = Buffer.concat(allAudio);
  fs.writeFileSync(outputPath, combinedAudio);
  console.log(`Speech saved to ${outputPath}`);
}

export async function getMusic(style: string, projectDir: string) {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.warn("PIXABAY_API_KEY not found, skipping background music.");
    return null;
  }

  try {
    // Search for music on Pixabay
    // Note: Pixabay API for music is slightly different or requires specific parameters
    // We'll use a more generic search that often returns audio results if available
    const query = encodeURIComponent(`${style} background music ambient`);
    const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${query}&category=music&per_page=3`;
    
    console.log(`Searching Pixabay music for: ${style}...`);
    const response = await axios.get(url);
    
    // Pixabay sometimes returns music in hits[0].videos.tiny.url for certain categories
    // or has a dedicated music API. If this fails, we'll use a fallback.
    const musicUrl = response.data.hits?.[0]?.videos?.tiny?.url;
    
    if (!musicUrl) {
      console.log("No music found on Pixabay for this style, using fallback.");
      return null;
    }

    const musicPath = path.join(projectDir, 'music.mp3');
    const musicResponse = await axios.get(musicUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(musicPath, musicResponse.data);
    console.log(`Music saved to ${musicPath}`);
    return musicPath;
  } catch (error) {
    console.error("Error fetching music from Pixabay:", error);
    return null;
  }
}
