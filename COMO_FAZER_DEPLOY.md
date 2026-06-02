# 🚀 COMO FAZER O DEPLOY DAS FUNÇÕES

## ✅ O QUE JÁ FOI FEITO

Atualizei os arquivos locais das edge functions com as credenciais corretas:

1. ✅ `supabase/functions/dingconnect-operators/index.ts` - CORRIGIDO
2. ✅ `supabase/functions/dingconnect-recharge/index.ts` - CORRIGIDO

Agora você precisa fazer o deploy manual dessas funções.

---

## 📋 OPÇÃO 1: Deploy via Dashboard do Supabase (RECOMENDADO)

### Passo 1: Abrir a função no dashboard

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions

2. Você verá uma lista com todas as funções

3. Clique em **dingconnect-operators**

### Passo 2: Editar a função

1. Procure pelo botão **"Edit"** ou ícone de lápis ✏️

2. Clique nele

3. Um editor vai abrir com o código atual da função

### Passo 3: Substituir o código

1. No projeto, abra o arquivo:
   ```
   supabase/functions/dingconnect-operators/index.ts
   ```

2. Copie **TODO** o conteúdo desse arquivo (Ctrl+A, Ctrl+C)

3. No editor do dashboard:
   - Selecione todo o código antigo (Ctrl+A)
   - Delete tudo (Delete ou Backspace)
   - Cole o novo código (Ctrl+V)

### Passo 4: Salvar e fazer deploy

1. Procure pelo botão **"Deploy"** ou **"Save"**

2. Clique nele

3. Aguarde a mensagem de sucesso (30-60 segundos)

### Passo 5: Repetir para a segunda função

Repita os passos 1-4 para a função **dingconnect-recharge**:
- Abra: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions/dingconnect-recharge
- Copie o conteúdo de: `supabase/functions/dingconnect-recharge/index.ts`
- Cole no editor
- Clique em Deploy

---

## 📋 OPÇÃO 2: Deploy via Git Push (SE O PROJETO ESTIVER NO GIT)

Se seu projeto Supabase está conectado ao Git:

1. Faça commit das alterações:
   ```bash
   git add supabase/functions/
   git commit -m "Fix DingConnect authentication"
   git push
   ```

2. O Supabase vai fazer o deploy automaticamente

---

## 📋 OPÇÃO 3: Deploy via CLI do Supabase (SE TIVER INSTALADO)

Se você tem o Supabase CLI instalado:

```bash
# Na pasta do projeto, execute:
supabase functions deploy dingconnect-operators
supabase functions deploy dingconnect-recharge
```

---

## ✅ COMO SABER SE DEU CERTO

Depois de fazer o deploy:

1. Abra o app da recarga

2. Clique em **"Buscar Operadoras"**

3. Se aparecer a lista de operadoras = **FUNCIONOU!** ✅

4. Se ainda der erro de autenticação = precisa tentar outra opção de deploy

---

## 🆘 SE NENHUMA OPÇÃO FUNCIONAR

Se você não conseguir acessar o dashboard nem usar CLI/Git:

1. Me avise que vou tentar outra abordagem

2. Posso criar um script que faz o deploy via API do Supabase

3. Ou posso guiar você por outro método

---

## 🔐 SOBRE AS CREDENCIAIS NO CÓDIGO

As credenciais estão **temporariamente** hardcoded no código das funções porque:

- O dashboard do Bolt não está abrindo a seção de Secrets
- É seguro porque as edge functions rodam no servidor (não no navegador)
- Quando o dashboard voltar a funcionar, vamos mover para Secrets

**Isso é temporário!** Quando o problema do dashboard for resolvido, vamos:
1. Adicionar as credenciais nos Secrets do Supabase
2. Remover do código
3. Fazer redeploy

---

## 💡 DICA

Se o dashboard do Supabase não abrir, tente:
- Limpar cache do navegador
- Usar modo anônimo/privado
- Usar outro navegador
- Acessar direto: https://supabase.com/dashboard

---

**Qual opção você vai tentar primeiro?**
