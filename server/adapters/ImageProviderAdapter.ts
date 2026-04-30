/**
 * ImageProviderAdapter Interface
 * Adapter Pattern — Defines the contract for fetching trip cover images from external APIs.
 */
export interface ImageProviderAdapter {
  fetchImage(query: string): Promise<string | null>;
}
