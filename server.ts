import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 10000;

// O segredo está aqui: ler a pasta 'dist' que o comando build vai criar
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
