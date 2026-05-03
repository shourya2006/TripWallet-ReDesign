import { ImageProviderAdapter } from './ImageProviderAdapter';

export class UnsplashAdapter implements ImageProviderAdapter {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  async fetchImage(query: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&client_id=${this.clientId}`
      );

      if (!response.ok) {
        console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: any = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }

      return null;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return null;
    }
  }
}
