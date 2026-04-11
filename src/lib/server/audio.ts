import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs';

export async function generateSpeech(cenas: any[], voice: string, outputPath: string, config: any) {
  const tts = new MsEdgeTTS();
  
  // Juntamos todo o texto das cenas para narrar de uma vez
  const textoCompleto = cenas.map(c => c.roteiro).join(" ");

  // Mapeamos os nomes das vozes para as vozes reais da Microsoft
  // Se não encontrar, ele usa o Antonio (Masculino) ou Francisca (Feminino)
  let voiceName = "pt-BR-AntonioNeural"; 
  if (voice.toLowerCase().includes('feminina')) voiceName = "pt-BR-FranciscaNeural";

  console.log(`Gerando narração com a voz: ${voiceName}...`);

  try {
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const readable = tts.push(textoCompleto);
    
    const writable = fs.createWriteStream(outputPath);
    readable.pipe(writable);

    return new Promise((resolve, reject) => {
      writable.on('finish', () => {
        console.log("Narração concluída com sucesso!");
        resolve(outputPath);
      });
      writable.on('error', reject);
    });
  } catch (error) {
    console.error("Erro na narração independente:", error);
    throw error;
  }
}

// Função para música (mantendo a estrutura que seu app espera)
export async function getMusic(musicStyle: string, projectDir: string) {
  const musicPath = path.join(projectDir, 'music.mp3');
  // Aqui você pode colocar uma lógica para baixar música livre ou um arquivo padrão
  console.log(`Buscando trilha sonora: ${musicStyle}...`);
  return musicPath;
}
