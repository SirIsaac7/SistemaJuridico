<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>Verifica tu correo electrónico</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f6fa; color: #2a3547; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
        Confirma tu correo para activar tu acceso al Sistema Jurídico.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #f3f6fa;">
        <tr>
            <td align="center" style="padding: 36px 16px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; overflow: hidden; background-color: #ffffff; border: 1px solid #e5eaf0; border-radius: 14px; box-shadow: 0 8px 28px rgba(30, 42, 74, 0.08);">
                    <tr>
                        <td style="padding: 26px 32px; background-color: #1e2a4a; border-bottom: 4px solid #d4af37;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td width="58" valign="middle">
                                        <div style="width: 46px; height: 46px; line-height: 46px; border-radius: 50%; background-color: #d4af37; color: #1e2a4a; font-size: 16px; font-weight: 700; text-align: center;">SJ</div>
                                    </td>
                                    <td valign="middle">
                                        <div style="color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.4px;">Sistema Jurídico</div>
                                        <div style="padding-top: 4px; color: #cbd3e3; font-size: 12px; letter-spacing: 0.8px; text-transform: uppercase;">Verificación de identidad</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 38px 32px 18px;">
                            <div style="margin-bottom: 18px; color: #1e2a4a; font-family: Georgia, 'Times New Roman', serif; font-size: 27px; font-weight: 700; line-height: 1.25;">Confirma tu correo</div>
                            <p style="margin: 0 0 18px; color: #2a3547; font-size: 16px; line-height: 1.65;">Hola, <strong>{{ $name }}</strong>:</p>
                            <p style="margin: 0 0 22px; color: #526178; font-size: 15px; line-height: 1.7;">Para activar tu cuenta y acceder al contenido jurídico, confirma que este correo te pertenece.</p>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 28px;">
                                <tr>
                                    <td align="center" bgcolor="#1e2a4a" style="border-radius: 7px;">
                                        <a href="{{ $verificationUrl }}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none;">Verificar mi correo</a>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f3e5; border-left: 4px solid #d4af37; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 17px 18px; color: #526178; font-size: 14px; line-height: 1.65;">El enlace vence en <strong>{{ $expiresInMinutes }} minutos</strong>. Puedes abrirlo desde tu celular: no cambiará el dispositivo autorizado de tu cuenta.</td>
                                </tr>
                            </table>

                            <p style="margin: 24px 0 0; color: #6b778c; font-size: 13px; line-height: 1.65;">Si no creaste esta cuenta, puedes ignorar este mensaje con tranquilidad.</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 18px 32px 34px;">
                            <p style="margin: 0; color: #8a95a6; font-size: 12px; line-height: 1.6;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                            <p style="margin: 5px 0 0; word-break: break-all; font-size: 12px; line-height: 1.6;"><a href="{{ $verificationUrl }}" style="color: #8a6a16; text-decoration: underline;">{{ $verificationUrl }}</a></p>
                        </td>
                    </tr>
                </table>

                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 22px 16px 0; color: #8a95a6; font-size: 12px; line-height: 1.6;">
                            © {{ $year }} Sistema Jurídico. Todos los derechos reservados.<br>
                            Este es un mensaje automático; no respondas a este correo.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
