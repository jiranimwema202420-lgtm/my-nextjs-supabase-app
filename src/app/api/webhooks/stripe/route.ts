import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.user_id;
    const amountCents = session.amount_total ?? 0;
    const amount = Number((amountCents / 100).toFixed(2));

    if (!userId || amount <= 0) {
      return NextResponse.json({ error: "Bad session payload" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin.rpc("credit_stripe_deposit", {
      p_session_id: session.id,
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      console.error("credit_stripe_deposit failed:", error);
      return NextResponse.json({ error: "Credit failed" }, { status: 500 });
    }

    console.log("Deposit credited:", data);
  }

  return NextResponse.json({ received: true });
}