module.exports = {
  mtn: {
    name: "MTN Mobile Money",
    merchantNumber: "0156035888",
    paymentSteps: [
      "Composez *126# sur votre téléphone",
      "Sélectionnez 'Paiements'",
      "Choisissez 'Payer une facture'",
      "Entrez le numéro: 0156035888",
      "Entrez le montant: {amount}",
      "Confirmez avec votre code secret"
    ],
    contact: "Contact MTN: 123 (gratuit)"
  },
  moov: {
    name: "Moov Money",
    merchantNumber: "0195103208",
    paymentSteps: [
      "Composez *155# sur votre téléphone",
      "Sélectionnez 'Paiements'",
      "Choisissez 'Payer un marchand'",
      "Entrez le code marchand: QUIZMED",
      "Entrez le montant: {amount}",
      "Confirmez avec votre code secret"
    ],
    contact: "Contact Moov: 1010 (gratuit)"
  },
  celtiis: {
    name: "Celtiis Money",
    merchantNumber: "0141996452",
    paymentSteps: [
      "Composez *555# sur votre téléphone",
      "Sélectionnez 'Transfert d'argent'",
      "Choisissez 'Paiement de service'",
      "Entrez le numéro: 0141996452",
      "Entrez le montant: {amount}",
      "Confirmez avec votre code PIN"
    ],
    contact: "Contact Celtiis: 555 (gratuit)"
  }
};