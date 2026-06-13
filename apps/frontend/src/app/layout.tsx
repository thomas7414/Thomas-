import { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'OpenDev - AI-Powered Development Platform',
  description: 'Build websites, web apps, mobile apps, APIs, and SaaS platforms with AI',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
