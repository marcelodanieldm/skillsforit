# SkillsForIT - SaaS Platform

## � Documentación Completa

- **[📖 Setup Guide](SETUP.md)** - Guía completa de instalación y configuración
- **[🔄 Flow Diagrams](FLOW.md)** - Diagramas de flujo del servicio y arquitectura
- **[📝 Sprint 4 Documentation](SPRINT4.md)** - CEO Dashboard & Analytics
- **[📊 Sprint 5 Documentation](SPRINT5.md)** - Event Tracking & User Segmentation

## 🚀 Sprint 5: Arquitectura Base y Analytics Avanzados ✅ COMPLETED

Event tracking system, automatic user segmentation, and conversion funnel analytics.

### 🆕 New Features (Sprint 5)

#### Event Tracking System ✅
- **10+ Event Types**: page_view, form_start, form_complete, checkout, payment events
- **Session Tracking**: Automatic session ID generation and management
- **Metadata Capture**: Device type, referrer, page, service, user segment
- **Analytics API**: `/api/events` for tracking and metrics retrieval

#### User Segmentation ✅
- **Automatic Clustering**: Users categorized into Junior, Transition, Leadership
- **Smart Algorithm**: Based on profession keywords + years of experience
- **Personalized Recommendations**: Different services suggested per segment
- **Segment Distribution**: Real-time metrics on user distribution

#### Conversion Funnel Analytics ✅
- **5-Stage Funnel**: Landing → Form → Checkout → Payment → Completion
- **Drop-off Analysis**: Calculate abandonment rates at each stage
- **Conversion Rates**: Per-stage and global conversion metrics
- **Time in Stage**: Average time users spend in each funnel stage
- **Segment Performance**: Conversion rates compared across segments

#### Analytics Dashboard ✅
- **Route**: `/analytics`
- **KPI Cards**: Total users, visitors, checkouts, conversion rate
- **Funnel Visualization**: Bar charts showing visitor flow and drop-offs
- **Segment Distribution**: Pie chart with percentage breakdown
- **Conversion by Segment**: Comparative bar chart with progress bars
- **Insights & Recommendations**: Automated strategy suggestions

### Previous Sprints

## �🚀 Sprint 4: CEO Dashboard & Analytics ✅ COMPLETED

Comprehensive analytics dashboard with revenue insights and profession-based filtering.

### ✨ Features Implemented

#### Sprint 1: MVP & Landing Page ✅
- **Hero Section with AIDA Framework**
- **Before/After CV Comparison** (Interactive toggle)
- **Benefits, How It Works, Pricing, Testimonials**
- **Responsive Design with Framer Motion animations**

#### Sprint 2: Core SaaS Features ✅

**🔄 Complete User Flow:**
1. **Landing Page** → User sees value proposition
2. **Upload CV** → Drag & drop or file selector
3. **User Form** → Collects name, email, country, profession
4. **Checkout** → Secure Stripe payment ($7 USD)
5. **Processing** → AI analyzes CV automatically
6. **Email Delivery** → PDF report sent automatically
7. **Dashboard** → Access to all analyses

**💳 Payment Integration:**
- ✅ Stripe Checkout Session
- ✅ Secure payment processing
- ✅ Webhook handler for payment confirmation
- ✅ Automatic fulfillment after payment

**🤖 AI Analysis:**
- ✅ OpenAI GPT-4 integration
- ✅ CV text extraction
- ✅ Personalized analysis based on profession/country
- ✅ 15+ specific improvements
- ✅ ATS score calculation
- ✅ Problems identification with severity levels
- ✅ Strengths and recommendations

**📧 Email System:**
- ✅ Automatic email delivery after payment
- ✅ Professional HTML email template
- ✅ PDF attachment with full report
- ✅ Nodemailer integration

**📄 PDF Report Generation:**
- ✅ Professional PDF layout with jsPDF
- ✅ Includes scores, problems, improvements
- ✅ Before/after examples

#### Sprint 3: Mentorship System ✅

**👨‍🏫 Mentor Features:**
- ✅ Mentor registration with bio, expertise, and hourly rate
- ✅ Availability calendar (day/time slots configuration)
- ✅ Rating and review system
- ✅ LinkedIn profile integration
- ✅ Mentor dashboard with upcoming/completed sessions
- ✅ **Session notes system** - Add notes after each session
- ✅ **Previous session history** - View mentee's last session notes before new meeting
- ✅ Session status tracking (scheduled/completed/cancelled/no-show)

