# Solução para Redirecionamento em Excesso no Embed

## 🔍 Problema Identificado

O erro **"Redirecionamento em excesso"** estava ocorrendo porque:

1. **Rota Inexistente**: O usuário estava tentando acessar `/videos/embed/[uid]` mas essa rota não existia no frontend
2. **Middleware do Clerk**: Mesmo com bypass configurado, o Clerk tentava processar a rota inexistente
3. **Loop de Redirecionamento**: Next.js redirecionava para 404, Clerk tentava autenticar, criando um loop infinito

## 🛠️ Solução Implementada

### 1. Criação da Rota `/videos/embed/[uid]`

Criada a página `frontend/src/pages/videos/embed/[uid].tsx` que:

- **Server-Side Rendering**: Usa `getServerSideProps` para evitar interferência do Clerk
- **Headers de Segurança**: Configura headers específicos para iframe
- **Anti-Redirect**: Script que bloqueia redirecionamentos indesejados
- **Player de Vídeo**: Integração com MuxVideoPlayer

### 2. Atualização do Middleware

Atualizado `frontend/src/middleware.ts`:

```typescript
// Adicionada rota pública
const isPublicRoute = createRouteMatcher([
  // ... outras rotas
  '/videos/embed/(.*)', // Videos embed routes - NEW
]);

// Bypass específico para /videos/embed/
if (pathname.startsWith('/videos/embed/')) {
  console.log('🎯 VIDEOS EMBED BYPASS for:', pathname);
  const response = NextResponse.next();
  // Headers de segurança e CORS
  return response;
}
```

### 3. Atualização da Função `isEmbedRoute`

Atualizado `frontend/src/lib/utils.ts`:

```typescript
export function isEmbedRoute(pathname: string): boolean {
  // ... lógica existente
  
  // Check for videos embed routes: /videos/embed/[uid]
  if (cleanPath.startsWith('/videos/embed/')) {
    return true;
  }
  
  // ... resto da lógica
}
```

### 4. Configuração do Next.js

Atualizado `frontend/next.config.ts` com headers específicos:

```typescript
{
  source: '/videos/embed/:uid*',
  headers: [
    { key: 'X-Frame-Options', value: 'ALLOWALL' },
    { key: 'Content-Security-Policy', value: "frame-ancestors *; ..." },
    // ... outros headers
  ],
}
```

## 🎯 Como Usar

### Embed via iframe:

```html
<iframe 
  src="https://sua-app.com/videos/embed/abc123" 
  width="100%" 
  height="400" 
  frameborder="0"
  allowfullscreen>
</iframe>
```

### Parâmetros Suportados:

- **uid**: ID único do vídeo (obrigatório)
- **autoplay**: Reprodução automática (opcional)
- **muted**: Vídeo sem som (opcional)

## 🔒 Segurança

### Headers Configurados:

- `X-Frame-Options: ALLOWALL` - Permite embed em qualquer domínio
- `Content-Security-Policy: frame-ancestors *` - Política de segurança permissiva
- `Access-Control-Allow-Origin: *` - CORS para cross-domain
- `Cache-Control: no-cache` - Evita problemas de cache

### Proteções Implementadas:

- **Anti-Redirect Script**: Bloqueia redirecionamentos indesejados
- **SSR**: Evita interferência do Clerk no client-side
- **Headers de Segurança**: Configuração específica para iframe

## 🚀 Teste

Para testar a solução:

1. **Acesso Direto**: `https://sua-app.com/videos/embed/abc123`
2. **Via iframe**: 
   ```html
   <iframe src="https://sua-app.com/videos/embed/abc123"></iframe>
   ```
3. **Cross-domain**: Teste em um domínio diferente

## 📝 Logs de Debug

O sistema inclui logs detalhados:

- `🎬 SSR: Fetching video for embed (videos/embed): [uid]`
- `🎯 VIDEOS EMBED BYPASS for: /videos/embed/[uid]`
- `🛡️ ANTI-REDIRECT PROTECTION ACTIVATED for videos/embed`

## 🔧 Troubleshooting

### Se ainda houver problemas:

1. **Verifique os logs**: Console do navegador e logs do servidor
2. **Teste a rota diretamente**: Acesse a URL no navegador
3. **Verifique o backend**: Confirme que `/videos/embed/[uid]` retorna dados
4. **Limpe o cache**: Headers anti-cache devem resolver problemas de cache

### Comandos úteis:

```bash
# Verificar se a rota está funcionando
curl -I https://sua-app.com/videos/embed/abc123

# Testar headers
curl -H "User-Agent: Mozilla/5.0" https://sua-app.com/videos/embed/abc123
```

## ✅ Resultado Esperado

Após a implementação:

- ✅ Rota `/videos/embed/[uid]` funciona corretamente
- ✅ Embed via iframe sem redirecionamentos
- ✅ Suporte cross-domain completo
- ✅ Player de vídeo funcional
- ✅ Sem interferência do Clerk
- ✅ Headers de segurança adequados 