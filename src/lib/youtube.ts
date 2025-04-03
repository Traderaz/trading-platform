import { google } from 'googleapis';

const youtube = google.youtube('v3');

export interface YouTubeStreamConfig {
  title: string;
  description: string;
  scheduledStartTime: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  videoId: string;
}

export class YouTubeService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createLivestream(config: YouTubeStreamConfig) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.accessToken });

    try {
      // Create a broadcast (scheduled livestream)
      const broadcast = await youtube.liveBroadcasts.insert({
        auth,
        part: ['snippet', 'status', 'contentDetails'],
        requestBody: {
          snippet: {
            title: config.title,
            description: config.description,
            scheduledStartTime: config.scheduledStartTime,
          },
          status: {
            privacyStatus: config.privacyStatus,
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
          },
        },
      });

      return broadcast.data;
    } catch (error) {
      console.error('Error creating YouTube livestream:', error);
      throw error;
    }
  }

  async getLivestreamDetails(videoId: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.accessToken });

    try {
      const response = await youtube.videos.list({
        auth,
        part: ['snippet', 'status', 'contentDetails'],
        id: [videoId],
      });

      return response.data.items?.[0];
    } catch (error) {
      console.error('Error fetching YouTube livestream details:', error);
      throw error;
    }
  }

  async updateLivestreamPrivacy(videoId: string, privacyStatus: 'private' | 'unlisted' | 'public') {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.accessToken });

    try {
      const response = await youtube.videos.update({
        auth,
        part: ['status'],
        requestBody: {
          id: videoId,
          status: {
            privacyStatus,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating YouTube livestream privacy:', error);
      throw error;
    }
  }
} 