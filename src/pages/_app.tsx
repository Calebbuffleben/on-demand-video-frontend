import "@/styles/globals.css";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from "../contexts/AuthContext";
import TokenProvider from "../components/Auth/TokenProvider";
import { ClerkProvider } from "@clerk/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Completely isolate embed routes from Clerk
  if (router.pathname.includes('/embed/') || router.asPath.includes('/embed/')) {
    return (
      <>
        <style jsx global>{`
          /* Reset any global styles that might interfere with embed */
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #000;
          }
          /* Completely disable any Clerk-related styles and elements */
          [data-clerk], [class*="clerk"], [id*="clerk"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          /* Prevent any Clerk scripts from loading */
          script[src*="clerk"] {
            display: none !important;
          }
          /* Hide any Clerk iframes */
          iframe[src*="clerk"] {
            display: none !important;
          }
        `}</style>
        <Component {...pageProps} />
      </>
    );
  }
  
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
