# ⚙️ Setup Guide - SkillsForIT

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- Accounts needed:
  - Stripe account (for payments)
  - OpenAI account (for AI analysis)
  - Gmail/SMTP account (for emails)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/marcelodanieldm/skillsforit.git
cd skillsforit
npm install
```

### 2. Environment Variables

Copy the example file and configure:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Stripe Keys (Get from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# OpenAI API Key (Get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_openai_key_here

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
PRODUCT_PRICE=7.00
```

### 3. Get API Keys

#### Stripe Setup
1. Go to https://dashboard.stripe.com/register
2. Navigate to Developers → API Keys
3. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Copy "Secret key" → `STRIPE_SECRET_KEY`
5. For webhook testing (see Webhook Setup below)

#### OpenAI Setup
1. Go to https://platform.openai.com/signup
2. Navigate to API Keys
3. Create new secret key
4. Copy key → `OPENAI_API_KEY`
5. Add billing information (pay-as-you-go)

#### Gmail Setup (for emails)
1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Use this password → `EMAIL_PASSWORD`
5. Use your email → `EMAIL_USER`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 5. Webhook Setup (for local testing)

To test Stripe webhooks locally:

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook

# Copy the webhook signing secret (whsec_...) to .env.local
```

## 🧪 Testing the Flow

### Test Cards (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 9995`
- Any future date for expiry
- Any 3 digits for CVC
- Any zip code

### Test Flow

1. Navigate to http://localhost:3000
2. Click "Optimizar mi CV por USD 7"
3. Upload a test CV (PDF or Word)
4. Fill the form with test data
5. Use test card for payment
6. Wait for processing
7. Check email for PDF report
8. Access dashboard at /dashboard

## 📂 Project Structure

```
skillsforit/
├── app/
│   ├── api/
│   │   ├── checkout/      # Stripe checkout session
│   │   ├── dashboard/     # User dashboard API
│   │   ├── upload/        # CV upload handler
│   │   └── webhook/       # Stripe webhook handler
│   ├── checkout/          # Checkout page
│   ├── dashboard/         # User dashboard
│   ├── success/           # Payment success page
│   ├── upload/            # CV upload page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── Hero.tsx
│   ├── BeforeAfterComparison.tsx
│   ├── Benefits.tsx
│   ├── HowItWorks.tsx
│   ├── Pricing.tsx
│   ├── Testimonials.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
├── lib/                   # Utilities
│   ├── ai-analysis.ts    # OpenAI integration
│   ├── database.ts       # In-memory database
│   ├── email.ts          # Nodemailer setup
│   ├── pdf-generator.ts  # PDF creation
│   └── stripe.ts         # Stripe helpers
├── public/
│   ├── uploads/          # Uploaded CVs
│   └── reports/          # Generated PDFs
└── .env.local            # Environment variables
```

## 🔧 Common Issues

### Issue: "Stripe webhook signature verification failed"
**Solution**: Make sure you're running `stripe listen` and using the correct webhook secret

### Issue: "OpenAI API key invalid"
**Solution**: Check that your API key is correct and has billing enabled

### Issue: "Email not sending"
**Solution**: 
- Verify Gmail app password is correct
- Check 2FA is enabled on Google account
- Try using a different SMTP provider

### Issue: "Module not found"
**Solution**: Run `npm install` again

### Issue: "Port 3000 already in use"
**Solution**: Kill the process or change port:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
PORT=3001 npm run dev
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Important for Production

1. **Database**: Migrate from in-memory to PostgreSQL/MongoDB
2. **File Storage**: Use AWS S3 or Cloudinary instead of local storage
3. **Webhook**: Configure production webhook in Stripe dashboard
4. **Domain**: Set `NEXT_PUBLIC_APP_URL` to your domain
5. **Email**: Consider using SendGrid or AWS SES for reliability

## 📊 Monitoring

- Check Stripe dashboard for payments
- Monitor OpenAI usage at platform.openai.com
- Review email delivery logs
- Check server logs for errors

## 🆘 Support

For issues:
1. Check this guide first
2. Review error messages in console
3. Check API key configurations
4. Review Stripe/OpenAI documentation

---

**Ready to launch!** 🎉
