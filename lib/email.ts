import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not set");
}

if (!from) {
  throw new Error("EMAIL_FROM is not set");
}

export const resend = new Resend(apiKey);
export const EMAIL_FROM = from;