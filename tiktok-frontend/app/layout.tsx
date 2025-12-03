import AllOverlays from '@/app/components/AllOverlays'
import type { Metadata } from 'next'
import UserProvider from './context/user'
import './globals.css'
import SWRProvider from './providers/SWRProvider'

export const metadata: Metadata = {
  title: 'TikTok Clone',
  description: 'TikTok Clone',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <UserProvider>
        <SWRProvider>
          <body>
            <AllOverlays />
            {children}
          </body>
        </SWRProvider>
      </UserProvider>
    </html>
  )
}
