declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeMode = "sandbox" | "production";

  export type CashfreeCheckoutResult = {
    error?: { message?: string };
    redirect?: boolean;
    paymentDetails?: { paymentMessage?: string };
  };

  export type CashfreeCheckout = {
    checkout(options: {
      paymentSessionId: string;
      redirectTarget: "_self" | "_blank" | "_top";
    }): Promise<CashfreeCheckoutResult> | void;
  };

  export function load(options: { mode: CashfreeMode }): Promise<CashfreeCheckout | null>;
}