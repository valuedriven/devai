import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(private readonly prisma: PrismaService) { }

    async handleClerkEvent(evt: any) {
        const { id } = evt.data;
        const eventType = evt.type;

        this.logger.log(`Received user event: ${eventType} for ID: ${id}`);

        if (eventType === 'user.created' || eventType === 'user.updated') {
            const email = evt.data.email_addresses?.[0]?.email_address;
            const firstName = evt.data.first_name || '';
            const lastName = evt.data.last_name || '';
            const name = `${firstName} ${lastName}`.trim() || 'New Customer';

            if (!email) {
                this.logger.warn(`User ${id} has no email address`);
                return;
            }

            await this.prisma.customers.upsert({
                where: { clerkId: id },
                update: {
                    name,
                    email,
                    // Se tenant id for necessário, você deve inferir do metadata ou context
                    // por enquanto, vamos apenas sincronizar cliente globalmente ou num tenant padrão.
                },
                create: {
                    clerkId: id,
                    name,
                    email,
                    // tenantId será associado de acordo com a regra de negócios.
                },
            });

            this.logger.log(`Upserted customer: ${id}`);
        }

        if (eventType === 'user.deleted') {
            await this.prisma.customers.delete({
                where: { clerkId: id },
            }).catch(err => {
                this.logger.warn(`Failed to delete customer ${id}, maybe not found`);
            });
            this.logger.log(`Deleted customer: ${id}`);
        }
    }
}
