# GitHub Copilot Instructions — Nexira Backend

## Project Overview

Nexira Backend is a **Node.js/Express REST API** written in **TypeScript**, backed by **PostgreSQL** via **Sequelize ORM**. It handles user authentication, AI image tasks (Google Gemini), subscription plans, Stripe payments, referrals, ledger/credits, and analytics.

---

## Tech Stack

| Layer           | Technology                                                  |
| --------------- | ----------------------------------------------------------- |
| Runtime         | Node.js                                                     |
| Language        | TypeScript 5.x (strict mode)                                |
| Framework       | Express 4.x                                                 |
| ORM             | Sequelize 6.x                                               |
| Database        | PostgreSQL                                                  |
| Auth            | JWT (`jsonwebtoken`) + Google OAuth (`google-auth-library`) |
| Payments        | Stripe                                                      |
| AI              | Google Gemini (`@google/genai`)                             |
| Email           | Resend                                                      |
| Validation      | `express-validator`                                         |
| Package Manager | Yarn                                                        |
| Testing         | Jest + `ts-jest`                                            |
| Security        | Helmet, CORS                                                |

---

## Project Structure

Each domain module lives in `src/<module>/` and follows a strict three-file pattern:

```
src/
  <module>/
    <module>.model.ts       # Sequelize model + interface
    <module>.controller.ts  # Request handlers (object export pattern)
    <module>.routes.ts      # Express router
  models/
    associations.ts         # All cross-model associations defined here
  utils/
    auth.middleware.ts      # JWT middleware (verifyUserToken, verifyAdminToken)
    credits.ts              # Credit helpers
    email.service.ts        # Email sending via Resend
    email-templates.ts      # HTML email template builders
    referral.ts             # Referral code utilities
  database.ts               # Sequelize instance
  app.ts                    # Express app setup
  index.ts                  # Server entry point
```

---

## Code Conventions

### TypeScript

- Always enable and respect **strict mode**. Never use `any` unless casting an error in a `catch` block (`error: any`).
- Define a plain `I<ModelName>` interface for every model's shape.
- Use `Optional<IModel, 'field1' | 'field2'>` for creation attributes.
- All model classes extend `Model<IModel, IModelCreationAttributes>` and implement `IModel`.
- Use non-null assertion (`!`) only for class properties that Sequelize guarantees to set.
- Target `ES2020`, module system is `commonjs`.

### Models (`<module>.model.ts`)

- Export both the class and the interface.
- Define all Sequelize field options inside `Model.init(...)`.
- Use `beforeCreate` / `beforeUpdate` hooks for derived fields (e.g., auto-generating referral codes).
- **Never** define associations inside a model file. All associations go in `src/models/associations.ts`.
- Use `DataTypes` constants, not raw strings, for column types.

```typescript
// Good
type: DataTypes.STRING,

// Bad
type: "VARCHAR(255)",
```

### Controllers (`<module>.controller.ts`)

- Export a single **named object** `export const <module>Controller = { ... }`.
- Every handler must be `async (req: Request | AuthRequest, res: Response) => { ... }`.
- Wrap every handler body in `try/catch`. On error, respond with `res.status(500).json({ error: error.message })`.
- Return `404` for missing resources, `400` for validation failures, `401/403` for auth failures.
- Exclude sensitive fields (e.g., `passwordHash`) from all responses. Use Sequelize `attributes: { exclude: [...] }` or delete from `toJSON()` output.
- Always use `AuthRequest` (from `utils/auth.middleware`) when the handler needs `req.user`.

```typescript
export const userController = {
  getUser: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ["passwordHash"] },
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
```

### Routes (`<module>.routes.ts`)

- Create `const router = Router()` and export it as default.
- Apply `verifyUserToken` for authenticated user endpoints.
- Apply `verifyAdminToken` for admin-only endpoints.
- Keep route files thin — no business logic.
- Register every router in `src/app.ts` under `/api/<module>`.

```typescript
import { Router } from "express";
import { verifyAdminToken, verifyUserToken } from "../utils/auth.middleware";
import { widgetController } from "./widget.controller";

const router = Router();

router.get("/", verifyAdminToken, widgetController.getAll);
router.get("/:id", verifyUserToken, widgetController.getById);

export default router;
```

### Authentication & Middleware

- Use `verifyUserToken` to protect user-facing endpoints.
- Use `verifyAdminToken` to protect admin-only endpoints.
- Access the authenticated user via `(req as AuthRequest).user`.
- JWT secret comes from `process.env.JWT_SECRET`. Never hardcode secrets.

### Database & Associations

- The Sequelize instance is exported from `src/database.ts` as the default export.
- All `hasMany`, `belongsTo`, `hasOne` calls live exclusively in `src/models/associations.ts` inside `initializeAssociations()`.
- When adding a new model, import it in `app.ts` to register it, and add its associations in `associations.ts`.
- Use `sequelize.sync({ alter: true })` for development only. Production migrations should be handled explicitly.

### Environment Variables

All secrets and config must come from environment variables loaded via `dotenv`. Required variables:

```
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
GOOGLE_CLIENT_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
NODE_ENV
```

Never fall back to a production-usable default for secrets. The only acceptable fallback is a clearly insecure placeholder (`"your-secret-key-change-in-production"`) that signals misconfiguration.

### Error Handling

- Always use `try/catch` in async handlers.
- Return structured JSON errors: `{ error: string }`.
- Use appropriate HTTP status codes consistently:
  - `200` — success
  - `201` — resource created
  - `400` — bad request / validation error
  - `401` — unauthenticated
  - `403` — forbidden (authenticated but lacks permission)
  - `404` — not found
  - `500` — unexpected server error

### Adding a New Module

1. Create `src/<module>/` directory with three files: `model.ts`, `controller.ts`, `routes.ts`.
2. Define the `I<Module>` interface and Sequelize model in `model.ts`.
3. Import the model in `app.ts` (to register it with Sequelize).
4. Add associations in `src/models/associations.ts`.
5. Implement handlers in `controller.ts` using the object-export pattern.
6. Define routes in `routes.ts` applying auth middleware as needed.
7. Import and register the router in `app.ts` under `/api/<module>`.

### Testing

- Test files must be colocated or placed in a `__tests__/` directory.
- Use `jest` with `ts-jest`. Configuration is in `package.json`.
- Test controller logic by mocking Sequelize models.
- Prefer unit tests for utilities (`src/utils/`) and integration tests for routes.

---

## What to Avoid

- Do not put business logic inside route files.
- Do not define Sequelize associations inside model files.
- Do not import from `dist/` — always import from `src/`.
- Do not use `var`; use `const` by default, `let` when reassignment is needed.
- Do not use CommonJS `require()` except where strictly necessary (e.g., `dotenv`). Prefer ES module `import`.
- Do not commit `.env` files.
- Do not expose `passwordHash` or other sensitive fields in API responses.
