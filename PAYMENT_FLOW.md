# Payment Flow Integration - Stripe Setup

## Overview

Complete end-to-end payment flow with Stripe integration, session tracking, and database updates.

## Changes Made

### 1. **Plan Model** (`src/plans/plan.model.ts`)

- Added `stripeKey` field to store Stripe price IDs
- Maps to database column `stripe_key`
- This is the Stripe price ID that will be used for checkout

### 2. **StripeSession Model** (`src/stripe-sessions/stripe-session.model.ts`)

- Added `planId` field to track which plan was purchased
- Maintains userId, planId, stripeId, amount, and status
- Records all payment session attempts with status tracking:
  - `pending` - Initial state
  - `processing` - In progress
  - `succeeded` - Payment completed
  - `failed` - Payment failed
  - `canceled` - User canceled

### 3. **Stripe Controller** (`src/stripe/stripe.controller.ts`)

#### `createCheckoutSession()`

**Flow:**

1. Frontend sends POST `/stripe/checkout` with `{ planId }`
2. Backend validates user is authenticated (requires `req.user.id`)
3. Fetches Plan by `planId` and validates `stripeKey` exists
4. Creates Stripe checkout session with plan's `stripeKey`
5. Creates StripeSession database record (status: "pending")
6. Returns response with:
   ```json
   {
     "url": "https://checkout.stripe.com/...",
     "sessionId": "cs_...",
     "stripeSessionId": 123
   }
   ```

#### `handleWebhook()`

**Flow:**

1. Stripe sends `checkout.session.completed` webhook
2. Backend fetches StripeSession by `stripeId`
3. Fetches Plan by `planId` from StripeSession
4. Fetches User by `userId`
5. Updates StripeSession status to "succeeded" and sets `processedAt`
6. Updates User:
   - Sets `planId` to new plan
   - Adds plan's `credits` to user's `creditBalance`
7. Logs successful payment

### 4. **StripeSession Controller** (`src/stripe-sessions/stripe-session.controller.ts`)

- Enhanced to include Plan details in responses
- Users can track payment history with plan information
- Sessions are associated with both User and Plan

### 5. **Models Association** (`src/models/associations.ts`)

- Added Plan ↔ StripeSession relationship
- Added User ↔ StripeSession relationship
- Enables eager loading of related data in queries

## Database Schema Changes

### New Column in `stripe_sessions` table

```sql
ALTER TABLE stripe_sessions ADD COLUMN planId INTEGER NOT NULL REFERENCES plans(id);
ALTER TABLE stripe_sessions ADD INDEX (planId);
```

### New Column in `plans` table

```sql
ALTER TABLE plans ADD COLUMN stripe_key VARCHAR(255);
ALTER TABLE plans ADD INDEX (stripe_key);
```

## Frontend Integration

### 1. **Display Plans**

```typescript
// Fetch active plans
GET /
  plans /
  active[
    // Response includes stripeKey for reference if needed
    {
      id: 1,
      name: "Starter",
      price: 9.99,
      credits: 100,
      stripeKey: "price_1234567890",
      isActive: true,
    }
  ];
```

### 2. **Initiate Checkout**

```typescript
// Request checkout session
POST /stripe/checkout
Content-Type: application/json
Authorization: Bearer <user-token>

{
  "planId": 1
}

// Response
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "sessionId": "cs_...",
  "stripeSessionId": 123
}

// Redirect user to url
```

### 3. **Handle Payment Success**

```typescript
// After successful payment, Stripe redirects to:
// success_url: {origin}?session_id={CHECKOUT_SESSION_ID}&success=true

// You can:
// 1. Show success message
// 2. Fetch updated user to see new planId and creditBalance
GET /users/{userId}

// Response includes updated user with new plan:
{
  id: 1,
  email: "user@example.com",
  planId: 1,
  creditBalance: 500.50,  // Previous + plan credits
  plan: {
    id: 1,
    name: "Starter",
    credits: 100
  }
}
```

### 4. **Handle Payment Failure/Cancellation**

```typescript
// User can retry from:
// cancel_url: {origin}?canceled=true

// Check session status
GET /stripe-sessions/stripe-id/{stripeSessionId}

// Response
{
  id: 123,
  userId: 1,
  planId: 1,
  stripeId: "cs_...",
  amount: "9.99",
  status: "succeeded",  // or "failed", "pending", etc.
  processedAt: "2026-02-17T10:30:00Z"
}
```

## Testing Checklist

- [ ] Create a plan with `stripeKey` set to test Stripe price ID (e.g., `price_1234567890`)
- [ ] Authenticate user
- [ ] Call `POST /stripe/checkout` with planId
- [ ] Verify StripeSession is created with status "pending"
- [ ] Complete payment in Stripe test environment
- [ ] Verify webhook is received and processed
- [ ] Check StripeSession status is now "succeeded"
- [ ] Verify User planId is updated
- [ ] Verify User creditBalance is increased by plan.credits
- [ ] Test with Stripe test cards (e.g., `4242 4242 4242 4242` for success)

## Required Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe dashboard)
```

## API Endpoints Summary

| Method | Endpoint                               | Purpose                   |
| ------ | -------------------------------------- | ------------------------- |
| POST   | `/stripe/checkout`                     | Initiate checkout session |
| POST   | `/stripe/webhook`                      | Stripe webhook handler    |
| GET    | `/stripe-sessions`                     | List all sessions         |
| GET    | `/stripe-sessions/:id`                 | Get session by ID         |
| GET    | `/stripe-sessions/stripe-id/:stripeId` | Get session by Stripe ID  |
| GET    | `/stripe-sessions/user/:userId`        | Get user's sessions       |
| PATCH  | `/stripe-sessions/:id/status`          | Update session status     |

## Security Notes

- ✅ User authentication required for checkout
- ✅ Webhook signature verification (Stripe signature)
- ✅ Plan validation before creating Stripe session
- ✅ User validation before updating credits
- ✅ Stripe session records ensure idempotency (unique stripeId)
- ✅ Credits are only added after webhook confirmation (not before)

## Database Migration Example

If you need to create a migration file:

```typescript
// Migration to add stripe_key to plans and planId to stripe_sessions
export async function up(queryInterface, Sequelize) {
  // Add stripe_key to plans
  await queryInterface.addColumn("plans", "stripe_key", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  // Add index on stripe_key
  await queryInterface.addIndex("plans", ["stripe_key"]);

  // Add planId to stripe_sessions
  await queryInterface.addColumn("stripe_sessions", "planId", {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "plans",
      key: "id",
    },
  });

  // Add index on planId
  await queryInterface.addIndex("stripe_sessions", ["planId"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex("stripe_sessions", ["planId"]);
  await queryInterface.removeColumn("stripe_sessions", "planId");
  await queryInterface.removeIndex("plans", ["stripe_key"]);
  await queryInterface.removeColumn("plans", "stripe_key");
}
```
