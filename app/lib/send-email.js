
import nodemailer from 'nodemailer';
import templates from './email-templates.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export function sendMentoriaWelcomeEmail({ to, password, dashboardUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.mentoriaWelcome({ to, password, dashboardUrl }),
  });
}

export function sendProductDeliveryEmail({ to, productName, downloadUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.productDelivery({ to, productName, downloadUrl }),
  });
}

export function sendCVAnalysisConfirmation({ to, analysisId }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.cvAnalysisConfirmation({ to, analysisId }),
  });
}

export function sendCVAnalysisResult({ to, analysisId, resultUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.cvAnalysisResult({ to, analysisId, resultUrl }),
  });
}

export function sendMentorshipSessionConfirmation({ to, mentorName, sessionDate, sessionUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.mentorshipSessionConfirmation({ to, mentorName, sessionDate, sessionUrl }),
  });
}

export function sendCartRecoveryEmail({ to, recoveryUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.cartRecovery({ to, recoveryUrl }),
  });
}

export function sendSessionReminderEmail({ to, sessionDate, sessionUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.sessionReminder({ to, sessionDate, sessionUrl }),
  });
}

export function sendUpsellOfferEmail({ to, offerUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.upsellOffer({ to, offerUrl }),
  });
}

export function sendFeedbackRequestEmail({ to, feedbackUrl }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    ...templates.feedbackRequest({ to, feedbackUrl }),
  });
}
