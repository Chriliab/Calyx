import { escapeHtml } from "./escape-html";

type CancellationData = {
  clientName: string;
  consultantName: string;
  sessionTitle: string;
  when: string; // already formatted in the consultant's timezone
  timezone: string;
};

export function clientCancellationEmail(data: CancellationData) {
  const subject = `Booking cancelled — ${data.sessionTitle}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 16px;">Your booking has been cancelled</h2>
      <p>Hi ${escapeHtml(data.clientName)},</p>
      <p>
        ${escapeHtml(data.consultantName)} has cancelled your
        ${escapeHtml(data.sessionTitle)} on:
      </p>
      <p style="font-size: 18px; font-weight: 600;">
        ${escapeHtml(data.when)} (${escapeHtml(data.timezone)})
      </p>
      <p>
        ${escapeHtml(data.consultantName)} will be in touch about your refund.
        If you have any questions, just reply to this email.
      </p>
    </div>
  `;

  const text = [
    `Your booking has been cancelled`,
    ``,
    `Hi ${data.clientName},`,
    ``,
    `${data.consultantName} has cancelled your ${data.sessionTitle} on:`,
    `${data.when} (${data.timezone})`,
    ``,
    `${data.consultantName} will be in touch about your refund.`,
    `If you have any questions, just reply to this email.`,
  ].join("\n");

  return { subject, html, text };
}