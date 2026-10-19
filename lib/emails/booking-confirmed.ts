type ConfirmationData = {
  consultantName: string;
  clientName: string;
  sessionTitle: string;
  when: string; // already formatted in the consultant's timezone
  timezone: string;
};

type NotificationData = ConfirmationData & {
  clientEmail: string;
  projectDescription: string;
  budgetRange: string;
  timeline: string;
};

/** Client-supplied text is never trusted as HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function clientConfirmationEmail(data: ConfirmationData) {
  const subject = `Booking confirmed — ${data.sessionTitle}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 16px;">Your booking is confirmed</h2>
      <p>Hi ${escapeHtml(data.clientName)},</p>
      <p>
        Your ${escapeHtml(data.sessionTitle)} with
        ${escapeHtml(data.consultantName)} is confirmed for:
      </p>
      <p style="font-size: 18px; font-weight: 600;">
        ${escapeHtml(data.when)}
      </p>
      <p style="color: #666; font-size: 14px;">
        All times are in ${escapeHtml(data.timezone)}.
      </p>
    </div>
  `;

  const text = [
    `Your booking is confirmed`,
    ``,
    `Hi ${data.clientName},`,
    ``,
    `Your ${data.sessionTitle} with ${data.consultantName} is confirmed for:`,
    `${data.when} (${data.timezone})`,
  ].join("\n");

  return { subject, html, text };
}

export function consultantNotificationEmail(data: NotificationData) {
  const subject = `New booking — ${data.when}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 16px;">New booking</h2>
      <p style="font-size: 18px; font-weight: 600;">
        ${escapeHtml(data.when)} (${escapeHtml(data.timezone)})
      </p>
      <h3 style="margin: 24px 0 8px;">Client</h3>
      <p style="margin: 0;">${escapeHtml(data.clientName)}</p>
      <p style="margin: 0;">${escapeHtml(data.clientEmail)}</p>
      <h3 style="margin: 24px 0 8px;">Project</h3>
      <p style="white-space: pre-wrap;">${escapeHtml(data.projectDescription)}</p>
      <h3 style="margin: 24px 0 8px;">Budget</h3>
      <p style="margin: 0;">${escapeHtml(data.budgetRange)}</p>
      <h3 style="margin: 24px 0 8px;">Timeline</h3>
      <p style="margin: 0;">${escapeHtml(data.timeline)}</p>
    </div>
  `;

  const text = [
    `New booking`,
    ``,
    `${data.when} (${data.timezone})`,
    ``,
    `Client: ${data.clientName} <${data.clientEmail}>`,
    ``,
    `Project:`,
    data.projectDescription,
    ``,
    `Budget: ${data.budgetRange}`,
    `Timeline: ${data.timeline}`,
  ].join("\n");

  return { subject, html, text };
}