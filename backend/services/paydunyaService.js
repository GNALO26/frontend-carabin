const Paydunya = require('paydunya');

const setup = new Paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE || 'test'
});

exports.initiatePayment = async (paymentData) => {
  const invoice = new Paydunya.CheckoutInvoice(setup);

  // Ajouter un article
  invoice.addItem(
    paymentData.description || 'Abonnement Premium',
    1,
    paymentData.amount,
    paymentData.amount
  );

  invoice.totalAmount = paymentData.amount;
  invoice.description = paymentData.description || 'Abonnement Premium';

  // Ajouter des données personnalisées
  invoice.addCustomData('user_id', paymentData.userId);
  invoice.addCustomData('email', paymentData.email);
  invoice.addCustomData('phone', paymentData.phone);

  try {
    const response = await invoice.create();
    return {
      success: true,
      invoice_url: response.response_text,
      token: response.token
    };
  } catch (error) {
    console.error('Erreur lors de la création de la facture PayDunya:', error);
    throw new Error(error.message || 'Erreur lors de l\'initialisation du paiement');
  }
};

exports.verifyPayment = async (token) => {
  const invoice = new Paydunya.CheckoutInvoice(setup);
  try {
    const response = await invoice.confirm(token);
    return {
      status: response.status,
      response_text: response.response_text,
      transaction_id: response.transaction_id
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    throw new Error(error.message || 'Erreur lors de la vérification du paiement');
  }
};