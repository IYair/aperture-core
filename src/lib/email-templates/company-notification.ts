interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  budget: string;
  message: string;
  consent: boolean;
}

export function getCompanyNotificationTemplate(data: ContactFormData, clientIP: string) {
  const html = `
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
  `;

  const text = `
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
  `.trim();

  return {
    subject: `Nuevo lead desde la web — ${data.name}`,
    html,
    text
  };
}