export enum PlanType {
    FREE = 'FREE',
    STANDARD = 'STANDARD',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
}

export const PLAN_LIMITS = {
    [PlanType.FREE]: {
        maxStores: 1,
        maxAiMessages: 50,
        maxProducts: 5,
        maxMembers: 1,
        canRemoteConfig: false
    },
    [PlanType.STANDARD]: {
        maxStores: 1,
        maxAiMessages: 2000,
        maxProducts: 30,
        maxMembers: 3,
        canRemoteConfig: true
    },
    [PlanType.PRO]: {
        maxStores: 3,
        maxAiMessages: 5000,
        maxProducts: 100,
        maxMembers: 10,
        canRemoteConfig: true
    },
    [PlanType.ENTERPRISE]: {
        maxStores: 999,
        maxAiMessages: 20000,
        maxProducts: 9999,
        maxMembers: 999,
        canRemoteConfig: true
    }
};
