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
app.use(express.json());

app.post("/api/generate-script", async (req, res) => {
  const { tema } = req.body;
  const script = await gerarRoteiro(tema, 1, "Informativo", "Português BR");
  res.json(script);
});

app.post("/api/produce-video", async (req, res) => {
  const { config, script } = req.body;
  const result = await produzirVideo(config, script);
  res.json(result);
});

app.use(express.static(path.join(process.cwd(), 'dist')));
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'dist', 'index.html')));

app.listen(Number(PORT), "0.0.0.0", () => console.log(`Servidor na porta ${PORT}`));
