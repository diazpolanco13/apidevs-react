# 📚 Contenido de Ejemplo para Documentación

Copia y pega este contenido directamente en Sanity Studio:

---

## 1️⃣ Categoría: Get Started

**Ve a Sanity Studio → Categorías de Documentación → Create**

```
Título: Get Started
Slug: get-started (auto-generate)
Orden: 1
Descripción: Quick start guide and installation
Es Colapsable: ✅ true
Expandida por Defecto: ✅ true
```

**Click PUBLISH**

---

## 2️⃣ Categoría: API Reference

**Ve a Sanity Studio → Categorías de Documentación → Create**

```
Título: API Reference
Slug: api-reference (auto-generate)
Orden: 2
Descripción: Complete API documentation
Es Colapsable: ✅ true
Expandida por Defecto: ❌ false
```

**Click PUBLISH**

---

## 3️⃣ Página: Quickstart

**Ve a Sanity Studio → Documentación → Create**

```
Título: Quickstart
Slug: quickstart (auto-generate)
Categoría: Get Started (select)
Orden: 1
Descripción: Get up and running in minutes with APIDevs Trading Platform
```

**Contenido (Portable Text):**

```
# Welcome to APIDevs Trading Platform

Get started with our professional trading indicators in less than 5 minutes.

## Prerequisites

Before you begin, make sure you have:

- A valid APIDevs account
- Basic knowledge of TradingView
- An active subscription (Free or PRO)

## Installation Steps

### 1. Create Your Account

Visit [APIDevs Sign Up](/signin) and create your account. You'll receive a confirmation email.

### 2. Choose Your Plan

We offer three subscription tiers:

- **FREE**: 2 basic indicators
- **PRO Monthly**: Full access to all 18 indicators ($39/month)
- **PRO Annual**: Save 48% with annual billing ($249/year)
- **LIFETIME**: One-time payment, lifetime access ($999)

### 3. Access Your Indicators

Once subscribed, visit the [Indicators Catalog](/indicadores) to browse all available tools.

## Quick Tips

> 💡 **Pro Tip**: Start with the RSI Bands indicator if you're new to our platform. It's user-friendly and highly effective.

> ⚠️ **Important**: Make sure to link your TradingView username in your profile settings to enable automatic access.

## Next Steps

- [Explore Indicators](/indicadores)
- [Join Discord Community](https://discord.gg/apidevs)
- [Watch Tutorial Videos](https://youtube.com/@apidevs)

## Need Help?

Contact us via:
- 📧 Email: info@apidevs.io
- 💬 Telegram: 24/7 Support
- 🎮 Discord: Active community
```

**SEO:**
```
Meta Title: Quickstart Guide - APIDevs Trading Platform
Meta Description: Get started with APIDevs trading indicators in 5 minutes. Step-by-step guide for beginners.
```

**Click PUBLISH**

---

## 4️⃣ Página: Authentication

**Ve a Sanity Studio → Documentación → Create**

```
Título: Authentication
Slug: authentication (auto-generate)
Categoría: API Reference (select)
Orden: 1
Descripción: Learn how to authenticate with the APIDevs API
```

**Contenido (Portable Text):**

```
# Authentication

APIDevs uses Supabase authentication for secure access to the platform.

## Overview

All API requests require authentication using JWT tokens. Here's how to get started.

## Getting Your API Key

1. Log in to your account
2. Go to **Account Settings** → **API Keys**
3. Generate a new API key
4. Copy and store it securely

> ⚠️ **Security Warning**: Never share your API keys publicly or commit them to version control.

## Making Authenticated Requests

### JavaScript Example

```javascript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'your-password'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();
```

### Python Example

```python
from supabase import create_client, Client

url = "YOUR_SUPABASE_URL"
key = "YOUR_SUPABASE_KEY"
supabase: Client = create_client(url, key)

# Sign in
user = supabase.auth.sign_in_with_password({
    "email": "user@example.com",
    "password": "your-password"
})
```

## Token Expiration

JWT tokens expire after 1 hour. Implement automatic refresh:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
});
```

## Error Handling

Common authentication errors:

| Error Code | Description | Solution |
|------------|-------------|----------|
| `invalid_credentials` | Wrong email/password | Verify credentials |
| `user_not_found` | Account doesn't exist | Sign up first |
| `email_not_confirmed` | Email not verified | Check your inbox |

> 💡 **Tip**: Always implement proper error handling in production applications.

## Next Steps

- [Indicators API](/docs/indicators-api)
- [Webhooks](/docs/webhooks)
- [Rate Limits](/docs/rate-limits)
```

**SEO:**
```
Meta Title: Authentication Guide - APIDevs API
Meta Description: Complete guide to authenticating with the APIDevs API using Supabase JWT tokens.
```

**Click PUBLISH**

---

## 🎯 Resultado Final

Una vez publiques estos 4 documentos, verás:

✅ **Sidebar con 2 categorías:**
- 🚀 Get Started (expandida)
  - Quickstart
- 📚 API Reference (colapsada)
  - Authentication

✅ **Navegación funcional**
✅ **Contenido renderizado con formato**
✅ **Code blocks con syntax highlighting**
✅ **Callouts (warnings, tips)**
✅ **Tablas y listas**

---

## 📝 Instrucciones Rápidas

1. Abre http://localhost:3000/studio
2. Crea las 2 **Categorías** primero
3. Luego crea las 2 **Páginas de Documentación**
4. Publica todo
5. Recarga http://localhost:3000/docs

¡LISTO! 🎉

