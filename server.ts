import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { gerarRoteiro } from "./src/lib/server/roteiro.ts";
import { produzirVideo, editarVideo } from "./src/lib/server/producao.ts";

dotenv.config();

// Configure ffmpeg path
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Ensure temp directories exist
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  // API Routes
  app.post("/api/generate-script", async (req, res) => {
    try {
      const { tema, duracao, tom, idioma, template } = req.body;
      const script = await gerarRoteiro(tema, duracao, tom, idioma, template);
      res.json(script);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/produce-video", async (req, res) => {
    try {
      const { config, script } = req.body;
      const result = await produzirVideo(config, script);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/edit-video", async (req, res) => {
    try {
      const { projectId, action, data } = req.body;
      const result = await editarVideo(projectId, action, data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/save-project", async (req, res) => {
    try {
      const { projectId, config, script } = req.body;
      const id = projectId || uuidv4();
      const projectDir = path.join(tempDir, id);
      if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

      const projectPath = path.join(projectDir, 'projeto.json');
      let projectData: any = {
        projectId: id,
        config,
        script,
        versions: [],
        createdAt: new Date().toISOString()
      };

      if (fs.existsSync(projectPath)) {
        const existingData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
        projectData = { ...existingData, config, script };
      }

      fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));
      res.json(projectData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects: any[] = [];
      const dirs = fs.readdirSync(tempDir);
      for (const dir of dirs) {
        const projectPath = path.join(tempDir, dir, 'projeto.json');
        if (fs.existsSync(projectPath)) {
          const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
          projects.push(projectData);
        }
      }
      res.json(projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const projectPath = path.join(tempDir, projectId, 'projeto.json');
      if (!fs.existsSync(projectPath)) return res.status(404).json({ error: "Project not found" });
      const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
      res.json(projectData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/projects/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const projectDir = path.join(tempDir, projectId);
      if (fs.existsSync(projectDir)) {
        fs.rmSync(projectDir, { recursive: true, force: true });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/test-apis", async (req, res) => {
    // Basic connectivity check
    res.json({ status: "ok", message: "APIs are reachable from server" });
  });

  // Serve static files from temp for video previews
  app.use('/temp', express.static(tempDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
   const distPath = path.join(process.cwd(), 'src');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
