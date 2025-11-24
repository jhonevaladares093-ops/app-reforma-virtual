'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaintBucket, Square, Sofa, Lightbulb, Ruler, ChevronRight, Box } from 'lucide-react';

interface ReformControlsProps {
  onApplyDecoration: (type: string, value: any) => void;
  onMeasure: (type: 'square' | 'linear') => void;
}

export default function ReformControls({ onApplyDecoration, onMeasure }: ReformControlsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [wallColor, setWallColor] = useState('#ffffff');
  const [floorTexture, setFloorTexture] = useState('default');
  const [selectedFurniture, setSelectedFurniture] = useState('');
  const [selectedLight, setSelectedLight] = useState('');
  const [selectedCeiling, setSelectedCeiling] = useState('');

  const wallColors = [
    { name: 'Branco Neve', color: '#ffffff' },
    { name: 'Azul Oceano', color: '#3b82f6' },
    { name: 'Verde Menta', color: '#10b981' },
    { name: 'Cinza Grafite', color: '#6b7280' },
    { name: 'Bege Areia', color: '#d4a574' },
    { name: 'Rosa Suave', color: '#f472b6' },
  ];

  const floorTextures = [
    { name: 'Porcelanato Branco', value: 'white-porcelain', color: '#f8f9fa' },
    { name: 'Porcelanato Preto', value: 'black-porcelain', color: '#1a1a1a' },
    { name: 'Madeira Clara', value: 'wood-light', color: '#d4a574' },
    { name: 'Madeira Escura', value: 'wood-dark', color: '#5d4037' },
    { name: 'Cimento Queimado', value: 'concrete', color: '#808080' },
    { name: 'Mármore Carrara', value: 'marble', color: '#e8e8e8' },
  ];

  const furniture = [
    { name: 'Sofá Moderno', value: 'sofa', icon: '🛋️' },
    { name: 'Mesa de Jantar', value: 'table', icon: '🪑' },
    { name: 'Estante', value: 'shelf', icon: '📚' },
    { name: 'Cama Box', value: 'bed', icon: '🛏️' },
  ];

  const lights = [
    { name: 'Lustre Central', value: 'ceiling', icon: '💡' },
    { name: 'Pendente', value: 'pendant', icon: '🔆' },
    { name: 'Spot Embutido', value: 'spot', icon: '⭐' },
    { name: 'Abajur', value: 'lamp', icon: '🕯️' },
  ];

  const ceilingOptions = [
    { 
      name: 'Sanca Aberta Simples', 
      value: 'sanca-aberta', 
      description: 'Iluminação indireta nas bordas',
      preview: '⬜'
    },
    { 
      name: 'Sanca Fechada', 
      value: 'sanca-fechada', 
      description: 'Rebaixo sem iluminação aparente',
      preview: '⬛'
    },
    { 
      name: 'Sanca Invertida', 
      value: 'sanca-invertida', 
      description: 'Luz central com rebaixo',
      preview: '◻️'
    },
    { 
      name: 'Forro Liso', 
      value: 'forro-liso', 
      description: 'Gesso liso sem detalhes',
      preview: '▫️'
    },
    { 
      name: 'Sanca com Spots', 
      value: 'sanca-spots', 
      description: 'Rebaixo com spots embutidos',
      preview: '⚪'
    },
    { 
      name: 'Sanca em L', 
      value: 'sanca-l', 
      description: 'Formato em L nas laterais',
      preview: '📐'
    },
  ];

  const sections = [
    {
      id: 'walls',
      title: 'Pintura de Paredes',
      icon: PaintBucket,
      description: 'Escolha a cor ideal para suas paredes',
    },
    {
      id: 'floor',
      title: 'Revestimento de Piso',
      icon: Square,
      description: 'Porcelanato, madeira e mais',
    },
    {
      id: 'ceiling',
      title: 'Forro de Gesso',
      icon: Box,
      description: 'Sancas e forros modernos',
    },
    {
      id: 'furniture',
      title: 'Móveis',
      icon: Sofa,
      description: 'Visualize móveis no ambiente',
    },
    {
      id: 'lights',
      title: 'Iluminação',
      icon: Lightbulb,
      description: 'Luminárias e spots',
    },
    {
      id: 'measure',
      title: 'Medição',
      icon: Ruler,
      description: 'Meça áreas e distâncias',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Opções de Reforma</h3>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <div key={section.id} className="space-y-3">
              <button
                onClick={() => setActiveSection(isActive ? null : section.id)}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4A90E2] to-[#007AFF] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">{section.title}</h4>
                    <p className="text-xs text-white/60">{section.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-white/50 transition-transform duration-300 ${
                    isActive ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Expanded Content */}
              {isActive && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {section.id === 'walls' && (
                    <div className="grid grid-cols-2 gap-2">
                      {wallColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setWallColor(color.color);
                            onApplyDecoration('wall', color.color);
                          }}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                            wallColor === color.color
                              ? 'bg-gradient-to-r from-[#4A90E2] to-[#007AFF] border-transparent text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-md border-2 border-white/30"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className="text-sm font-medium">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {section.id === 'floor' && (
                    <div className="grid grid-cols-2 gap-2">
                      {floorTextures.map((texture) => (
                        <button
                          key={texture.name}
                          onClick={() => {
                            setFloorTexture(texture.value);
                            onApplyDecoration('floor', texture.value);
                          }}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                            floorTexture === texture.value
                              ? 'bg-gradient-to-r from-[#4A90E2] to-[#007AFF] border-transparent text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-md border-2 border-white/30"
                            style={{ backgroundColor: texture.color }}
                          />
                          <span className="text-sm font-medium">{texture.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {section.id === 'ceiling' && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-[#4A90E2]/20 to-[#007AFF]/20 border border-[#4A90E2]/30 rounded-lg p-3 mb-3">
                        <p className="text-sm text-white/90 flex items-center gap-2">
                          <Box className="w-4 h-4" />
                          Aponte a câmera para o teto para visualizar
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {ceilingOptions.map((ceiling) => (
                          <button
                            key={ceiling.value}
                            onClick={() => {
                              setSelectedCeiling(ceiling.value);
                              onApplyDecoration('ceiling', ceiling.value);
                            }}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                              selectedCeiling === ceiling.value
                                ? 'bg-gradient-to-r from-[#4A90E2] to-[#007AFF] border-transparent text-white'
                                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-2xl">{ceiling.preview}</span>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{ceiling.name}</div>
                              <div className="text-xs text-white/60 mt-0.5">{ceiling.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.id === 'furniture' && (
                    <div className="grid grid-cols-2 gap-2">
                      {furniture.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            setSelectedFurniture(item.value);
                            onApplyDecoration('furniture', item.value);
                          }}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                            selectedFurniture === item.value
                              ? 'bg-gradient-to-r from-[#4A90E2] to-[#007AFF] border-transparent text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {section.id === 'lights' && (
                    <div className="grid grid-cols-2 gap-2">
                      {lights.map((light) => (
                        <button
                          key={light.name}
                          onClick={() => {
                            setSelectedLight(light.value);
                            onApplyDecoration('light', light.value);
                          }}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                            selectedLight === light.value
                              ? 'bg-gradient-to-r from-[#4A90E2] to-[#007AFF] border-transparent text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-xl">{light.icon}</span>
                          <span className="text-sm font-medium">{light.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {section.id === 'measure' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => onMeasure('square')}
                        className="w-full bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        📐 Medir Área (m²)
                      </button>
                      <button
                        onClick={() => onMeasure('linear')}
                        className="w-full bg-gradient-to-r from-[#4A90E2] to-[#007AFF] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        📏 Medir Distância (m)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
