import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 10000;

// Define o caminho da pasta src onde está o seu index.html
const publicPath = path.join(process.cwd(), 'src');

// Middleware para entender JSON (importante para a IA)
app.use(express.json());
app.use(express.static(publicPath));

// Rota principal que entrega o seu site
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
