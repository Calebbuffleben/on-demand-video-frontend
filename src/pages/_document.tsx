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
    let html = initialProps.html || '';
    
    // Remove any Clerk-related scripts
    html = html.replace(/<script[^>]*clerk[^>]*><\/script>/gi, '');
    html = html.replace(/<script[^>]*quick-chicken-4\.clerk\.accounts\.dev[^>]*><\/script>/gi, '');
    html = html.replace(/<script[^>]*__clerk[^>]*><\/script>/gi, '');
    
    // Remove any Clerk-related meta tags
    html = html.replace(/<meta[^>]*clerk[^>]*>/gi, '');
    
    // Remove any Clerk-related links
    html = html.replace(/<link[^>]*clerk[^>]*>/gi, '');
    
    return {
      ...initialProps,
      styles: null, // Remove any global styles that might include Clerk
      html: html,
    };
  }
  
  return initialProps;
};
