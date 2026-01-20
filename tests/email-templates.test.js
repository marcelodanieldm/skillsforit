const {
  sendMentoriaWelcomeEmail,
  sendProductDeliveryEmail,
  sendCVAnalysisConfirmation,
  sendCVAnalysisResult,
  sendMentorshipSessionConfirmation,
  sendCartRecoveryEmail,
  sendSessionReminderEmail,
  sendUpsellOfferEmail,
  sendFeedbackRequestEmail
} = require('../app/lib/send-email');

describe('Email templates integration', () => {
  it('should send mentoria welcome email', async () => {
    await expect(sendMentoriaWelcomeEmail({
      to: 'test@mailtrap.io',
      password: 'demo123',
      dashboardUrl: 'https://skillsforit.com/dashboard'
    })).resolves.toBeDefined();
  });

  it('should send product delivery email', async () => {
    await expect(sendProductDeliveryEmail({
      to: 'test@mailtrap.io',
      productName: 'Curso React',
      downloadUrl: 'https://skillsforit.com/download'
    })).resolves.toBeDefined();
  });

  it('should send CV analysis confirmation email', async () => {
    await expect(sendCVAnalysisConfirmation({
      to: 'test@mailtrap.io',
      analysisId: 'A12345'
    })).resolves.toBeDefined();
  });

  it('should send CV analysis result email', async () => {
    await expect(sendCVAnalysisResult({
      to: 'test@mailtrap.io',
      analysisId: 'A12345',
      resultUrl: 'https://skillsforit.com/result'
    })).resolves.toBeDefined();
  });

  it('should send mentorship session confirmation email', async () => {
    await expect(sendMentorshipSessionConfirmation({
      to: 'test@mailtrap.io',
      mentorName: 'Ana Mentor',
      sessionDate: '2026-01-21 18:00',
      sessionUrl: 'https://skillsforit.com/session',
      userName: 'Carlos'
    })).resolves.toBeDefined();
  });

  it('should send cart recovery email', async () => {
    await expect(sendCartRecoveryEmail({
      to: 'test@mailtrap.io',
      recoveryUrl: 'https://skillsforit.com/cart',
      productName: 'Curso React'
    })).resolves.toBeDefined();
  });

  it('should send session reminder email', async () => {
    await expect(sendSessionReminderEmail({
      to: 'test@mailtrap.io',
      mentorName: 'Ana Mentor',
      sessionDate: '2026-01-22 10:00',
      sessionUrl: 'https://skillsforit.com/session',
      userName: 'Carlos'
    })).resolves.toBeDefined();
  });

  it('should send upsell offer email', async () => {
    await expect(sendUpsellOfferEmail({
      to: 'test@mailtrap.io',
      userName: 'Carlos',
      productName: 'Mentoría Premium',
      discount: '20%',
      offerUrl: 'https://skillsforit.com/upsell'
    })).resolves.toBeDefined();
  });

  it('should send feedback request email', async () => {
    await expect(sendFeedbackRequestEmail({
      to: 'test@mailtrap.io',
      userName: 'Carlos',
      productName: 'Curso React',
      mentorName: 'Ana Mentor',
      feedbackUrl: 'https://skillsforit.com/feedback'
    })).resolves.toBeDefined();
  });
});
