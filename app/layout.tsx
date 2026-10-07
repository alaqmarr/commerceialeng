import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EnquiryCartDrawer } from '@/components/EnquiryCartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Commercial Engineering Associates | Industrial Tapes, Sealants & Adhesives',
  description:
    'Authorized distributor and technical solution provider for high-performance industrial tapes, structural adhesives, silicone sealants, and precision bonding materials.',
  keywords: [
    'commercial engineering associates',
    'industrial tapes',
    'structural adhesives',
    'silicone sealants',
    'thermal management materials',
    'bonding engineering',
    'die-cut tapes',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col selection:bg-red-600 selection:text-white">
        <AuthProvider>
          <CartProvider>
            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Application Content Area */}
            <main className="flex-1 flex flex-col">
              {children}
            </main>

            {/* Global Sliding Cart Drawer for RFQ Inquiries */}
            <EnquiryCartDrawer />

            {/* Industrial Engineering Footer */}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
