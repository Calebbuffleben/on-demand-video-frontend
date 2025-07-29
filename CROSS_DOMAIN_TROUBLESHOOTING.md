# 🌐 Cross-Domain Embed Troubleshooting Guide

## Problema Identificado

O embed funciona perfeitamente quando acessado diretamente no domínio da aplicação:
```
https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d
```

Mas apresenta problemas quando usado em outros domínios (cross-domain).

## ✅ Soluções Implementadas

### 1. **Frontend - Headers Agressivos para Cross-Domain**

**Arquivo:** `next.config.ts`
```typescript
// Headers para rotas de embed
{
  source: '/embed/:videoId*',
  headers: [
    { key: 'X-Frame-Options', value: 'ALLOWALL' },
    { key: 'Content-Security-Policy', value: "frame-ancestors *;" },
    { key: 'Access-Control-Allow-Origin', value: '*' },
    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS, HEAD' },
    { key: 'Access-Control-Allow-Headers', value: '*' },
    { key: 'Access-Control-Allow-Credentials', value: 'false' },
  ],
}
```

### 2. **Backend - CORS Headers Específicos**

**Arquivo:** `backend/src/videos/videos.controller.ts`
```typescript
@Get('embed/:uid')
@Public()
async getVideoForEmbed(
  @Param('uid') uid: string,
  @Req() req: Request,
  @Res() res: any
): Promise<EmbedVideoResponseDto> {
  // Headers agressivos para cross-domain
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('X-Frame-Options', 'ALLOWALL');
  res.header('Content-Security-Policy', 'frame-ancestors *;');
  res.header('X-Embed-API', 'true');
  res.header('X-Cross-Domain-Ready', 'true');
  
  // ... resto da lógica
}
```

### 3. **Middleware - Bypass Completo para Embeds**

**Arquivo:** `frontend/src/middleware.ts`
```typescript
// Bypass para rotas de embed
const embedBypassRoutes = [
  '/api/embed/(.*)',
  '/embed/(.*)',
  '/videos/embed/(.*)',
];

// Bypass imediato para embeds
if (isEmbedRequest || (isCrossDomain && isIframeRequest)) {
  console.log('🚀 CROSS-DOMAIN EMBED BYPASS');
  return NextResponse.next();
}
```

### 4. **SSR para Páginas de Embed**

**Arquivo:** `frontend/src/pages/embed/[videoId].tsx`
```typescript
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Headers agressivos para iframe
  context.res.setHeader('X-Frame-Options', 'ALLOWALL');
  context.res.setHeader('Content-Security-Policy', 'frame-ancestors *;');
  
  // Fetch direto do backend sem interferência do Clerk
  const response = await fetch(`${backendUrl}/videos/embed/${videoId}`);
  // ...
};
```

## 🔧 Como Testar

### 1. **Teste Local**
```bash
# Acesse o arquivo de teste
https://on-demand-video-frontend-production.up.railway.app/test-cross-domain-embed.html
```

### 2. **Teste em Outro Domínio**
```html
<!-- Cole este código em qualquer site -->
<iframe 
    src="https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d"
    width="100%" 
    height="400" 
    frameborder="0" 
    allowfullscreen>
</iframe>
```

### 3. **Teste com Parâmetros de Debug**
```html
<iframe 
    src="https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d?debug=true&cross-domain=true"
    width="100%" 
    height="400" 
    frameborder="0" 
    allowfullscreen>
</iframe>
```

## 🚨 Troubleshooting

### **Problema 1: "Redirecionamento em excesso"**
**Causa:** Clerk tentando redirecionar em páginas de embed
**Solução:** ✅ Já implementado - bypass completo do Clerk em rotas de embed

### **Problema 2: "X-Frame-Options" bloqueando**
**Causa:** Headers de segurança bloqueando iframe
**Solução:** ✅ Já implementado - `X-Frame-Options: ALLOWALL`

### **Problema 3: CORS bloqueando requisições**
**Causa:** Política de CORS restritiva
**Solução:** ✅ Já implementado - `Access-Control-Allow-Origin: *`

### **Problema 4: Content Security Policy**
**Causa:** CSP bloqueando frame-ancestors
**Solução:** ✅ Já implementado - `frame-ancestors *;`

## 📋 Checklist de Verificação

- [ ] **Frontend compilado** com as configurações de `next.config.ts`
- [ ] **Backend deployado** com os headers CORS atualizados
- [ ] **Middleware** configurado para bypass de embeds
- [ ] **SSR** funcionando para páginas de embed
- [ ] **Clerk** completamente bypassado em rotas de embed

## 🌐 Configurações para Diferentes Plataformas

### **WordPress**
```php
[embed]https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d[/embed]
```

### **HTML Puro**
```html
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe 
        src="https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        frameborder="0" 
        allowfullscreen>
    </iframe>
</div>
```

### **React/Next.js**
```jsx
<iframe 
    src="https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d"
    width="100%" 
    height="400" 
    frameBorder="0" 
    allowFullScreen
/>
```

## 🔍 Debug

### **Verificar Headers**
```bash
curl -I https://on-demand-video-frontend-production.up.railway.app/embed/84e8bed3-d73d-4095-89f4-f5d6f4d42a0d
```

### **Verificar Console do Navegador**
- Abra as ferramentas de desenvolvedor
- Vá para a aba Console
- Procure por erros relacionados a CORS, X-Frame-Options, ou CSP

### **Verificar Network Tab**
- Abra as ferramentas de desenvolvedor
- Vá para a aba Network
- Recarregue a página
- Verifique se as requisições para o embed estão retornando status 200

## 📞 Suporte

Se o problema persistir após implementar todas as soluções acima:

1. **Verifique o console do navegador** para erros específicos
2. **Teste em diferentes navegadores** para isolar o problema
3. **Verifique se o domínio de destino** está na lista de CORS permitidos
4. **Confirme que não há bloqueadores** de iframe no domínio de destino

---

**Última atualização:** $(date)
**Versão:** 1.0
**Status:** ✅ Implementado e testado 