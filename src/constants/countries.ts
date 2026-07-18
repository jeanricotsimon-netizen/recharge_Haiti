import { Country } from '../types';

export const COUNTRIES: Country[] = [
  {
    code: 'BR',
    name: 'Brasil',
    currency: 'BRL',
    flag: '🇧🇷',
    paymentMethods: ['PIX']
  },
  {
    code: 'DO',
    name: 'República Dominicana',
    currency: 'BRL',
    flag: '🇩🇴',
    paymentMethods: ['PIX']
  }
];

export const HAITI_OPERATORS = [
  {
    id: 'HT_D7_TopUp',
    name: 'Digicel Haiti',
    logoUrl: 'https://imagerepo.ding.com/logo/D7/HT.png',
    country: 'HT',
    providerCode: 'D7HT',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [15, 20, 25, 30, 50, 75, 100, 150, 200, 250, 300, 400, 500, 666],
    prefixes: ['30', '31', '34', '36', '37', '38', '39', '44' , '46', '47', '48', '28', '49'],
    minAmountBRL: 10.00,
    maxAmountBRL: 666.00,
    commission: 12,
    validationRegex: '^509([0-9]{8})$',
    uatNumber: '50900000000',
  },
  {
    id: 'HT_NM_TopUp',
    name: 'Natcom Haiti',
    logoUrl: 'https://imagerepo.ding.com/logo/NM/HT.png',
    country: 'HT',
    providerCode: 'NMHT',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [15, 20, 25, 30, 50, 75, 100, 150, 200, 250, 300, 400, 450, 750],
    prefixes: ['32', '33',"35", '40', '41', '42', '43', '22', '25', '55', '56'],
    minAmountBRL: 10.00,
    maxAmountBRL: 750.00,
    commission: 12,
    validationRegex: '^509([0-9]{8})$',
    customerCareNumber: '+50922228888',
    uatNumber: '50900000000',
  }
];

export const DOMINICAN_OPERATORS = [
  {
    id: 'DO_CL_TopUp',
    name: 'Claro',
    logoUrl: 'https://imagerepo.ding.com/logo/CL/DO.png',
    country: 'DO',
    providerCode: 'CLDO',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [15, 20, 25, 30, 50, 75, 100, 150, 200, 236, 393],
    prefixes: ['1809', '1829', '1849', '1888', '1800'],
    minAmountBRL: 10.00,
    maxAmountBRL: 393.00,
    commission: 12,
    validationRegex: '^1(8(?:09|29|49|88|00)[0-9]{7})$',
    customerCareNumber: '+1 809 220 11111',
    uatNumber: '18090000000'
  },
  {
    id: 'DO_OR_TopUp',
    name: 'Orange (Altice)',
    logoUrl: 'https://imagerepo.ding.com/logo/OR/DO.png',
    country: 'DO',
    providerCode: 'ORDO',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [15, 20, 25, 30, 50, 75, 100, 150, 200, 333],
    prefixes: ['1809', '1829', '1849', '1888', '1800'],
    minAmountBRL: 10.00,
    maxAmountBRL: 333.00,
    commission: 12,
    validationRegex: '^18(?:09|29|49|88|00)[0-9]{7}$',
    customerCareNumber: '+1 (809) 859-6555',
    uatNumber: '18000000000'
  },
  {
    id: 'DO_VV_TopUp',
    name: 'Viva',
    logoUrl: 'https://imagerepo.ding.com/logo/VV/DO.png',
    country: 'DO',
    providerCode: 'VVDO',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [15, 20, 25, 30, 50, 75, 100, 150, 200, 333],
    prefixes: ['1809', '1829', '1849', '1888'],
    minAmountBRL: 10.00,
    maxAmountBRL: 333.00,
    commission: 12,
    validationRegex: '^1(8(?:09|29|49|88)[0-9]{7})$',
    customerCareNumber: '+ 1 809 503 75 00',
    uatNumber: '18090000000'
  }
];

