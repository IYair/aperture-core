# Aperture Core — Sitio web en Astro

Sitio web en Astro + Tailwind para la agencia Aperture Core, con formulario de contacto funcionando vía API endpoints. Desplegado en VPS con Dokploy.

## Desarrollo local

```bash
npm run dev
```

Visita <http://localhost:4321>.

## Build

```bash
npm run build
```

La aplicación queda lista en `dist/` como servidor Node.js.

## Despliegue con Dokploy

1. Conecta tu repositorio a Dokploy
2. Dokploy detectará automáticamente el `Dockerfile` y construirá la imagen
3. La aplicación se ejecutará en el puerto 4321
4. Configura las variables de entorno necesarias:
   - `RESEND_API_KEY`: Tu API key de Resend (obligatorio)
   - `CONTACT_TO`: Email de destino para contactos
   - `CONTACT_FROM`: Email remitente (debe ser un dominio verificado en Resend)
   - `PUBLIC_PLAUSIBLE_DOMAIN`: (opcional) Para analytics

### Configuración de Resend

1. **Crea una cuenta en [Resend](https://resend.com)**
2. **Verifica tu dominio** en el dashboard de Resend
3. **Genera una API key** en la sección de configuración
4. **Configura las variables de entorno**:
   - `RESEND_API_KEY`: Tu API key
   - `CONTACT_FROM`: Un email de tu dominio verificado (ej: `noreply@tudominio.com`)
   - `CONTACT_TO`: Donde quieres recibir los contactos

El formulario enviará emails con formato HTML profesional y fallback de texto plano.

## Formulario de contacto

- Endpoint: `/api/contact` (API route de Astro en TypeScript)
- Protección: honeypot + rate limit por IP + validación de timing
- Redirección a `/gracias` tras envío exitoso
- Requiere configurar servicio de email para funcionar completamente

## Estructura clave

- `src/layouts/BaseLayout.astro`: Layout con Header/Footer
- `src/components/ContactForm.astro`: Form con validación básica
- `src/pages/index.astro`: Home con servicios y CTA
- `src/pages/contacto.astro`: Página de contacto
- `src/pages/gracias.astro`: Confirmación de envío
- `src/pages/api/contact.ts`: API endpoint para formulario de contacto
- `Dockerfile`: Configuración para despliegue en contenedor

## Licencia

Privado.
