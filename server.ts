import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { gerarRoteiro } from "./src/lib/server/roteiro.ts";
import { produzirVideo } from "./src/lib/server/producao.ts";

dotenv.config();
const app = express();
const PORT = process.env.PORT || "10000";

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 VibeStudio online na porta ${PORT}`);
});
