'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.refresh();
        router.push('/');
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Aguardar um momento para os cookies serem definidos
        await new Promise(resolve => setTimeout(resolve, 100));
        router.refresh();
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full p-2 shadow-lg shadow-blue-500/50">
              <Image
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/cd7cc866-7961-4983-b05a-3fb7c60eff1c.png"
                alt="LUNAR Design Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain brightness-150 contrast-125"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">LUNAR Design</h1>
          <p className="text-white/70">Visualize sua reforma em Realidade Aumentada</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4A90E2',
                    brandAccent: '#007AFF',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'transparent',
                    defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.1)',
                    defaultButtonBorder: 'rgba(255, 255, 255, 0.2)',
                    defaultButtonText: 'white',
                    dividerBackground: 'rgba(255, 255, 255, 0.2)',
                    inputBackground: 'rgba(255, 255, 255, 0.05)',
                    inputBorder: 'rgba(255, 255, 255, 0.2)',
                    inputBorderHover: 'rgba(255, 255, 255, 0.3)',
                    inputBorderFocus: '#4A90E2',
                    inputText: 'white',
                    inputLabelText: 'rgba(255, 255, 255, 0.8)',
                    inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                  },
                  space: {
                    spaceSmall: '8px',
                    spaceMedium: '16px',
                    spaceLarge: '24px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Cadastrar',
                  loading_button_label: 'Cadastrando...',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                },
              },
            }}
            providers={[]}
            redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/50 text-sm">
          <p>Crie sua conta e comece a visualizar suas reformas</p>
        </div>
      </div>
    </div>
  );
}
