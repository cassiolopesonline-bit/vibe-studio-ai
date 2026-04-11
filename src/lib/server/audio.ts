import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs';

export async function generateSpeech(cenas: any[], voice: string, outputPath: string) {
  const tts = new MsEdgeTTS();
  const textoCompleto = cenas.map(c => c.narracao || c.roteiro).join(" ");
  
  // Força o uso do Antonio Neural (Voz excelente e grátis)
  const voiceName = "pt-BR-AntonioNeural"; 

  try {
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const readable = tts.push(textoCompleto);
    const writable = fs.createWriteStream(outputPath);
    readable.pipe(writable);

    return new Promise((resolve, reject) => {
      writable.on('finish', () => resolve(outputPath));
      writable.on('error', reject);
    });
  } catch (error) {
    console.error("Erro no áudio:", error);
    throw error;
  }
}

export async function getMusic(musicStyle: string, projectDir: string) {
  return path.join(projectDir, 'music.mp3');
}
