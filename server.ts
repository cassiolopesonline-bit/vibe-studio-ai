import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 10000;

// O servidor vai ler a pasta 'dist', que o Render vai gerar
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
