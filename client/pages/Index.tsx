import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { loadRazorpayCheckout } from "@/lib/razorpay";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@shared/api";

export default function Index() {
  const [amount, setAmount] = useState<string>("499");
  const [name, setName] = useState<string>("Sagar Dhapate");
  const [email, setEmail] = useState<string>("sagar@example.com");
  const [desc, setDesc] = useState<string>("Pro plan subscription");
  const [loading, setLoading] = useState(false);
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);

  useEffect(() => {
    // Probe server config to enable/disable payments
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((cfg) => setHasKeys(Boolean(cfg?.keyId && cfg?.hasSecret)))
      .catch(() => setHasKeys(false));
  }, []);

  const startPayment = async () => {
    try {
      setLoading(true);
      const ready = await loadRazorpayCheckout();
      if (!ready) {
        toast.error("Failed to load Razorpay Checkout.");
        return;
      }

      const payload: CreateOrderRequest = {
        amount: numericAmount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      };

      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as CreateOrderResponse & {
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create order");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "NovaPay",
        description: desc,
        order_id: data.orderId,
        prefill: {
          name,
          email,
        },
        theme: { color: "#7c3aed" },
        handler: async function (response: any) {
          const verifyPayload: VerifyPaymentRequest = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(verifyPayload),
          });
          const verify = (await verifyRes.json()) as VerifyPaymentResponse;
          if (verify.verified) {
            toast.success("Payment successful ✅");
          } else {
            toast.error("Verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            toast("Payment popup closed");
          },
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-x-0 -top-24 -z-10 blur-3xl opacity-40">
        <div className="mx-auto h-64 w-2/3 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-indigo-600 rounded-full" />
      </div>

      <section className="container py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live Payments via Razorpay
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Accept payments in minutes with
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-300 bg-clip-text pl-2 text-transparent">
                Razorpay
              </span>
            </h1>
            <p className="mt-4 text-white/80 max-w-prose">
              A beautiful, production-ready payment gateway integration. Create
              orders, launch Razorpay Checkout, and verify payments securely.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                Zero setup fees
              </div>
              <div className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                Secure HMAC verify
              </div>
              <div className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                Test/live ready
              </div>
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>Enter details and pay securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-white/80">
                  Amount (INR)
                </label>
                <Input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-white/60">
                  You will be charged ₹{numericAmount.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-white/80">
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-white/80">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/80">
                  Description
                </label>
                <Input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              {hasKeys === false && (
                <div className="w-full rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-amber-200 text-sm">
                  Set environment variables RAZORPAY_KEY_ID and
                  RAZORPAY_KEY_SECRET to enable live payments.
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                size="lg"
                onClick={startPayment}
                disabled={loading || numericAmount <= 0 || hasKeys === false}
              >
                {loading ? "Processing..." : `Pay ₹${numericAmount.toFixed(2)}`}
              </Button>
              <p className="text-xs text-white/50">
                Payments are securely processed by Razorpay. We never store card
                details.
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section id="pricing" className="container pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Starter</h3>
            <p className="text-sm text-white/70">Great for experiments</p>
            <div className="mt-4 text-3xl font-extrabold">₹99</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-6 ring-2 ring-violet-500/40">
            <h3 className="font-semibold">Pro</h3>
            <p className="text-sm text-white/70">Most popular</p>
            <div className="mt-4 text-3xl font-extrabold">₹499</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Business</h3>
            <p className="text-sm text-white/70">Scale with confidence</p>
            <div className="mt-4 text-3xl font-extrabold">₹1,999</div>
          </div>
        </div>
      </section>
    </div>
  );
}
