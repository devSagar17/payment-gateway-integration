/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface CreateOrderRequest {
  amount: number; // in major units e.g., INR rupees
  currency?: string; // default INR
  receipt?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number; // subunits per Razorpay
  currency: string;
  keyId: string;
  receipt: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
}
