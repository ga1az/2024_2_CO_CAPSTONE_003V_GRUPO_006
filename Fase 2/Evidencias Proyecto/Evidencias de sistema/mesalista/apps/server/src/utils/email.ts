export function sendForgotPasswordHTML(token: string) {
  return `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f0f0f0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 30px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #2c3e50;
              text-align: center;
              font-size: 28px;
              margin-bottom: 20px;
            }
            p {
              margin-bottom: 20px;
              font-size: 16px;
            }
            .token {
              display: block;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              color: #ffffff;
              padding: 15px;
              background-color: #e74c3c;
              border-radius: 5px;
              margin: 30px 0;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #7f8c8d;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Recuperación de Contraseña</h1>
            <p>Estimado usuario de MesaLista,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Si usted no ha realizado esta solicitud, por favor ignore este correo.</p>
            <p>Para continuar con el proceso de recuperación de contraseña, utilice el siguiente código:</p>
            <div class="token">${token}</div>
            <p>Ingrese este código en la página de recuperación de contraseña de MesaLista para crear una nueva contraseña segura.</p>
            <p>Por razones de seguridad, este código expirará en 30 minutos. Si necesita un nuevo código, por favor realice otra solicitud de recuperación de contraseña.</p>
            <p>Si tiene alguna pregunta o necesita ayuda adicional, no dude en contactar a nuestro equipo de soporte.</p>
            <div class="footer">
              <p>Este es un correo automático, por favor no responda a esta dirección.</p>
              <p>&copy; 2024 MesaLista. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
}
