const escapeIcs = value => String(value || "")
  .replaceAll("\\", "\\\\")
  .replaceAll("\r\n", "\\n")
  .replaceAll("\n", "\\n")
  .replaceAll(",", "\\,")
  .replaceAll(";", "\\;");

const validStamp = value => /^\d{8}T\d{6}$/.test(value || "");

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Ty's House of Color appointment";
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const details = url.searchParams.get("details") || "";
  const client = url.searchParams.get("client") || "your client";

  if (!validStamp(start) || !validStamp(end)) {
    return new Response("Missing or invalid appointment time.", { status: 400 });
  }

  const now = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/, "");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "METHOD:PUBLISH",
    "PRODID:-//Ty's House of Color//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-TIMEZONE:America/Chicago",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@tyshouseofcolor`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=America/Chicago:${start}`,
    `DTEND;TZID=America/Chicago:${end}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(details)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Appointment tomorrow with ${escapeIcs(client)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Appointment in 2 hours with ${escapeIcs(client)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "attachment; filename=tys-house-of-color-appointment.ics",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
