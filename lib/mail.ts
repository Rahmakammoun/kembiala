import nodemailer from 'nodemailer'

export async function sendPasswordEmail(to: string, password: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Votre mot de passe Kembiala',
    html: `
      <p>Bonjour,</p>
      <p>Un compte vient d'être créé pour vous sur la plateforme <strong>Kembiala</strong>.</p>
      <p><strong>Identifiant :</strong> ${to}</p>
      <p><strong>Mot de passe temporaire :</strong> ${password}</p>
      <p>Vous pouvez maintenant vous connecter et modifier votre mot de passe si nécessaire.</p>
      <br/>
      <p>— L’équipe Kembiala</p>
    `,
  })

  console.log('📧 E-mail envoyé :', info.messageId)
}
