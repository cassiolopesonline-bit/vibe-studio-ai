import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs';

export async function generateSpeech(cenas: any[], voice: string, outputPath: string, config: any) {
  const tts = new MsEdgeTTS();
  const textoCompleto = cenas.map(c => c.narracao || c.roteiro).join(" ");

  // Mapeia o que vem do visual para a voz real da Microsoft
  let voiceName = voice || "pt-BR-AntonioNeural"; 
  
  // Garante que se vier um ID antigo da Google, ele mude para o gratuito
  if (voiceName.includes('Wavenet') || voiceName.includes('Standard')) {
    voiceName = voiceName.includes('Feminina') ? "pt-BR-FranciscaNeural" : "pt-BR-AntonioNeural";
  }

  console.log(`🎤 Gerando áudio gratuito: ${voiceName}`);

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
    console.error("❌ Erro no áudio:", error);
    throw error;
  }
}

export async function getMusic(musicStyle: string, projectDir: string) {
  return path.join(projectDir, 'music.mp3');
}
