# 📋 Price Books & Plans API Documentation

**Base URL:** `http://localhost:3000/api`

---

## 🔹 Price Books Endpoints

### 1. Get All Price Books

```bash
GET /price-books
```

Returns all price book versions with their associated plans.

**Response:**

```json
[
  {
    "id": 1,
    "versionTag": "v1.0",
    "creditsPerEnhancement": 1,
    "effectiveFrom": "2026-01-01T00:00:00.000Z",
    "termsOfService": "Standard terms",
    "plans": [
      {
        "id": 1,
        "name": "FREE",
        "price": "0.00",
        "credits": 10,
        "description": "Free tier",
        "isActive": true,
        "priceBookId": 1
      }
    ]
  }
]
```

---

### 2. Get Current Active Price Book

```bash
GET /price-books/current
```

Returns the currently active price book with all plans.

**Response:**

```json
{
  "id": 1,
  "versionTag": "v1.0",
  "creditsPerEnhancement": 1,
  "effectiveFrom": "2026-01-01T00:00:00.000Z",
  "termsOfService": "Standard terms",
  "plans": [...]
}
```

---

### 3. Get Current Active Plans Only ⭐ _Most Used for Frontend_

```bash
GET /price-books/current/plans
```

Returns only active plans from current price book.

**cURL Example:**

```bash
curl http://localhost:3000/api/price-books/current/plans
```

**Response:**

```json
{
  "plans": [
    {
      "id": 1,
      "name": "FREE",
      "price": "0.00",
      "credits": 10,
      "description": "Free tier with 10 credits",
      "isActive": true
    },
    {
      "id": 2,
      "name": "STARTER",
      "price": "9.99",
      "credits": 100,
      "description": "Starter plan with 100 credits",
      "isActive": true
    },
    {
      "id": 3,
      "name": "PRO",
      "price": "29.99",
      "credits": 500,
      "description": "Pro plan with 500 credits",
      "isActive": true
    }
  ],
  "creditsPerEnhancement": 1,
  "versionTag": "v1.0"
}
```

---

### 4. Get Specific Plan by Name

```bash
GET /price-books/current/plans/:planName
```

Get details of a specific plan (e.g., FREE, STARTER, PRO).

**cURL Example:**

```bash
curl http://localhost:3000/api/price-books/current/plans/PRO
```

**Response:**

```json
{
  "id": 3,
  "name": "PRO",
  "price": "29.99",
  "credits": 500,
  "description": "Pro plan with 500 credits",
  "isActive": true,
  "priceBookId": 1
}
```

---

### 5. Get Price Book by ID

```bash
GET /price-books/:id
```

**cURL Example:**

```bash
curl http://localhost:3000/api/price-books/1
```

---

### 6. Create Price Book (Admin Only)

```bash
POST /price-books
Content-Type: application/json
```

**Request Body:**

```json
{
  "versionTag": "v1.1",
  "creditsPerEnhancement": 1,
  "effectiveFrom": "2026-02-01T00:00:00.000Z",
  "termsOfService": "Updated terms"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/price-books \
  -H "Content-Type: application/json" \
  -d '{
    "versionTag": "v1.1",
    "creditsPerEnhancement": 1,
    "effectiveFrom": "2026-02-01T00:00:00.000Z",
    "termsOfService": "Updated terms"
  }'
```

---

### 7. Update Price Book (Admin Only)

```bash
PUT /price-books/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "creditsPerEnhancement": 2
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/price-books/1 \
  -H "Content-Type: application/json" \
  -d '{"creditsPerEnhancement": 2}'
```

---

### 8. Delete Price Book (Admin Only)

```bash
DELETE /price-books/:id
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/price-books/1
```

---

## 🔹 Plans Endpoints

### 1. Get All Plans

```bash
GET /plans
```

Returns all plans from all price books.

**cURL Example:**

