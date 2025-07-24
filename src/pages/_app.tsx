import "@/styles/globals.css";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider } from "../contexts/AuthContext";
import TokenProvider from "../components/Auth/TokenProvider";
import { ClerkProvider } from "@clerk/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Don't load Clerk for embed routes
  if (router.pathname.includes('/embed/') || router.asPath.includes('/embed/')) {
    return <Component {...pageProps} />;
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
