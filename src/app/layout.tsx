import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Red Calculator',
  description: 'A beautiful red-themed calculator with history',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
