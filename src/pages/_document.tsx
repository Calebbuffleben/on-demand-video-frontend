import { Html, Head, Main, NextScript } from "next/document";
import { DocumentContext } from "next/document";

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
  
  // Check if this is an embed route and prevent Clerk from loading
  const isEmbedRoute = ctx.pathname?.startsWith('/embed/');
  
  if (isEmbedRoute) {
    // For embed routes, return minimal HTML without any Clerk initialization
    return {
      ...initialProps,
      styles: null, // Remove any global styles that might include Clerk
    };
  }
  
  return initialProps;
};
