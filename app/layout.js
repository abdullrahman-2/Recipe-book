

import './globals.css';  

import { Inter } from 'next/font/google';  
const inter = Inter({ subsets: ['latin'] });

// استورد الـ Navbar بتاعك
 
 import ReduxProviderWrapper from '@/components/ReduxProviderWrapper';  
 
 export const metadata = {
  title: 'Recipe Book App',  
  description: 'Manage your favorite recipes',  

};

export default function RootLayout({ children }) {
  return (
   <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body
        className={`${inter.className} bg-gray-900 text-gray-200`}  
        style={{
          backgroundImage: `url('/images/BackGround.jpg')`,  
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >

         <ReduxProviderWrapper>
          <main className="min-h-screen py-8">
            <div className="mx-auto px-4 max-w-screen-2xl">
              {children}
            </div>
          </main>
        </ReduxProviderWrapper>

        <footer className="bg-gray-900 text-white p-6 text-center">
          <p>&copy; 2024 Recipe Book. All rights reserved.</p>
        </footer>
        
       </body>
    </html>
  );
}