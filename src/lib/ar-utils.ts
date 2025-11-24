/**
 * Utilitários para Realidade Aumentada
 * Gerencia permissões, compatibilidade e funcionalidades AR
 */

export interface ARCapabilities {
  hasCamera: boolean;
  hasGyroscope: boolean;
  hasAccelerometer: boolean;
  isARSupported: boolean;
  isMobile: boolean;
}

/**
 * Verifica se o dispositivo suporta AR
 */
export async function checkARSupport(): Promise<ARCapabilities> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let hasCamera = false;
  let hasGyroscope = false;
  let hasAccelerometer = false;

  // Verificar câmera
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    hasCamera = devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.warn('Não foi possível verificar dispositivos de mídia:', error);
  }

  // Verificar sensores de movimento
  if (typeof DeviceMotionEvent !== 'undefined') {
    hasGyroscope = 'DeviceMotionEvent' in window;
    hasAccelerometer = 'DeviceMotionEvent' in window;
  }

  const isARSupported = hasCamera && (hasGyroscope || hasAccelerometer) && isMobile;

  return {
    hasCamera,
    hasGyroscope,
    hasAccelerometer,
    isARSupported,
    isMobile,
  };
}

/**
 * Solicita permissões de câmera
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' // Câmera traseira
      } 
    });
    
    // Parar o stream imediatamente após obter permissão
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de câmera:', error);
    return false;
  }
}

/**
 * Solicita permissões de sensores de movimento (iOS 13+)
 */
export async function requestMotionPermission(): Promise<boolean> {
  // iOS 13+ requer permissão explícita para sensores de movimento
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de movimento:', error);
      return false;
    }
  }
  
  // Outros dispositivos não precisam de permissão explícita
  return true;
}

/**
 * Solicita todas as permissões necessárias para AR
 */
export async function requestAllARPermissions(): Promise<{
  camera: boolean;
  motion: boolean;
}> {
  const [camera, motion] = await Promise.all([
    requestCameraPermission(),
    requestMotionPermission(),
  ]);

  return { camera, motion };
}

/**
 * Detecta orientação do dispositivo
 */
export function getDeviceOrientation(): 'portrait' | 'landscape' {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return 'portrait';
  }
  return 'landscape';
}

/**
 * Calcula a posição do forro baseado na orientação do dispositivo
 */
export interface CeilingPosition {
  top: number;
  height: number;
  opacity: number;
}

export function calculateCeilingPosition(
  deviceOrientation: { alpha: number; beta: number; gamma: number } | null
): CeilingPosition {
  if (!deviceOrientation) {
    return { top: 0, height: 33, opacity: 0.95 };
  }

  // Beta: inclinação frontal/traseira (-180 a 180)
  // Quando o dispositivo aponta para cima (teto), beta é próximo de 90
  const beta = deviceOrientation.beta || 0;
  
  // Normalizar beta para 0-1 (0 = horizontal, 1 = apontando para cima)
  const tiltFactor = Math.max(0, Math.min(1, (beta + 90) / 180));
  
  // Ajustar posição e tamanho do forro baseado na inclinação
  const top = Math.max(0, 10 - (tiltFactor * 10));
  const height = 33 + (tiltFactor * 17); // 33% a 50% da tela
  const opacity = 0.85 + (tiltFactor * 0.1); // 0.85 a 0.95

  return { top, height, opacity };
}

/**
 * Formata mensagens de erro amigáveis
 */
export function getARErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'camera-denied': 'Permissão de câmera negada. Por favor, habilite nas configurações do navegador.',
    'camera-unavailable': 'Câmera não disponível. Verifique se outro aplicativo não está usando.',
    'motion-denied': 'Permissão de sensores negada. Necessário para AR funcionar corretamente.',
    'not-supported': 'Seu dispositivo não suporta Realidade Aumentada.',
    'not-mobile': 'AR funciona melhor em dispositivos móveis.',
  };

  return messages[error] || 'Erro desconhecido ao iniciar AR.';
}
