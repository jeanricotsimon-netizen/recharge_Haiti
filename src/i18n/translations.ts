export type Language = 'pt' | 'en' | 'es' | 'fr' | 'ht';

export interface Translations {
  home: {
    title: string;
    subtitle: string;
    brazilPayment: string;
    brazilMethod: string;
    otherCountries: string;
    otherMethod: string;
    startRecharge: string;
    viewHistory: string;
    supportedOperators: string;
    haitiOperators: string;
    drOperators: string;
    autoRefund: string;
    autoRefundDesc: string;
  };
  recharge: {
    originCountry: string;
    brazil: string;
    currency: string;
    method: string;
    pixInstant: string;
    pixBenefit: string;
    otherCountries: string;
    allCurrencies: string;
    paypalMethod: string;
    paypalBenefit: string;
    nextStep: string;
    destinationCountry: string;
    selectCountry: string;
    haiti: string;
    dominicanRepublic: string;
    phoneNumber: string;
    phonePlaceholder: string;
    selectOperator: string;
    selectAmount: string;
    paymentMethod: string;
    backToHome: string;
    amountTitle: string;
    currencyInfo: string;
    predefinedValues: string;
    customValue: string;
    useCustom: string;
    usePredefined: string;
    enterCustom: string;
    validValue: string;
    invalidValue: string;
    limitsLabel: string;
    rechargeValue: string;
    totalToPay: string;
    selectValuePrompt: string;
  };
  history: {
    title: string;
    noTransactions: string;
    status: {
      pending: string;
      processing: string;
      completed: string;
      failed: string;
      refunded: string;
    };
  };
  common: {
    loading: string;
    error: string;
    success: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    home: {
      title: 'Recharge Haiti',
      subtitle: 'Envie recargas internacionais de qualquer país',
      brazilPayment: 'Brasil',
      brazilMethod: 'Pague com PIX',
      otherCountries: 'Outros Países',
      otherMethod: 'Pague com PayPal',
      startRecharge: 'Fazer Recarga',
      viewHistory: 'Ver Histórico',
      supportedOperators: 'Operadoras Suportadas',
      haitiOperators: 'Haiti: Digicel, Natcom',
      drOperators: 'República Dominicana: Claro, Orange, Viva',
      autoRefund: 'Reembolso Automático',
      autoRefundDesc: 'Se a recarga falhar, devolvemos seu dinheiro automaticamente',
    },
    recharge: {
      originCountry: 'País de origem do pagamento',
      brazil: 'Brasil',
      currency: 'Moeda: BRL (Real Brasileiro)',
      method: 'Método',
      pixInstant: 'PIX (Instantâneo)',
      pixBenefit: 'Pagamento instantâneo e sem taxas bancárias',
      otherCountries: 'Outros Países',
      allCurrencies: 'Todas as moedas aceitas',
      paypalMethod: 'PayPal (Cartão/Saldo)',
      paypalBenefit: 'Pagamento seguro internacional',
      nextStep: 'Próximo passo: Escolha o país de destino da recarga',
      destinationCountry: 'País de destino da recarga',
      selectCountry: 'Selecione o país',
      haiti: 'Haiti',
      dominicanRepublic: 'República Dominicana',
      phoneNumber: 'Número de telefone',
      phonePlaceholder: 'Digite o número',
      selectOperator: 'Selecione a operadora',
      selectAmount: 'Selecione o valor',
      paymentMethod: 'Método de pagamento',
      backToHome: 'Voltar',
      amountTitle: 'Valor da recarga',
      currencyInfo: 'Valores em',
      predefinedValues: 'Valores pré-definidos',
      customValue: 'Valor personalizado',
      useCustom: 'Inserir valor personalizado',
      usePredefined: 'Usar valores pré-definidos',
      enterCustom: 'Digite um valor personalizado',
      validValue: 'Valor válido',
      invalidValue: 'Valor fora dos limites da operadora',
      limitsLabel: 'Limites',
      rechargeValue: 'Valor da recarga',
      totalToPay: 'Total a pagar',
      selectValuePrompt: 'Selecione um valor para continuar',
    },
    history: {
      title: 'Histórico de Transações',
      noTransactions: 'Nenhuma transação encontrada',
      status: {
        pending: 'Pendente',
        processing: 'Processando',
        completed: 'Concluída',
        failed: 'Falhou',
        refunded: 'Reembolsado',
      },
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
  },
  en: {
    home: {
      title: 'Recharge Haiti',
      subtitle: 'Send international recharges from any country',
      brazilPayment: 'Brazil',
      brazilMethod: 'Pay with PIX',
      otherCountries: 'Other Countries',
      otherMethod: 'Pay with PayPal',
      startRecharge: 'Start Recharge',
      viewHistory: 'View History',
      supportedOperators: 'Supported Operators',
      haitiOperators: 'Haiti: Digicel, Natcom',
      drOperators: 'Dominican Republic: Claro, Orange, Viva',
      autoRefund: 'Automatic Refund',
      autoRefundDesc: 'If the recharge fails, we automatically refund your money',
    },
    recharge: {
      originCountry: 'Payment origin country',
      brazil: 'Brazil',
      currency: 'Currency: BRL (Brazilian Real)',
      method: 'Method',
      pixInstant: 'PIX (Instant)',
      pixBenefit: 'Instant payment with no bank fees',
      otherCountries: 'Other Countries',
      allCurrencies: 'All currencies accepted',
      paypalMethod: 'PayPal (Card/Balance)',
      paypalBenefit: 'Secure international payment',
      nextStep: 'Next step: Choose the destination country',
      destinationCountry: 'Recharge destination country',
      selectCountry: 'Select country',
      haiti: 'Haiti',
      dominicanRepublic: 'Dominican Republic',
      phoneNumber: 'Phone number',
      phonePlaceholder: 'Enter number',
      selectOperator: 'Select operator',
      selectAmount: 'Select amount',
      paymentMethod: 'Payment method',
      backToHome: 'Back',
      amountTitle: 'Recharge amount',
      currencyInfo: 'Values in',
      predefinedValues: 'Predefined values',
      customValue: 'Custom value',
      useCustom: 'Enter custom value',
      usePredefined: 'Use predefined values',
      enterCustom: 'Enter a custom value',
      validValue: 'Valid value',
      invalidValue: 'Value outside operator limits',
      limitsLabel: 'Limits',
      rechargeValue: 'Recharge value',
      totalToPay: 'Total to pay',
      selectValuePrompt: 'Select a value to continue',
    },
    history: {
      title: 'Transaction History',
      noTransactions: 'No transactions found',
      status: {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
        refunded: 'Refunded',
      },
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },
  es: {
    home: {
      title: 'Recharge Haiti',
      subtitle: 'Envía recargas internacionales desde cualquier país',
      brazilPayment: 'Brasil',
      brazilMethod: 'Paga con PIX',
      otherCountries: 'Otros Países',
      otherMethod: 'Paga con PayPal',
      startRecharge: 'Hacer Recarga',
      viewHistory: 'Ver Historial',
      supportedOperators: 'Operadoras Soportadas',
      haitiOperators: 'Haití: Digicel, Natcom',
      drOperators: 'República Dominicana: Claro, Orange, Viva',
      autoRefund: 'Reembolso Automático',
      autoRefundDesc: 'Si la recarga falla, devolvemos tu dinero automáticamente',
    },
    recharge: {
      originCountry: 'País de origen del pago',
      brazil: 'Brasil',
      currency: 'Moneda: BRL (Real Brasileño)',
      method: 'Método',
      pixInstant: 'PIX (Instantáneo)',
      pixBenefit: 'Pago instantáneo sin comisiones bancarias',
      otherCountries: 'Otros Países',
      allCurrencies: 'Todas las monedas aceptadas',
      paypalMethod: 'PayPal (Tarjeta/Saldo)',
      paypalBenefit: 'Pago internacional seguro',
      nextStep: 'Siguiente paso: Elige el país de destino',
      destinationCountry: 'País de destino de la recarga',
      selectCountry: 'Seleccionar país',
      haiti: 'Haití',
      dominicanRepublic: 'República Dominicana',
      phoneNumber: 'Número de teléfono',
      phonePlaceholder: 'Ingrese el número',
      selectOperator: 'Seleccionar operadora',
      selectAmount: 'Seleccionar monto',
      paymentMethod: 'Método de pago',
      backToHome: 'Volver',
      amountTitle: 'Valor de la recarga',
      currencyInfo: 'Valores en',
      predefinedValues: 'Valores predefinidos',
      customValue: 'Valor personalizado',
      useCustom: 'Ingresar valor personalizado',
      usePredefined: 'Usar valores predefinidos',
      enterCustom: 'Ingrese un valor personalizado',
      validValue: 'Valor válido',
      invalidValue: 'Valor fuera de los límites del operador',
      limitsLabel: 'Límites',
      rechargeValue: 'Valor de la recarga',
      totalToPay: 'Total a pagar',
      selectValuePrompt: 'Seleccione un valor para continuar',
    },
    history: {
      title: 'Historial de Transacciones',
      noTransactions: 'No se encontraron transacciones',
      status: {
        pending: 'Pendiente',
        processing: 'Procesando',
        completed: 'Completada',
        failed: 'Falló',
        refunded: 'Reembolsado',
      },
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
  },
  fr: {
    home: {
      title: 'Recharge Haiti',
      subtitle: 'Envoyez des recharges internationales depuis n\'importe quel pays',
      brazilPayment: 'Brésil',
      brazilMethod: 'Payez avec PIX',
      otherCountries: 'Autres Pays',
      otherMethod: 'Payez avec PayPal',
      startRecharge: 'Faire une Recharge',
      viewHistory: 'Voir l\'Historique',
      supportedOperators: 'Opérateurs Supportés',
      haitiOperators: 'Haïti: Digicel, Natcom',
      drOperators: 'République Dominicaine: Claro, Orange, Viva',
      autoRefund: 'Remboursement Automatique',
      autoRefundDesc: 'Si la recharge échoue, nous remboursons votre argent automatiquement',
    },
    recharge: {
      originCountry: 'Pays d\'origine du paiement',
      brazil: 'Brésil',
      currency: 'Devise: BRL (Real Brésilien)',
      method: 'Méthode',
      pixInstant: 'PIX (Instantané)',
      pixBenefit: 'Paiement instantané sans frais bancaires',
      otherCountries: 'Autres Pays',
      allCurrencies: 'Toutes les devises acceptées',
      paypalMethod: 'PayPal (Carte/Solde)',
      paypalBenefit: 'Paiement international sécurisé',
      nextStep: 'Prochaine étape: Choisissez le pays de destination',
      destinationCountry: 'Pays de destination de la recharge',
      selectCountry: 'Sélectionner le pays',
      haiti: 'Haïti',
      dominicanRepublic: 'République Dominicaine',
      phoneNumber: 'Numéro de téléphone',
      phonePlaceholder: 'Entrez le numéro',
      selectOperator: 'Sélectionner l\'opérateur',
      selectAmount: 'Sélectionner le montant',
      paymentMethod: 'Méthode de paiement',
      backToHome: 'Retour',
      amountTitle: 'Montant de la recharge',
      currencyInfo: 'Valeurs en',
      predefinedValues: 'Valeurs prédéfinies',
      customValue: 'Valeur personnalisée',
      useCustom: 'Entrer une valeur personnalisée',
      usePredefined: 'Utiliser les valeurs prédéfinies',
      enterCustom: 'Entrez une valeur personnalisée',
      validValue: 'Valeur valide',
      invalidValue: 'Valeur hors des limites de l\'opérateur',
      limitsLabel: 'Limites',
      rechargeValue: 'Montant de la recharge',
      totalToPay: 'Total à payer',
      selectValuePrompt: 'Sélectionnez une valeur pour continuer',
    },
    history: {
      title: 'Historique des Transactions',
      noTransactions: 'Aucune transaction trouvée',
      status: {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Terminée',
        failed: 'Échouée',
        refunded: 'Remboursée',
      },
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
  },
  ht: {
    home: {
      title: 'Recharge Haiti',
      subtitle: 'Voye rekaj entènasyonal depi nenpòt peyi',
      brazilPayment: 'Brazil',
      brazilMethod: 'Peye avèk PIX',
      otherCountries: 'Lòt Peyi',
      otherMethod: 'Peye avèk PayPal',
      startRecharge: 'Kòmanse Rekaj',
      viewHistory: 'Gade Istorik',
      supportedOperators: 'Operatè ki Sipòte',
      haitiOperators: 'Ayiti: Digicel, Natcom',
      drOperators: 'Repiblik Dominikèn: Claro, Orange, Viva',
      autoRefund: 'Ranbousman Otomatik',
      autoRefundDesc: 'Si rekaj la echwe, nou ranbouse lajan ou otomatikman',
    },
    recharge: {
      originCountry: 'Peyi orijin pèman an',
      brazil: 'Brazil',
      currency: 'Lajan: BRL (Real Brezilyen)',
      method: 'Metòd',
      pixInstant: 'PIX (Rapid)',
      pixBenefit: 'Pèman rapid san frè bank',
      otherCountries: 'Lòt Peyi',
      allCurrencies: 'Tout lajan aksepte',
      paypalMethod: 'PayPal (Kat/Balans)',
      paypalBenefit: 'Pèman entènasyonal an sekirite',
      nextStep: 'Pwochen etap: Chwazi peyi destinasyon',
      destinationCountry: 'Peyi destinasyon rekaj la',
      selectCountry: 'Chwazi peyi',
      haiti: 'Ayiti',
      dominicanRepublic: 'Repiblik Dominikèn',
      phoneNumber: 'Nimewo telefòn',
      phonePlaceholder: 'Antre nimewo a',
      selectOperator: 'Chwazi operatè',
      selectAmount: 'Chwazi montan',
      paymentMethod: 'Metòd pèman',
      backToHome: 'Tounen',
      amountTitle: 'Valè rekaj la',
      currencyInfo: 'Valè yo an',
      predefinedValues: 'Valè pre-defini',
      customValue: 'Valè pèsonalize',
      useCustom: 'Mete valè pèsonalize',
      usePredefined: 'Sèvi ak valè pre-defini',
      enterCustom: 'Antre yon valè pèsonalize',
      validValue: 'Valè valab',
      invalidValue: 'Valè andeyò limit operatè a',
      limitsLabel: 'Limit',
      rechargeValue: 'Valè rekaj la',
      totalToPay: 'Total pou peye',
      selectValuePrompt: 'Chwazi yon valè pou kontinye',
    },
    history: {
      title: 'Istorik Tranzaksyon',
      noTransactions: 'Pa gen tranzaksyon',
      status: {
        pending: 'An atant',
        processing: 'Ap trete',
        completed: 'Konplete',
        failed: 'Echwe',
        refunded: 'Ranbouse',
      },
    },
    common: {
      loading: 'Ap chaje...',
      error: 'Erè',
      success: 'Siksè',
    },
  },
};
