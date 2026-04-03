# Guia de Deploy: VibeStudio AI no Render.com

Este guia explica como subir o seu projeto para o GitHub e realizar o deploy no Render.com.

## 1. Preparação do Repositório (GitHub)

1.  Crie um novo repositório no seu GitHub (ex: `vibe-studio-ai`).
2.  No seu computador, abra o terminal na pasta do projeto.
3.  Inicie o git e suba os arquivos:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/vibe-studio-ai.git
    git push -u origin main
    ```

## 2. Configuração no Render.com

1.  Acesse [Render.com](https://render.com) e faça login.
2.  Clique em **New +** e selecione **Web Service**.
3.  Conecte sua conta do GitHub e selecione o repositório `vibe-studio-ai`.
4.  Configure os detalhes do serviço:
    *   **Name:** `vibe-studio-ai`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`
5.  **Variáveis de Ambiente (Environment Variables):**
    Clique em **Advanced** ou na aba **Environment** e adicione as seguintes chaves:
    *   `GEMINI_API_KEY`: Sua chave da API do Google Gemini.
    *   `PEXELS_API_KEY`: Sua chave da API do Pexels.
    *   `PIXABAY_API_KEY`: Sua chave da API do Pixabay.
    *   `GOOGLE_APPLICATION_CREDENTIALS_JSON`: O conteúdo do seu arquivo JSON de credenciais do Google Cloud (para o Text-to-Speech).
    *   `NODE_ENV`: `production`

## 3. Notas Importantes

*   **FFmpeg:** O Render.com já possui o FFmpeg instalado em seus ambientes Linux, mas o projeto usa o `ffmpeg-static` para garantir compatibilidade.
*   **Armazenamento Temporário:** O Render.com usa um sistema de arquivos efêmero. Isso significa que os vídeos gerados na pasta `temp/` serão apagados se o servidor reiniciar. Para produção real, considere usar um serviço como AWS S3 ou Google Cloud Storage para salvar os vídeos permanentemente.
*   **Porta:** O servidor está configurado para usar a variável `PORT` fornecida pelo Render (padrão 3000).

## 4. Como baixar o ZIP

Para baixar o projeto agora e subir no GitHub:
1.  No menu superior do **AI Studio**, clique no ícone de engrenagem (Settings).
2.  Selecione **Export to ZIP**.
3.  Extraia o arquivo no seu computador e siga os passos do item 1 deste guia.