```bash
curl http://localhost:3000/api/plans
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "FREE",
    "price": "0.00",
    "credits": 10,
    "description": "Free tier",
    "isActive": true,
    "priceBookId": 1,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Get Active Plans

```bash
GET /plans/active
```

Returns only active plans.

**cURL Example:**

```bash
curl http://localhost:3000/api/plans/active
```

---

### 3. Get Plan by Name

```bash
GET /plans/name/:name
```

**cURL Example:**

```bash
curl http://localhost:3000/api/plans/name/STARTER
```

**Response:**

```json
{
  "id": 2,
  "name": "STARTER",
  "price": "9.99",
  "credits": 100,
  "description": "Starter plan",
  "isActive": true,
  "priceBookId": 1
}
```

---

### 4. Get Plan by ID

```bash
GET /plans/:id
```

**cURL Example:**

```bash
curl http://localhost:3000/api/plans/2
```

---

### 5. Create Plan (Admin Only)

```bash
POST /plans
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "ENTERPRISE",
  "price": 99.99,
  "credits": 2000,
  "description": "Enterprise plan with unlimited features",
  "isActive": true,
  "priceBookId": 1
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ENTERPRISE",
    "price": 99.99,
    "credits": 2000,
    "description": "Enterprise plan",
    "isActive": true,
    "priceBookId": 1
  }'
```

---

### 6. Update Plan (Admin Only)

```bash
PUT /plans/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "price": 19.99,
  "credits": 150
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/plans/2 \
  -H "Content-Type: application/json" \
  -d '{"price": 19.99, "credits": 150}'
```

---

### 7. Delete Plan (Admin Only)

```bash
DELETE /plans/:id
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/plans/2
```

---

## 💡 Frontend Integration Guide

### Recommended Endpoint for Pricing Page

Use the **Get Current Active Plans** endpoint for displaying pricing tiers:

```javascript
// JavaScript/TypeScript Example
async function fetchPlans() {
  const response = await fetch(
    "http://localhost:3000/api/price-books/current/plans",
  );
  const data = await response.json();

  console.log(data.plans); // Array of active plans
  console.log(data.creditsPerEnhancement); // Credits per action
  console.log(data.versionTag); // Current pricing version

  return data;
}
```

---

### React/Next.js Integration Example

```typescript
import { useEffect, useState } from 'react';

interface Plan {
  id: number;
  name: string;
  price: string;
  credits: number;
  description?: string;
  isActive: boolean;
}

interface PricingData {
  plans: Plan[];
  creditsPerEnhancement: number;
  versionTag: string;
}

export function PricingPage() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPricing() {
      try {
        const res = await fetch('/api/price-books/current/plans');
        const data = await res.json();
        setPricing(data);
      } catch (error) {
        console.error('Failed to load pricing:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPricing();
  }, []);

  if (loading) return <div>Loading pricing...</div>;
  if (!pricing) return <div>Failed to load pricing</div>;

  return (
    <div className="pricing-grid">
      {pricing.plans.map(plan => (
        <div key={plan.id} className="pricing-card">
          <h3>{plan.name}</h3>
          <p className="price">${plan.price}/mo</p>
          <p>{plan.credits} credits</p>
          <p>{plan.description}</p>
          <button>Choose Plan</button>
        </div>
      ))}
    </div>
  );
}
```

---

### Vue.js Integration Example

```vue
<template>
  <div v-if="loading">Loading pricing...</div>
  <div v-else-if="pricing" class="pricing-grid">
    <div v-for="plan in pricing.plans" :key="plan.id" class="pricing-card">
      <h3>{{ plan.name }}</h3>
      <p class="price">${{ plan.price }}/mo</p>
      <p>{{ plan.credits }} credits</p>
      <p>{{ plan.description }}</p>
      <button>Choose Plan</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Plan {
  id: number;
  name: string;
  price: string;
  credits: number;
  description?: string;
}

