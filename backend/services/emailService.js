const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendAccessCode(email, accessCode, expiryDate) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5">
      <h2>Quiz de Carabin — Code d'accès</h2>
      <p>Bonjour,</p>
      <p>Merci pour votre paiement. Voici votre code d'accès <strong>valable 30 jours</strong> :</p>
      <p style="font-size:22px; font-weight:bold; letter-spacing:2px">${accessCode}</p>
      <p>Date d'expiration : <strong>${new Date(expiryDate).toLocaleString()}</strong></p>
      <p>Pour activer votre accès premium, entrez ce code sur la page de validation.</p>
      <p>Cordialement,<br/>Équipe Quiz de Carabin</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Quiz de Carabin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Votre code d'accès — Quiz de Carabin (30 jours)",
    text: `Votre code d'accès: ${accessCode} (expire le ${new Date(expiryDate).toLocaleString()})`,
    html
  });

  console.log('✉️  Email envoyé à %s (%s)', email, info.messageId);
  return true;
}

module.exports = { sendAccessCode };
