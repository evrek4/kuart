import { redirect } from 'next/navigation';
import { prisma } from '@kuafor-art/database';
import DirectoryClient from './DirectoryClient';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Kuaför Rehberi | KuaförArt',
  description: 'Şehrinizdeki en iyi kuaförleri bulun ve hemen online randevu alın.',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function RehberPage() {
  // 1. Modülün açık olup olmadığını kontrol et
  const globalSettings = await prisma.globalSettings.findFirst();
  
  // Modül kapalıysa anasayfaya yönlendir
  if (!globalSettings || !globalSettings.isDirectoryEnabled) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] dark:bg-[#081326] flex flex-col selection:bg-[#0B1933] selection:text-white dark:selection:bg-white dark:selection:text-[#0B1933]">
      <Navbar />
      
      <div className="flex-grow">
        <DirectoryClient />
      </div>

      <Footer />
    </main>
  );
}
