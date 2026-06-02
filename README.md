# Recharge Haiti

Um aplicativo web para revenda de recargas internacionais direcionado para haitianos na diáspora que desejam comprar recargas e enviar para o Haiti.

## Funcionalidades

- **Sistema Brasil**: Suporte exclusivo para o Brasil
- **Pagamentos Seguros**: PIX via MercadoPago
- **Reembolso Automático**: Sistema automático de estorno em caso de falha
- **Histórico Completo**: Acompanhe todas as suas transações
- **Interface Responsiva**: Design otimizado para dispositivos móveis

## Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Payments**: MercadoPago (PIX)
- **Recharges**: DingConnect API
- **Icons**: Lucide React

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas principais
├── services/           # Integrações com APIs
├── hooks/              # Custom hooks
├── types/              # TypeScript types
├── constants/          # Constantes e configurações
└── utils/              # Funções utilitárias
```

## Setup

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas chaves de API
   ```
4. Configure o Supabase:
   - Clique em "Connect to Supabase" no topo da aplicação
   - Execute as migrações SQL
5. Execute o projeto: `npm run dev`

## 🧪 Modo de Teste

O aplicativo está configurado para **MODO DE TESTE** com as seguintes funcionalidades:

### Painel de Testes
- 🔧 **Ícone de engrenagem** no canto inferior direito
- ✅ Testar conexão com todas as APIs
- ✅ Verificar configuração das chaves
- ✅ Validar integração Supabase
- ✅ Simular fluxo completo de pagamento

### Configuração de Teste Ativa
- 🧪 **Stripe**: Modo teste com chaves `pk_test_...`
- 🧪 **MercadoPago**: Simulação (sem cobrança real)
- 🧪 **Reloadly**: Dados simulados (sem recarga real)
- 🧪 **Supabase**: Database real (seguro para testes)

### Testando o Fluxo Completo

1. **Clique no ícone de engrenagem** (canto inferior direito)
2. **Execute "Testes de API"** para verificar todas as integrações

#### Teste PIX (Brasil):
- **País**: Brasil
- **Número**: 3012-3456 (Digicel)
- **Valor**: R$ 10
- **Método**: PIX
- **Resultado**: QR Code simulado

#### Teste Cartão (Internacional):
- **País**: Estados Unidos
- **Número**: 3223-4567 (Natcom)
- **Valor**: $10 USD
- **Método**: CARD
- **Cartão**: 4242 4242 4242 4242
- **CVV**: 123 | **Data**: 12/25

## Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Execute as migrações SQL em `supabase/migrations/`
3. Configure as variáveis de ambiente

## Integrações

### Configuração das APIs

#### DingConnect API
1. Crie uma conta em [DingConnect](https://www.dingconnect.com/) (PRODUÇÃO)
2. Acesse o dashboard e obtenha:
   - Client ID: `3ea5f8fc-1d31-4858-84ea-25330252fb39`
   - Client Secret: `gSWqEvjKbR8gLO6zC3t01uAnfpl+e+yE/CSjceQgsgo=`
3. Configure no arquivo `.env`:
   ```
   # Para frontend (Vite)
   VITE_DINGCONNECT_CLIENT_ID=3ea5f8fc-1d31-4858-84ea-25330252fb39
   VITE_DINGCONNECT_CLIENT_SECRET=gSWqEvjKbR8gLO6zC3t01uAnfpl+e+yE/CSjceQgsgo=
   # Para Supabase Edge Functions
   DINGCONNECT_CLIENT_ID=3ea5f8fc-1d31-4858-84ea-25330252fb39
   DINGCONNECT_CLIENT_SECRET=gSWqEvjKbR8gLO6zC3t01uAnfpl+e+yE/CSjceQgsgo=
   ```

#### MercadoPago (Brasil)
1. Crie uma conta em [MercadoPago Developers](https://www.mercadopago.com.br/developers)
2. Para TESTE, obtenha as chaves de teste:
   - Access Token
   - Public Key
3. Configure no arquivo `.env`:
   ```
   # MODO TESTE (sem cobrança real)
   VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-5413112594519532-070307-11f6968eaf3357c7526b4ef96acb1c9b-156425199
   VITE_MERCADOPAGO_PUBLIC_KEY=TEST-e1f9d87a-822e-4b80-aee9-0163aa443f26
   MERCADOPAGO_ACCESS_TOKEN=TEST-5413112594519532-070307-11f6968eaf3357c7526b4ef96acb1c9b-156425199
   ```

#### Stripe Configuration (LIVE MODE - PRODUCTION)
⚠️ **ATENÇÃO**: Use apenas em produção - cobrará valores reais!

1. No [Dashboard Stripe](https://dashboard.stripe.com/apikeys), mude para modo LIVE
2. Obtenha as chaves de produção:
   - Publishable Key (pk_live_...)
   - Secret Key (sk_live_...)
3. Configure no arquivo `.env` de produção:
   ```
   # Para frontend (Vite)
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
   VITE_STRIPE_SECRET_KEY=sk_live_your-live-secret-key
   # Para Supabase Edge Functions
   STRIPE_SECRET_KEY=sk_live_your-live-secret-key
   ```

### 🧪 Testando as Integrações

#### Modo Sandbox/Teste
- **DingConnect**: ⚠️ PRODUÇÃO REAL - Recargas custam dinheiro real
- **MercadoPago**: Chaves devem começar com `TEST-`
- **Supabase**: Banco real (seguro para testes)

#### Dados de Teste
- **Números Haiti Válidos**:
  - **Digicel**: 3012-3456, 3678-9012, 2812-3456 (fixo)
  - **Natcom**: 3223-4567, 4012-3456, 2212-3456 (fixo)
- **Valores**: R$ 5, 10, 15, 20, 25, 50, 100
- **PIX**: QR Code simulado (sem cobrança real)

### DingConnect API
- Autenticação OAuth2 automática
- Suporte para operadoras do Haiti e República Dominicana
- **Haiti**: Digicel (173), Natcom (174)
- **República Dominicana**: Altice/Orange (ORDO), Viva (VVDO), Claro Data (D8DO)
- **⚠️ PRODUÇÃO**: Recargas custam dinheiro real

### MercadoPago
- Pagamentos PIX instantâneos
- QR Code automático
- Polling para confirmação de pagamento
- Sistema de reembolso automático

## Fluxo de Recarga

1. **Seleção do país** de origem (apenas Brasil)
2. **Inserção do número** de destino no Haiti
3. **Escolha da operadora** (Digicel/Natcom)
4. **Seleção do valor** da recarga
5. **Método de pagamento** (PIX)
6. **Processamento do pagamento**
7. **Confirmação do pagamento**
8. **Execução da recarga** via DingConnect
9. **Confirmação ou reembolso** automático

## Fluxo Técnico Detalhado

### Pagamento PIX (Brasil)
1. Criação do pagamento no MercadoPago
2. Geração do QR Code PIX
3. Polling para confirmação (10s intervals, 5min timeout)
4. Confirmação → Execução da recarga
5. Falha na recarga → Reembolso automático

## Tratamento de Erros

- **Falha no pagamento**: Transação marcada como "failed"
- **Falha na recarga**: Reembolso automático + status "refunded"
- **Timeout de pagamento**: Cancelamento automático
- **Erro de API**: Logs detalhados + retry automático

## Segurança

- Row Level Security (RLS) habilitado no Supabase
- Validação de dados em múltiplas camadas
- Logs detalhados para auditoria
- Tratamento seguro de erros

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.# rechargehaiti
# tophaiti
# tophaiti
# tophaiti
# tophaiti
# rechargehaiti
# rechargehaiti