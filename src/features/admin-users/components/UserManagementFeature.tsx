"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

import { adminUserService } from "../services/adminUserService";
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListParams,
  AdminUsersSummary,
  AdminUserSortBy,
  AdminUserSortOrder,
  AdminUserStatus,
} from "../types/admin-user.types";

const initialPagination: ApiPagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
const numberFormatter = new Intl.NumberFormat("en-US");

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "No baseline";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}% vs previous period`;
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleLabel(user: Pick<AdminUserListItem, "isCreator">) {
  return user.isCreator ? "Creator" : "Viewer";
}

function getStatusClass(status: AdminUserStatus) {
  return status === "active" ? "text-emerald-400" : "text-primary";
}

function buildSummaryCards(summary: AdminUsersSummary | null) {
  return [
    {
      label: "Total Users",
      value: summary ? numberFormatter.format(summary.totalUsers) : "-",
      detail: summary ? formatPercent(summary.growth30dPercent) : "Identity service unavailable",
      icon: "groups",
      tone: "default",
    },
    {
      label: "Active Users 30D",
      value: summary ? numberFormatter.format(summary.activeUsers30d) : "-",
      detail: "Refresh-token activity window",
      icon: "bolt",
      tone: "success",
    },
    {
      label: "New Users 30D",
      value: summary ? numberFormatter.format(summary.newUsers30d) : "-",
      detail: "Fresh account growth",
      icon: "person_add",
      tone: "secondary",
    },
    {
      label: "Suspended Users",
      value: summary ? numberFormatter.format(summary.lockedUsers) : "-",
      detail: summary ? `${numberFormatter.format(summary.flaggedUsers)} flagged in v1 contract` : "Waiting for summary",
      icon: "gavel",
      tone: "danger",
    },
  ] as const;
}

function getSummaryToneClass(tone: ReturnType<typeof buildSummaryCards>[number]["tone"]) {
  if (tone === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (tone === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  if (tone === "danger") {
    return "border-l-primary text-primary";
  }

  return "border-l-border text-foreground";
}

export function UserManagementFeature() {
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [pagination, setPagination] = useState<ApiPagination>(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminUserStatus | "all">("all");
  const [creatorFilter, setCreatorFilter] = useState<"all" | "creator" | "viewer">("all");
  const [sortBy, setSortBy] = useState<AdminUserSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<AdminUserSortOrder>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actingUserId, setActingUserId] = useState<string | null>(null);
  const [suspendUser, setSuspendUser] = useState<AdminUserListItem | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const queryParams = useMemo<AdminUserListParams>(() => ({
    page,
    limit: pagination.limit,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    isCreator: creatorFilter === "all" ? undefined : creatorFilter === "creator",
    sortBy,
    sortOrder,
  }), [creatorFilter, page, pagination.limit, search, sortBy, sortOrder, status]);

  const loadUsers = useCallback(async (params: AdminUserListParams = queryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryData, listData] = await Promise.all([
        adminUserService.getSummary(),
        adminUserService.getUsers(params),
      ]);

      setSummary(summaryData);
      setUsers(listData.items);
      setPagination(listData.pagination);
    } catch (err) {
      setSummary(null);
      setUsers([]);
      setPagination(initialPagination);
      setError(getErrorMessage(err, "Khong the tai danh sach user admin."));
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [summaryData, listData] = await Promise.all([
          adminUserService.getSummary(),
          adminUserService.getUsers(queryParams),
        ]);

        if (!cancelled) {
          setSummary(summaryData);
          setUsers(listData.items);
          setPagination(listData.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setSummary(null);
          setUsers([]);
          setPagination(initialPagination);
          setError(getErrorMessage(err, "Khong the tai danh sach user admin."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleOpenDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setSelectedUser(null);
    setDetailError(null);
    setIsDetailLoading(true);

    try {
      const detail = await adminUserService.getUserDetail(userId);
      setSelectedUser(detail);
    } catch (err) {
      setDetailError(getErrorMessage(err, "Khong the tai chi tiet user."));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const refreshSelectedDetail = async () => {
    if (!selectedUserId) {
      return;
    }

    try {
      const detail = await adminUserService.getUserDetail(selectedUserId);
      setSelectedUser(detail);
    } catch {
      setSelectedUser(null);
    }
  };

  const handleReactivate = async (user: AdminUserListItem) => {
    setActionError(null);
    setActingUserId(user.userId);

    try {
      await adminUserService.updateUserStatus(user.userId, { status: "active" });
      await Promise.all([loadUsers(queryParams), refreshSelectedDetail()]);
    } catch (err) {
      setActionError(getErrorMessage(err, "Khong the mo khoa user."));
    } finally {
      setActingUserId(null);
    }
  };

  const handleSuspend = async () => {
    const reason = suspendReason.trim();
    if (!suspendUser) {
      return;
    }

    if (!reason) {
      setActionError("Vui long nhap ly do khoa user.");
      return;
    }

    setActionError(null);
    setActingUserId(suspendUser.userId);

    try {
      await adminUserService.updateUserStatus(suspendUser.userId, { status: "suspended", reason });
      setSuspendUser(null);
      setSuspendReason("");
      await Promise.all([loadUsers(queryParams), refreshSelectedDetail()]);
    } catch (err) {
      setActionError(getErrorMessage(err, "Khong the khoa user."));
    } finally {
      setActingUserId(null);
    }
  };

  const summaryCards = buildSummaryCards(summary);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Identity Control</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">User Management</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            {isLoading ? "Loading identity directory..." : `${numberFormatter.format(pagination.total)} platform users from identity-service.`}
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground">
          Live API
        </span>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 font-body text-sm text-primary">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 font-body text-sm text-secondary">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(item => (
          <article key={item.label} className={`relative overflow-hidden rounded-lg border border-border/30 border-l-4 bg-card p-6 ${getSummaryToneClass(item.tone)}`}>
            <span className="material-symbols-outlined absolute right-4 top-4 text-6xl opacity-10 transition-opacity group-hover:opacity-20" aria-hidden="true">
              {item.icon}
            </span>
            <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
            <h2 className="font-headline text-4xl font-black tabular-nums text-foreground">{item.value}</h2>
            <p className="mt-1 font-mono text-xs">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 overflow-hidden rounded-lg border border-border/30 bg-card xl:col-span-9">
          <div className="space-y-4 border-b border-border/30 bg-background px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-headline text-lg font-bold text-foreground">User Directory</h2>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Search account email or profile display name. Identity API excludes admin accounts.
                </p>
              </div>
              <form className="flex w-full gap-2 lg:w-80" onSubmit={handleSearchSubmit}>
                <label className="sr-only" htmlFor="admin-user-search">Search users</label>
                <input
                  id="admin-user-search"
                  className="min-h-11 flex-1 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  placeholder="Search email or display name"
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                />
                <button className="min-h-11 rounded-sm bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90" type="submit">
                  Search
                </button>
              </form>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Status
                <select
                  className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-xs text-foreground outline-none focus:border-primary"
                  value={status}
                  onChange={event => {
                    setPage(1);
                    setStatus(event.target.value as AdminUserStatus | "all");
                  }}
                >
                  <option value="all">Any Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
              <label className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Role
                <select
                  className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-xs text-foreground outline-none focus:border-primary"
                  value={creatorFilter}
                  onChange={event => {
                    setPage(1);
                    setCreatorFilter(event.target.value as "all" | "creator" | "viewer");
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="creator">Creators</option>
                  <option value="viewer">Viewers</option>
                </select>
              </label>
              <label className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Sort
                <select
                  className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-xs text-foreground outline-none focus:border-primary"
                  value={sortBy}
                  onChange={event => {
                    setPage(1);
                    setSortBy(event.target.value as AdminUserSortBy);
                  }}
                >
                  <option value="createdAt">Created</option>
                  <option value="updatedAt">Updated</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <label className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Order
                <select
                  className="min-h-11 rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-xs text-foreground outline-none focus:border-primary"
                  value={sortOrder}
                  onChange={event => {
                    setPage(1);
                    setSortOrder(event.target.value as AdminUserSortOrder);
                  }}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/30 bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">User Profile</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Join Date</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <UserSkeletonRows />
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                      Khong co user nao khop bo loc hien tai.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <UserRow
                      key={user.userId}
                      user={user}
                      actingUserId={actingUserId}
                      onOpenDetail={handleOpenDetail}
                      onStartSuspend={setSuspendUser}
                      onReactivate={handleReactivate}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/30 px-6 py-4 font-body text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              Showing page {pagination.page} of {Math.max(pagination.totalPages, 1)} - {numberFormatter.format(pagination.total)} users
            </span>
            <div className="flex gap-2">
              <button
                className="min-h-11 rounded-sm border border-border/30 px-4 font-headline text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={isLoading || page <= 1}
                onClick={() => setPage(current => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                className="min-h-11 rounded-sm border border-border/30 px-4 font-headline text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={isLoading || page >= pagination.totalPages}
                onClick={() => setPage(current => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <UserDetailPanel
          userId={selectedUserId}
          user={selectedUser}
          isLoading={isDetailLoading}
          error={detailError}
          onClose={() => {
            setSelectedUserId(null);
            setSelectedUser(null);
            setDetailError(null);
          }}
        />
      </div>

      {suspendUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-border/40 bg-card p-6 shadow-2xl">
            <h2 className="font-headline text-xl font-bold text-foreground">Suspend user</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Suspending {suspendUser.displayName || suspendUser.email} revokes all refresh tokens and triggers downstream sync events.
            </p>
            <label className="mt-5 block font-label text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="suspend-reason">
              Reason
            </label>
            <textarea
              id="suspend-reason"
              className="mt-2 min-h-28 w-full rounded-sm border border-border/30 bg-input px-3 py-2 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              maxLength={500}
              placeholder="Violation of platform policy"
              value={suspendReason}
              onChange={event => setSuspendReason(event.target.value)}
            />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="min-h-11 rounded-sm border border-border/40 px-4 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={actingUserId === suspendUser.userId}
                onClick={() => {
                  setSuspendUser(null);
                  setSuspendReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="min-h-11 rounded-sm bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={actingUserId === suspendUser.userId}
                onClick={() => void handleSuspend()}
              >
                {actingUserId === suspendUser.userId ? "Suspending..." : "Confirm Suspend"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function UserRow({
  user,
  actingUserId,
  onOpenDetail,
  onStartSuspend,
  onReactivate,
}: {
  user: AdminUserListItem;
  actingUserId: string | null;
  onOpenDetail: (userId: string) => Promise<void>;
  onStartSuspend: (user: AdminUserListItem) => void;
  onReactivate: (user: AdminUserListItem) => Promise<void>;
}) {
  const isActing = actingUserId === user.userId;

  return (
    <tr className="group transition-colors hover:bg-muted/40">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div>
            <p className="font-headline text-sm font-bold text-foreground">{user.displayName || "Unnamed User"}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{user.userId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`rounded-sm px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${user.isCreator ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>
          {getRoleLabel(user)}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="font-mono text-xs text-foreground/80">{user.email}</p>
        <p className={`mt-1 font-label text-[10px] font-bold uppercase tracking-widest ${user.isEmailVerified ? "text-emerald-400" : "text-secondary"}`}>
          {user.isEmailVerified ? "Verified Email" : "Unverified Email"}
        </p>
      </td>
      <td className="px-6 py-4">
        <span className={`flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(user.status)}`}>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{user.status === "active" ? "check_circle" : "block"}</span>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right font-mono text-[10px] text-muted-foreground">
        {formatDate(user.createdAt)}
        <br />
        <span>Active {formatDate(user.lastActiveAt)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <button className="min-h-11 min-w-11 rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" type="button" aria-label={`View ${user.email}`} onClick={() => void onOpenDetail(user.userId)}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
          </button>
          {user.status === "active" ? (
            <button className="min-h-11 min-w-11 rounded-sm p-2 text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50" type="button" aria-label={`Suspend ${user.email}`} disabled={isActing} onClick={() => onStartSuspend(user)}>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">block</span>
            </button>
          ) : (
            <button className="min-h-11 min-w-11 rounded-sm p-2 text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50" type="button" aria-label={`Reactivate ${user.email}`} disabled={isActing} onClick={() => void onReactivate(user)}>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">lock_open</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserAvatar({ user }: { user: AdminUserListItem }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const canShowAvatar = Boolean(user.avatarUrl && !avatarFailed);

  if (canShowAvatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={`${user.displayName || user.email} avatar`}
        width={40}
        height={40}
        className="h-10 w-10 rounded-sm object-cover"
        onError={() => setAvatarFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted font-headline text-xs font-bold text-primary">
      {getInitials(user.displayName, user.email)}
    </div>
  );
}

function UserSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-6 py-4" colSpan={6}>
        <div className="h-14 rounded-sm bg-muted/60" />
      </td>
    </tr>
  ));
}

function UserDetailPanel({
  userId,
  user,
  isLoading,
  error,
  onClose,
}: {
  userId: string | null;
  user: AdminUserDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <aside className="col-span-12 rounded-lg border border-border/30 bg-card p-6 xl:col-span-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">Account Detail</p>
          <h2 className="mt-1 font-headline text-lg font-bold text-foreground">Selected User</h2>
        </div>
        {userId ? (
          <button className="min-h-11 min-w-11 rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" type="button" aria-label="Close user detail" onClick={onClose}>
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        ) : null}
      </div>

      {!userId ? (
        <div className="mt-8 rounded-sm border border-border/30 bg-background p-5 text-sm text-muted-foreground">
          Select a user to inspect profile data and active session summary.
        </div>
      ) : isLoading ? (
        <div className="mt-8 space-y-3 animate-pulse">
          <div className="h-16 rounded-sm bg-muted/60" />
          <div className="h-24 rounded-sm bg-muted/60" />
          <div className="h-24 rounded-sm bg-muted/60" />
        </div>
      ) : error ? (
        <div className="mt-8 rounded-sm border border-primary/30 bg-primary/10 p-5 text-sm text-primary">{error}</div>
      ) : user ? (
        <div className="mt-8 space-y-5">
          <div className="rounded-sm border border-border/30 bg-background p-5">
            <p className="font-headline text-base font-bold text-foreground">{user.profile.displayName || user.email}</p>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-sm border px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${user.status === "active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-primary/30 bg-primary/10 text-primary"}`}>
                {user.status}
              </span>
              <span className="rounded-sm border border-border/30 bg-muted px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-foreground">
                {user.profile.isCreator ? "Creator" : "Viewer"}
              </span>
              <span className={`rounded-sm border px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${user.isEmailVerified ? "border-emerald-500/30 text-emerald-400" : "border-secondary/30 text-secondary"}`}>
                {user.isEmailVerified ? "Email Verified" : "Email Unverified"}
              </span>
            </div>
          </div>

          <DetailBlock title="Profile">
            <DetailLine label="Bio" value={user.profile.bio || "No bio"} />
            <DetailLine label="Phone" value={user.profile.phone ? String(user.profile.phone) : "N/A"} />
            <DetailLine label="Gender" value={user.profile.gender || "N/A"} />
            <DetailLine label="Birthday" value={formatDate(user.profile.birthday)} />
          </DetailBlock>

          <DetailBlock title="Sessions">
            <DetailLine label="Active Sessions" value={numberFormatter.format(user.sessions.activeSessionCount)} />
            <DetailLine label="Last Active" value={formatDate(user.sessions.lastActiveAt)} />
            <DetailLine label="Created" value={formatDate(user.createdAt)} />
            <DetailLine label="Updated" value={formatDate(user.updatedAt)} />
          </DetailBlock>
        </div>
      ) : null}
    </aside>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border/30 bg-background p-5">
      <h3 className="font-headline text-sm font-bold text-foreground">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/20 pb-2 last:border-b-0 last:pb-0">
      <span className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-right font-body text-xs text-foreground">{value}</span>
    </div>
  );
}
