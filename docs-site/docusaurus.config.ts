import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'APIDevs Trading Platform - Documentación',
  tagline: 'Sistema de indicadores de trading con gestión de accesos TradingView',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.apidevs-platform.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'apidevs', // Usually your GitHub org/user name.
  projectName: 'apidevs-react', // Usually your repo name.

  onBrokenLinks: 'warn', // Cambiar a 'throw' en producción

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/apidevs/apidevs-react/edit/main/docs-site/',
        },
        // Blog desactivado - no lo necesitamos para documentación técnica
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Plugins adicionales
  plugins: [
    // Mermaid para diagramas
    '@docusaurus/theme-mermaid',
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'APIDevs Docs',
      logo: {
        alt: 'APIDevs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          href: 'https://github.com/apidevs/apidevs-react',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Proyecto',
          items: [
            {
              label: 'APIDevs Trading Platform',
              href: 'https://apidevs-platform.com',
            },
            {
              label: 'Dashboard Admin',
              href: 'https://apidevs-platform.com/admin',
            },
          ],
        },
        {
          title: 'Documentación',
          items: [
            {
              label: 'Sistema TradingView',
              to: '/docs/systems/tradingview-access/overview',
            },
            {
              label: 'Sistema de Cookies',
              to: '/docs/systems/cookies/overview',
            },
            {
              label: 'Arquitectura Completa',
              to: '/docs/project/overview',
            },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/apidevs/apidevs-react',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/apidevs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} APIDevs Trading Platform. Construido con Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      // Syntax highlighting adicional para el proyecto
      additionalLanguages: ['typescript', 'json', 'bash', 'jsx', 'tsx', 'sql', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
