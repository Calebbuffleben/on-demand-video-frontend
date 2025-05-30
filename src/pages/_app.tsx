import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthContext";
import TokenProvider from "../components/Auth/TokenProvider";

export default function App({ Component, pageProps }: AppProps) {
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
