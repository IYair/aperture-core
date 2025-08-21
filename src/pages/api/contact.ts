import type { APIRoute } from 'astro';

const RATE_LIMIT_MAP = new Map<string, number>();
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds

// Spam keyword detection
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'porn', 'sex', 'loan', 'bitcoin', 'cryptocurrency',
  'pharmacy', 'pills', 'weight loss', 'make money', 'click here', 
  'congratulations', 'winner', 'free money', 'inheritance'
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /https?:\/\/[^\s]+/gi, // Multiple URLs
  /[A-Z]{10,}/g, // Excessive caps
  /(.{1,3})\1{4,}/g // Repeated characters
];

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  budget: string;
  message: string;
  website?: string; // honeypot
  consent: boolean;
  _ts?: string;
}

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  try {
    // Rate limiting
    const now = Date.now();
    const lastRequest = RATE_LIMIT_MAP.get(clientAddress) || 0;
    
    if (now - lastRequest < RATE_LIMIT_WINDOW) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Demasiadas solicitudes, intenta en unos segundos' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    RATE_LIMIT_MAP.set(clientAddress, now);
    
    // Parse form data
    const formData = await request.formData();
    const data: ContactFormData = {
      name: (formData.get('name') as string)?.trim() || '',
      email: (formData.get('email') as string)?.trim() || '',
      company: (formData.get('company') as string)?.trim() || '',
      budget: (formData.get('budget') as string)?.trim() || '',
      message: (formData.get('message') as string)?.trim() || '',
      website: (formData.get('website') as string)?.trim() || '',
      consent: formData.get('consent') === 'on',
      _ts: formData.get('_ts') as string
    };
    
    // Timing validation (minimum 3 seconds)
    if (data._ts) {
      const formOpenTime = parseInt(data._ts);
      if (now - formOpenTime < 3000) {
        return new Response(
          JSON.stringify({ ok: false, message: 'Formulario enviado demasiado rápido' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Honeypot check
    if (data.website) {
      // Pretend success for bots
      return redirect('/gracias', 302);
    }
    
    // Validation
    if (!data.name || !data.email || !data.message || !data.consent) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Campos requeridos faltantes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Spam content detection
    const fullText = `${data.name} ${data.message} ${data.company || ''}`.toLowerCase();
    const hasSpamKeywords = SPAM_KEYWORDS.some(keyword => fullText.includes(keyword));
    
    if (hasSpamKeywords) {
      console.log(`Spam detected from IP ${clientAddress}: Contains spam keywords`);
      // Silently reject - don't give bots feedback
      return redirect('/gracias', 302);
    }

    // Suspicious pattern detection
    const urlCount = (data.message.match(/https?:\/\/[^\s]+/gi) || []).length;
    const hasExcessiveCaps = /[A-Z]{10,}/.test(data.message);
    const hasRepeatedChars = /(.{1,3})\1{4,}/.test(data.message);
    
    if (urlCount > 2 || hasExcessiveCaps || hasRepeatedChars) {
      console.log(`Suspicious content detected from IP ${clientAddress}`);
      // Silently reject
      return redirect('/gracias', 302);
    }

    // Message length validation
    if (data.message.length > 2000 || data.message.length < 10) {
      return new Response(
        JSON.stringify({ ok: false, message: 'El mensaje debe tener entre 10 y 2000 caracteres' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Log legitimate contact for monitoring
    console.log(`Legitimate contact from ${clientAddress}: ${data.email}`);
    
    // Send email using your preferred service
    await sendContactEmail(data, clientAddress);
    
    return redirect('/gracias', 302);
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ ok: false, message: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function sendContactEmail(data: ContactFormData, clientIP: string) {
  const { Resend } = await import('resend');
  
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    throw new Error('Email service not configured');
  }
  
  const resend = new Resend(resendApiKey);
  
  const toEmail = process.env.CONTACT_TO || 'info@aperturecore.com';
  const fromEmail = process.env.CONTACT_FROM || 'noreply@aperturecore.com';
  
  try {
    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: `Nuevo lead desde la web — ${data.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Nuevo contacto desde ApertureCore.com</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Empresa:</strong> ${data.company || 'No especificada'}</p>
            <p><strong>Presupuesto:</strong> ${data.budget}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Mensaje:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #4f46e5; white-space: pre-wrap;">${data.message}</div>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="font-size: 12px; color: #6b7280;">
            <p><strong>Información técnica:</strong></p>
            <p>IP: ${clientIP}</p>
            <p>Timestamp: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
          </div>
        </div>
      `,
      text: `
Nuevo contacto desde ApertureCore.com

Nombre: ${data.name}
Email: ${data.email}
Empresa: ${data.company || 'No especificada'}
Presupuesto: ${data.budget}

Mensaje:
${data.message}

---
IP: ${clientIP}
Timestamp: ${new Date().toISOString()}
      `.trim()
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    throw error;
  }
}