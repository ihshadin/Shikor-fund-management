import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  title: 'Shikor Showpno Fund',
  description: 'Shikor Showpno Fund — Payment Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={archivo.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('shikor-theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(_){}`,
          }}
        />
      </head>
      <body className={archivo.className}>
        {children}
      </body>
    </html>
  );
}
