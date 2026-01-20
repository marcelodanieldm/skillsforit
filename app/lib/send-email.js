// Envío de emails para SkillsForIT
const nodemailer = require('nodemailer');
const templates = require('./email-templates');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendMentoriaWelcomeEmail({ to, password, dashboardUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.mentoriaWelcome({ to, password, dashboardUrl }),
  });
}

function sendProductDeliveryEmail({ to, productName, downloadUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.productDelivery({ to, productName, downloadUrl }),
  });
}

function sendCVAnalysisConfirmation({ to, analysisId }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.cvAnalysisConfirmation({ to, analysisId }),
  });
}

function sendCVAnalysisResult({ to, analysisId, resultUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.cvAnalysisResult({ to, analysisId, resultUrl }),
  });
}

function sendMentorshipSessionConfirmation({ to, mentorName, sessionDate, sessionUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.mentorshipSessionConfirmation({ to, mentorName, sessionDate, sessionUrl }),
  });
}

function sendCartRecoveryEmail({ to, recoveryUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.cartRecovery({ to, recoveryUrl }),
  });
}

function sendSessionReminderEmail({ to, sessionDate, sessionUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.sessionReminder({ to, sessionDate, sessionUrl }),
  });
}

function sendUpsellOfferEmail({ to, offerUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.upsellOffer({ to, offerUrl }),
  });
}

function sendFeedbackRequestEmail({ to, feedbackUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.feedbackRequest({ to, feedbackUrl }),
  });
}

module.exports = {
  sendMentoriaWelcomeEmail,
  sendProductDeliveryEmail,
  sendCVAnalysisConfirmation,
  sendCVAnalysisResult,
  sendMentorshipSessionConfirmation,
  sendCartRecoveryEmail,
  sendSessionReminderEmail,
  sendUpsellOfferEmail,
  sendFeedbackRequestEmail,
};
