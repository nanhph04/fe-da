"use client";

import { useState } from "react";

const userData = [
  { id: "USR-001", name: "Julian Vane", email: "julian.v@velvet.art", role: "Creator", membership: "Gold", status: "Active", joinDate: "Oct 12, 2023" },
  { id: "USR-002", name: "Elena Rossi", email: "elena@gallery.com", role: "Viewer", membership: "Silver", status: "Flagged", joinDate: "Nov 03, 2023" },
  { id: "USR-003", name: "Markus Wright", email: "m.wright@staff.velvet", role: "Staff", membership: "Standard", status: "Active", joinDate: "Jan 15, 2024" },
];

export function UserManagementFeature() {
  const [users] = useState(userData);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Identity Control</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">User Management</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Oversee audience growth and community health.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite
        </button>
      </header>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="flex items-center justify-between border-b border-border/30 bg-background px-6 py-4">
          <h2 className="font-headline text-lg font-bold text-foreground">User Directory</h2>
          <select className="rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-xs text-foreground outline-none focus:border-primary">
            <option>All Roles</option>
            <option>Creator</option>
            <option>Viewer</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-semibold">User Profile</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Membership</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Join Date</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted font-headline text-xs font-bold text-primary">
                        {user.name.split(" ").map((part) => part[0]).join("")}
                      </div>
                      <div>
                        <p className="font-headline text-sm font-bold text-foreground">{user.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="rounded-sm bg-muted px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-primary">{user.role}</span></td>
                  <td className="px-6 py-4"><span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">{user.membership}</span></td>
                  <td className="px-6 py-4"><span className={`flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest ${user.status === "Active" ? "text-emerald-400" : "text-primary"}`}>{user.status === "Flagged" ? <span className="material-symbols-outlined text-[14px]">flag</span> : null}{user.status}</span></td>
                  <td className="px-6 py-4 text-right font-mono text-[10px] text-muted-foreground">{user.joinDate}</td>
                  <td className="px-6 py-4"><div className="flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"><button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><span className="material-symbols-outlined text-[18px]">visibility</span></button><button className="rounded p-1 text-primary hover:bg-primary/10"><span className="material-symbols-outlined text-[18px]">block</span></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