const pricing = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch("/api/price-books/current/plans");
    pricing.value = await res.json();
  } catch (error) {
    console.error("Failed to load pricing:", error);
  } finally {
    loading.value = false;
  }
});
</script>
```

---

## 🎯 Key Concepts

### Price Books

- **Version Control**: Each price book has a `versionTag` for tracking pricing versions
- **Effective Date**: `effectiveFrom` determines when a price book becomes active
- **Current Active**: Only one price book is active at a time (latest by `effectiveFrom`)
- **Credits System**: `creditsPerEnhancement` defines how many credits each action costs

### Plans

- **Belongs to Price Book**: Each plan is associated with a specific price book
- **Active Status**: Only `isActive: true` plans are shown to users
- **Pricing Tiers**: Common tiers are FREE, STARTER, PRO, ENTERPRISE
- **Credits**: Number of credits included in each plan determines usage limits

---

## 🔐 Authentication

Admin endpoints require authentication:

```bash
# Add Authorization header with JWT token
curl -X POST http://localhost:3000/api/price-books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"versionTag": "v1.1", ...}'
```

---

## 📊 Data Models

### PriceBook Model

```typescript
{
  id: number;
  versionTag: string;           // e.g., "v1.0", "v2.0"
  creditsPerEnhancement: number; // Credits per action
  effectiveFrom: Date;          // When this version becomes active
  termsOfService: string;       // Terms and conditions
  createdAt: Date;
  updatedAt: Date;
  plans: Plan[];                // Associated plans
}
```

### Plan Model

```typescript
{
  id: number;
  name: string;                 // e.g., "FREE", "PRO"
  price: number;                // Decimal price
  credits: number;              // Credits included
  description?: string;         // Plan description
  isActive: boolean;            // Is plan available
  priceBookId: number;          // Foreign key to price book
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 Best Practices for Frontend

1. **Cache Plans Data**: Plans don't change frequently, consider caching for 1 hour
2. **Handle Loading States**: Always show loading indicators
3. **Error Handling**: Gracefully handle API failures
4. **Display Credits**: Show credit limits clearly to users
5. **Price Formatting**: Format prices with proper currency symbols
6. **Active Plans Only**: Filter and display only active plans
7. **Responsive Design**: Make pricing cards mobile-friendly

---

## 🚀 Quick Start - Setup Pricing

### Step 1: Create a Price Book

First, create a price book to hold your pricing structure:

```bash
curl -X POST http://localhost:3000/api/price-books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "versionTag": "v1.0",
    "creditsPerEnhancement": 1,
    "effectiveFrom": "2026-01-01T00:00:00.000Z",
    "termsOfService": "Standard terms and conditions"
  }'
```

**Response:**

```json
{
  "id": 1,
  "versionTag": "v1.0",
  "creditsPerEnhancement": 1,
  "effectiveFrom": "2026-01-01T00:00:00.000Z",
  "termsOfService": "Standard terms and conditions",
  "createdAt": "2026-01-21T00:00:00.000Z",
  "updatedAt": "2026-01-21T00:00:00.000Z"
}
```

**Note the `id` (1 in this example) - you'll need it for creating plans!**

---

### Step 2: Create Plans

Now create plans associated with your price book. Use the `priceBookId` from Step 1:

**Create FREE Plan:**

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "FREE",
    "price": 0,
    "credits": 10,
    "description": "Free tier with 10 credits per month",
    "isActive": true,
    "priceBookId": 1
  }'
```

**Create STARTER Plan:**

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "STARTER",
    "price": 9.99,
    "credits": 100,
    "description": "Starter plan with 100 credits per month",
    "isActive": true,
    "priceBookId": 1
  }'
```

**Create PRO Plan:**

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "PRO",
    "price": 29.99,
    "credits": 500,
    "description": "Pro plan with 500 credits per month",
    "isActive": true,
    "priceBookId": 1
  }'
```

**Create ENTERPRISE Plan:**

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "ENTERPRISE",
    "price": 99.99,
    "credits": 2000,
    "description": "Enterprise plan with 2000 credits per month",
    "isActive": true,
    "priceBookId": 1
  }'
```

---

### Step 3: Verify Your Setup

Check that everything is set up correctly:

```bash
# Get current active plans
curl http://localhost:3000/api/price-books/current/plans
```

**Expected Response:**

```json
{
  "plans": [
    {
      "id": 1,
      "name": "FREE",
      "price": "0.00",
      "credits": 10,
      "description": "Free tier with 10 credits per month",
      "isActive": true
    },
    {
      "id": 2,
      "name": "STARTER",
      "price": "9.99",
      "credits": 100,
      "description": "Starter plan with 100 credits per month",
      "isActive": true
    },
    {
      "id": 3,
      "name": "PRO",
      "price": "29.99",
      "credits": 500,
      "description": "Pro plan with 500 credits per month",
      "isActive": true
    },
    {
      "id": 4,
      "name": "ENTERPRISE",
      "price": "99.99",
      "credits": 2000,
      "description": "Enterprise plan with 2000 credits per month",
      "isActive": true
    }
  ],
  "creditsPerEnhancement": 1,
  "versionTag": "v1.0"
}
```

---

### Step 4: Use in Frontend

Now your pricing is ready! Use it in your frontend:

```bash
# 1. Fetch pricing for your app
curl http://localhost:3000/api/price-books/current/plans

# 2. Display plans in your pricing page
# Use the response to render pricing cards

# 3. When user selects a plan, use the plan name/id
# to create Stripe checkout or update user subscription
```

