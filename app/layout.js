import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Toaster } from 'sonner' // 1. Importa o componente base
import './globals.css'

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'InspectAI',
  description: 'Detecção automática de defeitos em placas eletrônicas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-bg-base text-text-primary font-sans">
        {children}
        
        {/* 2. Configurações do Toaster: tema escuro e cores ricas para Critical/Success */}
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          richColors 
          closeButton
          expand={true}      // <-- 1. Faz as notificações ficarem em lista, não empilhadas
          visibleToasts={6}  // <-- 2. Aumenta o limite de balões visíveis ao mesmo tempo
          gap={12}
        />
      </body>
    </html>
  )
}