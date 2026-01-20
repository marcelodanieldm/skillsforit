import { test, expect } from '@playwright/test';

const flows = [
  {
    id: 'mentoriaWelcome',
    label: 'Mentoría Welcome',
    testData: { to: 'test@mailtrap.io', password: 'demo123', dashboardUrl: 'https://skillsforit.com/dashboard' }
  },
  {
    id: 'productDelivery',
    label: 'Product Delivery',
    testData: { to: 'test@mailtrap.io', productName: 'Curso React', downloadUrl: 'https://skillsforit.com/download' }
  },
  {
    id: 'cvAnalysisConfirmation',
    label: 'CV Analysis Confirmation',
    testData: { to: 'test@mailtrap.io', analysisId: 'A12345' }
  },
  {
    id: 'cvAnalysisResult',
    label: 'CV Analysis Result',
    testData: { to: 'test@mailtrap.io', analysisId: 'A12345', resultUrl: 'https://skillsforit.com/result' }
  },
  {
    id: 'mentorshipSessionConfirmation',
    label: 'Mentorship Session Confirmation',
    testData: { to: 'test@mailtrap.io', mentorName: 'Ana Mentor', sessionDate: '2026-01-21 18:00', sessionUrl: 'https://skillsforit.com/session', userName: 'Carlos' }
  },
  {
    id: 'cartRecovery',
    label: 'Cart Recovery',
    testData: { to: 'test@mailtrap.io', recoveryUrl: 'https://skillsforit.com/cart', productName: 'Curso React' }
  },
  {
    id: 'sessionReminder',
    label: 'Session Reminder',
    testData: { to: 'test@mailtrap.io', mentorName: 'Ana Mentor', sessionDate: '2026-01-22 10:00', sessionUrl: 'https://skillsforit.com/session', userName: 'Carlos' }
  },
  {
    id: 'upsellOffer',
    label: 'Upsell Offer',
    testData: { to: 'test@mailtrap.io', userName: 'Carlos', productName: 'Mentoría Premium', discount: '20%', offerUrl: 'https://skillsforit.com/upsell' }
  },
  {
    id: 'feedbackRequest',
    label: 'Feedback Request',
    testData: { to: 'test@mailtrap.io', userName: 'Carlos', productName: 'Curso React', mentorName: 'Ana Mentor', feedbackUrl: 'https://skillsforit.com/feedback' }
  }
];

test.describe('Email templates E2E', () => {
  for (const flow of flows) {
    test(`Send email for ${flow.label}`, async ({ request }) => {
      const response = await request.post('/api/email-templates/test', {
        data: { id: flow.id, data: flow.testData }
      });
      expect(response.ok()).toBeTruthy();
      const json = await response.json();
      expect(json.success).toBeTruthy();
    });
  }
});
