"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        mobile: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    mobile: formData.mobile,
                }),
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                await update();
            } else {
                const data = await response.json();
                setMessage({ type: "error", text: data.error || "Failed to update profile" });
            }
        } catch {
            setMessage({ type: "error", text: "An error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Password changed successfully!" });
                setFormData(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }));
            } else {
                const data = await response.json();
                setMessage({ type: "error", text: data.error || "Failed to change password" });
            }
        } catch {
            setMessage({ type: "error", text: "An error occurred" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                    <User className="w-8 h-8 text-[#D9FD3A]" />
                    My Profile
                </h1>
                <p className="text-foreground-muted">
                    Manage your account settings and preferences.
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={session?.user?.email || ""}
                                disabled
                                className="input opacity-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-foreground-muted mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label htmlFor="mobile" className="label">Mobile Number</label>
                            <input
                                type="tel"
                                id="mobile"
                                value={formData.mobile}
                                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                className="input"
                                placeholder="Your mobile number"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-6">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="label">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="label">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !formData.currentPassword || !formData.newPassword}
                            className="btn btn-secondary w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Changing...
                                </>
                            ) : (
                                "Change Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Account Info */}
            <div className="card mt-6">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-foreground-muted">Role</p>
                        <p className="font-medium capitalize">{session?.user?.role || "User"}</p>
                    </div>
                    <div>
                        <p className="text-foreground-muted">Member Since</p>
                        <p className="font-medium">February 2026</p>
                    </div>
                    <div>
                        <p className="text-foreground-muted">Account Status</p>
                        <span className="badge badge-success">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
