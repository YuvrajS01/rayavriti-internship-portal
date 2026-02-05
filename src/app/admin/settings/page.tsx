"use client";

import { useState } from "react";
import { Settings, Save, Globe, CreditCard, Bell, Shield, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [settings, setSettings] = useState({
        siteName: "Rayavriti Platform",
        siteDescription: "Master the Future of Technology",
        contactEmail: "admin@rayavriti.com",
        supportPhone: "+91 9999999999",
        upiId: "your-upi-id@bank",
        upiMerchantName: "Rayavriti",
        enablePayments: true,
        enableCertificates: true,
        enableEmailNotifications: true,
        maintenanceMode: false,
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // In a real app, this would save to database/env
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: "success", text: "Settings saved successfully!" });
        } catch {
            setMessage({ type: "error", text: "Failed to save settings" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-[#D9FD3A]" />
                    Platform Settings
                </h1>
                <p className="text-foreground-muted">
                    Configure platform-wide settings and preferences.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg ${message.type === "success"
                            ? "bg-success/10 border border-success/20 text-success"
                            : "bg-error/10 border border-error/20 text-error"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-5 h-5 text-[#D9FD3A]" />
                        <h2 className="text-lg font-semibold">General Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="siteName" className="label">Site Name</label>
                            <input
                                type="text"
                                id="siteName"
                                value={settings.siteName}
                                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="siteDescription" className="label">Site Description</label>
                            <input
                                type="text"
                                id="siteDescription"
                                value={settings.siteDescription}
                                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="contactEmail" className="label">Contact Email</label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={settings.contactEmail}
                                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="supportPhone" className="label">Support Phone</label>
                            <input
                                type="tel"
                                id="supportPhone"
                                value={settings.supportPhone}
                                onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <CreditCard className="w-5 h-5 text-[#D9FD3A]" />
                        <h2 className="text-lg font-semibold">Payment Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="upiId" className="label">UPI ID</label>
                            <input
                                type="text"
                                id="upiId"
                                value={settings.upiId}
                                onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))}
                                className="input"
                                placeholder="yourname@bank"
                            />
                        </div>
                        <div>
                            <label htmlFor="upiMerchantName" className="label">UPI Merchant Name</label>
                            <input
                                type="text"
                                id="upiMerchantName"
                                value={settings.upiMerchantName}
                                onChange={(e) => setSettings(prev => ({ ...prev, upiMerchantName: e.target.value }))}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-5 h-5 text-[#D9FD3A]" />
                        <h2 className="text-lg font-semibold">Feature Toggles</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary cursor-pointer">
                            <div>
                                <p className="font-medium">Enable Payments</p>
                                <p className="text-sm text-foreground-muted">Allow users to make payments for courses</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.enablePayments}
                                onChange={(e) => setSettings(prev => ({ ...prev, enablePayments: e.target.checked }))}
                                className="w-5 h-5 accent-[#D9FD3A]"
                            />
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary cursor-pointer">
                            <div>
                                <p className="font-medium">Enable Certificates</p>
                                <p className="text-sm text-foreground-muted">Issue certificates upon course completion</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.enableCertificates}
                                onChange={(e) => setSettings(prev => ({ ...prev, enableCertificates: e.target.checked }))}
                                className="w-5 h-5 accent-[#D9FD3A]"
                            />
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary cursor-pointer">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-foreground-muted">Send email notifications to users</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.enableEmailNotifications}
                                onChange={(e) => setSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                                className="w-5 h-5 accent-[#D9FD3A]"
                            />
                        </label>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="card border-warning/30">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-warning" />
                        <h2 className="text-lg font-semibold">Maintenance Mode</h2>
                    </div>
                    <label className="flex items-center justify-between p-4 rounded-lg bg-warning/10 cursor-pointer">
                        <div>
                            <p className="font-medium text-warning">Enable Maintenance Mode</p>
                            <p className="text-sm text-foreground-muted">Takes the site offline for users (admins can still access)</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                            className="w-5 h-5 accent-warning"
                        />
                    </label>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary px-8"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
