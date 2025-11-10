import { deleteSessions, findSessionsByShop } from "./session-storage";

/*
 * App Installations
 */
export const AppInstallations = {
    includes: async function (shopDomain: string) {
        const shopSessions = await findSessionsByShop(shopDomain);

        if (shopSessions.length > 0) {
            for (const session of shopSessions) {
                if (session.accessToken) return true;
            }
        }

        return false;
    },

    delete: async function (shopDomain: string) {
        const shopSessions = await findSessionsByShop(shopDomain);

        if (shopSessions.length > 0) {
            await deleteSessions(
                shopSessions.map((session: { id: any }) => session.id),
            );
        }
    },
};
