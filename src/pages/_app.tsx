import "@/styles/globals.css";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { ClerkProvider } from "@clerk/nextjs";
import { isEmbedRoute } from "@/lib/utils";
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/clerk.css';


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isEmbedPage, setIsEmbedPage] = useState(false);
  const [isCrossDomainIframe, setIsCrossDomainIframe] = useState(false);
  
  // 🌐 CROSS-DOMAIN IFRAME DETECTION
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're in an iframe
      const inIframe = window.self !== window.top;
      
      // Check if parent has different origin (cross-domain)
      let crossDomain = false;
      if (inIframe) {
        try {
          // This will throw an error if cross-domain
          const parentHost = window.parent.location.host;
          const currentHost = window.location.host;
          crossDomain = parentHost !== currentHost;
        } catch {
          // If we can't access parent location, it's definitely cross-domain
          crossDomain = true;
        }
      }
      
      setIsCrossDomainIframe(inIframe && crossDomain);
      
      console.log('🌐 CROSS-DOMAIN DETECTION:', {
        inIframe,
        crossDomain,
        currentHost: window.location.host,
        pathname: router.pathname,
        bypass: inIframe && crossDomain
      });
    }
  }, [router.pathname]);
  
  // ULTRA AGGRESSIVE EMBED DETECTION
  useEffect(() => {
    const checkIfEmbed = () => {
      const pathname = router.pathname;
      const asPath = router.asPath;
      const isEmbed = isEmbedRoute(pathname) || isEmbedRoute(asPath) || 
                     pathname.includes('embed') || asPath.includes('embed');
      
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
                             router.asPath.includes('embed') ||
                             router.asPath.includes('__clerk_handshake');
  
  // 🎯 BYPASS DECISION: Embed page OR cross-domain iframe
  const shouldBypassClerk = immediateEmbedCheck || isEmbedPage || isCrossDomainIframe;
  
  // 🔥 PRODUCTION LOGGING
  console.log('🚀 _APP.TSX BYPASS DECISION:', {
    currentPath: router.pathname,
    immediateEmbedCheck,
    isEmbedPage,
    isCrossDomainIframe,
    shouldBypassClerk,
    environment: process.env.NODE_ENV,
  });

  // 🚨 BYPASS CLERK for embed pages OR cross-domain iframes
  if (shouldBypassClerk) {
    console.log('🚀 BYPASSING CLERK - REASON:', {
      embed: immediateEmbedCheck || isEmbedPage,
      crossDomain: isCrossDomainIframe,
      path: router.pathname
    });
    
    return (
      <>
        <Head>
          <title>Video Embed</title>
          <meta name="robots" content="noindex,nofollow" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('🌐 CROSS-DOMAIN EMBED LOADED');
                console.log('🌐 HOST:', window.location.host);
                console.log('🌐 IN IFRAME:', window !== window.top);
                
                // ULTRA-AGGRESSIVE CLERK BLOCKING
                (function() {
                  // Block Clerk environment variables
                  window.__CLERK_FRONTEND_API = null;
                  window.__CLERK_PUBLISHABLE_KEY = null;
                  window.__CLERK_SECRET_KEY = null;
                  
                  // Block Clerk from loading scripts
                  const originalCreateElement = document.createElement;
                  document.createElement = function(tagName) {
                    const element = originalCreateElement.call(document, tagName);
                    if (tagName.toLowerCase() === 'script') {
                      const originalSetAttribute = element.setAttribute;
                      element.setAttribute = function(name, value) {
                        if (name === 'src' && (value.includes('clerk') || value.includes('quick-chicken'))) {
                          console.log('🚫 BLOCKED CLERK SCRIPT:', value);
                          return element;
                        }
                        return originalSetAttribute.call(this, name, value);
                      };
                    }
                    return element;
                  };
                  
                  // Block Clerk redirects
                  const originalLocation = window.location;
                  Object.defineProperty(window, 'location', {
                    get: function() {
                      return originalLocation;
                    },
                    set: function(value) {
                      if (typeof value === 'string' && (value.includes('clerk') || value.includes('quick-chicken'))) {
                        console.log('🚫 BLOCKED CLERK REDIRECT:', value);
                        return;
                      }
                      originalLocation.href = value;
                    }
                  });
                  
                  // Block Clerk handshake parameters
                  if (window.location.search.includes('__clerk_handshake')) {
                    const url = new URL(window.location);
                    url.searchParams.delete('__clerk_handshake');
                    url.searchParams.delete('__clerk_loaded');
                    url.searchParams.delete('__clerk_synced');
                    url.searchParams.delete('__clerk_db_jwt');
                    
                    // Replace URL without Clerk parameters
                    window.history.replaceState({}, '', url.toString());
                    console.log('🧹 REMOVED CLERK PARAMETERS FROM URL');
                  }
                  
                  // Block any Clerk-related navigation
                  window.addEventListener('beforeunload', function(e) {
                    if (window.location.href.includes('clerk') || window.location.href.includes('quick-chicken')) {
                      e.preventDefault();
                      e.returnValue = '';
                      console.log('🚫 BLOCKED CLERK NAVIGATION');
                      return '';
                    }
                  });
                  
                  console.log('🚫 ULTRA-AGGRESSIVE CLERK BLOCKING ACTIVATED');
                })();
                
                // Try to detect parent domain safely
                try {
                  if (window !== window.top) {
                    console.log('🌐 PARENT DOMAIN:', window.parent.location.host);
                  }
                } catch (e) {
                  console.log('🌐 CROSS-DOMAIN IFRAME CONFIRMED (cannot access parent)');
                }
              `
            }}
          />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  // 🔥 NORMAL CLERK LOADING for same-domain requests
  console.log('🔐 LOADING CLERK - SAME DOMAIN:', router.pathname);
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >

      <Head>
        <title>Scale - Video Management Platform</title>
        <meta name="description" content="Comprehensive video management for your organization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </ClerkProvider>
  );
}
