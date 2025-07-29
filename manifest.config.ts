import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Mindful Browsing - Addiction Preventer',
  description: 'Gentle reminders to help you browse mindfully and break addictive browsing patterns',
  version: pkg.version,
  icons: {
    16: 'public/logo.png',
    32: 'public/logo.png',
    48: 'public/logo.png',
    128: 'public/logo.png',
  },
  action: {
    default_icon: {
      16: 'public/logo.png',
      32: 'public/logo.png',
      48: 'public/logo.png',
      128: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
    default_title: 'Mindful Browsing Settings'
  },
  content_scripts: [{
    js: ['src/content/main.tsx'],
    matches: ['<all_urls>'],
    run_at: 'document_end'
  }],
  permissions: [
    'storage',
    'activeTab'
  ],
  host_permissions: [
    '<all_urls>'
  ]
})
