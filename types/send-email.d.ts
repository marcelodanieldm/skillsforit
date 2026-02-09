// TypeScript declaration for ESM send-email.js (universal for all import styles)
declare module '../../lib/send-email' {
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
declare module 'app/lib/send-email' {
  export * from '../../lib/send-email';
}
declare module 'app/lib/send-email.js' {
  export * from '../../lib/send-email';
}
declare module '../../lib/send-email.js' {
  export * from '../../lib/send-email';
}
