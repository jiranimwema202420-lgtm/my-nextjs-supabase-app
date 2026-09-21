"use server";

export type TurnstileResult = {
  success: boolean;
  error?: string;
};

export async function verifyTurnstileToken(
  token: string,
): Promise<TurnstileResult> {
  if (!token) {
    return { success: false, error: "Missing captcha token." };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is missing in .env.local");
    return { success: false, error: "Server configuration error." };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      },
    );

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      console.error("Turnstile verification failed:", data["error-codes"]);
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }
  } catch (error) {
    console.error("Turnstile fetch error:", error);
    return { success: false, error: "Network error during security check." };
  }
}