**📅 Booking System (Calendly-like):**
- ✅ Browse mentors by expertise
- ✅ Filter mentors by skills
- ✅ View mentor ratings and reviews
- ✅ 7-day calendar view
- ✅ 10-minute time slot selection
- ✅ Availability validation
- ✅ Booking form with mentee details
- ✅ Stripe payment for mentorship sessions
- ✅ Google Meet link generation
- ✅ Confirmation page with meeting details

**📝 Session Notes (Core User Story):**
- ✅ **View previous session notes** before new meeting
- ✅ Add session notes with:
  - Content summary
  - Topics discussed
  - Action items
  - Next steps
- ✅ Notes displayed to mentor before next session with same mentee
- ✅ Full session history tracking

**💰 Mentorship Pricing:**
- Flexible pricing: $10-$100 per 10-min session
- Default rate slider in registration
- Separate Stripe checkout for mentorships
- Payment required before booking confirmation

#### Sprint 4: CEO Dashboard & Analytics ✅

**📊 Analytics Dashboard (Core User Story):**
- ✅ **Profession filter dropdown** - Filter all data by user profession
- ✅ **Revenue by Profession chart** - Identify most profitable niches
- ✅ **Top 3 professions podium** (🥇🥈🥉) - Quick visual reference
- ✅ Real-time data filtering and refresh
- ✅ Visual indicator for active filter

**📈 KPIs & Metrics:**
- ✅ Total Revenue - Overall business performance
- ✅ Total Customers - Unique customer count
- ✅ Avg Revenue Per Customer - Customer value metric
- ✅ Projected Monthly Revenue - Growth forecasting

**📉 Data Visualizations:**
- ✅ **Bar Chart** - Revenue & customer count by profession
- ✅ **Pie Chart** - CV Analysis vs Mentorship revenue split
- ✅ **Line Chart** - Daily revenue trend (30 days)
- ✅ **Grid Cards** - Top countries by revenue

**💾 Revenue Tracking:**
- ✅ Automatic tracking on all Stripe payments
- ✅ CV Analysis payments ($7 USD) with profession/country
- ✅ Mentorship payments (variable) tracked
- ✅ RevenueRecord model with full metadata

**🔍 Analytics Queries:**
- ✅ Revenue by profession (with filter)
- ✅ Revenue by service type
- ✅ Revenue by country
- ✅ Daily revenue time series
- ✅ Aggregate calculations (totals, averages, percentages)

**🎨 Dashboard Features:**
- ✅ Recharts integration for professional charts
- ✅ Responsive grid layouts
- ✅ Color-coded KPIs (green=$, blue=users, purple=avg, yellow=projection)
- ✅ Hover tooltips with formatted data
- ✅ Loading states and error handling

**👤 Dashboard:**
- ✅ Email-based access (MVP authentication)
- ✅ View all analyses
- ✅ Download PDF reports
- ✅ Status tracking (pending/processing/completed)
- ✅ Score visualization

### 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Icons

**Backend:**
- Next.js API Routes
- Stripe (Payments & Webhooks)
- OpenAI GPT-4 (AI Analysis)
- Nodemailer (Email)
- jsPDF (PDF Generation)

**Storage (MVP):**
- In-memory database (for MVP)
- File system for uploads/reports
- Ready to migrate to PostgreSQL/MongoDB

### 📦 Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Required API Keys:
# - STRIPE_SECRET_KEY (from https://stripe.com)
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_WEBHOOK_SECRET
# - OPENAI_API_KEY (from https://openai.com)
# - EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD

# Run development server
npm run dev
```

### 🌐 Routes

- `/` - Landing page
- `/upload` - CV upload & form
- `/checkout?id={analysisId}` - Stripe checkout
- `/success?session_id={sessionId}` - Payment confirmation
- `/dashboard` - User dashboard
- `/api/upload` - Upload CV endpoint
- `/api/checkout` - Create Stripe session
- `/api/webhook` - Stripe webhook handler
- `/api/dashboard` - Get user analyses

### 🔐 Environment Variables

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=app_specific_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PRODUCT_PRICE=7.00
```

