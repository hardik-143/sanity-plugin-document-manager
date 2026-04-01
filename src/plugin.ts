import {definePlugin} from 'sanity'
import {DatabaseIcon} from '@sanity/icons'
import type {DocumentManagerPluginConfig, ResolvedConfig} from './types'
import {DocumentManagerTool} from './components/DocumentManagerTool'

function resolveConfig(config: DocumentManagerPluginConfig = {}): ResolvedConfig {
  return {
    title: config.title ?? 'Document Manager',
    icon: config.icon ?? DatabaseIcon,
    titleEmoji: config.titleEmoji ?? '📋',
    pageSize: config.pageSize ?? 50,
    apiVersion: config.apiVersion ?? '2024-06-01',
    excludeTypes: config.excludeTypes ?? [],
    defaultDataset: config.defaultDataset,
  }
}

export function documentManager(config?: DocumentManagerPluginConfig) {
  const resolved = resolveConfig(config)

  return definePlugin({
    name: 'document-manager',
    tools: (prev) => [
      ...prev,
      {
        name: 'document-manager',
        title: resolved.title,
        icon: resolved.icon,
        component: () => DocumentManagerTool({config: resolved}),
      },
    ],
  })()
}
