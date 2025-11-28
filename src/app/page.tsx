'use client';

import { useState, useEffect } from 'react';
import CameraView from '@/components/CameraView';
import ReformControls from '@/components/ReformControls';
import { Home, Camera, Settings, User, AlertCircle, CheckCircle, LogOut, Save, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { 
  checkARSupport, 
  requestAllARPermissions, 
  getARErrorMessage,
  type ARCapabilities 
} from '@/lib/ar-utils';
import { supabase } from '@/lib/supabase';
import type { Environment } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [environmentName, setEnvironmentName] = useState('');
  
  const [decorations, setDecorations] = useState<{
    wall?: string;
    floor?: string;
    furniture?: string;
    light?: string;
    ceiling?: string;
  }>({});
  const [measurement, setMeasurement] = useState<string>('');
  const [measurementType, setMeasurementType] = useState<'square' | 'linear' | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [arCapabilities, setArCapabilities] = useState<ARCapabilities | null>(null);
  const [arError, setArError] = useState<string | null>(null);
  const [isCheckingAR, setIsCheckingAR] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação - SEM redirecionamento (middleware cuida disso)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadEnvironments(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadEnvironments(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar suporte AR ao carregar
  useEffect(() => {
    checkARSupport().then(setArCapabilities);
  }, []);

  // Carregar ambientes do usuário
  const loadEnvironments = async (userId: string) => {
    const { data, error } = await supabase
      .from('environments')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setEnvironments(data);
    }
  };

  // Salvar ambiente atual
  const saveEnvironment = async () => {
    if (!user || !environmentName.trim()) return;

    const environmentData = {
      project_id: user.id, // Usando user_id como project_id temporariamente
      name: environmentName,
      decorations,
      measurements: {
        area: measurementType === 'square' ? measurement : undefined,
        distance: measurementType === 'linear' ? measurement : undefined,
      },
    };

    if (currentEnvironment) {
      // Atualizar existente
      const { error } = await supabase
        .from('environments')
        .update(environmentData)
        .eq('id', currentEnvironment.id);

      if (!error) {
        alert('Ambiente atualizado com sucesso!');
        loadEnvironments(user.id);
      }
    } else {
      // Criar novo
      const { error } = await supabase
        .from('environments')
        .insert([environmentData]);

      if (!error) {
        alert('Ambiente salvo com sucesso!');
        loadEnvironments(user.id);
      }
    }

    setShowSaveDialog(false);
    setEnvironmentName('');
  };

  // Carregar ambiente salvo
  const loadEnvironment = (env: Environment) => {
    setCurrentEnvironment(env);
    setDecorations(env.decorations);
    setEnvironmentName(env.name);
    
    if (env.measurements.area) {
      setMeasurement(`Área: ${env.measurements.area}`);
      setMeasurementType('square');
    } else if (env.measurements.distance) {
      setMeasurement(`Distância: ${env.measurements.distance}`);
      setMeasurementType('linear');
    }
    
    setShowLoadDialog(false);
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleApplyDecoration = (type: string, value: any) => {
    setDecorations(prev => ({ ...prev, [type]: value }));
    
    // Ativar AR automaticamente quando selecionar uma opção
    if (!showAR) {
      handleStartAR();
    }
  };

  const handleMeasure = (type: 'square' | 'linear') => {
    setMeasurementType(type);
    
    // Simular medição (em produção, usaria sensores AR reais)
    setTimeout(() => {
      if (type === 'square') {
        const area = (Math.random() * 30 + 10).toFixed(1);
        setMeasurement(`Área: ${area} m²`);
      } else {
        const distance = (Math.random() * 8 + 2).toFixed(1);
        setMeasurement(`Distância: ${distance} m`);
      }
    }, 1000);
    
    // Ativar AR automaticamente
    if (!showAR) {
      handleStartAR();
    }
  };

  const handleStartAR = async () => {
    setIsCheckingAR(true);
    setArError(null);

    // Verificar suporte
    if (!arCapabilities?.isARSupported) {
      if (!arCapabilities?.isMobile) {
        setArError('not-mobile');
      } else if (!arCapabilities?.hasCamera) {
        setArError('camera-unavailable');
      } else {
        setArError('not-supported');
      }
      setIsCheckingAR(false);
      return;
    }

    // Solicitar permissões
    const permissions = await requestAllARPermissions();
    
    if (!permissions.camera) {
      setArError('camera-denied');
      setIsCheckingAR(false);
      return;
    }

    if (!permissions.motion) {
      setArError('motion-denied');
      setIsCheckingAR(false);
      return;
    }

    // Tudo OK, iniciar AR
    setShowAR(true);
    setIsCheckingAR(false);
  };

  // Renderizar o forro de gesso baseado no tipo selecionado
  const renderCeiling = () => {
    if (!decorations.ceiling) return null;

    const ceilingStyles: Record<string, any> = {
      'sanca-aberta': {
        border: '8px solid rgba(255, 255, 255, 0.9)',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 240, 0.95) 100%)',
        boxShadow: 'inset 0 0 30px rgba(255, 200, 100, 0.4), 0 4px 20px rgba(0, 0, 0, 0.2)',
      },
      'sanca-fechada': {
        background: 'linear-gradient(180deg, rgba(250, 250, 250, 0.95) 0%, rgba(230, 230, 230, 0.95) 100%)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        border: '2px solid rgba(200, 200, 200, 0.3)',
      },
      'sanca-invertida': {
        background: 'linear-gradient(180deg, rgba(245, 245, 245, 0.95) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(245, 245, 245, 0.95) 100%)',
        boxShadow: 'inset 0 -20px 40px rgba(255, 220, 120, 0.5), 0 4px 20px rgba(0, 0, 0, 0.2)',
        border: '4px solid rgba(255, 255, 255, 0.8)',
      },
      'forro-liso': {
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      'sanca-spots': {
        background: 'linear-gradient(180deg, rgba(250, 250, 250, 0.95) 0%, rgba(235, 235, 235, 0.95) 100%)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        border: '3px solid rgba(200, 200, 200, 0.4)',
      },
      'sanca-l': {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 240, 0.95) 100%)',
        boxShadow: 'inset -10px -10px 30px rgba(255, 200, 100, 0.3), 0 4px 20px rgba(0, 0, 0, 0.2)',
        border: '6px solid rgba(255, 255, 255, 0.9)',
        borderRight: '20px solid rgba(255, 255, 255, 0.9)',
        borderBottom: '20px solid rgba(255, 255, 255, 0.9)',
      },
    };

    const style = ceilingStyles[decorations.ceiling] || {};

    return (
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none transition-all duration-500"
        style={style}
      >
        {/* Spots embutidos para sanca-spots */}
        {decorations.ceiling === 'sanca-spots' && (
          <div className="flex justify-around items-center h-full px-8">
            {[1, 2, 3, 4].map((spot) => (
              <div
                key={spot}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-lg animate-pulse"
                style={{
                  boxShadow: '0 0 20px rgba(255, 220, 100, 0.8), inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              />
            ))}
          </div>
        )}

        {/* Iluminação indireta para sanca aberta */}
        {decorations.ceiling === 'sanca-aberta' && (
          <div className="absolute inset-0 border-8 border-transparent">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-yellow-200/60 to-transparent blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-yellow-200/60 to-transparent blur-sm" />
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-yellow-200/60 to-transparent blur-sm" />
            <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-l from-yellow-200/60 to-transparent blur-sm" />
          </div>
        )}

        {/* Label do tipo de forro */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {decorations.ceiling === 'sanca-aberta' && 'Sanca Aberta Simples'}
          {decorations.ceiling === 'sanca-fechada' && 'Sanca Fechada'}
          {decorations.ceiling === 'sanca-invertida' && 'Sanca Invertida'}
          {decorations.ceiling === 'forro-liso' && 'Forro Liso'}
          {decorations.ceiling === 'sanca-spots' && 'Sanca com Spots'}
          {decorations.ceiling === 'sanca-l' && 'Sanca em L'}
        </div>
      </div>
    );
  };

  // Renderizar piso com texturas realistas
  const renderFloor = () => {
    if (!decorations.floor) return null;

    const floorStyles: Record<string, any> = {
      'white-porcelain': {
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)',
        backgroundSize: '100px 100px',
        boxShadow: 'inset 0 -20px 40px rgba(0, 0, 0, 0.05)',
      },
      'black-porcelain': {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        backgroundSize: '100px 100px',
        boxShadow: 'inset 0 -20px 40px rgba(255, 255, 255, 0.05)',
      },
      'wood-light': {
        background: 'repeating-linear-gradient(90deg, #d4a574 0px, #c9985d 10px, #d4a574 20px)',
        boxShadow: 'inset 0 -20px 40px rgba(0, 0, 0, 0.1)',
      },
      'wood-dark': {
        background: 'repeating-linear-gradient(90deg, #5d4037 0px, #4e342e 10px, #5d4037 20px)',
        boxShadow: 'inset 0 -20px 40px rgba(0, 0, 0, 0.2)',
      },
      'concrete': {
        background: 'linear-gradient(135deg, #808080 0%, #6b6b6b 50%, #808080 100%)',
        backgroundSize: '200px 200px',
        boxShadow: 'inset 0 -20px 40px rgba(0, 0, 0, 0.15)',
      },
      'marble': {
        background: 'linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 25%, #e8e8e8 50%, #f5f5f5 75%, #e8e8e8 100%)',
        backgroundSize: '150px 150px',
        boxShadow: 'inset 0 -20px 40px rgba(0, 0, 0, 0.05)',
      },
    };

    const style = floorStyles[decorations.floor] || {};

    return (
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none transition-all duration-500"
        style={style}
      >
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {decorations.floor === 'white-porcelain' && 'Porcelanato Branco'}
          {decorations.floor === 'black-porcelain' && 'Porcelanato Preto'}
          {decorations.floor === 'wood-light' && 'Madeira Clara'}
          {decorations.floor === 'wood-dark' && 'Madeira Escura'}
          {decorations.floor === 'concrete' && 'Cimento Queimado'}
          {decorations.floor === 'marble' && 'Mármore Carrara'}
        </div>
      </div>
    );
  };

  // Renderizar móveis em 3D simulado
  const renderFurniture = () => {
    if (!decorations.furniture) return null;

    const furnitureData: Record<string, { emoji: string; name: string; position: string }> = {
      'sofa': { emoji: '🛋️', name: 'Sofá Moderno', position: 'bottom-20 left-1/2 -translate-x-1/2' },
      'table': { emoji: '🪑', name: 'Mesa de Jantar', position: 'bottom-32 right-10' },
      'shelf': { emoji: '📚', name: 'Estante', position: 'top-1/2 right-8 -translate-y-1/2' },
      'bed': { emoji: '🛏️', name: 'Cama Box', position: 'bottom-24 left-10' },
    };

    const furniture = furnitureData[decorations.furniture];
    if (!furniture) return null;

    return (
      <div className={`absolute ${furniture.position} pointer-events-none transition-all duration-500`}>
        <div className="relative">
          <div className="text-6xl drop-shadow-2xl animate-bounce">
            {furniture.emoji}
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
            {furniture.name}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar iluminação
  const renderLight = () => {
    if (!decorations.light) return null;

    const lightData: Record<string, { emoji: string; name: string; position: string }> = {
      'ceiling': { emoji: '💡', name: 'Lustre Central', position: 'top-10 left-1/2 -translate-x-1/2' },
      'pendant': { emoji: '🔆', name: 'Pendente', position: 'top-16 left-1/3 -translate-x-1/2' },
      'spot': { emoji: '⭐', name: 'Spot Embutido', position: 'top-8 right-1/4' },
      'lamp': { emoji: '🕯️', name: 'Abajur', position: 'top-1/2 right-12 -translate-y-1/2' },
    };

    const light = lightData[decorations.light];
    if (!light) return null;

    return (
      <div className={`absolute ${light.position} pointer-events-none transition-all duration-500`}>
        <div className="relative">
          <div className="text-5xl drop-shadow-2xl animate-pulse">
            {light.emoji}
          </div>
          {/* Efeito de luz */}
          <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-3xl scale-150 animate-pulse" />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
            {light.name}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A1A2F] text-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full p-1 shadow-lg shadow-blue-500/50">
            <Image
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/cd7cc866-7961-4983-b05a-3fb7c60eff1c.png"
              alt="LUNAR Design Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain brightness-150 contrast-125"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">LUNAR Design</h1>
            {currentEnvironment && (
              <p className="text-xs text-white/60">{currentEnvironment.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Salvar ambiente"
          >
            <Save className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={() => setShowLoadDialog(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Carregar ambiente"
          >
            <FolderOpen className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </header>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1A2F] border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Salvar Ambiente</h3>
            <input
              type="text"
              value={environmentName}
              onChange={(e) => setEnvironmentName(e.target.value)}
              placeholder="Nome do ambiente (ex: Sala de Estar)"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEnvironment}
                disabled={!environmentName.trim()}
                className="flex-1 bg-gradient-to-r from-[#4A90E2] to-[#007AFF] hover:opacity-90 text-white py-3 rounded-lg font-medium transition-opacity disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1A2F] border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Carregar Ambiente</h3>
            {environments.length === 0 ? (
              <p className="text-white/60 text-center py-8">
                Nenhum ambiente salvo ainda
              </p>
            ) : (
              <div className="space-y-2">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => loadEnvironment(env)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="font-semibold">{env.name}</div>
                    <div className="text-sm text-white/60 mt-1">
                      {new Date(env.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {showAR ? (
          <div className="relative h-full">
            <CameraView />
            
            {/* Pintura de Parede Overlay */}
            {decorations.wall && (
              <div
                className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-500"
                style={{ 
                  background: `linear-gradient(180deg, transparent 0%, ${decorations.wall} 35%, ${decorations.wall} 65%, transparent 100%)`,
                  mixBlendMode: 'multiply'
                }}
              />
            )}

            {/* Forro de Gesso Overlay */}
            {renderCeiling()}
            
            {/* Piso Overlay */}
            {renderFloor()}

            {/* Móveis Overlay */}
            {renderFurniture()}

            {/* Iluminação Overlay */}
            {renderLight()}

            {/* Medição Overlay */}
            {measurement && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white px-4 py-3 rounded-xl font-semibold shadow-lg">
                <div className="flex items-center gap-2">
                  {measurementType === 'square' ? '📐' : '📏'}
                  <span>{measurement}</span>
                </div>
              </div>
            )}

            {/* Instruções contextuais */}
            {decorations.ceiling && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                📱 Aponte para o teto
              </div>
            )}

            {decorations.floor && !decorations.ceiling && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                📱 Aponte para o chão
              </div>
            )}

            {decorations.wall && !decorations.ceiling && !decorations.floor && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                📱 Aponte para a parede
              </div>
            )}

            {measurementType && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                📱 Mova o celular para medir
              </div>
            )}

            {/* Botão voltar */}
            <button
              onClick={() => {
                setShowAR(false);
                setMeasurement('');
                setMeasurementType(null);
              }}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all"
            >
              Voltar
            </button>
          </div>
        ) : (
          <div className="px-6 py-8 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Transforme seu ambiente</h2>
              <p className="text-white/70 text-lg">
                Visualize sua reforma antes de fazer
              </p>
            </div>

            {/* AR Status Alert */}
            {arCapabilities && !arCapabilities.isARSupported && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-500 mb-1">AR Limitado</h4>
                  <p className="text-sm text-white/70">
                    {!arCapabilities.isMobile && 'Para melhor experiência, use um dispositivo móvel.'}
                    {arCapabilities.isMobile && !arCapabilities.hasCamera && 'Câmera não detectada no dispositivo.'}
                    {arCapabilities.isMobile && arCapabilities.hasCamera && 'Sensores de movimento não disponíveis.'}
                  </p>
                </div>
              </div>
            )}

            {/* AR Success Alert */}
            {arCapabilities?.isARSupported && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-500 mb-1">Dispositivo Compatível</h4>
                  <p className="text-sm text-white/70">
                    Seu dispositivo suporta Realidade Aumentada!
                  </p>
                </div>
              </div>
            )}

            {/* AR Error Alert */}
            {arError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-500 mb-1">Erro ao Iniciar AR</h4>
                  <p className="text-sm text-white/70">
                    {getARErrorMessage(arError)}
                  </p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleStartAR}
              disabled={isCheckingAR}
              className="w-full bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white py-4 px-6 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex items-center justify-center gap-2">
                <Camera className="w-6 h-6" />
                {isCheckingAR ? 'Verificando permissões...' : 'Visualizar Ambiente em AR'}
              </div>
            </button>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#007AFF] rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Realidade Aumentada</h3>
                <p className="text-white/60 text-sm">
                  Veja sua reforma antes de fazer
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#007AFF] rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Personalização Total</h3>
                <p className="text-white/60 text-sm">
                  Escolha cores, pisos e móveis
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A90E2] to-[#007AFF] rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Medição Precisa</h3>
                <p className="text-white/60 text-sm">
                  Meça áreas e distâncias com AR
                </p>
              </div>
            </div>

            {/* Controls Section */}
            <div className="mt-8">
              <ReformControls
                onApplyDecoration={handleApplyDecoration}
                onMeasure={handleMeasure}
              />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A1A2F] border-t border-white/10 px-6 py-3 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-[#4A90E2]' : 'text-white/50'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('camera');
            handleStartAR();
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'camera' ? 'text-[#4A90E2]' : 'text-white/50'
          }`}
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs font-medium">Câmera</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'settings' ? 'text-[#4A90E2]' : 'text-white/50'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Ajustes</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'profile' ? 'text-[#4A90E2]' : 'text-white/50'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