### 🔄 User Flow Diagram

```
┌─────────────┐
│ Landing Page│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Upload CV  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  User Form  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Checkout   │ ◄───► Stripe
└──────┬──────┘
       │ (Payment Success)
       ▼
┌─────────────┐
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI Analysis │ ◄───► OpenAI GPT-4
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Generate PDF │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Send Email  │ ◄───► Nodemailer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### 🧪 Testing Webhook Locally

To test Stripe webhooks locally, use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook

# Use test cards for checkout:
# 4242 4242 4242 4242 (Success)
# 4000 0000 0000 9995 (Declined)
```

### 📊 Data Flow

**CV Analysis Flow:**
1. **User uploads CV** → Stored in `/public/uploads/`
2. **Payment confirmed** → Webhook triggers analysis
3. **AI analyzes CV** → OpenAI processes content
4. **PDF generated** → Saved in `/public/reports/`
5. **Email sent** → PDF attached automatically
6. **Dashboard updated** → User can download report

**Mentorship Flow:**
1. **Mentor registers** → Profile created with availability
2. **User browses mentors** → Filters by expertise
3. **User selects time slot** → From mentor's availability
4. **Payment processed** → Stripe checkout for mentorship
5. **Session booked** → Google Meet link generated
6. **Before session** → Mentor views previous session notes
7. **After session** → Mentor adds notes for next time

### 🎯 Next Steps (Sprint 4 - Future Enhancements)

**Authentication & Security:**
- [ ] Implement proper authentication (JWT/NextAuth)
- [ ] Password hashing with bcrypt
- [ ] Email verification
- [ ] OAuth integration (Google/LinkedIn)

**Database & Storage:**
- [ ] Migrate to PostgreSQL database
- [ ] Move files to S3/Cloud Storage
- [ ] Database backups and recovery

**Mentorship Enhancements:**
- [ ] Mentee session history dashboard
- [ ] Video call integration (Zoom API)
- [ ] Calendar sync (Google Calendar)
- [ ] Automated reminder emails
- [ ] Rescheduling functionality
- [ ] Mentor availability bulk update
- [ ] Group mentorship sessions

**Payment & Billing:**
- [ ] Payment history and invoices
- [ ] Refund system
- [ ] Subscription model for unlimited mentorships
- [ ] Multiple payment methods (PayPal, etc.)
- [ ] Mentor payout system

**Analytics & Admin:**
- [ ] Admin dashboard
- [ ] Analytics for CV analysis
- [ ] Mentorship session analytics
- [ ] Revenue tracking
- [ ] User behavior tracking

**Additional Features:**
- [ ] A/B testing for landing page
- [ ] CV templates download
- [ ] LinkedIn profile optimization service
- [ ] Interview preparation module
- [ ] Career path recommendations

### 🐛 Known Limitations (MVP)

**General:**
- In-memory database (resets on server restart)
- Files stored locally (should use S3/Cloud Storage)
- Simple auth system (no password hashing yet)

**CV Analysis:**
- Mock PDF extraction (needs proper PDF parsing in production)
- No admin panel yet

**Mentorship:**
- No real video integration (using mock Google Meet links)
- Availability doesn't check for time zone conflicts
- No notification system for upcoming sessions
- No cancellation/rescheduling feature yet
- No mentor verification process

### 📝 Notes

**CV Analysis:**
- All CTAs on landing page redirect to `/upload`
- Email delivery requires valid SMTP credentials
- OpenAI API key required for AI analysis
- Stripe webhook must be configured for production
- PDF reports are automatically attached to emails

**Mentorship:**
- Mentors can set custom hourly rates ($10-$100)
- Sessions are fixed at 10 minutes
- **Previous session notes** automatically shown to mentor before new session with same mentee
- Session notes include: content, topics, action items, next steps
- All bookings require Stripe payment confirmation
- Meeting links are generated automatically

---

**MVP Status**: ✅ Fully Functional SaaS with Mentorship
**Revenue Ready**: ✅ Yes - Can process CV analysis ($7) and mentorship payments ($10-$100)
**Automated**: ✅ Complete automation from payment to delivery
**Mentorship Ready**: ✅ Full booking, payment, and session notes system
