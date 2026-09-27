"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export type PaymentResult = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function createDeposit(amount: number): Promise<void> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Not authenticated");
  }

  if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
    throw new Error("Deposit must be between $1 and $10,000");
  }

  const headerList = await headers();
  const origin = headerList.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: userData.user.id,
    metadata: { user_id: userData.user.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amount * 100),
          product_data: { name: "Glass Ops Wallet Credit" },
        },
      },
    ],
    success_url: origin + "/player?deposit=success",
    cancel_url: origin + "/player?deposit=canceled",
  });

  await supabase.rpc("create_payment_record", {
    p_type: "deposit",
    p_amount: amount,
    p_session_id: session.id,
    p_metadata: { origin: "checkout" },
  });

  redirect(session.url!);
}

export async function requestWithdrawal(amount: number): Promise<PaymentResult> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { success: false, error: "Not authenticated" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Enter a valid amount" };
  }

  const { data, error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function approveWithdrawal(paymentId: string): Promise<PaymentResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("settle_withdrawal", {
    p_payment_id: paymentId,
    p_approve: true,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function rejectWithdrawal(paymentId: string): Promise<PaymentResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("settle_withdrawal", {
    p_payment_id: paymentId,
    p_approve: false,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}