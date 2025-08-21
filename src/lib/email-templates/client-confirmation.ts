interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  budget: string;
  message: string;
  consent: boolean;
}

export function getClientConfirmationTemplate(data: ContactFormData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">Aperture Core</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Software Development Agency</p>
        </div>
        
        <h2 style="color: #374151; font-size: 24px; margin-bottom: 20px;">¡Hola ${data.name}!</h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Gracias por contactarnos. Hemos recibido tu mensaje y queremos confirmarte que nuestro equipo lo revisará muy pronto.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Resumen de tu consulta:</h3>
          <p style="margin: 8px 0; color: #4b5563;"><strong>Empresa:</strong> ${data.company || 'No especificada'}</p>
          <p style="margin: 8px 0; color: #4b5563;"><strong>Presupuesto:</strong> ${data.budget}</p>
          <div style="margin-top: 15px;">
            <p style="margin: 0 0 8px 0; color: #374151; font-weight: 600;">Tu mensaje:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #4f46e5; white-space: pre-wrap; color: #4b5563;">${data.message}</div>
          </div>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
          <strong>¿Qué sigue?</strong><br>
          Nuestro equipo analizará tu proyecto y te responderemos en un plazo máximo de 24 horas con una propuesta inicial y los siguientes pasos.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://aperturecore.com" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Visitar nuestro sitio web
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <div style="text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Este es un email automático, por favor no respondas a este mensaje.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
            <strong>Aperture Core</strong> — Software Development Agency<br>
            <a href="https://aperturecore.com" style="color: #4f46e5;">aperturecore.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
¡Hola ${data.name}!

Gracias por contactarnos. Hemos recibido tu mensaje y queremos confirmarte que nuestro equipo lo revisará muy pronto.

RESUMEN DE TU CONSULTA:
Empresa: ${data.company || 'No especificada'}
Presupuesto: ${data.budget}

Tu mensaje:
${data.message}

¿QUÉ SIGUE?
Nuestro equipo analizará tu proyecto y te responderemos en un plazo máximo de 24 horas con una propuesta inicial y los siguientes pasos.

---
Este es un email automático, por favor no respondas a este mensaje.

Aperture Core — Software Development Agency
https://aperturecore.com
  `.trim();

  return {
    subject: '¡Gracias por contactarnos! — Aperture Core',
    html,
    text
  };
}