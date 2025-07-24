import "@/styles/globals.css";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from "../contexts/AuthContext";
import TokenProvider from "../components/Auth/TokenProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { isEmbedRoute } from "@/lib/utils";
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isEmbedPage, setIsEmbedPage] = useState(false);
  
  // ULTRA AGGRESSIVE EMBED DETECTION
  useEffect(() => {
    const checkIfEmbed = () => {
      const pathname = router.pathname;
      const asPath = router.asPath;
      const isEmbed = isEmbedRoute(pathname) || isEmbedRoute(asPath) || 
                     pathname.includes('embed') || asPath.includes('embed');
      
      console.log('🔥 APP.TSX EMBED CHECK:', {
        pathname,
        asPath,
        isEmbed,
        isEmbedRoute: isEmbedRoute(pathname),
        isInIframe: typeof window !== 'undefined' ? window.self !== window.top : false
      });
      
      setIsEmbedPage(isEmbed);
    };
    
    checkIfEmbed();
    
    // Listen for route changes
    router.events.on('routeChangeStart', checkIfEmbed);
    router.events.on('routeChangeComplete', checkIfEmbed);
    
    return () => {
      router.events.off('routeChangeStart', checkIfEmbed);
      router.events.off('routeChangeComplete', checkIfEmbed);
    };
  }, [router]);
  
  // IMMEDIATE CHECK - don't wait for useEffect
  const immediateEmbedCheck = isEmbedRoute(router.pathname) || 
                             isEmbedRoute(router.asPath) || 
                             router.pathname.includes('embed') || 
                             router.asPath.includes('embed');
  
  // If ANY indication this is an embed, NEVER load Clerk
  if (immediateEmbedCheck || isEmbedPage) {
    console.log('🚀 BYPASSING CLERK COMPLETELY - EMBED DETECTED');
    return <Component {...pageProps} />;
  }
  
  console.log('🔐 LOADING CLERK - NON-EMBED ROUTE');
  return (
    <ClerkProvider {...pageProps}>
      <TokenProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </TokenProvider>
    </ClerkProvider>
  );
}
