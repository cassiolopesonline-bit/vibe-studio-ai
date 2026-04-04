import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";
import axios from "axios";

export async function generateSpeech(cenas: any[], voiceName: string, outputPath: string, config: any = {}) {
  const tts = new MsEdgeTTS();
  const allAudio: Buffer[] = [];
  const { voicePitch = 0, voiceSpeed = 1.0 } = config;

  // Mapa de vozes para garantir que funcione mesmo se o nome vier do Google
  // Se a voz não for encontrada, ele usa a 'pt-BR-AntonioNeural' por padrão
  const voiceMap: { [key: string]: string } = {
    'Kore': 'pt-BR-AntonioNeural',
    'Charon': 'pt-BR-DonatoNeural',
    'Aoede': 'pt-BR-FranciscaNeural',
    'Narrador USA': 'en-US-GuyNeural',
    'Narradora USA': 'en-US-AriaNeural'
  };

  const selectedVoice = voiceMap[voiceName] || voiceName || 'pt-BR-AntonioNeural';

  console.log(`Gerando narração com a voz: ${selectedVoice} (Grátis via Edge-TTS)`);

  try {
    for (const cena of cenas) {
      console.log(`Sintetizando cena: ${cena.narracao.substring(0, 30)}...`);
      
      // Configura a voz e o formato
      await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      
      // Gera o áudio da cena específica
      const audioBuffer = await tts.pushAsync(cena.narracao);
      allAudio.push(audioBuffer);
    }

    const combinedAudio = Buffer.concat(allAudio);
    fs.writeFileSync(outputPath, combinedAudio);
    console.log(`Áudio salvo com sucesso em: ${outputPath}`);
  } catch (error) {
    console.error("Erro na geração de voz Edge-TTS:", error);
    throw error;
  }
}

export async function getMusic(style: string, projectDir: string) {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.warn("PIXABAY_API_KEY não encontrada, pulando trilha sonora.");
    return null;
  }

  try {
    const query = encodeURIComponent(`${style} background music ambient`);
    const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${query}&category=music&per_page=3`;
    
    console.log(`Buscando música no Pixabay: ${style}...`);
    const response = await axios.get(url);
    const musicUrl = response.data.hits?.[0]?.videos?.tiny?.url;
    
    if (!musicUrl) {
      console.log("Nenhuma música encontrada no Pixabay.");
      return null;
    }

    const musicPath = path.join(projectDir, 'music.mp3');
    const musicResponse = await axios.get(musicUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(musicPath, musicResponse.data);
    return musicPath;
  } catch (error) {
    console.error("Erro ao buscar música:", error);
    return null;
  }
}
