import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Settings, 
  Edit3, 
  Download, 
  Play, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Volume2, 
  Music, 
  History, 
  Key, 
  Save, 
  Palette,
  RefreshCw, 
  Trash2,
  Maximize,
  ImageIcon,
  Type,
  Zap,
  Sun,
  Moon,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'create' | 'preview' | 'edit' | 'settings' | 'inspiration';

interface Scene {
  cena_id: number;
  duracao_segundos: number;
  base_duracao?: number;
  velocidade?: number;
  narracao: string;
  query_busca_imagem: string;
  query_busca_video: string;
  usar_video: boolean;
  importancia: 'alta' | 'media' | 'low';
  timestamp_inicio: number;
}

interface Script {
  titulo: string;
  duracao_total_segundos: number;
  cenas: Scene[];
}

interface ProjectState {
  projectId: string;
  config: any;
  script: Script;
  versions: { version: number; path: string }[];
  createdAt: string;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [loading, setLoading] = useState(false);
  const [inspirationVideos, setInspirationVideos] = useState<any[]>([]);
  const [verticalVideos, setVerticalVideos] = useState<any[]>([]);
  const [loadingInspiration, setLoadingInspiration] = useState(false);
  const [previewingMusic, setPreviewingMusic] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MUSIC_PREVIEWS: Record<string, string> = {
    'Cinematográfico': 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    'Misterioso': 'https://cdn.pixabay.com/audio/2022/02/22/audio_d0c6af1110.mp3',
    'Épico': 'https://cdn.pixabay.com/audio/2022/01/21/audio_31743c588f.mp3',
    'Suave': 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3',
    'Tensão': 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    'Lo-Fi': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1ab0f0308d.mp3',
    'Cyberpunk': 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    'Alegre': 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3'
  };

