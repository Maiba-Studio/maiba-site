"use client";

import { useEffect, useState, FormEvent } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { X } from "lucide-react";

interface UserInfo {
  id: string;
  username: string;
  role: "admin" | "moderator";
  createdAt: string;
}

type Tab = "password" | "moderators";

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("password");
  const [users, setUsers] = useState<UserInfo[]>([]);

  // Change password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // New moderator
  const [newUsername, setNewUsername] = useState("");
  const [newModPw, setNewModPw] = useState("");
  const [modMsg, setModMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [modLoading, setModLoading] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState<UserInfo | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editMsg, setEditMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchUsers = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPw !== confirmPw) {
      setPwMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ type: "ok", text: "Password changed successfully." });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setPwMsg({ type: "err", text: data.error || "Failed to change password." });
      }
    } catch {
      setPwMsg({ type: "err", text: "Connection failed." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCreateModerator = async (e: FormEvent) => {
    e.preventDefault();
    setModMsg(null);

    if (!newUsername.trim() || !newModPw.trim()) {
      setModMsg({ type: "err", text: "Username and password required." });
      return;
    }
    if (newModPw.length < 6) {
      setModMsg({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }

    setModLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newModPw,
          role: "moderator",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModMsg({ type: "ok", text: `Moderator "${data.username}" created.` });
        setNewUsername("");
        setNewModPw("");
        fetchUsers();
      } else {
        setModMsg({ type: "err", text: data.error || "Failed to create moderator." });
      }
    } catch {
      setModMsg({ type: "err", text: "Connection failed." });
    } finally {
      setModLoading(false);
    }
  };

  const handleDeleteUser = async (user: UserInfo) => {
    if (!confirm(`Delete ${user.role} "${user.username}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  const openEdit = (user: UserInfo) => {
    setEditing(user);
    setEditUsername(user.username);
    setEditPassword("");
    setEditMsg(null);
  };

  const handleEditSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditMsg(null);

    const body: Record<string, string> = {};
    if (editUsername.trim() && editUsername !== editing.username)
      body.username = editUsername.trim();
    if (editPassword.trim()) {
      if (editPassword.length < 6) {
        setEditMsg({ type: "err", text: "Password must be at least 6 characters." });
        return;
      }
      body.password = editPassword;
    }

    if (Object.keys(body).length === 0) {
      setEditing(null);
      return;
    }

    const res = await fetch(`/api/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setEditing(null);
      fetchUsers();
    } else {
      setEditMsg({ type: "err", text: data.error || "Failed to update." });
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "password", label: "My Password" },
    { id: "moderators", label: "Moderators" },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Accounts</h1>
        <p className="text-malamaya text-sm mt-1">
          Manage your password and moderator accounts.
        </p>
      </div>

      <div className="flex gap-1 mb-8 border-b border-malamaya-border/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm tracking-widest uppercase transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-maiba-red text-maiba-red"
                : "border-transparent text-malamaya hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Change Password ── */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className="max-w-md space-y-5">
          <Field label="Current Password">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className="admin-input"
              autoComplete="current-password"
            />
          </Field>
          <Field label="New Password">
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              className="admin-input"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              className="admin-input"
              autoComplete="new-password"
            />
          </Field>

          {pwMsg && (
            <p className={`text-sm ${pwMsg.type === "ok" ? "text-emerald-400" : "text-maiba-red"}`}>
              {pwMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
          >
            {pwLoading ? "Saving..." : "Change Password"}
          </button>
        </form>
      )}

      {/* ── Moderators ── */}
      {activeTab === "moderators" && (
        <div className="space-y-8">
          {/* Create new */}
          <div className="border border-malamaya-border/20 rounded-sm p-6">
            <h2 className="text-sm tracking-widest uppercase text-malamaya-light mb-4">
              Create Moderator
            </h2>
            <p className="text-malamaya-border text-xs mb-4">
              Moderators can only access Field Notes for editing. They cannot edit Site Content or manage accounts.
            </p>
            <form onSubmit={handleCreateModerator} className="max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Username">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                    className="admin-input"
                    autoComplete="off"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    value={newModPw}
                    onChange={(e) => setNewModPw(e.target.value)}
                    required
                    className="admin-input"
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              {modMsg && (
                <p className={`text-sm ${modMsg.type === "ok" ? "text-emerald-400" : "text-maiba-red"}`}>
                  {modMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={modLoading}
                className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-6 py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
              >
                {modLoading ? "Creating..." : "+ Create Moderator"}
              </button>
            </form>
          </div>

          {/* List existing */}
          {users.length > 0 && (
            <div>
              <h2 className="text-sm tracking-widest uppercase text-malamaya-light mb-4">
                Existing Accounts
              </h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border border-malamaya-border/20 rounded-sm px-5 py-3"
                  >
                    <div>
                      <span className="text-foreground text-sm">
                        {user.username}
                      </span>
                      <span
                        className={`ml-3 text-[10px] tracking-widest uppercase ${
                          user.role === "admin"
                            ? "text-maiba-red"
                            : "text-malamaya"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-[10px] tracking-widest uppercase text-malamaya hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-[10px] tracking-widest uppercase text-maiba-red/60 hover:text-maiba-red transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-midnight border border-malamaya-border/30 rounded-sm p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm tracking-widest uppercase text-malamaya-light">
                Edit {editing.role}: {editing.username}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="text-malamaya hover:text-maiba-red text-sm"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <Field label="Username">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="New Password" hint="leave blank to keep current">
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="admin-input"
                  autoComplete="new-password"
                />
              </Field>

              {editMsg && (
                <p className={`text-sm ${editMsg.type === "ok" ? "text-emerald-400" : "text-maiba-red"}`}>
                  {editMsg.text}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-maiba-red/10 border border-maiba-red/30 text-maiba-red px-5 py-2.5 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="border border-malamaya-border/30 text-malamaya px-5 py-2.5 rounded-sm hover:text-foreground transition-colors text-sm tracking-widest uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
        {label}
        {hint && (
          <span className="text-malamaya-border ml-2 normal-case tracking-normal">
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
