import Link from "next/link";
import { Users as UsersIcon, Search, MoreHorizontal, Mail, Shield, Ban, CheckCircle } from "lucide-react";
import { db, users } from "@/db";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getUsers() {
    return await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
}

async function getUserStats() {
    const result = await db
        .select({
            total: sql<number>`count(*)`,
            admins: sql<number>`count(*) filter (where role = 'admin')`,
            thisMonth: sql<number>`count(*) filter (where created_at >= date_trunc('month', current_date))`,
        })
        .from(users);

    return result[0];
}

export default async function UsersManagementPage() {
    const [allUsers, stats] = await Promise.all([getUsers(), getUserStats()]);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">User Management</h1>
                    <p className="text-foreground-muted">
                        Manage platform users and their roles.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-[#D9FD3A]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.total || 0}</p>
                            <p className="text-sm text-foreground-muted">Total Users</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.admins || 0}</p>
                            <p className="text-sm text-foreground-muted">Admins</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
                            <p className="text-sm text-foreground-muted">New This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 font-medium text-foreground-muted">User</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Role</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Mobile</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Joined</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((user) => (
                                <tr key={user.id} className="border-b border-border hover:bg-background-tertiary/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#D9FD3A]/20 flex items-center justify-center font-semibold text-[#D9FD3A]">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-foreground-muted">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`badge ${user.role === "admin" ? "badge-info" : ""
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-foreground-muted">
                                        {user.mobile || "-"}
                                    </td>
                                    <td className="p-4 text-foreground-muted">
                                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="btn btn-ghost p-2" title="Email User">
                                                <Mail className="w-4 h-4" />
                                            </button>
                                            {user.role !== "admin" && (
                                                <button className="btn btn-ghost p-2" title="Make Admin">
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="btn btn-ghost p-2" title="More Options">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {allUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-foreground-muted">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
