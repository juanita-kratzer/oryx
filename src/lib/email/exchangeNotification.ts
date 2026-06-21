import {
  isEmailConfigured,
  REPLY_TO_EMAIL,
  SENDER_EMAIL,
  SENDER_NAME,
  sendGridClient,
  getSendGridErrorDetail,
} from "./client";

type ExchangeNotificationParams = {
  to: string;
  cardName: string;
  exchange: {
    name: string;
    phone?: string | null;
    email?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    notes?: string | null;
  };
};

export async function sendExchangeNotificationEmail(
  params: ExchangeNotificationParams
): Promise<void> {
  const sg = sendGridClient();
  if (!isEmailConfigured() || !sg) return;

  const { to, cardName, exchange } = params;
  const lines = [
    `Someone shared their details from your card "${cardName}".`,
    "",
    `Name: ${exchange.name}`,
    exchange.phone ? `Phone: ${exchange.phone}` : null,
    exchange.email ? `Email: ${exchange.email}` : null,
    exchange.company ? `Company: ${exchange.company}` : null,
    exchange.jobTitle ? `Job title: ${exchange.jobTitle}` : null,
    exchange.notes ? `Notes: ${exchange.notes}` : null,
  ].filter(Boolean);

  const text = lines.join("\n");
  const html = lines.map((l) => `<p>${l}</p>`).join("");

  try {
    await sg.send({
      to,
      from: { email: SENDER_EMAIL, name: SENDER_NAME },
      replyTo: { email: REPLY_TO_EMAIL, name: SENDER_NAME },
      subject: "New contact shared from your Oryx card",
      text,
      html: `<div style="font-family: sans-serif; color: #111827;">${html}</div>`,
    });
  } catch (err) {
    console.error("exchange notification email:", getSendGridErrorDetail(err));
  }
}
