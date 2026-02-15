import type {Metadata} from 'next';
import '@/app/styles';
import pretandard from '@/app/fonts';
import Providers from '@/app/providers';
import {Header} from '@/widgets/header';
import {Footer} from '@/widgets/footer';
import {Toaster} from 'sonner';
import {ChatBot} from '@/features/chatbot';

export const metadata: Metadata = {
  metadataBase: new URL('https://modu-review.com'),
  title: {
    default: '모두의 후기',
    template: '%s | 모두의 후기',
  },
  description: '당신이 찾던 그 후기를 확인해보세요.',
  icons: {
    icon: '/resources/logo.ico',
  },
  openGraph: {
    title: {
      default: '모두의 후기',
      template: '%s | 모두의 후기',
    },
    description: '당신이 찾던 그 후기를 확인해보세요',
    url: 'https://modu-review.com',
    siteName: '모두의 후기',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: '/resources/og-image.png',
        width: 1200,
        height: 630,
        alt: '모두의 후기',
      },
    ],
  },
};

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pretandard.className} antialiased flex flex-col w-full`}>
        <Providers>
          <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-xl">
            <Header />
          </header>
          <main className="grow w-full mx-auto">{children}</main>
          <div id="modal-root" />
          <div className="fixed bottom-6 right-4 z-50 md:bottom-12 md:right-8">
            <ChatBot />
          </div>
        </Providers>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
