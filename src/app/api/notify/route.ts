export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import nodemailer from 'nodemailer';

function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

// GET settings helper
async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('key, value');
  const settings: Record<string, string> = {};
  (data || []).forEach((s: any) => { settings[s.key] = s.value; });
  return settings;
}

// Send notification email
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { to, subject, body } = await req.json();
    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body required' }, { status: 400 });
    }

    const settings = await getSettings();
    const smtpHost = settings.smtp_host || '';
    const smtpUser = settings.smtp_user || '';
    const smtpPassword = settings.smtp_password || '';
    const fromEmail = settings.from_email || 'noreply@skyroute.uk';
    const fromName = settings.from_name || 'SkyRoute System';
    const recipient = to || settings.notification_email || 'raf.rajkowski@dnata.com';

    // If SMTP not configured, log the email instead
    if (!smtpHost || !smtpUser) {
      console.log('[NOTIFY] SMTP not configured. Email would be sent:', { to: recipient, subject, body });
      return NextResponse.json({ success: true, message: 'SMTP not configured — email logged. Configure SMTP in Admin Settings.' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(settings.smtp_port || '587'),
      secure: parseInt(settings.smtp_port || '587') === 465,
      auth: { user: smtpUser, pass: smtpPassword },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipient,
      subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Ramp Issue Notification</h2>
        <p style="font-size: 14px; color: #374151;">${body.replace(/\n/g, '<br>')}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">This is an automated notification from SkyRoute C209/C208 System.</p>
      </div>`,
    });

    return NextResponse.json({ success: true, message: 'Email sent' });
  } catch (err: any) {
    console.error('[NOTIFY] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
