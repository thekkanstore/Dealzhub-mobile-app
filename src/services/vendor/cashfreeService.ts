import Config from 'react-native-config';

const rawConfig: Record<string, string | undefined> = (Config as any) || {};

const isSandbox =
  (rawConfig.CASHFREE_ENV || rawConfig.VITE_CASHFREE_ENV || 'sandbox').toLowerCase() === 'sandbox';

export const CASHFREE_CONFIG = {
  APP_ID: rawConfig.CASHFREE_APP_ID || rawConfig.VITE_CASHFREE_APP_ID || '',
  SECRET_KEY: rawConfig.CASHFREE_SECRET_KEY || rawConfig.VITE_CASHFREE_SECRET_KEY || '',
  ENV: isSandbox ? 'sandbox' : 'production',
  BASE_URL: isSandbox
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg',
  API_VERSION: '2023-08-01',
};

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
}

export const createCashfreeMobileOrder = async (params: CreateOrderParams) => {
  const { orderId, orderAmount, customerName, customerEmail, customerPhone, returnUrl } = params;

  const cleanPhone = (customerPhone || '9999999999').toString().replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail =
    customerEmail && customerEmail.includes('@') ? customerEmail : 'vendor@dealzhub.co.in';

  const payload = {
    order_id: orderId,
    order_amount: parseFloat(orderAmount.toString()),
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${Date.now()}`,
      customer_name: customerName || 'Dealzhub Vendor',
      customer_email: cleanEmail,
      customer_phone: cleanPhone.length === 10 ? cleanPhone : '9999999999',
    },
    order_meta: {
      return_url: returnUrl || `dealszhub://payment-status?order_id={order_id}`,
    },
  };

  const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_CONFIG.APP_ID,
      'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
      'x-api-version': CASHFREE_CONFIG.API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create payment order with Cashfree');
  }

  return data;
};

export const getCashfreeCheckoutUrl = (orderId: string, paymentSessionId?: string): string => {
  if (CASHFREE_CONFIG.ENV === 'production') {
    if (paymentSessionId) {
      return `https://payments.cashfree.com/order/#${paymentSessionId}`;
    }
    return `https://cashfree.com/pg/orders/${orderId}/checkout`;
  }
  if (paymentSessionId) {
    return `https://payments-test.cashfree.com/order/#${paymentSessionId}`;
  }
  return `https://sandbox.cashfree.com/pg/orders/${orderId}/checkout`;
};

/**
 * Creates a Cashfree payment order and returns the web checkout URL.
 * Automatically falls back to Links API if Orders API fails.
 */
export const initiateCashfreeWebPayment = async (params: CreateOrderParams): Promise<string> => {
  const returnUrl = params.returnUrl || `dealszhub://payment-status?order_id=${params.orderId}`;

  // 1. Try Cashfree Orders API first (standard web PG checkout, works in production)
  try {
    const orderData = await createCashfreeMobileOrder({
      ...params,
      returnUrl,
    });
    if (orderData?.payment_session_id) {
      return getCashfreeCheckoutUrl(params.orderId, orderData.payment_session_id);
    }
  } catch (orderErr: any) {
    console.warn('Cashfree Orders API error, trying Links API fallback:', orderErr);
    // 2. Fallback to Links API if Orders API is unavailable
    try {
      const linkData = await createCashfreePaymentLink(params);
      if (linkData?.link_url) {
        return linkData.link_url;
      }
    } catch (linkErr: any) {
      console.error('Cashfree Links API fallback error:', linkErr);
      throw orderErr || linkErr;
    }
  }

  throw new Error('Cashfree did not return a valid payment session.');
};

export const createCashfreePaymentLink = async (params: CreateOrderParams) => {
  const { orderId, orderAmount, customerName, customerEmail, customerPhone, returnUrl } = params;

  const cleanPhone = (customerPhone || '9999999999').toString().replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail =
    customerEmail && customerEmail.includes('@') ? customerEmail : 'vendor@dealzhub.co.in';

  const payload = {
    link_id: orderId,
    link_amount: parseFloat(orderAmount.toString()),
    link_currency: 'INR',
    link_purpose: `DealzHub Vendor Subscription (${orderId})`,
    customer_details: {
      customer_name: customerName || 'Dealzhub Vendor',
      customer_email: cleanEmail,
      customer_phone: cleanPhone.length === 10 ? cleanPhone : '9999999999',
    },
    link_notify: {
      send_sms: false,
      send_email: false,
    },
    link_meta: {
      return_url: returnUrl || `dealszhub://payment-status?link_id=${orderId}&order_id=${orderId}`,
    },
  };

  const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/links`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_CONFIG.APP_ID,
      'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
      'x-api-version': CASHFREE_CONFIG.API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create payment link with Cashfree');
  }

  return data;
};

export const verifyCashfreePaymentLink = async (linkId: string) => {
  const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/links/${linkId}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_CONFIG.APP_ID,
      'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
      'x-api-version': CASHFREE_CONFIG.API_VERSION,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify payment link with Cashfree');
  }

  return data;
};

export const verifyCashfreeMobileOrder = async (orderId: string) => {
  const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_CONFIG.APP_ID,
      'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
      'x-api-version': CASHFREE_CONFIG.API_VERSION,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify payment order with Cashfree');
  }

  return data;
};
