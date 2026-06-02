import { HAITI_OPERATORS, DOMINICAN_OPERATORS, ALL_OPERATORS } from '../constants/countries';

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
    // República Dominicana - 10 dígitos: XXX-XXX-XXXX
    const prefix3 = cleanNumber.substring(0, 3); // 809, 829, 849

    console.log('Detectando operadora Rep. Dom. para número:', phoneNumber);
    console.log('Número limpo:', cleanNumber);
    console.log('Prefixo (3 dígitos) extraído:', prefix3);

    // Verificar se é um código de área válido da República Dominicana
    const validAreaCodes = ['809', '829', '849'];
    if (!validAreaCodes.includes(prefix3)) {
      console.log('❌ Código de área inválido para Rep. Dom.:', prefix3);
      return null;
    }

    // Para República Dominicana, não conseguimos detectar a operadora apenas pelo prefixo
    // pois todas as operadoras usam os mesmos códigos de área (809, 829, 849)
    // Retornamos null para forçar seleção manual
    console.log('⚠️ Rep. Dom.: Prefixo válido mas operadora não pode ser detectada automaticamente');
    console.log('   Códigos de área 809/829/849 são compartilhados entre operadoras');
    return null;
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
    // República Dominicana: XXX-XXX-XXXX (ex: 809-123-4567)
    return `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3, 6)}-${cleanNumber.substring(6)}`;
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