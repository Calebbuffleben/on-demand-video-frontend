import { Html, Head, Main, NextScript } from "next/document";
import { DocumentContext } from "next/document";
import { isEmbedRoute } from "@/lib/utils";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);
  
  // Check if this is an embed route using our centralized detection function
  const isEmbed = ctx.pathname ? isEmbedRoute(ctx.pathname) : false;
  
  if (isEmbed) {
    // For embed routes, return minimal HTML without any Clerk initialization
    // This prevents any authentication-related redirects in iframe contexts
    return {
      ...initialProps,
      styles: null, // Remove any global styles that might include Clerk
    };
  }
  
  return initialProps;
};
