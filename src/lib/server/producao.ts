import path from "path";
import fs from "fs";
import { generateSpeech, getMusic } from "./audio.ts";
import { generateMedia } from "./midia.ts";
import { assembleVideo } from "./montagem.ts";
import { v4 as uuidv4 } from "uuid";

export async function produzirVideo(config: any, script: any) {
  const projectId = uuidv4();
  const projectDir = path.join(process.cwd(), 'temp', projectId);
  if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

  console.log(`Starting production for project ${projectId}...`);

  // 1. Generate Narration
  const narrationPath = path.join(projectDir, 'narration.mp3');
  await generateSpeech(script.cenas, config.voice, narrationPath, config);

  // 2. Fetch Music
  await getMusic(config.musicStyle, projectDir);

  // 3. Generate Media (Images/Videos) in parallel
  const mediaPaths = await generateMedia(script.cenas, projectDir, config);

  // 4. Assemble Video
  const videoPath = path.join(projectDir, 'video_v1.mp4');
  await assembleVideo(script.cenas, mediaPaths, narrationPath, config, videoPath);

  // 4. Save project state
  const projectState = {
    projectId,
    config,
    script,
    versions: [{ version: 1, path: `/temp/${projectId}/video_v1.mp4` }],
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(projectDir, 'projeto.json'), JSON.stringify(projectState, null, 2));

  return projectState;
}

export async function editarVideo(projectId: string, action: string, data: any) {
  const projectDir = path.join(process.cwd(), 'temp', projectId);
  const projectStatePath = path.join(projectDir, 'projeto.json');
  if (!fs.existsSync(projectStatePath)) throw new Error("Project not found");

  const projectState = JSON.parse(fs.readFileSync(projectStatePath, 'utf8'));
  const nextVersion = projectState.versions.length + 1;
  const videoPath = path.join(projectDir, `video_v${nextVersion}.mp4`);

  console.log(`Editing project ${projectId}, action: ${action}...`);

  if (action === "change_narrator") {
    projectState.config = { ...projectState.config, ...data };
    const narrationPath = path.join(projectDir, 'narration.mp3');
    await generateSpeech(projectState.script.cenas, data.voice, narrationPath, projectState.config);
  } else if (action === "change_music") {
    projectState.config = { ...projectState.config, ...data };
    await getMusic(data.musicStyle, projectDir);
  } else if (action === "edit_scene") {
    const sceneIndex = projectState.script.cenas.findIndex((c: any) => c.cena_id === data.sceneId);
    if (sceneIndex !== -1) {
      projectState.script.cenas[sceneIndex] = { ...projectState.script.cenas[sceneIndex], ...data.sceneData };
      // Regenerate specific scene media if needed
      await generateMedia([projectState.script.cenas[sceneIndex]], projectDir, projectState.config);
      // Regenerate narration if text changed
      const narrationPath = path.join(projectDir, 'narration.mp3');
      await generateSpeech(projectState.script.cenas, projectState.config.voice, narrationPath, projectState.config);
    }
  } else if (action === "change_visual") {
    const oldAI = projectState.config.useAIImages;
    const oldRatio = projectState.config.aspectRatio;
    const oldStyle = projectState.config.visualStyle;
    const oldRes = projectState.config.resolution;
    
    projectState.config = { ...projectState.config, ...data };
    
    // If AI setting, Ratio, Style or Resolution changed, we need to regenerate media
    if (oldAI !== data.useAIImages || oldRatio !== data.aspectRatio || oldStyle !== data.visualStyle || oldRes !== data.resolution) {
      await generateMedia(projectState.script.cenas, projectDir, projectState.config);
    }
  }

  // Re-assemble
  const mediaPaths = projectState.script.cenas.map((c: any) => path.join(projectDir, `scene_${c.cena_id}.mp4`));
  const narrationPath = path.join(projectDir, 'narration.mp3');
  await assembleVideo(projectState.script.cenas, mediaPaths, narrationPath, projectState.config, videoPath);

  projectState.versions.push({ version: nextVersion, path: `/temp/${projectId}/video_v${nextVersion}.mp4` });
  fs.writeFileSync(projectStatePath, JSON.stringify(projectState, null, 2));

  return projectState;
}
