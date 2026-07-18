import { HAITI_OPERATORS, DOMINICAN_OPERATORS, BRAZIL_OPERATORS, ALL_OPERATORS } from '../constants/countries';

export const HAITI_OPERATOR_PREFIXES = {
  DIGICEL: ['30', '31', '34', '36', '37', '38', '39', '44', '46', '47', '48', '28', '49'],
  NATCOM: ['32', '33',"35", '40', '41', '42', '43', '22', '25', '55', '56']
};

export const DOMINICAN_OPERATOR_PREFIXES = {
  // República Dominicana usa códigos de área 809, 829, 849
  // Números têm 10 dígitos: XXX-XXX-XXXX
  ALTICE: ['809', '829', '849'],
  VIVA: ['809', '829', '849'],
  CLARO: ['809', '829', '849']
};

// Prefixos de operadoras brasileiras (códigos regionais não identificam a operadora)
// No Brasil, todas as operadoras usam os mesmos códigos de área (DDD)
// A detecção automática não é possível pelo prefixo - usuário deve escolher manualmente
export const BRAZIL_AREA_CODES = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99'
];

export const detectOperatorFromPhone = (phoneNumber: string): string | null => {
  // Remove espaços, hífens e outros caracteres não numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Verifica se o número tem pelo menos 8 dígitos (Haiti) ou 10 dígitos (Rep. Dom.)
  if (cleanNumber.length < 8) {
    return null;
  }

  // Detectar país baseado no comprimento e formato
  if (cleanNumber.length === 8) {
    // Haiti - 8 dígitos
    const prefix = cleanNumber.substring(0, 2);

    console.log('Detectando operadora Haiti para número:', phoneNumber);
    console.log('Número limpo:', cleanNumber);
    console.log('Prefixo extraído:', prefix);

    // Verifica se é Digicel
    if (HAITI_OPERATOR_PREFIXES.DIGICEL.includes(prefix)) {
      console.log('✅ Detectado como Digicel (prefixo:', prefix, ')');
      return 'HT_D7_TopUp'; // DingConnect SKU da Digicel Haiti BRL
    }

    // Verifica se é Natcom
    if (HAITI_OPERATOR_PREFIXES.NATCOM.includes(prefix)) {
      console.log('✅ Detectado como Natcom (prefixo:', prefix, ')');
      return 'HT_NM_TopUp'; // DingConnect SKU da Natcom Haiti
    }
  } else if (cleanNumber.length === 10) {
    // Pode ser República Dominicana (XXX-XXX-XXXX) ou Brasil (DDD + 8 dígitos)
    const prefix3 = cleanNumber.substring(0, 3); // 809, 829, 849
    const prefix2 = cleanNumber.substring(0, 2); // DDD Brasil

    // Verificar se é República Dominicana
    const validDominicanAreaCodes = ['809', '829', '849'];
    if (validDominicanAreaCodes.includes(prefix3)) {
      console.log('Detectando operadora Rep. Dom. para número:', phoneNumber);
      console.log('Número limpo:', cleanNumber);
      console.log('Prefixo (3 dígitos) extraído:', prefix3);

      // Para República Dominicana, não conseguimos detectar a operadora apenas pelo prefixo
      // pois todas as operadoras usam os mesmos códigos de área (809, 829, 849)
      console.log('⚠️ Rep. Dom.: Prefixo válido mas operadora não pode ser detectada automaticamente');
      return null;
    }

    // Verificar se é Brasil (DDD + 8 dígitos)
    if (BRAZIL_AREA_CODES.includes(prefix2)) {
      console.log('Detectando operadora Brasil para número:', phoneNumber);
      console.log('Número limpo:', cleanNumber);
      console.log('Prefixo (2 dígitos) extraído:', prefix2);

      // No Brasil, todas as operadoras compartilham os mesmos DDDs
      // Não é possível detectar a operadora automaticamente pelo prefixo
      console.log('⚠️ Brasil: DDD válido mas operadora não pode ser detectada automaticamente');
      return null;
    }
  } else if (cleanNumber.length === 11) {
    // Brasil - 11 dígitos (com nono dígito)
    const prefix2 = cleanNumber.substring(0, 2);

    console.log('Detectando operadora Brasil para número:', phoneNumber);
    console.log('Número limpo:', cleanNumber);
    console.log('Prefixo (2 dígitos) extraído:', prefix2);

    if (BRAZIL_AREA_CODES.includes(prefix2)) {
      // No Brasil, todas as operadoras compartilham os mesmos DDDs
      console.log('⚠️ Brasil: DDD válido mas operadora não pode ser detectada automaticamente');
      return null;
    }
  }

  return null;
};

