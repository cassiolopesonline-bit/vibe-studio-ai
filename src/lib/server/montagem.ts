import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export async function assembleVideo(cenas: any[], mediaPaths: string[], narrationPath: string, config: any, outputPath: string) {
  console.log(`Assembling video to ${outputPath}...`);

  const projectDir = path.dirname(outputPath);
  const concatFilePath = path.join(projectDir, 'concat.txt');
  const concatContent = mediaPaths.map(p => `file '${p}'`).join('\n');
  fs.writeFileSync(concatFilePath, concatContent);

  const srtPath = path.join(projectDir, 'subtitles.srt');
  generateSrt(cenas, srtPath);

  return new Promise((resolve, reject) => {
    const musicPath = path.join(projectDir, 'music.mp3');
    const hasMusic = fs.existsSync(musicPath);

    const command = ffmpeg()
      .input(concatFilePath)
      .inputOptions(['-f concat', '-safe 0'])
      .input(narrationPath);

    if (hasMusic) {
      command.input(musicPath);
    }

    const filters = [];
    filters.push(`[1:a]volume=${config.narrationVolume / 100}[a1]`);
    
    if (hasMusic) {
      if (config.musicDucking) {
        // sidechaincompress: music (2:a) is compressed by narration (1:a)
        filters.push(`[2:a]volume=${config.musicVolume / 100}[a2_pre]`);
        filters.push(`[a2_pre][1:a]sidechaincompress=threshold=0.1:ratio=20:attack=10:release=200[a2]`);
      } else {
        filters.push(`[2:a]volume=${config.musicVolume / 100}[a2]`);
      }
      filters.push(`[a1][a2]amix=inputs=2:duration=first[aout]`);
    } else {
      filters.push(`[a1]anull[aout]`);
    }

    const videoFilters = [];
    if (config.showSubtitles) {
      const color = config.subtitleColor?.replace('#', '&H') || '&HFFFFFF';
      
      let style = `FontSize=24,PrimaryColour=${color},OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=20`;
      
      if (config.subtitleStyle === 'outline') {
        style = `FontSize=26,PrimaryColour=${color},OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=1,Alignment=2,MarginV=25`;
      } else if (config.subtitleStyle === 'glow') {
        style = `FontSize=24,PrimaryColour=${color},OutlineColour=${color},BorderStyle=1,Outline=1,Shadow=4,Alignment=2,MarginV=20`;
      } else if (config.subtitleStyle === 'minimal') {
        style = `FontSize=18,PrimaryColour=&HCCCCCC,OutlineColour=&H00000000,BorderStyle=1,Outline=0,Shadow=0,Alignment=2,MarginV=15,Italic=1`;
      }
      
      videoFilters.push(`subtitles='${srtPath.replace(/\\/g, '/')}:force_style="${style}"'`);
    }

    command
      .complexFilter(filters)
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-r 25',
        '-map 0:v',
        '-map [aout]',
        '-shortest'
      ]);

    if (videoFilters.length > 0) {
      command.videoFilters(videoFilters);
    }

    command.save(outputPath)
      .on('end', () => {
        fs.unlinkSync(concatFilePath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error(`FFmpeg assembly error:`, err);
        reject(err);
      });
  });
}

function generateSrt(cenas: any[], outputPath: string) {
  let srt = "";
  cenas.forEach((cena, i) => {
    const start = formatTime(cena.timestamp_inicio);
    const end = formatTime(cena.timestamp_inicio + cena.duracao_segundos);
    srt += `${i + 1}\n${start} --> ${end}\n${cena.narracao}\n\n`;
  });
  fs.writeFileSync(outputPath, srt);
}

function formatTime(seconds: number) {
  const date = new Date(0);
  date.setSeconds(seconds);
  const ms = Math.floor((seconds % 1) * 1000);
  return date.toISOString().substr(11, 8) + "," + ms.toString().padStart(3, '0');
}
