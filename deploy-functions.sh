#!/bin/bash

# Script de deploy das Edge Functions
# Execute este script para fazer deploy das funções atualizadas

echo "🚀 Iniciando deploy das Edge Functions..."

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI não encontrado"
    echo "📦 Instale com: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"

# Verificar se está logado
echo "🔐 Verificando login..."
supabase projects list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Você não está logado no Supabase"
    echo "🔑 Execute: supabase login"
    exit 1
fi

echo "✅ Login verificado"

# Link do projeto (se necessário)
echo "🔗 Verificando link do projeto..."
supabase link --project-ref ptdffidlieebxxnznezy 2>/dev/null || echo "Projeto já linkado"

# Deploy das funções
echo ""
echo "📤 Fazendo deploy de dingconnect-recharge..."
supabase functions deploy dingconnect-recharge

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer deploy de dingconnect-recharge"
    exit 1
fi

echo ""
echo "📤 Fazendo deploy de dingconnect-operators..."
supabase functions deploy dingconnect-operators

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer deploy de dingconnect-operators"
    exit 1
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🧪 Próximos passos:"
echo "1. Abra a aplicação"
echo "2. Tente fazer uma recarga"
echo "3. Verifique os logs no Supabase Dashboard"
echo ""
echo "📊 Ver logs: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/logs/edge-functions"