export const getOperatorInfo = (operatorId: string) => {
  const operator = ALL_OPERATORS.find(op => op.id === operatorId);
  if (!operator) return null;
  
  return {
    id: operator.id,
    name: operator.name,
    logo: getOperatorLogo(operator.id),
    country: operator.country,
    prefixes: operator.prefixes,
    minAmount: operator.minAmountBRL,
    maxAmount: operator.maxAmountBRL,
    commission: operator.commission
  };
};

const getOperatorLogo = (operatorId: string): string => {
  // Haiti operators
  if (operatorId === 'DH') return '📱'; // Digicel
  if (operatorId === 'NH') return '📞'; // Natcom
  
  // Dominican Republic operators
  if (operatorId === 'ORDO') return '🟠'; // Altice (Orange)
  if (operatorId === 'VVDO') return '🟢'; // Viva
  if (operatorId === 'D8DO') return '🔴'; // Claro
  
  return '📱'; // Default
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Formatar baseado no comprimento
  if (cleanNumber.length === 8) {
    // Haiti: XXXX-XXXX
    const first8 = cleanNumber.substring(0, 8);
    return `${first8.substring(0, 4)}-${first8.substring(4)}`;
  } else if (cleanNumber.length === 10) {
    // Pode ser República Dominicana (XXX-XXX-XXXX) ou Brasil (XX-XXXX-XXXX)
    const prefix3 = cleanNumber.substring(0, 3);
    const prefix2 = cleanNumber.substring(0, 2);
    const validDominicanAreaCodes = ['809', '829', '849'];

    if (validDominicanAreaCodes.includes(prefix3)) {
      // República Dominicana: XXX-XXX-XXXX
      return `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3, 6)}-${cleanNumber.substring(6)}`;
    }
    if (BRAZIL_AREA_CODES.includes(prefix2)) {
      // Brasil: XX-XXXX-XXXX
      return `${cleanNumber.substring(0, 2)}-${cleanNumber.substring(2, 6)}-${cleanNumber.substring(6)}`;
    }
    // Default: República Dominicana format
    return `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3, 6)}-${cleanNumber.substring(6)}`;
  } else if (cleanNumber.length === 11) {
    // Brasil com nono dígito: XX-XXXXX-XXXX
    const prefix2 = cleanNumber.substring(0, 2);
    if (BRAZIL_AREA_CODES.includes(prefix2)) {
      return `${cleanNumber.substring(0, 2)}-${cleanNumber.substring(2, 7)}-${cleanNumber.substring(7)}`;
    }
    // Fallback
    return `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3, 7)}-${cleanNumber.substring(7)}`;
  }

  // Se tem 4 ou mais dígitos, adiciona hífen
  if (cleanNumber.length >= 4) {
    return `${cleanNumber.substring(0, 4)}-${cleanNumber.substring(4)}`;
  }

  // Se tem menos de 4 dígitos, retorna como está
  return cleanNumber;
};

export const isValidDominicanNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Deve ter exatamente 10 dígitos
  if (cleanNumber.length !== 10) {
    return false;
  }

  // Deve começar com um código de área válido (809, 829 ou 849)
  const prefix3 = cleanNumber.substring(0, 3);
  const validAreaCodes = ['809', '829', '849'];

  return validAreaCodes.includes(prefix3);
};
export const isValidHaitiNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Deve ter exatamente 8 dígitos
  if (cleanNumber.length !== 8) {
    return false;
  }

  // Deve começar com um prefixo válido
  const prefix = cleanNumber.substring(0, 2);
  const allPrefixes = [
    ...HAITI_OPERATOR_PREFIXES.DIGICEL,
    ...HAITI_OPERATOR_PREFIXES.NATCOM
  ];

  return allPrefixes.includes(prefix);
};

export const isValidBrazilNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Deve ter 10 (DDD + 8) ou 11 (DDD + 9 dígitos) dígitos
  if (cleanNumber.length !== 10 && cleanNumber.length !== 11) {
    return false;
  }

  // Deve começar com um DDD válido
  const prefix2 = cleanNumber.substring(0, 2);
  return BRAZIL_AREA_CODES.includes(prefix2);
};