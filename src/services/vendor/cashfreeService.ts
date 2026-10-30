import Config from 'react-native-config';

const rawConfig: Record<string, string | undefined> = (Config as any) || {};

const isSandbox =
  (rawConfig.CASHFREE_ENV || rawConfig.VITE_CASHFREE_ENV || 'sandbox').toLowerCase() === 'sandbox';

const CASHFREE_SERVICE_URL =
  rawConfig.CASHFREE_SERVICE_URL ||
  'https://createcashfreeorder-298300377700.us-central1.run.app';

export const CASHFREE_CONFIG = {
  APP_ID: rawConfig.CASHFREE_APP_ID || rawConfig.VITE_CASHFREE_APP_ID || '',
  ENV: isSandbox ? 'sandbox' : 'production',
  SERVICE_URL: CASHFREE_SERVICE_URL,
};

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
}

/**
 * Creates a Cashfree payment order via Cloud Run Serverless Gateway (CRIT-02 Resolved)
 * Secret keys are protected on the server side in Google Secret Manager.
 */
export const createCashfreeMobileOrder = async (params: CreateOrderParams) => {
  const { orderId, orderAmount, customerName, customerEmail, customerPhone, returnUrl } = params;

  const cleanPhone = (customerPhone || '9999999999').toString().replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail =
    customerEmail && customerEmail.includes('@') ? customerEmail.trim().toLowerCase() : 'vendor@dealzhub.co.in';
  const cleanName =
    (customerName || 'Dealzhub Vendor').replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 50) || 'Dealzhub Vendor';

  const payload = {
    orderId: orderId,
    orderAmount: parseFloat(orderAmount.toString()),
    customerName: cleanName,
    customerEmail: cleanEmail,
    customerPhone: cleanPhone.length === 10 ? cleanPhone : '9999999999',
    returnUrl: returnUrl || `dealszhub://payment-status?order_id={order_id}`,
  };

  const response = await fetch(`${CASHFREE_CONFIG.SERVICE_URL}/create-order`, {
    method: 'POST',
    headers: {
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
  if (paymentSessionId) {
    const envParam = CASHFREE_CONFIG.ENV === 'sandbox' ? '&env=sandbox' : '';
    return `https://dealzhub.co.in/checkout?session_id=${encodeURIComponent(paymentSessionId)}${envParam}`;
  }
  return `https://dealzhub.co.in/payment-status?order_id=${encodeURIComponent(orderId)}`;
};

/**
 * Creates a Cashfree payment order and returns the web checkout URL.
 */
export const initiateCashfreeWebPayment = async (params: CreateOrderParams): Promise<string> => {
  const returnUrl = params.returnUrl || `dealszhub://payment-status?order_id=${params.orderId}`;

  const orderData = await createCashfreeMobileOrder({
    ...params,
    returnUrl,
  });

  if (orderData?.payment_session_id) {
    return getCashfreeCheckoutUrl(params.orderId, orderData.payment_session_id);
  }

  throw new Error('Cashfree did not return a valid payment session.');
};

/**
 * Verifies a Cashfree payment order via Cloud Run Serverless Gateway
 */
export const verifyCashfreeMobileOrder = async (orderId: string) => {
  const response = await fetch(
    `${CASHFREE_CONFIG.SERVICE_URL}/verify-order?orderId=${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify payment order with Cashfree');
  }

  return data;
};

export const createCashfreePaymentLink = async (params: CreateOrderParams) => {
  return await createCashfreeMobileOrder(params);
};

export const verifyCashfreePaymentLink = async (linkId: string) => {
  return await verifyCashfreeMobileOrder(linkId);
};
