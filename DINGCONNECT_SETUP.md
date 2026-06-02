# Configuração do DingConnect API

## Problema Atual

As credenciais DingConnect que você está usando não são válidas. A API está retornando erro 401 (AuthenticationFailed).

## Solução: Obter Credenciais Válidas

### Passo 1: Acessar o Portal DingConnect

1. Acesse: https://www.dingconnect.com/
2. Faça login na sua conta DingConnect
3. Navegue até **Account Settings** → **Developer Tab**

### Passo 2: Gerar Credenciais OAuth (Recomendado)

O DingConnect agora usa OAuth 2.0 Client Credentials Flow:

1. No portal, gere um novo **OAuth Client**
2. Você receberá:
   - `client_id` (UUID format)
   - `client_secret` (string longa)
3. Guarde essas credenciais com segurança

### Passo 3: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/settings/functions
2. Configure os seguintes secrets:
   - `DINGCONNECT_CLIENT_ID` = seu client_id
   - `DINGCONNECT_CLIENT_SECRET` = seu client_secret

### Passo 4: Atualizar o Código

Se você obteve credenciais OAuth, o código precisa ser atualizado para usar o novo endpoint:

**Endpoint Antigo (não funciona mais):**
```
POST https://api.dingconnect.com/api/V1/GetAccessToken
Content-Type: application/json
{
  "ClientId": "...",
  "ClientSecret": "..."
}
```

**Endpoint Novo (OAuth 2.0):**
```
POST https://idp.ding.com/connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=...&client_secret=...
```

## Modo de Teste

O DingConnect não tem ambiente sandbox separado. Para testar:

1. **Modo UAT (Teste)**: Use os números UAT que aparecem no campo `UatNumber` ao buscar produtos
   - Esses números sempre retornam sucesso
   - Não debitam do seu saldo
   - Formato: último dígito varia para simular diferentes cenários

2. **Modo Live**: Sua conta provavelmente está neste modo
   - Para mudar para modo UAT, contate: [email protected]

## Verificação

Para verificar se suas credenciais estão corretas, teste diretamente:

```bash
curl -X POST 'https://idp.ding.com/connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=SEU_CLIENT_ID&client_secret=SEU_CLIENT_SECRET'
```

Se funcionar, você receberá:
```json
{
  "access_token": "...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

## Próximos Passos

1. Gere novas credenciais OAuth no portal DingConnect
2. Configure os secrets no Supabase
3. Avise para eu atualizar o código para usar o novo endpoint OAuth