  const handleToggleMusicPreview = (style: string) => {
    if (previewingMusic === style) {
      audioRef.current?.pause();
      setPreviewingMusic(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const url = MUSIC_PREVIEWS[style];
      if (url) {
        audioRef.current = new Audio(url);
        audioRef.current.volume = musicVolume / 100;
        audioRef.current.play();
        setPreviewingMusic(style);
        audioRef.current.onended = () => setPreviewingMusic(null);
      }
    }
  };

  const fetchInspiration = async () => {
    setLoadingInspiration(true);
    try {
      // Fetch horizontal videos
      const resH = await fetch('https://api.pexels.com/videos/search?query=cinematic+landscape+tech&per_page=6&orientation=landscape', {
        headers: { Authorization: '5332242a64100000010000100778f654446548779913994326578654' }
      });
      const dataH = await resH.json();
      if (dataH.videos && dataH.videos.length > 0) {
        setInspirationVideos(dataH.videos);
      } else {
        throw new Error("No horizontal videos found");
      }

      // Fetch vertical videos
      const resV = await fetch('https://api.pexels.com/videos/search?query=fashion+lifestyle+vlog&per_page=4&orientation=portrait', {
        headers: { Authorization: '5332242a64100000010000100778f654446548779913994326578654' }
      });
      const dataV = await resV.json();
      if (dataV.videos && dataV.videos.length > 0) {
        setVerticalVideos(dataV.videos);
      } else {
        throw new Error("No vertical videos found");
      }
    } catch (error) {
      console.error("Erro ao carregar inspiração, usando fallback:", error);
      // Fallback data if API fails
      setInspirationVideos([
        { id: 1, video_files: [{ link: 'https://player.vimeo.com/external/370331493.sd.mp4?s=7b23a58aa4ef70725c3a82439f7c709046396834&profile_id=139&oauth2_token_id=57447761' }], image: 'https://picsum.photos/seed/v1/800/450', user: { name: 'Cinematic Nature' } },
        { id: 2, video_files: [{ link: 'https://player.vimeo.com/external/517090081.sd.mp4?s=454c2d7115df2de7d81910565d4820f1905835c4&profile_id=139&oauth2_token_id=57447761' }], image: 'https://picsum.photos/seed/v2/800/450', user: { name: 'Urban Tech' } },
        { id: 3, video_files: [{ link: 'https://player.vimeo.com/external/494252666.sd.mp4?s=721d1249129905c78151047274890761a572c1bb&profile_id=139&oauth2_token_id=57447761' }], image: 'https://picsum.photos/seed/v3/800/450', user: { name: 'Fashion Vision' } }
      ]);
      setVerticalVideos([
        { id: 4, video_files: [{ link: 'https://player.vimeo.com/external/403846610.sd.mp4?s=6941656821815181518151815181518151815181&profile_id=139&oauth2_token_id=57447761' }], image: 'https://picsum.photos/seed/v4/400/700', user: { name: 'Vlog Style' } },
        { id: 5, video_files: [{ link: 'https://player.vimeo.com/external/403846610.sd.mp4?s=6941656821815181518151815181518151815181&profile_id=139&oauth2_token_id=57447761' }], image: 'https://picsum.photos/seed/v5/400/700', user: { name: 'Street Fashion' } }
      ]);
    } finally {
      setLoadingInspiration(false);
    }
  };
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectState | null>(null);
  const [savedProjects, setSavedProjects] = useState<ProjectState[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editSubTab, setEditSubTab] = useState<'subtitles' | 'music'>('subtitles');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Config
  const [theme, setTheme] = useState('');
  const [template, setTemplate] = useState('Livre');
  const [duration, setDuration] = useState(1);
  const [tone, setTone] = useState('Informativo');
  const [language, setLanguage] = useState('Português BR');
  const [voice, setVoice] = useState('pt-BR-Wavenet-B');
  const [voicePitch, setVoicePitch] = useState(0);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [visualStyle, setVisualStyle] = useState('Cinematográfico');
  const [resolution, setResolution] = useState('1080p');
  const [subtitleStyle, setSubtitleStyle] = useState('default');
  const [narrationVolume, setNarrationVolume] = useState(100);

  const visualStyles = [
    { id: 'Cinematográfico', name: 'Cinematográfico', img: 'https://picsum.photos/seed/movie/200/120' },
    { id: 'Realista', name: 'Realista', img: 'https://picsum.photos/seed/real/200/120' },
    { id: 'Cartoon/Desenho', name: '3D Cartoon', img: 'https://picsum.photos/seed/disney/200/120' },
    { id: 'Anime', name: 'Anime', img: 'https://picsum.photos/seed/anime/200/120' },
    { id: 'Cyberpunk', name: 'Cyberpunk', img: 'https://picsum.photos/seed/cyber/200/120' },
    { id: 'Pintura a Óleo', name: 'Pintura', img: 'https://picsum.photos/seed/paint/200/120' },
  ];

  const subtitleStyles = [
    { id: 'none', name: 'Sem Legenda', class: '' },
    { id: 'default', name: 'Padrão', class: 'font-sans' },
    { id: 'cursive', name: 'Cursiva', class: 'font-serif italic' },
    { id: 'bold-yellow', name: 'Destaque Amarelo', class: 'font-black text-yellow-400 uppercase' },
    { id: 'glow-blue', name: 'Brilho Azul', class: 'font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' },
    { id: 'outline-red', name: 'Contorno Vermelho', class: 'font-bold text-red-500 [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]' },
    { id: 'minimal-yellow', name: 'Minimal Amarelo', class: 'font-light text-yellow-200 tracking-widest' },
    { id: 'caps-white', name: 'Caps Branco', class: 'font-black text-white uppercase tracking-tighter' },
  ];

  const MUSIC_TRACKS = [
    { id: 'none', name: 'Nenhuma', url: '' },
    { id: 'camino', name: 'Camino A Pozitos', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3' },
    { id: 'gemini', name: 'Gemini', url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d0c6af1110.mp3' },
    { id: 'thats-the-one', name: 'That\'s the One', url: 'https://cdn.pixabay.com/audio/2022/01/21/audio_31743c588f.mp3' },
    { id: 'dance', name: 'Dance Number 24449', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3' },
    { id: 'lonely', name: 'Lonely Man', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3' },
    { id: 'deck', name: 'Deck The Halls', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1ab0f0308d.mp3' },
    { id: 'connective', name: 'Connective Tissue', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3' },
    { id: 'vayase', name: 'Vayase A Dormir', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3' },
    { id: 'acta', name: 'Acta Non Verba', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3' },
    { id: 'jingle', name: 'Jingle Bells', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1ab0f0308d.mp3' },
    { id: 'creme', name: 'Creme Brulee', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3' },
    { id: 'california', name: 'California King', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3' },
  ];

  const trendingTopics = [
    { title: "A história de superação de um atleta", icon: "🏆", category: "Esporte" },
    { title: "Curiosidades sobre o espaço sideral", icon: "🚀", category: "Ciência" },
    { title: "Como a IA vai mudar o mundo em 2026", icon: "🤖", category: "Tecnologia" },
    { title: "Meditação guiada para iniciantes", icon: "🧘", category: "Saúde" },
    { title: "A jornada de um herói em um mundo RPG", icon: "⚔️", category: "Games" },
    { title: "Receitas rápidas para o dia a dia", icon: "🍳", category: "Culinária" },
    { title: "Dicas de viagem para o Japão", icon: "🗾", category: "Viagem" }
  ];
  const [musicVolume, setMusicVolume] = useState(30);
  const [musicStyle, setMusicStyle] = useState('Cinematográfico');
  const [musicDucking, setMusicDucking] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [useAIImages, setUseAIImages] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');

  // Script
  const [script, setScript] = useState<Script | null>(null);
  const [isScriptEditable, setIsScriptEditable] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    pexels: '',
    pixabay: '',
    google_tts: ''
  });

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleGenerateScript = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    addLog("Iniciando geração de roteiro gratuito com Gemini 2.0 Flash...");
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: theme, duracao: duration, tom: tone, idioma: language, template })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScript(data);
      addLog("Roteiro gratuito gerado com sucesso!");
    } catch (err: any) {
      setError(err.message);
      addLog(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProduceVideo = async () => {
    if (!script) return;
    setLoading(true);
    setError(null);
    addLog("Iniciando produção do vídeo (Free Tier)...");
    try {
      const config = { 
        voice, voicePitch, voiceSpeed, narrationVolume, musicVolume, musicStyle, musicDucking,
        theme, template, duration, tone, language,
        aspectRatio, useAIImages, showSubtitles, subtitleColor, visualStyle,
        resolution, subtitleStyle
      };
      const res = await fetch('/api/produce-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, script })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProject(data);
      setActiveTab('preview');
      addLog("Vídeo gratuito produzido com sucesso!");
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
      addLog(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (!data.error) setSavedProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleLoadProject = (proj: ProjectState) => {
    setProject(proj);
    setScript(proj.script);
    // Restore config if available
    if (proj.config) {
      if (proj.config.theme) setTheme(proj.config.theme);
      if (proj.config.template) setTemplate(proj.config.template);
      if (proj.config.duration) setDuration(proj.config.duration);
      if (proj.config.tone) setTone(proj.config.tone);
      if (proj.config.language) setLanguage(proj.config.language);
      if (proj.config.voice) setVoice(proj.config.voice);
      if (proj.config.narrationVolume) setNarrationVolume(proj.config.narrationVolume);
      if (proj.config.musicVolume) setMusicVolume(proj.config.musicVolume);
      if (proj.config.musicStyle) setMusicStyle(proj.config.musicStyle);
      if (proj.config.aspectRatio) setAspectRatio(proj.config.aspectRatio);
      if (proj.config.useAIImages !== undefined) setUseAIImages(proj.config.useAIImages);
      if (proj.config.showSubtitles !== undefined) setShowSubtitles(proj.config.showSubtitles);
      if (proj.config.subtitleColor) setSubtitleColor(proj.config.subtitleColor);
      if (proj.config.visualStyle) setVisualStyle(proj.config.visualStyle);
      if (proj.config.resolution) setResolution(proj.config.resolution);
      if (proj.config.subtitleStyle) setSubtitleStyle(proj.config.subtitleStyle);
    }
    setActiveTab('preview');
    setShowHistory(false);
    addLog(`Projeto "${proj.script.titulo}" carregado.`);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      fetchProjects();
      if (project?.projectId === projectId) setProject(null);
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchProjects();
    fetchInspiration();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPreviewingMusic(null);
    }
  }, [activeTab]);

  const handleSurpriseMe = () => {
    const templates = ['Tutorial', 'Review de Produto', 'Vlog', 'Documentário', 'Noticiário'];
    const tones = ['Informativo', 'Misterioso', 'Dramático', 'Épico', 'Publicitário'];
    const styles = ['Cinematográfico', 'Misterioso', 'Épico', 'Suave', 'Tensão'];
    const ratios = ['16:9', '9:16', '1:1'];
    
    setTemplate(templates[Math.floor(Math.random() * templates.length)]);
    setTone(tones[Math.floor(Math.random() * tones.length)]);
    setMusicStyle(styles[Math.floor(Math.random() * styles.length)]);
    setAspectRatio(ratios[Math.floor(Math.random() * ratios.length)]);
    setUseAIImages(Math.random() > 0.5);
    setDuration(Math.floor(Math.random() * 3) + 1);
    
    addLog("Configurações randomizadas! Prepare-se para algo único.");
  };

  const handleSaveProject = async () => {
    if (!script) return;
    setLoading(true);
    try {
      const config = { 
        voice, voicePitch, voiceSpeed, narrationVolume, musicVolume, musicStyle, musicDucking,
        theme, template, duration, tone, language,
        aspectRatio, useAIImages, showSubtitles, subtitleColor, visualStyle,
        resolution, subtitleStyle
      };
      const res = await fetch('/api/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project?.projectId, config, script })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProject(data);
      addLog("Projeto salvo com sucesso!");
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
      addLog(`Erro ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = async (action: string, data: any) => {
    if (!project) return;
    setLoading(true);
    setError(null);
    addLog(`Executando edição parcial: ${action}...`);
    try {
      const res = await fetch('/api/edit-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.projectId, action, data })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setProject(result);
      addLog("Edição concluída!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
      addLog(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-brand/30 transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Sidebar / Nav */}
      <nav className={`fixed top-0 left-0 right-0 h-16 z-50 px-4 md:px-8 flex items-center justify-between border-b transition-all duration-300 ${darkMode ? 'bg-zinc-950/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-black/5 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2 group cursor-pointer shrink-0">
          <div className="p-1.5 md:p-2 bg-brand/10 border border-brand/20 rounded-lg group-hover:bg-brand/20 transition-all duration-500">
            <Video className="w-4 h-4 md:w-5 md:h-5 text-brand" />
          </div>
          <h1 className="text-sm md:text-xl font-display font-bold tracking-tight hidden xs:block">
            VibeStudio <span className="text-brand">AI</span>
          </h1>
        </div>
        
        <div className={`hidden md:flex p-1 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100/50 border-black/5'}`}>
          {(['inspiration', 'create', 'preview', 'edit', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab 
                  ? (darkMode ? 'bg-zinc-800 text-white shadow-lg ring-1 ring-white/10' : 'bg-white text-zinc-900 shadow-md ring-1 ring-black/5')
                  : (darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900')
              }`}
            >
              {tab === 'inspiration' && <Globe className="w-3.5 h-3.5" />}
              {tab === 'create' && <Sparkles className="w-3.5 h-3.5" />}
              {tab === 'preview' && <Play className="w-3.5 h-3.5" />}
              {tab === 'edit' && <Edit3 className="w-3.5 h-3.5" />}
              {tab === 'settings' && <Settings className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{tab === 'inspiration' ? 'Inspiração' : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/5 text-zinc-500 hover:text-brand' : 'bg-black/5 border-black/5 text-zinc-500 hover:text-brand'}`}
          >
            {darkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <div className={`h-6 w-px mx-0.5 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-xl border transition-all ${showHistory ? 'text-brand border-brand/30 bg-brand/5' : (darkMode ? 'bg-white/5 border-white/5 text-zinc-500 hover:text-brand' : 'bg-black/5 border-black/5 text-zinc-500 hover:text-brand')}`}
          >
            <History className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t backdrop-blur-xl px-2 py-1 flex justify-around items-center transition-all duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] ${darkMode ? 'bg-zinc-950/90 border-white/10' : 'bg-white/90 border-black/10'}`}>
        {(['inspiration', 'create', 'preview', 'edit', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[64px] ${
              activeTab === tab 
                ? 'text-brand bg-brand/10' 
                : (darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900')
            }`}
          >
            {tab === 'inspiration' && <Globe className="w-5 h-5" />}
            {tab === 'create' && <Sparkles className="w-5 h-5" />}
            {tab === 'preview' && <Play className="w-5 h-5" />}
            {tab === 'edit' && <Edit3 className="w-5 h-5" />}
            {tab === 'settings' && <Settings className="w-5 h-5" />}
            <span className="text-[9px] font-bold uppercase tracking-tight">
              {tab === 'inspiration' ? 'Inspiração' : tab === 'create' ? 'Criar' : tab === 'preview' ? 'Ver' : tab === 'edit' ? 'Editar' : 'Ajustes'}
            </span>
          </button>
        ))}
      </div>

      {/* History Side Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-96 border-l z-[70] p-8 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-zinc-950 border-white/5' : 'bg-white border-black/5'}`}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold">Histórico</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Projetos Salvos</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className={`p-2 transition-colors ${darkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                  <Trash2 className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                {savedProjects.length === 0 && (
                  <div className="text-center py-20 space-y-4 opacity-30">
                    <History className="w-10 h-10 mx-auto" />
                    <p className="text-xs">Nenhum projeto encontrado</p>
                  </div>
                )}
                {savedProjects.map((proj) => (
                  <div 
                    key={proj.projectId}
                    className={`p-5 glass-card rounded-2xl border group hover:border-brand/30 transition-all cursor-pointer ${darkMode ? 'border-white/5' : 'border-black/5'}`}
                    onClick={() => handleLoadProject(proj)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold group-hover:text-brand transition-colors line-clamp-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                          {proj.script.titulo}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {new Date(proj.createdAt).toLocaleDateString()} • {proj.script.duracao_total_segundos}s
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(proj.projectId);
                        }}
                        className={`p-1.5 transition-colors ${darkMode ? 'text-zinc-700 hover:text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold text-zinc-500 uppercase ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                        {proj.config?.template || 'Livre'}
                      </div>
                      <div className="px-2 py-0.5 bg-brand/10 rounded text-[8px] font-bold text-brand uppercase">
                        v{proj.versions.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-28 pb-32 max-w-7xl mx-auto px-4 md:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'inspiration' && (
            <motion.div 
              key="inspiration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 pb-20"
            >
              <div className="text-center space-y-4 pt-10">
                <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic">Vision</h2>
                <div className="flex justify-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {['Trending', 'Movies', 'Effects', 'Vision', 'Tech', 'Nature', 'Fashion'].map(tag => (
                    <button key={tag} className={`px-6 py-2 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${darkMode ? 'bg-zinc-900 border-white/5 hover:bg-white/10' : 'bg-white border-black/5 hover:bg-black/5'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {loadingInspiration ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className={`aspect-[16/9] animate-pulse rounded-3xl border ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-200 border-black/5'}`} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {inspirationVideos.map((video, idx) => (
                    <motion.div 
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group relative aspect-[16/9] rounded-[2rem] overflow-hidden border transition-all cursor-pointer ${darkMode ? 'bg-zinc-900 border-white/5 hover:border-brand/30' : 'bg-white border-black/5 hover:border-brand/30'}`}
                    >
                      <video 
                        src={video.video_files[0].link}
                        poster={video.image}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                        muted
                        loop
                        onMouseOver={e => (e.target as HTMLVideoElement).play()}
                        onMouseOut={e => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-80 ${darkMode ? 'from-zinc-950' : 'from-zinc-900'}`} />
                      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-brand uppercase tracking-widest">Template {idx + 1}</p>
                          <h4 className="text-lg font-bold text-white capitalize">{video.user.name}</h4>
                        </div>
                        <button 
                          onClick={() => {
                            setTheme(video.user.name + " cinematic style");
                            setActiveTab('create');
                          }}
                          className="p-3 bg-white text-zinc-950 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="pt-20 text-center">
                <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic mb-10">Money Shot</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   {verticalVideos.map((video, idx) => (
                     <motion.div 
                       key={video.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className={`aspect-[9/16] rounded-[2rem] overflow-hidden border relative group cursor-pointer ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-black/5'}`}
                     >
                        <video 
                          src={video.video_files[0].link}
                          poster={video.image}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                          muted
                          loop
                          onMouseOver={e => (e.target as HTMLVideoElement).play()}
                          onMouseOut={e => {
                            const v = e.target as HTMLVideoElement;
                            v.pause();
                            v.currentTime = 0;
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                           <span className="text-[9px] font-mono uppercase tracking-widest text-brand">Vertical Pro</span>
                           <h5 className="text-xs font-bold text-white truncate">{video.user.name}</h5>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div 
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 pt-10">
                <h2 className="text-7xl font-display font-black tracking-tighter uppercase italic leading-none">
                  Create <span className="text-brand">Magic</span>
                </h2>
                <p className="text-zinc-500 text-sm max-w-lg mx-auto font-medium">
                  Transforme suas ideias em vídeos cinematográficos em segundos usando o poder da inteligência artificial.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Trending Sidebar - Inspired by MagicLight */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                  <div className={`p-8 glass-card rounded-[2.5rem] border transition-all ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
                    <h3 className="text-[11px] uppercase font-bold text-brand mb-6 flex items-center gap-2 tracking-widest">
                      <Sparkles size={14} /> Ideias em Alta
                    </h3>
                    <div className="space-y-4">
                      {trendingTopics.map((topic, i) => (
                        <button 
                          key={topic.title}
                          onClick={() => setTheme(topic.title)}
                          className={`w-full group text-left p-4 rounded-2xl transition-all border border-transparent hover:border-brand/20 ${darkMode ? 'bg-zinc-950/50 hover:bg-zinc-900' : 'bg-zinc-50 hover:bg-white shadow-sm'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{topic.icon}</span>
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold text-brand uppercase tracking-tighter">{topic.category}</p>
                              <p className={`text-[11px] font-medium leading-tight ${darkMode ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-700 group-hover:text-zinc-900'}`}>
                                {topic.title}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Config Panel */}
                <div className="lg:col-span-3 space-y-8">
                <div className="p-8 glass-card rounded-[2.5rem] space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                      Configuração
                    </h3>
                    <div className="px-2 py-1 bg-brand/10 rounded-md text-[9px] font-bold text-brand uppercase tracking-wider">
                      Free Tier
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Edit3 className="w-3.5 h-3.5 text-brand/60" /> Template de Roteiro
                      </label>
                      <select 
                        value={template} onChange={(e) => setTemplate(e.target.value)}
                        className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                      >
                        {['Livre', 'Tutorial', 'Review de Produto', 'Vlog', 'Documentário', 'Noticiário'].map(t => <option key={t} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Clock className="w-3.5 h-3.5 text-brand/60" /> Duração ({duration} {duration === 1 ? 'minuto' : 'minutos'})
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 3, 5, 10].map(d => (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={`py-3 rounded-2xl text-[10px] font-bold border transition-all ${
                              duration === d 
                                ? 'bg-brand/10 border-brand/50 text-brand' 
                                : (darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-500' : 'bg-white border-black/10 text-zinc-500')
                            }`}
                          >
                            {d === 1 ? 'Shorts' : `${d} min`}
                          </button>
                        ))}
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1"
                        value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                        className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Sparkles className="w-3.5 h-3.5 text-brand/60" /> Tom do Vídeo
                      </label>
                      <select 
                        value={tone} onChange={(e) => setTone(e.target.value)}
                        className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                      >
                        {['Informativo', 'Misterioso', 'Dramático', 'Épico', 'Publicitário'].map(t => <option key={t} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Globe className="w-3.5 h-3.5 text-brand/60" /> Idioma
                      </label>
                      <select 
                        value={language} onChange={(e) => setLanguage(e.target.value)}
                        className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                      >
                        {['Português BR', 'Inglês', 'Espanhol'].map(l => <option key={l} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>{l}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Volume2 className="w-3.5 h-3.5 text-brand/60" /> Voz do Narrador
                      </label>
                      <select 
                        value={voice} onChange={(e) => setVoice(e.target.value)}
                        className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                      >
                        <option value="pt-BR-Wavenet-B" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Kore (Masculina Grave)</option>
                        <option value="pt-BR-Wavenet-D" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Charon (Masculina Épica)</option>
                        <option value="pt-BR-Wavenet-A" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Aoede (Feminina Suave)</option>
                        <option value="pt-BR-Wavenet-C" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Fenrir (Masculina Intensa)</option>
                        <option value="pt-BR-Wavenet-E" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Zephyr (Feminina Clara)</option>
                        <option value="pt-BR-Standard-B" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Standard B (Masculina)</option>
                        <option value="pt-BR-Standard-C" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Standard C (Feminina)</option>
                        <option value="en-US-Wavenet-D" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Narrador USA (Masculina)</option>
                        <option value="en-US-Wavenet-F" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Narradora USA (Feminina)</option>
                      </select>
                      <div className="pt-2 space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                            <span>Volume Narração</span>
                            <span>{narrationVolume}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            value={narrationVolume} onChange={(e) => setNarrationVolume(parseInt(e.target.value))}
                            className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                              <span>Tom (Pitch)</span>
                              <span>{voicePitch}</span>
                            </div>
                            <input 
                              type="range" min="-10" max="10" step="1"
                              value={voicePitch} onChange={(e) => setVoicePitch(parseInt(e.target.value))}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                              <span>Velocidade</span>
                              <span>{voiceSpeed}x</span>
                            </div>
                            <input 
                              type="range" min="0.5" max="2.0" step="0.1"
                              value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Music className="w-3.5 h-3.5 text-brand/60" /> Estilo Musical
                      </label>
                      <div className="flex gap-2">
                          <select 
                            value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)}
                            className={`flex-1 border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                          >
                            {['Cinematográfico', 'Misterioso', 'Épico', 'Suave', 'Tensão', 'Lo-Fi', 'Cyberpunk', 'Alegre'].map(s => <option key={s} value={s} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>{s}</option>)}
                          </select>
                        <button
                          onClick={() => handleToggleMusicPreview(musicStyle)}
                          className={`p-4 rounded-2xl border transition-all ${
                            previewingMusic === musicStyle 
                              ? 'bg-brand text-zinc-950' 
                              : (darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:text-white' : 'bg-white border-black/10 text-zinc-500 hover:text-zinc-900')
                          }`}
                          title="Preview Música"
                        >
                          {previewingMusic === musicStyle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="pt-2 space-y-2">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                          <span>Volume Música</span>
                          <span>{musicVolume}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={musicVolume} onChange={(e) => {
                            setMusicVolume(parseInt(e.target.value));
                            if (audioRef.current) audioRef.current.volume = parseInt(e.target.value) / 100;
                          }}
                          className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <label className={`text-[10px] uppercase font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Auto-Ducking (Abaixar música na fala)</label>
                        <button 
                          onClick={() => setMusicDucking(!musicDucking)}
                          className={`w-10 h-5 rounded-full transition-all relative ${musicDucking ? 'bg-brand' : (darkMode ? 'bg-zinc-800' : 'bg-zinc-300')}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${musicDucking ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Settings className="w-3.5 h-3.5 text-brand/60" /> Resolução
                      </label>
                      <div className="flex gap-2">
                        {['720p', '1080p'].map(res => (
                          <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={`flex-1 py-3 rounded-2xl text-[10px] font-bold border transition-all ${
                              resolution === res 
                                ? 'bg-brand/10 border-brand/50 text-brand' 
                                : (darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-500' : 'bg-white border-black/10 text-zinc-500')
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <Maximize className="w-3.5 h-3.5 text-brand/60" /> Formato
                        </label>
                        <select 
                          value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                          className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                        >
                          <option value="16:9" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>16:9 (Horizontal)</option>
                          <option value="9:16" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>9:16 (Vertical)</option>
                          <option value="1:1" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>1:1 (Quadrado)</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <ImageIcon className="w-3.5 h-3.5 text-brand/60" /> Mídia
                        </label>
                        <button 
                          onClick={() => setUseAIImages(!useAIImages)}
                          className={`w-full p-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            useAIImages 
                              ? 'bg-brand/10 border-brand/50 text-brand' 
                              : (darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-500' : 'bg-white border-black/10 text-zinc-500')
                          }`}
                        >
                          {useAIImages ? <Sparkles className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                          {useAIImages ? 'IA Generativa' : 'Stock (Pexels)'}
                        </button>
                      </div>
                    </div>

                    {useAIImages && (
                      <div className="space-y-4">
                        <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <Palette className="w-3.5 h-3.5 text-brand/60" /> Estilo Visual (IA)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {visualStyles.map(style => (
                            <button
                              key={style.id}
                              onClick={() => setVisualStyle(style.id)}
                              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                                visualStyle === style.id
                                  ? 'border-brand scale-[1.02]' 
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={style.img} alt={style.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">{style.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`p-4 rounded-3xl space-y-4 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className="flex items-center justify-between">
                        <label className={`text-[10px] uppercase font-bold flex items-center gap-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          <Type className="w-3.5 h-3.5 text-brand/60" /> Legendas
                        </label>
                        <button 
                          onClick={() => setShowSubtitles(!showSubtitles)}
                          className={`w-10 h-5 rounded-full transition-all relative ${showSubtitles ? 'bg-brand' : (darkMode ? 'bg-zinc-800' : 'bg-zinc-300')}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showSubtitles ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                      {showSubtitles && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {['#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF'].map(color => (
                              <button 
                                key={color}
                                onClick={() => setSubtitleColor(color)}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${subtitleColor === color ? 'border-brand scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {subtitleStyles.map(style => (
                              <button
                                key={style.id}
                                onClick={() => setSubtitleStyle(style.id)}
                                className={`py-2 rounded-xl text-[9px] font-bold border transition-all ${
                                  subtitleStyle === style.id 
                                    ? 'bg-brand/10 border-brand/50 text-brand' 
                                    : (darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-500' : 'bg-white border-black/10 text-zinc-500')
                                }`}
                              >
                                {style.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Panel */}
                <div className="p-8 glass-card rounded-[2.5rem] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                      Status
                    </h3>
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />}
                  </div>
                  <div className="h-40 overflow-y-auto font-mono text-[10px] text-zinc-500 space-y-2 custom-scrollbar pr-2">
                    {logs.length === 0 && <p className="italic opacity-30">Aguardando comando...</p>}
                    {logs.map((log, i) => (
                      <motion.p 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className={log.includes('Erro') ? 'text-red-400' : log.includes('sucesso') ? 'text-brand-hover' : ''}
                      >
                        {log}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-6 space-y-8">
                <div className="p-10 glass rounded-[3rem] space-y-10 relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                  
                  <div className="space-y-6 relative">
                    <h2 className="text-5xl font-display font-bold tracking-tight leading-tight">
                      Transforme ideias em <br />
                      <span className="text-brand text-glow">vídeos épicos.</span>
                    </h2>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Pronto para uso</span>
                    </div>
                    <div className="relative group">
                      <textarea 
                        value={theme} onChange={(e) => setTheme(e.target.value)}
                        placeholder="Descreva o tema do seu vídeo aqui..."
                        className={`w-full h-48 border rounded-[2rem] p-8 text-xl focus:outline-none focus:border-brand/30 transition-all duration-500 resize-none shadow-inner ${darkMode ? 'bg-zinc-950/40 border-white/5 text-zinc-100 placeholder:text-zinc-800' : 'bg-white border-black/10 text-zinc-900 placeholder:text-zinc-300'}`}
                      />
                      <div className="absolute bottom-6 right-8 flex gap-3">
                        <button 
                          onClick={handleSurpriseMe}
                          className={`p-3 hover:bg-brand/10 hover:text-brand rounded-xl transition-all border ${darkMode ? 'bg-zinc-900/50 text-zinc-500 border-white/5' : 'bg-zinc-100 text-zinc-500 border-black/5'}`}
                          title="Surpreenda-me!"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleGenerateScript}
                          disabled={!theme || loading}
                          className={`px-6 py-3 hover:bg-white/10 text-xs font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 border ${darkMode ? 'bg-white/5 text-white border-white/5' : 'bg-zinc-900 text-white border-black/5'}`}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand" />}
                          Roteiro
                        </button>
                        <button 
                          onClick={handleProduceVideo}
                          disabled={!script || loading}
                          className="px-8 py-3 bg-brand text-zinc-950 text-xs font-bold rounded-xl hover:bg-brand-hover disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-brand/20"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                          Produzir
                        </button>
                      </div>
                    </div>
                  </div>

                  {script && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`space-y-8 pt-10 border-t ${darkMode ? 'border-white/5' : 'border-black/5'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-display font-bold">{script.titulo}</h3>
                          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Roteiro Estruturado</p>
                        </div>
                        <button 
                          onClick={handleSaveProject}
                          disabled={!script || loading}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 border ${darkMode ? 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border-white/5' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border-black/5'}`}
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar Projeto
                        </button>
                        <button 
                          onClick={() => setIsScriptEditable(!isScriptEditable)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                            isScriptEditable 
                              ? 'bg-brand text-zinc-950' 
                              : (darkMode ? 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200')
                          }`}
                        >
                          {isScriptEditable ? 'Salvar Alterações' : 'Editar Cenas'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {script.cenas.map((cena, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 glass-card rounded-[2rem] space-y-4 group"
                          >
                            <div className="flex justify-between items-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider ${darkMode ? 'bg-zinc-900/50 text-zinc-500' : 'bg-zinc-100 text-zinc-500'}`}>
                                Cena {cena.cena_id} • {cena.duracao_segundos}s
                              </span>
                              <div className={`w-2 h-2 rounded-full ${cena.usar_video ? 'bg-brand shadow-[0_0_10px_rgba(139,92,246,0.5)]' : (darkMode ? 'bg-zinc-700' : 'bg-zinc-300')}`} />
                            </div>
                            
                            {isScriptEditable ? (
                              <div className="space-y-4">
                                <textarea 
                                  value={cena.narracao}
                                  onChange={(e) => {
                                    const newCenas = [...script.cenas];
                                    newCenas[i].narracao = e.target.value;
                                    setScript({ ...script, cenas: newCenas });
                                  }}
                                  className={`w-full border rounded-xl p-4 text-xs focus:outline-none focus:border-brand/30 min-h-[80px] ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                                />
                                <div className="space-y-2">
                                  <input 
                                    value={cena.query_busca_imagem}
                                    onChange={(e) => {
                                      const newCenas = [...script.cenas];
                                      newCenas[i].query_busca_imagem = e.target.value;
                                      setScript({ ...script, cenas: newCenas });
                                    }}
                                    placeholder="Query Imagem"
                                    className={`w-full border rounded-xl p-3 text-[9px] focus:outline-none ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-400' : 'bg-white border-black/10 text-zinc-600'}`}
                                  />
                                  <input 
                                    value={cena.query_busca_video}
                                    onChange={(e) => {
                                      const newCenas = [...script.cenas];
                                      newCenas[i].query_busca_video = e.target.value;
                                      setScript({ ...script, cenas: newCenas });
                                    }}
                                    placeholder="Query Vídeo"
                                    className={`w-full border rounded-xl p-3 text-[9px] focus:outline-none ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-400' : 'bg-white border-black/10 text-zinc-600'}`}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{cena.narracao}</p>
                                <div className="flex gap-2">
                                  <div className={`px-3 py-2 rounded-xl border flex-1 ${darkMode ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-black/5'}`}>
                                    <p className="text-[8px] text-zinc-600 uppercase font-bold mb-1">Stock Img</p>
                                    <p className={`text-[10px] truncate ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{cena.query_busca_imagem}</p>
                                  </div>
                                  <div className={`px-3 py-2 rounded-xl border flex-1 ${darkMode ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-black/5'}`}>
                                    <p className="text-[8px] text-zinc-600 uppercase font-bold mb-1">Stock Vid</p>
                                    <p className={`text-[10px] truncate ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{cena.query_busca_video}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

          {activeTab === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              {project ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-8">
                    <div className={`aspect-video rounded-[3.5rem] overflow-hidden border relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] group ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-black/5'}`}>
                      <video 
                        src={project.versions[project.versions.length - 1].path} 
                        controls className="w-full h-full object-contain"
                      />
                      <div className={`absolute inset-0 pointer-events-none border-[12px] rounded-[3.5rem] ${darkMode ? 'border-zinc-900/50' : 'border-zinc-100/50'}`} />
                    </div>
                    <div className="flex justify-between items-center glass p-10 rounded-[3rem]">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-display font-bold">{project.script.titulo}</h3>
                        <div className="flex items-center gap-4 text-zinc-500 text-xs font-mono">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {project.script.duracao_total_segundos}s</span>
                          <span className={`w-1 h-1 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                          <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {project.script.cenas.length} cenas</span>
                          <span className={`w-1 h-1 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                          <span className="text-brand font-bold">Versão {project.versions.length}</span>
                        </div>
                      </div>
                      <a 
                        href={project.versions[project.versions.length - 1].path} download
                        className={`px-10 py-5 font-bold rounded-2xl transition-all flex items-center gap-3 shadow-xl ${darkMode ? 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-white/10' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-black/10'}`}
                      >
                        <Download className="w-5 h-5" /> Exportar MP4
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                    <div className="p-8 glass-card rounded-[2.5rem] space-y-8">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <History className="w-4 h-4" /> Histórico
                      </h3>
                      <div className="space-y-4">
                        {project.versions.map((v) => (
                          <motion.div 
                            key={v.version} 
                            whileHover={{ x: 5 }}
                            className={`flex items-center justify-between p-5 border rounded-2xl group ${darkMode ? 'bg-zinc-950/50 border-white/5' : 'bg-white border-black/10'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand font-mono text-xs font-bold">
                                v{v.version}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold">Versão {v.version}</p>
                                <p className="text-[10px] text-zinc-600">Finalizado em 1080p</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button className={`p-2 transition-colors ${darkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Play className="w-4 h-4" /></button>
                              <a href={v.path} download className={`p-2 transition-colors ${darkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}><Download className="w-4 h-4" /></a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-40 space-y-6">
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-black/5'}`}>
                    <Video className={`w-10 h-10 ${darkMode ? 'text-zinc-800' : 'text-zinc-300'}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold">Nenhum vídeo produzido</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto">Vá para a aba "Create" e descreva sua ideia para começar a mágica.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'edit' && (
            <motion.div 
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              {project ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Edit Panel */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="p-10 glass-card rounded-[3rem] space-y-10">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-display font-bold">Ajustes Rápidos</h3>
                        <p className="text-xs text-zinc-500">Edição parcial sem regerar tudo.</p>
                      </div>
                      
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Narrador</label>
                          <div className="flex gap-3">
                            <select 
                              value={voice} onChange={(e) => setVoice(e.target.value)}
                              className={`flex-1 border rounded-2xl p-4 text-sm focus:outline-none ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                            >
                              <option value="pt-BR-Wavenet-B" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Kore</option>
                              <option value="pt-BR-Wavenet-D" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Charon</option>
                              <option value="pt-BR-Wavenet-A" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Aoede</option>
                              <option value="pt-BR-Wavenet-C" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Fenrir</option>
                              <option value="pt-BR-Wavenet-E" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Zephyr</option>
                              <option value="pt-BR-Standard-B" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Standard B</option>
                              <option value="pt-BR-Standard-C" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Standard C</option>
                              <option value="en-US-Wavenet-D" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Narrador USA</option>
                              <option value="en-US-Wavenet-F" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>Narradora USA</option>
                            </select>
                            <button 
                              onClick={() => handleEditVideo('change_narrator', { voice, voicePitch, voiceSpeed, narrationVolume })}
                              disabled={loading}
                              className="p-4 bg-brand text-zinc-950 rounded-2xl hover:bg-brand-hover transition-all disabled:opacity-50"
                            >
                              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                <span>Volume Narração</span>
                                <span>{narrationVolume}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" 
                                value={narrationVolume} onChange={(e) => setNarrationVolume(parseInt(e.target.value))}
                                className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                  <span>Pitch</span>
                                  <span>{voicePitch}</span>
                                </div>
                                <input 
                                  type="range" min="-10" max="10" step="1"
                                  value={voicePitch} onChange={(e) => setVoicePitch(parseInt(e.target.value))}
                                  className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                  <span>Velocidade</span>
                                  <span>{voiceSpeed}x</span>
                                </div>
                                <input 
                                  type="range" min="0.5" max="2.0" step="0.1"
                                  value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                  className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <label className={`text-[10px] uppercase font-bold tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Trilha Sonora</label>
                          <select 
                            value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)}
                            className={`w-full border rounded-2xl p-4 text-sm mb-2 focus:outline-none ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                          >
                            {['Cinematográfico', 'Misterioso', 'Épico', 'Suave', 'Tensão', 'Lo-Fi', 'Cyberpunk', 'Alegre'].map(s => <option key={s} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>{s}</option>)}
                          </select>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                              <span>Volume</span>
                              <span>{musicVolume}%</span>
                            </div>
                            <input 
                              type="range" min="0" max="100" 
                              value={musicVolume} onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                            />
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <label className={`text-[10px] uppercase font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Auto-Ducking</label>
                            <button 
                              onClick={() => setMusicDucking(!musicDucking)}
                              className={`w-10 h-5 rounded-full transition-all relative ${musicDucking ? 'bg-brand' : (darkMode ? 'bg-zinc-800' : 'bg-zinc-300')}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${musicDucking ? 'left-6' : 'left-1'}`} />
                            </button>
                          </div>
                          <button 
                            onClick={() => handleEditVideo('change_music', { musicStyle, musicVolume, musicDucking })}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-xs transition-all border ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-white/5 text-white' : 'bg-zinc-100 hover:bg-zinc-200 border-black/5 text-zinc-900'}`}
                          >
                            Atualizar Áudio
                          </button>
                        </div>
                      </div>

                      {/* Visual & Format Panel */}
                      <div className="p-8 glass-card rounded-[2.5rem] space-y-8">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                          <Maximize className="w-4 h-4" /> Visual & Formato
                        </h3>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <label className={`text-[10px] uppercase font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Formato</label>
                              <select 
                                value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                                className={`w-full border rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                              >
                                <option value="16:9" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>16:9</option>
                                <option value="9:16" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>9:16</option>
                                <option value="1:1" className={darkMode ? 'bg-zinc-900' : 'bg-white'}>1:1</option>
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className={`text-[10px] uppercase font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Mídia</label>
                              <button 
                                onClick={() => setUseAIImages(!useAIImages)}
                                className={`w-full p-4 rounded-2xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${
                                  useAIImages 
                                    ? 'bg-brand/10 border-brand/50 text-brand' 
                                    : (darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-500' : 'bg-white border-black/10 text-zinc-500')
                                }`}
                              >
                                {useAIImages ? 'IA' : 'Stock'}
                              </button>
                            </div>
                          </div>

                          {useAIImages && (
                            <div className="space-y-3">
                              <label className={`text-[10px] uppercase font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Estilo Visual (IA)</label>
                              <select 
                                value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)}
                                className={`w-full border rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                              >
                                {['Cinematográfico', 'Cartoon/Desenho', 'Cyberpunk', 'Realista', 'Anime', 'Pintura a Óleo', '3D Render'].map(s => (
                                  <option key={s} value={s} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>{s}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className={`p-4 rounded-3xl space-y-4 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                            <div className="flex items-center justify-between">
                              <label className={`text-[10px] uppercase font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Legendas</label>
                              <button 
                                onClick={() => setShowSubtitles(!showSubtitles)}
                                className={`w-10 h-5 rounded-full transition-all relative ${showSubtitles ? 'bg-brand' : (darkMode ? 'bg-zinc-800' : 'bg-zinc-300')}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showSubtitles ? 'left-6' : 'left-1'}`} />
                              </button>
                            </div>
                            {showSubtitles && (
                              <div className="flex items-center gap-3">
                                {['#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF'].map(color => (
                                  <button 
                                    key={color}
                                    onClick={() => setSubtitleColor(color)}
                                    className={`w-5 h-5 rounded-full border-2 transition-all ${subtitleColor === color ? 'border-brand scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => handleEditVideo('change_visual', { aspectRatio, useAIImages, showSubtitles, subtitleColor, visualStyle, resolution, subtitleStyle })}
                            disabled={loading}
                            className="w-full py-4 bg-brand text-zinc-950 rounded-2xl hover:bg-brand-hover font-bold text-xs transition-all shadow-xl shadow-brand/10"
                          >
                            Aplicar Mudanças Visuais
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scene Editor & Tabbed Interface */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8 border-b border-white/5 pb-2">
                        <button 
                          onClick={() => setEditSubTab('subtitles')}
                          className={`flex items-center gap-2 pb-4 text-[10px] font-mono uppercase tracking-widest transition-all relative ${editSubTab === 'subtitles' ? 'text-brand' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Type className="w-4 h-4" /> Subtitle Settings
                          {editSubTab === 'subtitles' && <motion.div layoutId="editTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
                        </button>
                        <button 
                          onClick={() => setEditSubTab('music')}
                          className={`flex items-center gap-2 pb-4 text-[10px] font-mono uppercase tracking-widest transition-all relative ${editSubTab === 'music' ? 'text-brand' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Music className="w-4 h-4" /> Background Music
                          {editSubTab === 'music' && <motion.div layoutId="editTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 mr-4">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Pronta para uso</span>
                        </div>
                        <button 
                          onClick={() => setShowSettingsModal(true)}
                          className={`p-3 rounded-2xl border transition-all ${darkMode ? 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white' : 'bg-white border-black/5 text-zinc-400 hover:text-zinc-900'}`}
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleProduceVideo()}
                          disabled={loading}
                          className="px-8 py-3 bg-brand text-zinc-950 rounded-2xl font-bold text-xs hover:bg-brand-hover transition-all flex items-center gap-2 shadow-xl shadow-brand/20"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          Generate
                        </button>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Video Preview */}
                      <div className={`aspect-video rounded-[3rem] overflow-hidden border relative shadow-2xl group ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-black/5'}`}>
                        <video 
                          src={project.versions[project.versions.length - 1].path} 
                          controls className="w-full h-full object-contain"
                        />
                        
                        <AnimatePresence>
                          {saveSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 z-20"
                            >
                              <Check className="w-4 h-4" /> Save success
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Subtitle Preview Overlay */}
                        {showSubtitles && (
                          <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
                            <div className={`px-4 py-2 text-center ${subtitleStyles.find(s => s.id === subtitleStyle)?.class}`} style={{ color: subtitleColor }}>
                              Subtitle display
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tab Content */}
                      <div className="p-10 glass rounded-[3rem] space-y-8">
                        {editSubTab === 'subtitles' ? (
                          <div className="space-y-8">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Subtitle Style</h4>
                              <button 
                                onClick={() => setShowSubtitles(!showSubtitles)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${showSubtitles ? 'bg-brand/10 text-brand' : 'bg-zinc-800 text-zinc-500'}`}
                              >
                                {showSubtitles ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {subtitleStyles.map(style => (
                                <button
                                  key={style.id}
                                  onClick={() => {
                                    setSubtitleStyle(style.id);
                                    if (style.id === 'none') setShowSubtitles(false);
                                    else setShowSubtitles(true);
                                  }}
                                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group ${
                                    subtitleStyle === style.id 
                                      ? 'border-brand bg-brand/5' 
                                      : (darkMode ? 'border-white/5 bg-white/5 hover:border-white/10' : 'border-black/5 bg-black/5 hover:border-black/10')
                                  }`}
                                >
                                  <div className={`text-center text-xs ${style.class}`} style={{ color: subtitleColor }}>
                                    Subtitle
                                  </div>
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{style.name}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                              <label className="text-[10px] font-mono text-zinc-500 uppercase">Color</label>
                              <div className="flex items-center gap-3">
                                {['#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FF4444'].map(color => (
                                  <button 
                                    key={color}
                                    onClick={() => setSubtitleColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${subtitleColor === color ? 'border-brand scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Background Music</h4>
                              <div className="flex items-center gap-4 w-1/2">
                                <div className="flex justify-between text-[10px] font-mono text-zinc-500 w-12">
                                  <span>{musicVolume}%</span>
                                </div>
                                <input 
                                  type="range" min="0" max="100" 
                                  value={musicVolume} onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                                  className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-brand ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                              {MUSIC_TRACKS.map(track => (
                                <div 
                                  key={track.id}
                                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                    musicStyle === track.name 
                                      ? 'border-brand bg-brand/5' 
                                      : (darkMode ? 'bg-zinc-950/50 border-white/5' : 'bg-white border-black/10')
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                                      <Music className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <span className="text-xs font-bold">{track.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {musicStyle === track.name && (
                                      <span className="px-3 py-1 bg-brand/10 text-brand text-[8px] font-bold rounded-full uppercase">Applied</span>
                                    )}
                                    <button 
                                      onClick={() => {
                                        setMusicStyle(track.name);
                                        handleToggleMusicPreview(track.name);
                                      }}
                                      className={`p-2 rounded-full transition-all ${previewingMusic === track.name ? 'bg-brand text-zinc-950' : 'text-zinc-500 hover:text-brand'}`}
                                    >
                                      {previewingMusic === track.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end pt-6">
                          <button 
                            onClick={() => handleEditVideo('change_visual', { showSubtitles, subtitleStyle, subtitleColor, musicStyle, musicVolume })}
                            disabled={loading}
                            className="px-10 py-4 bg-brand text-zinc-950 rounded-2xl font-bold text-xs hover:bg-brand-hover transition-all shadow-xl shadow-brand/10"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>

                      {/* Scene Timeline (Moved below or kept as a separate section) */}
                      <div className="p-10 glass rounded-[3rem] space-y-8">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-display font-bold">Timeline de Cenas</h3>
                          <p className="text-xs text-zinc-500">Regenere cenas individuais para perfeição.</p>
                        </div>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                          {project.script.cenas.map((cena, i) => (
                            <div key={i} className="p-8 glass-card rounded-[2.5rem] space-y-6 group">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono ${darkMode ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                    {cena.cena_id}
                                  </span>
                                  <span className={`text-xs font-bold ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Cena {cena.cena_id}</span>
                                </div>
                                <button 
                                  onClick={() => handleEditVideo('edit_scene', { sceneId: cena.cena_id, sceneData: cena })}
                                  disabled={loading}
                                  className="px-5 py-2 bg-brand/10 text-brand text-[10px] font-bold rounded-xl hover:bg-brand/20 transition-all flex items-center gap-2 border border-brand/20"
                                >
                                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                  Regenerar Cena
                                </button>
                              </div>
                              <textarea 
                                value={cena.narracao}
                                onChange={(e) => {
                                  const newCenas = [...project.script.cenas];
                                  newCenas[i].narracao = e.target.value;
                                  setProject({ ...project, script: { ...project.script, cenas: newCenas } });
                                }}
                                className={`w-full border rounded-2xl p-6 text-sm focus:outline-none focus:border-brand/30 min-h-[100px] leading-relaxed ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-40 space-y-6">
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-black/5'}`}>
                    <Edit3 className={`w-10 h-10 ${darkMode ? 'text-zinc-800' : 'text-zinc-300'}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold">Modo de Edição Bloqueado</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto">Produza um vídeo primeiro para habilitar as ferramentas de refinamento.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="p-12 glass rounded-[3.5rem] space-y-10 relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                
                <div className="flex items-center gap-6 relative">
                  <div className="p-5 bg-brand/10 border border-brand/20 rounded-3xl">
                    <Key className="w-8 h-8 text-brand" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-bold">Chaves de API</h3>
                    <p className="text-zinc-500 text-sm font-medium">Configure seu ambiente de produção gratuito.</p>
                  </div>
                </div>

                <div className="space-y-8 relative">
                  {[
                    { label: 'Gemini API Key', key: 'gemini', placeholder: 'AIza...' },
                    { label: 'Pexels API Key', key: 'pexels', placeholder: '...' },
                    { label: 'Pixabay API Key', key: 'pixabay', placeholder: '...' },
                    { label: 'Google Cloud Project ID', key: 'google_tts', placeholder: 'my-project-123' }
                  ].map((field) => (
                    <div key={field.key} className="space-y-3">
                      <label className={`text-[10px] uppercase font-bold tracking-widest ml-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{field.label}</label>
                      <input 
                        type="password"
                        value={(apiKeys as any)[field.key]}
                        onChange={(e) => setApiKeys({ ...apiKeys, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className={`w-full border rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-mono ${darkMode ? 'bg-zinc-950/50 border-white/5 text-zinc-100' : 'bg-white border-black/10 text-zinc-900'}`}
                      />
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <button 
                      onClick={async () => {
                        addLog("Testando conexão com APIs gratuitas...");
                        const res = await fetch('/api/test-apis');
                        const data = await res.json();
                        addLog(data.message);
                      }}
                      className={`w-full py-5 rounded-2xl font-bold transition-all shadow-xl ${darkMode ? 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-black/20' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-black/10'}`}
                    >
                      Testar Conexão
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-4 opacity-50 hover:opacity-100">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#27272a' : '#e4e4e7'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#3f3f46' : '#d4d4d8'};
        }
      `}</style>
      <AnimatePresence>
        {showSettingsModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[110] p-10 rounded-[3rem] border shadow-2xl ${darkMode ? 'bg-zinc-950 border-white/10' : 'bg-white border-black/10'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold">Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <Trash2 className="w-5 h-5 rotate-45 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Ratio</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: '16:9', icon: <div className="w-6 h-3.5 border-2 border-current rounded-sm" /> },
                      { id: '9:16', icon: <div className="w-3.5 h-6 border-2 border-current rounded-sm" /> },
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setAspectRatio(r.id)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${
                          aspectRatio === r.id 
                            ? 'border-brand bg-brand/5 text-brand' 
                            : (darkMode ? 'border-white/5 bg-white/5 text-zinc-500 hover:border-white/10' : 'border-black/5 bg-black/5 text-zinc-400 hover:border-black/10')
                        }`}
                      >
                        {r.icon}
                        <span className="text-xs font-bold">{r.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Video Export Resolution</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: '720p', name: 'Standard (720p)', icon: null },
                      { id: '1080p', name: 'High (1080p)', icon: <Sparkles className="w-3 h-3" /> },
                    ].map(res => (
                      <button
                        key={res.id}
                        onClick={() => setResolution(res.id)}
                        className={`flex items-center justify-center gap-2 p-6 rounded-[2rem] border-2 transition-all text-xs font-bold ${
                          resolution === res.id 
                            ? 'border-brand bg-brand/5 text-brand' 
                            : (darkMode ? 'border-white/5 bg-white/5 text-zinc-500 hover:border-white/10' : 'border-black/5 bg-black/5 text-zinc-400 hover:border-black/10')
                        }`}
                      >
                        {res.name}
                        {res.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowSettingsModal(false)}
                    className={`flex-1 py-4 rounded-2xl font-bold text-xs transition-all ${darkMode ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleEditVideo('change_visual', { aspectRatio, resolution });
                      setShowSettingsModal(false);
                    }}
                    className="flex-1 py-4 bg-brand text-zinc-950 rounded-2xl font-bold text-xs hover:bg-brand-hover transition-all"
                  >
                    Ok
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
