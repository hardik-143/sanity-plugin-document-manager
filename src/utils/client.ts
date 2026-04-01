import {createClient, type SanityClient} from '@sanity/client'

interface MakeClientOptions {
  projectId: string
  dataset: string
  apiVersion: string
  token?: string
}

export function makeClient({projectId, dataset, apiVersion, token}: MakeClientOptions): SanityClient {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}
