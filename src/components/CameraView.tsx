/**
 * Componente de Câmera com Suporte AR Aprimorado
 * Gerencia acesso à câmera e sensores de movimento
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceOrientation, setDeviceOrientation] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Solicitar acesso à câmera traseira
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Câmera traseira
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
        setIsLoading(false);
      }
    };

    // Iniciar câmera
    startCamera();

    // Listener para orientação do dispositivo
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      });
    };

    // Adicionar listener de orientação
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video da câmera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-white font-medium">Iniciando câmera...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <h3 className="font-semibold text-red-500 text-lg">Erro na Câmera</h3>
            </div>
            <p className="text-white/80 text-sm">{error}</p>
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && deviceOrientation && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded-lg font-mono">
          <div>Alpha: {deviceOrientation.alpha.toFixed(1)}°</div>
          <div>Beta: {deviceOrientation.beta.toFixed(1)}°</div>
          <div>Gamma: {deviceOrientation.gamma.toFixed(1)}°</div>
        </div>
      )}
    </div>
  );
}
