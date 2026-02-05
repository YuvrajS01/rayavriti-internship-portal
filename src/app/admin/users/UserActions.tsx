"use client";

import { useState } from "react";
import { Mail, Shield, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    mobile: string | null;
    createdAt: Date;
}

interface UserActionsProps {
    user: User;
    onUpdate: () => void;
}

export function UserActions({ user, onUpdate }: UserActionsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleMakeAdmin = async () => {
        if (!confirm(`Are you sure you want to make ${user.name || user.email} an admin?`)) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "admin" }),
            });
            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveAdmin = async () => {
        if (!confirm(`Are you sure you want to remove admin privileges from ${user.name || user.email}?`)) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "user" }),
            });
            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${user.name || user.email}? This cannot be undone.`)) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-2">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <a
                href={`mailto:${user.email}`}
                className="btn btn-ghost p-2"
                title="Email User"
            >
                <Mail className="w-4 h-4" />
            </a>
            {user.role === "admin" ? (
                <button
                    onClick={handleRemoveAdmin}
                    className="btn btn-ghost p-2 text-warning"
                    title="Remove Admin"
                >
                    <ToggleRight className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={handleMakeAdmin}
                    className="btn btn-ghost p-2"
                    title="Make Admin"
                >
                    <Shield className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={handleDelete}
                className="btn btn-ghost p-2 text-error hover:bg-error/10"
                title="Delete User"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
