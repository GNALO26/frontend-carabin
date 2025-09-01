const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction pour envoyer un code d'accès
async function sendAccessCode(email, code, expiryDate) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Votre code d\'accès unique - Quiz de Carabin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4361ee;">Bienvenue sur Quiz de Carabin!</h2>
        <p>Votre abonnement a été activé avec succès. Voici votre code d'accès unique.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; color: #4361ee;">Votre code d'accès unique:</h3>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #212529; margin: 15px 0;">${code}</div>
          <p style="margin: 0; color: #6c757d;">
            Valable jusqu'au ${expiryDate.toLocaleDateString('fr-FR')} à ${expiryDate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">Important:</h4>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Ce code est à usage unique et personnel</li>
            <li>Il ne peut être utilisé que par votre compte</li>
            <li>Après utilisation, il ne sera plus valable</li>
          </ul>
        </div>
        
        <p>Utilisez ce code dans votre espace membre pour activer votre abonnement premium.</p>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
        <p style="color: #6c757d; font-size: 14px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
}

module.exports = { sendAccessCode };