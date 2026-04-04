import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

export async function generateMedia(cenas: any[], projectDir: string, config: any = {}) {
  const mediaPaths: string[] = [];
  const { useAIImages, aspectRatio = '16:9', visualStyle = 'Cinematográfico', resolution = '1080p' } = config;

  console.log(`Generating media for ${cenas.length} scenes (AI: ${useAIImages}, Ratio: ${aspectRatio}, Style: ${visualStyle}, Res: ${resolution})...`);

  const promises = cenas.map(async (cena) => {
    const outputPath = path.join(projectDir, `scene_${cena.cena_id}.mp4`);
    
    try {
      if (useAIImages) {
        await generateAIImageKenBurns(cena.query_busca_imagem, cena.duracao_segundos, outputPath, aspectRatio, cena.velocidade, visualStyle, resolution);
      } else if (cena.usar_video) {
        try {
          await generatePexelsVideo(cena.query_busca_video, cena.duracao_segundos, outputPath, aspectRatio, cena.velocidade, resolution);
        } catch (error) {
          console.error(`Pexels video failed for scene ${cena.cena_id}, falling back to image:`, error);
          await generatePexelsImageKenBurns(cena.query_busca_imagem, cena.duracao_segundos, outputPath, aspectRatio, cena.velocidade, resolution);
        }
      } else {
        await generatePexelsImageKenBurns(cena.query_busca_imagem, cena.duracao_segundos, outputPath, aspectRatio, cena.velocidade, resolution);
      }
    } catch (err) {
      console.error(`Media generation failed for scene ${cena.cena_id}:`, err);
      // Fallback to a simple color background if everything fails
      await generateColorFallback(cena.duracao_segundos, outputPath, aspectRatio, resolution);
    }
    
    mediaPaths.push(outputPath);
  });

  await Promise.all(promises);
  return mediaPaths;
}

async function generateAIImageKenBurns(prompt: string, duration: number, outputPath: string, aspectRatio: string, speed: number = 1.0, visualStyle: string = 'Cinematográfico', resolution: string = '1080p') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for AI images");

  const ai = new GoogleGenAI({ apiKey });
  
  // Map aspect ratio string to Gemini format
  const geminiRatio = aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1';

  const stylePrompts: Record<string, string> = {
    'Cinematográfico': 'A high-quality, cinematic, professional stock photo of: {prompt}. Realistic style, 4k, detailed, movie lighting.',
    'Cartoon/Desenho': 'A vibrant, high-quality cartoon illustration of: {prompt}. Stylized, clean lines, colorful, professional animation style.',
    'Cyberpunk': 'A futuristic, cyberpunk style artwork of: {prompt}. Neon lights, high-tech, dark atmosphere, synthwave aesthetic, detailed.',
    'Realista': 'A hyper-realistic, high-resolution photograph of: {prompt}. Natural lighting, sharp focus, 8k, professional photography.',
    'Anime': 'A beautiful anime style illustration of: {prompt}. High-quality Japanese animation aesthetic, expressive, detailed background.',
    'Pintura a Óleo': 'A classic oil painting of: {prompt}. Rich textures, visible brushstrokes, artistic, museum quality, traditional style.',
    '3D Render': 'A professional 3D render of: {prompt}. Octane render, Unreal Engine 5 style, high-quality textures, volumetric lighting.'
  };

  const basePrompt = stylePrompts[visualStyle] || stylePrompts['Cinematográfico'];
  const finalPrompt = basePrompt.replace('{prompt}', prompt);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: finalPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: geminiRatio as any
      }
    }
  });

  let base64Data = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      base64Data = part.inlineData.data;
      break;
    }
  }

  if (!base64Data) throw new Error("Failed to generate AI image");

  const imagePath = path.join(path.dirname(outputPath), `ai_img_${Math.random()}.png`);
  fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));

  return applyKenBurns(imagePath, duration, outputPath, aspectRatio, speed, resolution);
}

async function generatePexelsVideo(query: string, duration: number, outputPath: string, aspectRatio: string, speed: number = 1.0, resolution: string = '1080p') {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY is required");

  const orientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';

  const response = await axios.get(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}`, {
    headers: { Authorization: apiKey }
  });

  const videos = response.data.videos || [];
  if (videos.length === 0) throw new Error("No video found on Pexels");

  const bestVideo = videos[0];
  const videoFile = bestVideo.video_files?.find((f: any) => f.quality === 'hd') || 
                    bestVideo.video_files?.[0];
                    
  const videoUrl = videoFile?.link;
  if (!videoUrl) throw new Error("No suitable video file found on Pexels");

  const tempVideoPath = path.join(path.dirname(outputPath), `temp_vid_${Math.random()}.mp4`);
  const vidResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(tempVideoPath, vidResponse.data);

  const [width, height] = getDimensions(aspectRatio, resolution);

  return new Promise((resolve, reject) => {
    ffmpeg(tempVideoPath)
      .duration(duration)
      .videoFilter([
        `scale=${width}:${height}:force_original_aspect_ratio=increase`,
        `crop=${width}:${height}`,
        `setpts=1/${speed}*PTS`,
        `fade=t=in:st=0:d=0.5`,
        `fade=t=out:st=${duration - 0.5}:d=0.5`
      ])
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-r 25',
        '-an' // Remove audio from stock video
      ])
      .save(outputPath)
      .on('end', () => {
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function generatePexelsImageKenBurns(query: string, duration: number, outputPath: string, aspectRatio: string, speed: number = 1.0, resolution: string = '1080p') {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY is required");

  const orientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';

  const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`, {
    headers: { Authorization: apiKey }
  });

  const imageUrl = response.data.photos[0]?.src?.large2x;
  if (!imageUrl) throw new Error("No image found on Pexels");

  const imagePath = path.join(path.dirname(outputPath), `temp_img_${Math.random()}.jpg`);
  const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, imgResponse.data);

  return applyKenBurns(imagePath, duration, outputPath, aspectRatio, speed, resolution);
}

async function applyKenBurns(imagePath: string, duration: number, outputPath: string, aspectRatio: string, speed: number = 1.0, resolution: string = '1080p') {
  const [width, height] = getDimensions(aspectRatio, resolution);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop(duration)
      .videoFilter([
        `scale=${width*2}:${height*2}:force_original_aspect_ratio=increase`,
        `crop=${width*2}:${height*2}`,
        `zoompan=z='min(zoom+0.001*${speed},1.5)':d=${duration * 25}:s=${width}x${height}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
        `fade=t=in:st=0:d=0.5`,
        `fade=t=out:st=${duration - 0.5}:d=0.5`
      ])
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-r 25'
      ])
      .save(outputPath)
      .on('end', () => {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function generateColorFallback(duration: number, outputPath: string, aspectRatio: string, resolution: string = '1080p') {
  const [width, height] = getDimensions(aspectRatio, resolution);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`color=c=black:s=${width}x${height}:d=${duration}`)
      .inputFormat('lavfi')
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-r 25'
      ])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
}

function getDimensions(aspectRatio: string, resolution: string = '1080p'): [number, number] {
  const is720 = resolution === '720p';
  if (aspectRatio === '9:16') return is720 ? [720, 1280] : [1080, 1920];
  if (aspectRatio === '1:1') return is720 ? [720, 720] : [1080, 1080];
  return is720 ? [1280, 720] : [1920, 1080];
}
