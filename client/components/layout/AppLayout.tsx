import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-gradient-to-br from-[#0f1226] via-[#0b0f2a] to-[#060913] text-white",
        className,
      )}
    >
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md shadow-violet-500/30">
              ₹
            </span>
            <span className="font-extrabold tracking-tight text-lg">
              NovaPay
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline text-sm text-white/80 hover:text-white"
            >
              Razorpay Docs
            </a>
            <Button
              asChild
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/10"
            >
              <a href="#pricing">Pricing</a>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10">
        <div className="container py-8 text-sm text-white/60 flex justify-between items-center">
          <p>© {new Date().getFullYear()} NovaPay. Built with Razorpay.</p>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-white">
              Home
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
