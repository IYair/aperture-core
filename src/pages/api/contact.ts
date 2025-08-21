import type { APIRoute } from 'astro';
import { getCompanyNotificationTemplate } from '../../lib/email-templates/company-notification';
import { getClientConfirmationTemplate } from '../../lib/email-templates/client-confirmation';

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
      return redirect('/error?message=' + encodeURIComponent('Demasiadas solicitudes, intenta en unos segundos') + '&code=429', 302);
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
        return redirect('/error?message=' + encodeURIComponent('Formulario enviado demasiado rápido') + '&code=400', 302);
      }
    }
    
    // Honeypot check
    if (data.website) {
      // Pretend success for bots
      return redirect('/gracias', 302);
    }
    
    // Validation
    if (!data.name || !data.email || !data.message || !data.consent) {
      return redirect('/error?message=' + encodeURIComponent('Campos requeridos faltantes') + '&code=400', 302);
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return redirect('/error?message=' + encodeURIComponent('Email inválido') + '&code=400', 302);
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
    const urlCount = (data.message.match(SUSPICIOUS_PATTERNS[0]) || []).length;
    const hasExcessiveCaps = SUSPICIOUS_PATTERNS[1].test(data.message);
    const hasRepeatedChars = SUSPICIOUS_PATTERNS[2].test(data.message);
    
    if (urlCount > 2 || hasExcessiveCaps || hasRepeatedChars) {
      console.log(`Suspicious content detected from IP ${clientAddress}`);
      // Silently reject
      return redirect('/gracias', 302);
    }

    // Message length validation
    if (data.message.length > 2000 || data.message.length < 10) {
      return redirect('/error?message=' + encodeURIComponent('El mensaje debe tener entre 10 y 2000 caracteres') + '&code=400', 302);
    }
    
    // Log legitimate contact for monitoring
    console.log(`Legitimate contact from ${clientAddress}: ${data.email}`);
    
    // Send emails (to company and confirmation to client)
    await sendContactEmail(data, clientAddress);
    await sendConfirmationEmail(data);
    
    return redirect('/gracias', 302);
  } catch (error) {
    console.error('Contact form error:', error);
    return redirect('/error?message=' + encodeURIComponent('Error interno del servidor') + '&code=500', 302);
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
  
  const template = getCompanyNotificationTemplate(data, clientIP);
  
  try {
    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text
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

async function sendConfirmationEmail(data: ContactFormData) {
  const { Resend } = await import('resend');
  
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    throw new Error('Email service not configured');
  }
  
  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.CONTACT_FROM || 'noreply@aperturecore.com';
  
  const template = getClientConfirmationTemplate(data);
  
  try {
    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) {
      console.error('Resend API error (confirmation email):', error);
      // Don't throw error for confirmation email to avoid breaking the main flow
      console.log('Confirmation email failed but main email sent successfully');
      return null;
    }

    console.log('Confirmation email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending confirmation email with Resend:', error);
    // Don't throw error for confirmation email to avoid breaking the main flow
    console.log('Confirmation email failed but main email sent successfully');
    return null;
  }
}