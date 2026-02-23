import { PrismaClient } from '@prisma/client';
import { PLAN_LIMITS, PlanType } from '../config/plans';

const prisma = new PrismaClient();

export class SubscriptionService {

    // Get or create subscription for user
    static async getSubscription(userId: string) {
        let subscription = await (prisma as any).subscription.findUnique({
            where: { userId }
        });

        if (!subscription) {
            subscription = await (prisma as any).subscription.create({
                data: {
                    userId,
                    plan: 'FREE'
                }
            });
        }
        return subscription;
    }

    // Check if user can create a store
    static async canCreateStore(userId: string): Promise<boolean> {
        const subscription = await this.getSubscription(userId);
        const limit = PLAN_LIMITS[subscription.plan as PlanType].maxStores;

        const currentCount = await prisma.store.count({
            where: { userId }
        });

        return currentCount < limit;
    }

    // Check if user has AI message credits
    static async canSendAiMessage(userId: string): Promise<boolean> {
        const subscription = await this.getSubscription(userId);
        const limit = PLAN_LIMITS[subscription.plan as PlanType].maxAiMessages;

        return subscription.aiMessageCount < limit;
    }

    // Increment usage
    static async incrementAiUsage(userId: string): Promise<void> {
        await (prisma as any).subscription.update({
            where: { userId },
            data: {
                aiMessageCount: { increment: 1 }
            }
        });
    }

    // Upgrade Plan (Admin only for now)
    static async upgradePlan(userId: string, plan: PlanType): Promise<void> {
        await (prisma as any).subscription.update({
            where: { userId },
            data: { plan }
        });
    }
}
