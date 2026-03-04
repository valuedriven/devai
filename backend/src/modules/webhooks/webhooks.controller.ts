import { Controller, Post, Req, Res, Headers, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';
import { Webhook } from 'svix';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post('clerk')
    async handleClerkWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('svix-signature') svixSignature: string,
    ) {
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new BadRequestException('Missing svix headers');
        }

        const payload = (req as any).rawBody?.toString('utf8');

        if (!payload && Object.keys(req.body || {}).length) {
            // fallback se rawBody nao estiver configurado
            throw new BadRequestException('Raw body is required for webhook signature verification');
        }

        try {
            const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
            const evt: any = wh.verify(payload || JSON.stringify(req.body), {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });

            await this.webhooksService.handleClerkEvent(evt);
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error('Error verifying or processing webhook:', err.message);
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}
