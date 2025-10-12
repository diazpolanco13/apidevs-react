/**
 * Sanity Studio Configuration - APIDevs Custom Theme (Mintlify Style)
 * Professional documentation-focused CMS with APIDevs branding
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {codeInput} from '@sanity/code-input'

// Config
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/deskStructure'

// Custom theme (inline for now)
import {buildLegacyTheme} from 'sanity'

const APIDEVS_PRIMARY = '#C9D92E'
const APIDEVS_PURPLE = '#9333EA'
const APIDEVS_DARK = '#0A0A0A'
const APIDEVS_GRAY = '#1A1A1A'

const customTheme = buildLegacyTheme({
  '--black': APIDEVS_DARK,
  '--white': '#FFFFFF',
  '--brand-primary': APIDEVS_PRIMARY,
  '--default-button-primary-color': APIDEVS_PRIMARY,
  '--main-navigation-color': APIDEVS_DARK,
  '--focus-color': APIDEVS_PRIMARY,
  '--gray': '#6B7280',
  '--component-bg': APIDEVS_GRAY,
  '--component-text-color': '#FFFFFF',
})

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  
  // Schema
  schema,
  
  // Theme personalizado tipo Mintlify
  theme: customTheme,
  
  // Plugins
  plugins: [
    structureTool({
      structure,
      title: 'APIDevs Content',
    }),
    visionTool({
      defaultApiVersion: apiVersion,
      title: 'GROQ Query',
    }),
    codeInput(),
  ],
})
