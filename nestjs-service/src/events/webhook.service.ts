import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly configService: ConfigService) { }

  /**
   * Yeni etkinlik oluşturulduğunda Go servisine webhook gönderir.
   * X-Webhook-Signature header'ı ile HMAC-SHA256 imzası eklenir.
   */
  async sendEventCreatedWebhook(event: any): Promise<void> {
    const goServiceUrl = this.configService.get<string>('GO_SERVICE_URL', 'http://go-service:8080');
    const webhookSecret = this.configService.get<string>('WEBHOOK_SECRET', 'webhook_shared_secret_key');
    const apiKey = this.configService.get<string>('API_KEY', 'campusconnect_api_key_change_in_production');

    const payload = {
      eventType: 'event.created',
      timestamp: new Date().toISOString(),
      data: {
        id: event.id,
        title: event.title,
        category: event.category,
        city: event.city,
        eventDate: event.eventDate,
        organizerId: event.organizerId,
        maxParticipants: event.maxParticipants,
      },
    };

    const payloadString = JSON.stringify(payload);

    // HMAC-SHA256 imza oluştur
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');

    try {
      const response = await axios.post(
        `${goServiceUrl}/api/v1/webhooks/events`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-API-Key': apiKey,
          },
          timeout: 5000,
        },
      );

      this.logger.log(
        `✅ Webhook başarıyla gönderildi: event=${event.id}, status=${response.status}`,
      );
    } catch (error) {
      // Webhook hatası ana işlemi bloklamaz, sadece loglanır
      this.logger.error(
        `❌ Webhook gönderilemedi: event=${event.id}, error=${error.message}`,
      );
    }
  }
}
