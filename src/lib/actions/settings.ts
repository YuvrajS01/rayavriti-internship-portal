import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SiteSettings = {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    upiId: string;
    upiMerchantName: string;
    paymentQrUrl: string;
    enablePayments: boolean;
    enableCertificates: boolean;
    enableEmailNotifications: boolean;
    maintenanceMode: boolean;
};

export const defaultSettings: SiteSettings = {
    siteName: "Rayavriti Platform",
    siteDescription: "Master the Future of Technology",
    contactEmail: "admin@rayavriti.com",
    supportPhone: "+91 9999999999",
    upiId: "",
    upiMerchantName: "Rayavriti",
    paymentQrUrl: "",
    enablePayments: true,
    enableCertificates: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
};

export async function getSettings(): Promise<SiteSettings> {
    const allSettings = await db.select().from(siteSettings);
    const settings = { ...defaultSettings };

    allSettings.forEach((s) => {
        if (s.key in settings) {
            const key = s.key as keyof SiteSettings;
            if (typeof settings[key] === "boolean") {
                (settings as any)[key] = s.value === "true";
            } else {
                (settings as any)[key] = s.value;
            }
        }
    });

    return settings;
}

export async function updateSettings(newSettings: Partial<SiteSettings>) {
    const entries = Object.entries(newSettings);

    for (const [key, value] of entries) {
        const valStr = String(value);
        
        // Upsert logic
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
        
        if (existing.length > 0) {
            await db.update(siteSettings)
                .set({ value: valStr, updatedAt: new Date() })
                .where(eq(siteSettings.key, key));
        } else {
            await db.insert(siteSettings)
                .values({ key, value: valStr });
        }
    }

    return getSettings();
}