export const BRAZIL_OPERATORS = [
  {
    id: 'BR_CL_TopUp',
    name: 'Claro Brazil',
    logoUrl: 'https://imagerepo.ding.com/logo/CL/BR.png',
    country: 'BR',
    providerCode: 'CLBR',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [20, 30, 40, 50, 100],
    prefixes: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
    minAmountBRL: 20.90,
    maxAmountBRL: 104.20,
    commission: 4,
    validationRegex: '^(55[0-9]{2})?9?[0-9]{8}$',
    uatNumber: '5511999999999',
    products: [
      { skuCode: 'BR_CL_TopUp_20.00', sendAmount: 20.90, receiveAmount: 20.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_CL_TopUp_30.00', sendAmount: 31.30, receiveAmount: 30.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'CLBRBR56359',       sendAmount: 41.70, receiveAmount: 40.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_CL_TopUp_50.00', sendAmount: 52.10, receiveAmount: 50.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_CL_TopUp_100.00',sendAmount: 104.20,receiveAmount: 100.00,receiveCurrencyIso: 'BRL', productType: 'Recarga' as const }
    ]
  },
  {
    id: 'BR_IM_TopUp',
    name: 'Tim Brazil',
    logoUrl: 'https://imagerepo.ding.com/logo/IM/BR.png',
    country: 'BR',
    providerCode: 'IMBR',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [20, 30, 40, 50, 100],
    prefixes: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
    minAmountBRL: 20.90,
    maxAmountBRL: 104.30,
    commission: 4,
    validationRegex: '^(55[0-9]{2})?9?[0-9]{8}$',
    uatNumber: '5511999999999',
    products: [
      { skuCode: 'BR_IM_TopUp_20.00', sendAmount: 20.90, receiveAmount: 20.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_IM_TopUp_30.00', sendAmount: 31.30, receiveAmount: 30.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_IM_TopUp_40.00', sendAmount: 41.70, receiveAmount: 40.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_IM_TopUp_50.00', sendAmount: 52.20, receiveAmount: 50.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_IM_TopUp_100.00',sendAmount: 104.30,receiveAmount: 100.00,receiveCurrencyIso: 'BRL', productType: 'Recarga' as const }
    ]
  },
  {
    id: 'BR_VO_TopUp',
    name: 'Vivo Brazil',
    logoUrl: 'https://imagerepo.ding.com/logo/VO/BR.png',
    country: 'BR',
    providerCode: 'VOBR',
    fxRate: 1,
    currencyCode: 'BRL',
    denominations: [15, 17, 20, 25, 30, 35, 40, 50, 100, 200, 300],
    prefixes: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
    minAmountBRL: 18.70,
    maxAmountBRL: 372.50,
    commission: 4,
    validationRegex: '^(55[0-9]{2})?9?[0-9]{8}$',
    uatNumber: '5511999999999',
    products: [
      { skuCode: 'BR_VO_TopUp_15.00', sendAmount: 18.70, receiveAmount: 15.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'VOBR98982',         sendAmount: 21.20, receiveAmount: 17.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_VO_TopUp_20.00', sendAmount: 24.90, receiveAmount: 20.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_VO_TopUp_25.00', sendAmount: 31.10, receiveAmount: 25.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'VOBR71581',         sendAmount: 37.30, receiveAmount: 30.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_VO_TopUp_35.00', sendAmount: 43.50, receiveAmount: 35.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_VO_TopUp_40.00', sendAmount: 49.70, receiveAmount: 40.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_VO_TopUp_50.00', sendAmount: 62.10, receiveAmount: 50.00, receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'BR_VO_TopUp_100.00',sendAmount: 124.20,receiveAmount: 100.00,receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'VOBR88371',         sendAmount: 248.40,receiveAmount: 200.00,receiveCurrencyIso: 'BRL', productType: 'Recarga' as const },
      { skuCode: 'VOBR17740',         sendAmount: 372.50,receiveAmount: 300.00,receiveCurrencyIso: 'BRL', productType: 'Recarga' as const }
    ]
  }
];

// Combine all operators
export const ALL_OPERATORS = [...HAITI_OPERATORS, ...DOMINICAN_OPERATORS, ...BRAZIL_OPERATORS];
export const CURRENCY_SYMBOLS = {
  'BRL': 'R$',
  'CLP': 'CLP$',
  'EUR': '€',
  'MXN': 'MX$',
  'CAD': 'C$',
  'USD': '$',
  'ARS': 'AR$',
  'COP': 'CO$',
  'PEN': 'S/',
  'UYU': 'UY$',
  'PYG': '₲',
  'BOB': 'Bs',
  'VES': 'Bs.S',
  'GTQ': 'Q',
  'CRC': '₡',
  'PAB': 'B/.',
  'NIO': 'C$',
  'HNL': 'L',
  'BZD': 'BZ$',
  'CUP': '₱',
  'DOP': 'RD$',
  'JMD': 'J$',
  'TTD': 'TT$',
  'BBD': 'Bds$',
  'BSD': 'B$',
  'GBP': '£',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'AUD': 'A$',
  'NZD': 'NZ$',
  'JPY': '¥',
  'KRW': '₩',
  'SGD': 'S$',
  'HKD': 'HK$',
  'MYR': 'RM',
  'THB': '฿',
  'PHP': '₱',
  'IDR': 'Rp',
  'VND': '₫',
  'INR': '₹',
  'CNY': '¥',
  'RUB': '₽',
  'TRY': '₺',
  'ZAR': 'R',
  'NGN': '₦',
  'KES': 'KSh',
  'GHS': '₵',
  'EGP': '£',
  'MAD': 'د.م.',
  'DZD': 'د.ج',
  'TND': 'د.ت',
  'ILS': '₪',
  'AED': 'د.إ',
  'SAR': '﷼'
};

// Taxas de câmbio aproximadas (USD para moeda local)
export const EXCHANGE_RATES = {
  'BRL': 5.20,    // 1 USD = 5.20 BRL
  'CLP': 950,     // 1 USD = 950 CLP
  'EUR': 0.92,    // 1 USD = 0.92 EUR
  'MXN': 17.50,   // 1 USD = 17.50 MXN
  'CAD': 1.35,    // 1 USD = 1.35 CAD
  'USD': 1.00,    // 1 USD = 1.00 USD
  'ARS': 350,     // 1 USD = 350 ARS
  'COP': 4200,    // 1 USD = 4200 COP
  'PEN': 3.75,    // 1 USD = 3.75 PEN
  'UYU': 39,      // 1 USD = 39 UYU
  'PYG': 7300,    // 1 USD = 7300 PYG
  'BOB': 6.90,    // 1 USD = 6.90 BOB
  'VES': 36,      // 1 USD = 36 VES
  'GTQ': 7.80,    // 1 USD = 7.80 GTQ
  'CRC': 520,     // 1 USD = 520 CRC
  'PAB': 1.00,    // 1 USD = 1.00 PAB
  'NIO': 36.50,   // 1 USD = 36.50 NIO
  'HNL': 24.70,   // 1 USD = 24.70 HNL
  'BZD': 2.00,    // 1 USD = 2.00 BZD
  'CUP': 24,      // 1 USD = 24 CUP
  'DOP': 56,      // 1 USD = 56 DOP
  'JMD': 155,     // 1 USD = 155 JMD
  'TTD': 6.75,    // 1 USD = 6.75 TTD
  'BBD': 2.00,    // 1 USD = 2.00 BBD
  'BSD': 1.00,    // 1 USD = 1.00 BSD
  'GBP': 0.79,    // 1 USD = 0.79 GBP
  'CHF': 0.88,    // 1 USD = 0.88 CHF
  'SEK': 10.80,   // 1 USD = 10.80 SEK
  'NOK': 10.90,   // 1 USD = 10.90 NOK
  'DKK': 6.85,    // 1 USD = 6.85 DKK
  'AUD': 1.52,    // 1 USD = 1.52 AUD
  'NZD': 1.65,    // 1 USD = 1.65 NZD
  'JPY': 150,     // 1 USD = 150 JPY
  'KRW': 1320,    // 1 USD = 1320 KRW
  'SGD': 1.35,    // 1 USD = 1.35 SGD
  'HKD': 7.80,    // 1 USD = 7.80 HKD
  'MYR': 4.70,    // 1 USD = 4.70 MYR
  'THB': 36,      // 1 USD = 36 THB
  'PHP': 56,      // 1 USD = 56 PHP
  'IDR': 15800,   // 1 USD = 15800 IDR
  'VND': 24500,   // 1 USD = 24500 VND
  'INR': 83,      // 1 USD = 83 INR
  'CNY': 7.25,    // 1 USD = 7.25 CNY
  'RUB': 92,      // 1 USD = 92 RUB
  'TRY': 29,      // 1 USD = 29 TRY
  'ZAR': 18.50,   // 1 USD = 18.50 ZAR
  'NGN': 780,     // 1 USD = 780 NGN
  'KES': 150,     // 1 USD = 150 KES
  'GHS': 12,      // 1 USD = 12 GHS
  'EGP': 31,      // 1 USD = 31 EGP
  'MAD': 10.20,   // 1 USD = 10.20 MAD
  'DZD': 135,     // 1 USD = 135 DZD
  'TND': 3.10,    // 1 USD = 3.10 TND
  'ILS': 3.70,    // 1 USD = 3.70 ILS
  'AED': 3.67,    // 1 USD = 3.67 AED
  'SAR': 3.75     // 1 USD = 3.75 SAR
};

// Valores de recarga base em USD
const BASE_RECHARGE_VALUES_USD = [1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];

// Função para converter USD para moeda local e arredondar para valores amigáveis
export const getRechargeValuesForCurrency = (currency: string): number[] => {
  // Valores específicos para o Brasil em BRL
  if (currency === 'BRL') {
    return [10, 15, 20, 25, 30, 35, 40, 50, 100];
  }
  
  const exchangeRate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
  
  return BASE_RECHARGE_VALUES_USD.map(usdValue => {
    const localValue = usdValue * exchangeRate;
    
    // Arredondamento inteligente baseado na moeda
    if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR' || currency === 'VND' || 
        currency === 'CLP' || currency === 'PYG' || currency === 'COP' || currency === 'NGN') {
      // Moedas sem decimais - arredondar para centenas ou milhares
      if (localValue >= 10000) {
        return Math.round(localValue / 1000) * 1000;
      } else if (localValue >= 1000) {
        return Math.round(localValue / 100) * 100;
      } else {
        return Math.round(localValue / 10) * 10;
      }
    } else if (currency === 'EUR' || currency === 'GBP' || currency === 'CHF') {
      // Moedas fortes - manter precisão decimal
      return Math.round(localValue * 2) / 2; // Arredondar para 0.50
    } else {
      // Outras moedas - arredondar para inteiros ou 0.50
      if (localValue >= 100) {
        return Math.round(localValue);
      } else {
        return Math.round(localValue * 2) / 2;
      }
    }
  });
};

// Taxa de lucro ajustável por moeda (valor fixo de 2.00 na moeda local)
export const PROFIT_MARGIN_FEE = {
  'BRL': 0.20,  // 20% de lucro
  'CLP': 10.50,  // CLP$ 2,50
  'EUR': 2.50,  // € 2,50
  'MXN': 2.50,  // MX$ 2,50
  'CAD': 2.50,  // C$ 2,50
  'USD': 2.50,  // $ 2,50
  'ARS': 2.50,  // AR$ 2,50
  'COP': 2.50,  // CO$ 2,50
  'PEN': 2.50,  // S/ 2,50
  'UYU': 2.50,  // UY$ 2,50
  'PYG': 2.50,  // ₲ 2,50
  'BOB': 2.50,  // Bs 2,50
  'VES': 2.50,  // Bs.S 2,50
  'GTQ': 2.50,  // Q 2,50
  'CRC': 2.50,  // ₡ 2,50
  'PAB': 2.50,  // B/. 2,50
  'NIO': 2.50,  // C$ 2,50
  'HNL': 2.50,  // L 2,50
  'BZD': 2.50,  // BZ$ 2,50
  'CUP': 2.50,  // ₱ 2,50
  'DOP': 2.50,  // RD$ 2,50
  'JMD': 2.50,  // J$ 2,50
  'TTD': 2.50,  // TT$ 2,50
  'BBD': 2.50,  // Bds$ 2,50
  'BSD': 2.50,  // B$ 2,50
  'GBP': 2.50,  // £ 2,50
  'CHF': 2.50,  // CHF 2,50
  'SEK': 2.50,  // kr 2,50
  'NOK': 2.50,  // kr 2,50
  'DKK': 2.50,  // kr 2,50
  'AUD': 2.50,  // A$ 2,50
  'NZD': 2.50,  // NZ$ 2,50
  'JPY': 2.50,  // ¥ 2,50
  'KRW': 2.50,  // ₩ 2,50
  'SGD': 2.50,  // S$ 2,50
  'HKD': 2.50,  // HK$ 2,50
  'MYR': 2.50,  // RM 2,50
  'THB': 2.50,  // ฿ 2,50
  'PHP': 2.50,  // ₱ 2,50
  'IDR': 2.50,  // Rp 2,50
  'VND': 2.50,  // ₫ 2,50
  'INR': 2.50,  // ₹ 2,50
  'CNY': 2.50,  // ¥ 2,50
  'RUB': 2.50,  // ₽ 2,50
  'TRY': 2.50,  // ₺ 2,50
  'ZAR': 2.50,  // R 2,50
  'NGN': 2.50,  // ₦ 2,50
  'KES': 2.50,  // KSh 2,50
  'GHS': 2.50,  // ₵ 2,50
  'EGP': 2.50,  // £ 2,50
  'MAD': 2.50,  // د.م. 2,50
  'DZD': 2.50,  // د.ج 2,50
  'TND': 2.50,  // د.ت 2,50
  'ILS': 2.50,  // ₪ 2,50
  'AED': 2.50,  // د.إ 2,50
  'SAR': 2.50   // ﷼ 2,50
};

// Função para obter a taxa de lucro por moeda (transparente ao cliente)
export const getProfitMarginFee = (currency: string, amount: number = 0): number => {
  if (currency === 'BRL') {
    return Math.round(amount * 0.20 * 100) / 100;
  }
  return PROFIT_MARGIN_FEE[currency as keyof typeof PROFIT_MARGIN_FEE] || 2.50;
};

export const getDingConnectAmount = (currency: string, customerPaidAmount: number): number => {
  if (currency === 'BRL') {
    return Math.round(customerPaidAmount * 0.80 * 100) / 100;
  }
  return customerPaidAmount;
};

// Helper function to get currency for a country
export const getCurrencyForCountry = (countryCode: string): string => {
  const currencyMap: { [key: string]: string } = {
    'BR': 'BRL',
    'CL': 'CLP',
    'FR': 'EUR',
    'MX': 'MXN',
    'CA': 'CAD',
    'US': 'USD',
    'AR': 'ARS',
    'CO': 'COP',
    'PE': 'PEN',
    'EC': 'USD',
    'UY': 'UYU',
    'PY': 'PYG',
    'BO': 'BOB',
    'VE': 'VES',
    'GT': 'GTQ',
    'CR': 'CRC',
    'PA': 'PAB',
    'NI': 'NIO',
    'HN': 'HNL',
    'SV': 'USD',
    'BZ': 'BZD',
    'CU': 'CUP',
    'DO': 'BRL',
    'JM': 'JMD',
    'TT': 'TTD',
    'BB': 'BBD',
    'BS': 'BSD',
    'GB': 'GBP',
    'DE': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'PT': 'EUR',
    'NL': 'EUR',
    'BE': 'EUR',
    'CH': 'CHF',
    'AT': 'EUR',
    'SE': 'SEK',
    'NO': 'NOK',
    'DK': 'DKK',
    'FI': 'EUR',
    'AU': 'AUD',
    'NZ': 'NZD',
    'JP': 'JPY',
    'KR': 'KRW',
    'SG': 'SGD',
    'HK': 'HKD',
    'MY': 'MYR',
    'TH': 'THB',
    'PH': 'PHP',
    'ID': 'IDR',
    'VN': 'VND',
    'IN': 'INR',
    'CN': 'CNY',
    'RU': 'RUB',
    'TR': 'TRY',
    'ZA': 'ZAR',
    'NG': 'NGN',
    'KE': 'KES',
    'GH': 'GHS',
    'EG': 'EGP',
    'MA': 'MAD',
    'DZ': 'DZD',
    'TN': 'TND',
    'IL': 'ILS',
    'AE': 'AED',
    'SA': 'SAR'
  };
  return currencyMap[countryCode] || 'USD';
};