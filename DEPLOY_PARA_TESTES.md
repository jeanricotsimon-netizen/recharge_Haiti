# 🚀 Deploy para Testes PayPal Sandbox

## ⚠️ IMPORTANTE

O PayPal SDK **NÃO FUNCIONA** no preview do Bolt.new devido a restrições do WebContainer.

Para testar PayPal Sandbox REAL, você precisa fazer deploy em um servidor real.

---

## Opção 1: Deploy no Netlify (RECOMENDADO)

### Passo 1: Criar conta Netlify

1. Acesse: https://www.netlify.com/
2. Clique em **Sign Up**
3. Use sua conta GitHub

### Passo 2: Fazer Deploy

**Via Netlify Drop (Mais Fácil):**

1. Build o projeto:
   ```bash
   npm run build
   ```

2. Acesse: https://app.netlify.com/drop

3. Arraste a pasta `dist/` para a área de drop

4. Aguarde o deploy (30 segundos)

5. Você receberá uma URL: `https://random-name-123.netlify.app`

**Via Git (Recomendado para produção):**

1. Conecte seu repositório GitHub

2. Configure:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. Adicione variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_key
   ```

4. Deploy automático a cada push

---

## Opção 2: Deploy no Vercel

### Passo 1: Criar conta Vercel

1. Acesse: https://vercel.com/
2. Clique em **Sign Up**
3. Use sua conta GitHub

### Passo 2: Fazer Deploy

1. Instale o Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Faça login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

4. Siga as instruções

5. Você receberá uma URL: `https://seu-app.vercel.app`

---

## Opção 3: Deploy no GitHub Pages

### Passo 1: Configurar Vite

Edite `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/nome-do-repositorio/'  // Adicione isso
})
```

### Passo 2: Build e Deploy

1. Build:
   ```bash
   npm run build
   ```

2. Instale gh-pages:
   ```bash
   npm install -D gh-pages
   ```

3. Adicione script no `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Configure GitHub Pages:
   - Vá em Settings → Pages
   - Source: gh-pages branch

6. URL: `https://seu-usuario.github.io/nome-repo/`

---

## Depois do Deploy

### 1. Testar PayPal Sandbox

Acesse a URL do seu deploy e:

1. Selecione um país e operador
2. Digite um número de telefone
3. Escolha **PayPal**
4. Clique em **Processar Recarga**
5. O botão PayPal REAL deve aparecer
6. Faça login com conta sandbox do PayPal
7. Complete o pagamento

### 2. Contas de Teste PayPal

Crie contas no PayPal Developer:

1. Acesse: https://developer.paypal.com/dashboard/
2. Vá em **Sandbox → Accounts**
3. Use a conta **Personal** para fazer pagamentos de teste

Credenciais exemplo:
```
Email: sb-buyer47@personal.example.com
Senha: [gerada pelo PayPal]
```

### 3. Monitorar Transações

**No PayPal Dashboard:**
- https://developer.paypal.com/dashboard/
- Sandbox → Accounts → Business → Transactions

**No Supabase:**
```sql
SELECT * FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

---

## Checklist de Testes

- [ ] Deploy realizado com sucesso
- [ ] App carrega sem erros
- [ ] Botão PayPal aparece (não mensagem de erro)
- [ ] Login com conta sandbox funciona
- [ ] Pagamento é processado
- [ ] Recarga é enviada pelo DingConnect
- [ ] Transação é salva no Supabase
- [ ] Histórico mostra a transação

---

## Problemas Comuns

### "PayPal SDK não disponível"

**Causa:** Ainda está no preview do Bolt.new

**Solução:** Faça deploy em Netlify/Vercel

### "Invalid client_id"

**Causa:** Client ID não configurado corretamente

**Solução:** Verifique o `index.html` tem o Client ID correto

### "CORS error"

**Causa:** Edge Functions não aceitam requisições do seu domínio

**Solução:** Configure CORS no Supabase:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## Próximos Passos

Depois de testar no Sandbox:

1. ✅ Validar 10+ transações de teste
2. ✅ Testar cenários de erro
3. ✅ Verificar recargas são entregues
4. 📝 Seguir guia: `MIGRACAO_PRODUCAO_PAYPAL.md`
5. 🚀 Ativar modo produção

---

## Suporte

- **Netlify Docs**: https://docs.netlify.com/
- **Vercel Docs**: https://vercel.com/docs
- **PayPal Sandbox**: https://developer.paypal.com/docs/

---

**✅ Agora você pode testar PayPal Sandbox REAL!**
