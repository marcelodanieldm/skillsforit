// TypeScript declaration for ESM send-email.js
// This allows importing the ESM module from .ts files without type errors.
declare module './send-email' {
  export function sendMentoriaWelcomeEmail(args: any): Promise<any>;
  export function sendProductDeliveryEmail(args: any): Promise<any>;
  export function sendCVAnalysisConfirmation(args: any): Promise<any>;
  export function sendCVAnalysisResult(args: any): Promise<any>;
  export function sendMentorshipSessionConfirmation(args: any): Promise<any>;
  export function sendCartRecoveryEmail(args: any): Promise<any>;
  export function sendSessionReminderEmail(args: any): Promise<any>;
  export function sendUpsellOfferEmail(args: any): Promise<any>;
  export function sendFeedbackRequestEmail(args: any): Promise<any>;
}
