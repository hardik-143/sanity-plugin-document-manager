import type {ComponentType} from 'react'

/**
 * Configuration options for the Document Manager plugin.
 */
export interface DocumentManagerPluginConfig {
  /**
   * Custom title shown in the Studio navbar.
   * @default 'Document Manager'
   */
  title?: string

  /**
   * Custom icon component for the tool.
   * @default DatabaseIcon from @sanity/icons
   */
  icon?: ComponentType

  /**
   * Emoji shown before the title text inside the tool.
   * @default '📋'
   */
  titleEmoji?: string

  /**
   * Number of documents displayed per page.
   * @default 50
   */
  pageSize?: number

  /**
   * Sanity API version used for GROQ queries and API calls.
   * @default '2024-06-01'
   */
  apiVersion?: string

  /**
   * Document types to exclude from the type filter dropdown.
   * Useful for hiding internal types like sanity.imageAsset.
   * @default []
   */
  excludeTypes?: string[]

  /**
   * Pre-select a specific dataset when the tool loads.
   * If omitted, the first dataset alphabetically is selected.
   */
  defaultDataset?: string
}

/** Resolved config with all defaults applied. */
export interface ResolvedConfig {
  title: string
  icon: ComponentType
  titleEmoji: string
  pageSize: number
  apiVersion: string
  excludeTypes: string[]
  defaultDataset?: string
}

/** Shape of a single document entry returned from GROQ. */
export interface DocEntry {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  title?: string
  name?: string
}
