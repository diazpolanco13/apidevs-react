/**
 * Script para crear contenido de ejemplo en Sanity Docs
 * Ejecutar: npx tsx scripts/create-docs-sample.ts
 */

import { client } from '../sanity/lib/client';

async function createSampleDocs() {
  console.log('🚀 Creando contenido de ejemplo para documentación...\n');

  try {
    // 1. Crear categoría "Get Started"
    console.log('📁 Creando categoría: Get Started...');
    const getStartedCategory = await client.create({
      _type: 'docCategory',
      title: 'Get Started',
      slug: { _type: 'slug', current: 'get-started' },
      order: 1,
      description: 'Quick start guide and installation',
      isCollapsible: true,
      defaultExpanded: true
    });
    console.log('✅ Categoría creada:', getStartedCategory._id);

    // 2. Crear categoría "API Reference"
    console.log('\n📁 Creando categoría: API Reference...');
    const apiCategory = await client.create({
      _type: 'docCategory',
      title: 'API Reference',
      slug: { _type: 'slug', current: 'api-reference' },
      order: 2,
      description: 'Complete API documentation',
      isCollapsible: true,
      defaultExpanded: false
    });
    console.log('✅ Categoría creada:', apiCategory._id);

    // 3. Crear página "Quickstart"
    console.log('\n📄 Creando página: Quickstart...');
    const quickstartDoc = await client.create({
      _type: 'documentation',
      title: 'Quickstart',
      slug: { _type: 'slug', current: 'quickstart' },
      category: {
        _type: 'reference',
        _ref: getStartedCategory._id
      },
      order: 1,
      description: 'Get up and running in minutes with APIDevs Trading Platform',
      content: [
        {
          _type: 'block',
          _key: 'block1',
          style: 'h1',
          children: [{ _type: 'span', text: 'Welcome to APIDevs Trading Platform' }]
        },
        {
          _type: 'block',
          _key: 'block2',
          style: 'normal',
          children: [{ _type: 'span', text: 'Get started with our professional trading indicators in less than 5 minutes.' }]
        },
        {
          _type: 'block',
          _key: 'block3',
          style: 'h2',
          children: [{ _type: 'span', text: 'Prerequisites' }]
        },
        {
          _type: 'block',
          _key: 'block4',
          style: 'normal',
          children: [{ _type: 'span', text: 'Before you begin, make sure you have:' }]
        },
        {
          _type: 'block',
          _key: 'block5',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'A valid APIDevs account' }]
        },
        {
          _type: 'block',
          _key: 'block6',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Basic knowledge of TradingView' }]
        },
        {
          _type: 'block',
          _key: 'block7',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'An active subscription (Free or PRO)' }]
        },
        {
          _type: 'callout',
          _key: 'callout1',
          type: 'tip',
          content: [
            {
              _type: 'block',
              _key: 'calloutBlock1',
              style: 'normal',
              children: [
                { _type: 'span', text: '💡 ' },
                { _type: 'span', text: 'Pro Tip: ', marks: ['strong'] },
                { _type: 'span', text: 'Start with the RSI Bands indicator if you\'re new to our platform. It\'s user-friendly and highly effective.' }
              ]
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block8',
          style: 'h2',
          children: [{ _type: 'span', text: 'Installation Steps' }]
        },
        {
          _type: 'block',
          _key: 'block9',
          style: 'h3',
          children: [{ _type: 'span', text: '1. Create Your Account' }]
        },
        {
          _type: 'block',
          _key: 'block10',
          style: 'normal',
          children: [
            { _type: 'span', text: 'Visit ' },
            {
              _type: 'span',
              text: 'APIDevs Sign Up',
              marks: ['link-e1f44268a667']
            },
            { _type: 'span', text: ' and create your account. You\'ll receive a confirmation email.' }
          ],
          markDefs: [
            {
              _key: 'link-e1f44268a667',
              _type: 'link',
              href: '/signin'
            }
          ]
        },
        {
          _type: 'codeBlock',
          _key: 'code1',
          language: 'bash',
          filename: 'terminal',
          code: 'npm install @apidevs/indicators\nnpm run setup'
        }
      ],
      seo: {
        metaTitle: 'Quickstart Guide - APIDevs Trading Platform',
        metaDescription: 'Get started with APIDevs trading indicators in 5 minutes. Step-by-step guide for beginners.'
      }
    });
    console.log('✅ Página creada:', quickstartDoc._id);

    // 4. Crear página "Authentication"
    console.log('\n📄 Creando página: Authentication...');
    const authDoc = await client.create({
      _type: 'documentation',
      title: 'Authentication',
      slug: { _type: 'slug', current: 'authentication' },
      category: {
        _type: 'reference',
        _ref: apiCategory._id
      },
      order: 1,
      description: 'Learn how to authenticate with the APIDevs API',
      content: [
        {
          _type: 'block',
          _key: 'authBlock1',
          style: 'h1',
          children: [{ _type: 'span', text: 'Authentication' }]
        },
        {
          _type: 'block',
          _key: 'authBlock2',
          style: 'normal',
          children: [{ _type: 'span', text: 'APIDevs uses Supabase authentication for secure access to the platform.' }]
        },
        {
          _type: 'callout',
          _key: 'authCallout1',
          type: 'warning',
          content: [
            {
              _type: 'block',
              _key: 'authCalloutBlock1',
              style: 'normal',
              children: [
                { _type: 'span', text: '⚠️ ' },
                { _type: 'span', text: 'Security Warning: ', marks: ['strong'] },
                { _type: 'span', text: 'Never share your API keys publicly or commit them to version control.' }
              ]
            }
          ]
        },
        {
          _type: 'block',
          _key: 'authBlock3',
          style: 'h2',
          children: [{ _type: 'span', text: 'Making Authenticated Requests' }]
        },
        {
          _type: 'codeBlock',
          _key: 'authCode1',
          language: 'javascript',
          filename: 'auth.js',
          code: `const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'your-password'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();`
        }
      ],
      seo: {
        metaTitle: 'Authentication Guide - APIDevs API',
        metaDescription: 'Complete guide to authenticating with the APIDevs API using Supabase JWT tokens.'
      }
    });
    console.log('✅ Página creada:', authDoc._id);

    console.log('\n🎉 ¡Contenido de ejemplo creado exitosamente!');
    console.log('\n📍 Ahora recarga: http://localhost:3000/docs\n');

  } catch (error) {
    console.error('❌ Error creando contenido:', error);
    process.exit(1);
  }
}

createSampleDocs();