---

## 🔄 Updating Pricing (Create New Version)

When you need to change pricing, create a new price book version:

### Step 1: Create New Price Book Version

```bash
curl -X POST http://localhost:3000/api/price-books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "versionTag": "v2.0",
    "creditsPerEnhancement": 1,
    "effectiveFrom": "2026-03-01T00:00:00.000Z",
    "termsOfService": "Updated terms and conditions"
  }'
```

**Response:** (Note the new `id: 2`)

```json
{
  "id": 2,
  "versionTag": "v2.0",
  ...
}
```

### Step 2: Create Plans for New Version

Create new plans with updated pricing using the new `priceBookId: 2`:

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "FREE",
    "price": 0,
    "credits": 15,
    "description": "Free tier with 15 credits per month (Updated!)",
    "isActive": true,
    "priceBookId": 2
  }'
```

Repeat for all your plan tiers with new pricing...

### Step 3: Deactivate Old Plans (Optional)

If you want to completely switch to new pricing:

```bash
# Deactivate old FREE plan
curl -X PUT http://localhost:3000/api/plans/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"isActive": false}'
```

---

## 📝 Complete Setup Script

Here's a complete bash script to set up your pricing:

```bash
#!/bin/bash

# Set your admin token
TOKEN="YOUR_ADMIN_TOKEN"
BASE_URL="http://localhost:3000/api"

# Step 1: Create Price Book
echo "Creating price book..."
PRICEBOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/price-books" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "versionTag": "v1.0",
    "creditsPerEnhancement": 1,
    "effectiveFrom": "2026-01-01T00:00:00.000Z",
    "termsOfService": "Standard terms"
  }')

# Extract price book ID
PRICEBOOK_ID=$(echo $PRICEBOOK_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Price Book ID: $PRICEBOOK_ID"

# Step 2: Create Plans
echo "Creating FREE plan..."
curl -s -X POST "$BASE_URL/plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"FREE\",
    \"price\": 0,
    \"credits\": 10,
    \"description\": \"Free tier with 10 credits\",
    \"isActive\": true,
    \"priceBookId\": $PRICEBOOK_ID
  }"

echo "Creating STARTER plan..."
curl -s -X POST "$BASE_URL/plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"STARTER\",
    \"price\": 9.99,
    \"credits\": 100,
    \"description\": \"Starter plan with 100 credits\",
    \"isActive\": true,
    \"priceBookId\": $PRICEBOOK_ID
  }"

echo "Creating PRO plan..."
curl -s -X POST "$BASE_URL/plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"PRO\",
    \"price\": 29.99,
    \"credits\": 500,
    \"description\": \"Pro plan with 500 credits\",
    \"isActive\": true,
    \"priceBookId\": $PRICEBOOK_ID
  }"

echo "Creating ENTERPRISE plan..."
curl -s -X POST "$BASE_URL/plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"ENTERPRISE\",
    \"price\": 99.99,
    \"credits\": 2000,
    \"description\": \"Enterprise plan with 2000 credits\",
    \"isActive\": true,
    \"priceBookId\": $PRICEBOOK_ID
  }"

echo "Setup complete! Verifying..."
curl -s "$BASE_URL/price-books/current/plans" | json_pp
```

**Usage:**

```bash
chmod +x setup-pricing.sh
./setup-pricing.sh
```

---

## ❓ FAQ

**Q: Which endpoint should I use for the pricing page?**  
A: Use `GET /price-books/current/plans` - it returns only active plans with clean data.

**Q: How do I know which plans are available?**  
A: All plans returned from `/current/plans` are active and available.

**Q: What's the difference between price-books and plans endpoints?**  
A: Price books are versions of your pricing strategy. Plans are the actual tiers (FREE, PRO, etc.). Use price-books endpoints to get current pricing context.

**Q: Can I create custom plan names?**  
A: Yes, plan names are flexible. Common names are FREE, STARTER, PRO, ENTERPRISE.

**Q: How are credits used?**  
A: Credits determine usage limits. Each action costs `creditsPerEnhancement` credits. Users can't exceed their plan's credit limit.

---

## 📝 Notes

- All prices are stored as DECIMAL(10, 2) in database
- Dates are in ISO 8601 format
- Credits are integers
- Plan names are case-sensitive in the database but API lookup is case-insensitive
- Only one price book can be active at any given time (determined by `effectiveFrom` date)
