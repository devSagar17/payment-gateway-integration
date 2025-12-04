import type { RequestHandler } from "express";
import crypto from "crypto";

function assertEnv() {
  const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
  const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
  
  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    const error = new Error(
      "Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment.",
    );
    // @ts-expect-error add code
    ((error.code = "MISSING_KEYS"), (error.status = 500));
    throw error;
  }
  
  return { RZP_KEY_ID, RZP_KEY_SECRET };
}

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { RZP_KEY_ID, RZP_KEY_SECRET } = assertEnv();
    const { amount, currency = "INR", receipt } = req.body ?? {};
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const subunits = Math.round(amt * 100);

    const basicAuth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString(
      "base64",
    );

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: subunits,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ message: "Failed to create order", details: text });
    }

    const data = (await response.json()) as {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
    };

    return res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: RZP_KEY_ID,
      receipt: data.receipt,
    });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return res
      .status(status)
      .json({ message: err?.message || "Internal Server Error" });
  }
};

export const verifyPayment: RequestHandler = async (req, res) => {
  try {
    const { RZP_KEY_ID, RZP_KEY_SECRET } = assertEnv();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing verification fields" });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", RZP_KEY_SECRET)
      .update(payload)
      .digest("hex");

    const verified = expected === razorpay_signature;

    return res.status(200).json({ verified });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return res
      .status(status)
      .json({ message: err?.message || "Internal Server Error" });
  }
};

export const getConfig: RequestHandler = (_req, res) => {
  const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
  const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
  
  res
    .status(200)
    .json({ keyId: RZP_KEY_ID, hasSecret: Boolean(RZP_KEY_SECRET) });
};