import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
// Estas funções abaixo precisam existir na sua pasta src/lib/server/
import { gerarRoteiro } from "./src/lib/server/roteiro.ts";
import { produzirVideo, editarVideo } from "./src/lib/server/producao.ts";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. Rota para Gerar Roteiro (O que deu erro antes)
app.post("/api/generate-script", async (req, res) => {
  try {
    const { tema, duracao, tom, idioma, template } = req.body;
    const script = await gerarRoteiro(tema, duracao, tom, idioma, template);
    res.json(script);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Rota para Produzir o Vídeo
app.post("/api/produce-video", async (req, res) => {
  try {
    const { config, script } = req.body;
    const result = await produzirVideo(config, script);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve os arquivos prontos do site
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Serve a pasta temp para os previews de vídeo
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
