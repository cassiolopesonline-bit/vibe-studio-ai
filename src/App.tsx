import React, { useState, useEffect } from 'react';
import { Sparkles, Video, Download, Play, Loader2, AlertCircle, Sun, Moon } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');
  const [voice, setVoice] = useState('pt-BR-AntonioNeural');
  const [script, setScript] = useState(null);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateScript = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: theme, voice })
      });
      const data = await res.json();
      setScript(data);
    } catch (err) { setError("Erro ao gerar roteiro"); }
    finally { setLoading(false); }
  };

  const handleProduceVideo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/produce-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { voice }, script })
      });
      const data = await res.json();
      setProject(data);
      setActiveTab('preview');
    } catch (err) { setError("Erro na produção"); }
    finally { setLoading(false); }
  };

  return (
    <div className={darkMode ? 'bg-zinc-950 text-white min-h-screen' : 'bg-zinc-50 text-black min-h-screen'}>
      <nav className="p-4 border-b border-white/5 flex justify-between items-center">
        <h1 className="font-bold text-xl">VibeStudio AI</h1>
        <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun /> : <Moon />}</button>
      </nav>
      <main className="p-8 max-w-4xl mx-auto">
        {activeTab === 'create' ? (
          <div className="space-y-6">
            <textarea value={theme} onChange={(e)=>setTheme(e.target.value)} className="w-full p-4 bg-zinc-900 rounded-xl" placeholder="Tema do vídeo..." />
            <select value={voice} onChange={(e)=>setVoice(e.target.value)} className="w-full p-4 bg-zinc-900 rounded-xl text-brand font-bold">
              <option value="pt-BR-AntonioNeural">Antonio (Grátis)</option>
              <option value="pt-BR-FranciscaNeural">Francisca (Grátis)</option>
              <option value="pt-BR-ThalitaNeural">Thalita (Grátis)</option>
              <option value="pt-BR-DonatoNeural">Donato (Grátis)</option>
            </select>
            <div className="flex gap-4">
              <button onClick={handleGenerateScript} className="flex-1 p-4 bg-zinc-800 rounded-xl font-bold">ROTEIRO</button>
              <button onClick={handleProduceVideo} disabled={!script} className="flex-1 p-4 bg-blue-600 rounded-xl font-bold">PRODUZIR</button>
            </div>
            {script && <div className="p-4 bg-white/5 rounded-xl mt-4">{script.titulo}</div>}
          </div>
        ) : (
          <div className="text-center">
            {project && <video src={project.versions[0].path} controls className="w-full rounded-xl" />}
            <button onClick={()=>setActiveTab('create')} className="mt-4 p-4 border border-white/10 rounded-xl">VOLTAR</button>
          </div>
        )}
      </main>
    </div>
  );
}
