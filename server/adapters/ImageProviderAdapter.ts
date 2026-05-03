export interface ImageProviderAdapter {
  fetchImage(query: string): Promise<string | null>;
}
