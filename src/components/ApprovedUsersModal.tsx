import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import { X, UserPlus, Trash2, Mail, Shield, AlertCircle, Check, Loader2 } from "lucide-react";

interface ApprovedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

interface ApprovedUser {
  email: string;
  role: string;
  addedAt: string;
  addedBy: string;
}

export default function ApprovedUsersModal({ isOpen, onClose, currentUserEmail }: ApprovedUsersModalProps) {
  const [users, setUsers] = useState<ApprovedUser[]>([]);
  const [newEmail, setNewEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchApprovedUsers();
    }
  }, [isOpen]);

  const fetchApprovedUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const querySnapshot = await getDocs(collection(db, "approved_users"));
      const userList: ApprovedUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userList.push({
          email: doc.id, // document ID is the email address
          role: data.role || "editor",
          addedAt: data.addedAt || "",
          addedBy: data.addedBy || "system",
        });
      });
      // Sort users alphabetically
      userList.sort((a, b) => a.email.localeCompare(b.email));
      setUsers(userList);
    } catch (err: any) {
      console.error("Error fetching approved users:", err);
      setErrorMsg("Failed to load approved users. Please check connection permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailToAdd = newEmail.toLowerCase().trim();
    if (!emailToAdd) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToAdd)) {
      setErrorMsg("Invalid email format.");
      return;
    }

    setActionLoading(true);
    try {
      // Save user to Firestore (email is the document key)
      const userDocRef = doc(db, "approved_users", emailToAdd);
      await setDoc(userDocRef, {
        email: emailToAdd,
        role: "editor",
        addedAt: new Date().toISOString(),
        addedBy: currentUserEmail,
      });

      setNewEmail("");
      setSuccessMsg(`"${emailToAdd}" is now approved!`);
      await fetchApprovedUsers();

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error adding approved user:", err);
      setErrorMsg("Failed to authorize the new email. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (emailToDelete: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (emailToDelete.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()) {
      setErrorMsg("You cannot remove yourself from the approved users list.");
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke access for "${emailToDelete}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "approved_users", emailToDelete.toLowerCase().trim()));
      setSuccessMsg(`Access revoked for "${emailToDelete}".`);
      await fetchApprovedUsers();

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error deleting approved user:", err);
      setErrorMsg("Failed to remove user. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-[#C8DCF0] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2D5A4E] text-white p-5 flex items-center justify-between border-b border-[#1C3A32]">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-[#EDF4FB]" />
            <div>
              <h2 className="font-serif font-semibold text-lg leading-tight">Approved Users Access</h2>
              <p className="text-[10px] text-[#EDF4FB]/70 font-sans tracking-wide">
                Manage who can log into the Attach Rate Dashboard
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form and Messages */}
        <div className="p-5 border-b border-[#F0F4F8] bg-[#F8FAFA]">
          <form onSubmit={handleAddUser} className="flex gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="Enter colleague's work email..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={actionLoading}
                className="w-full bg-white text-gray-800 text-xs py-3 pl-9 pr-3 rounded-xl border border-[#C8DCF0] outline-none focus:ring-1 focus:ring-[#2D5A4E] focus:border-[#2D5A4E]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading || !newEmail}
              className="flex items-center gap-1.5 px-4 bg-[#2D5A4E] hover:bg-[#204037] text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              <span>Approve Access</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 p-2.5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 flex items-start gap-2 text-xs text-green-800 bg-green-50 border border-green-100 p-2.5 rounded-lg animate-fade-in">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Authorized Accounts ({users.length})
            </h3>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2D5A4E]" />}
          </div>

          {loading && users.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading approved users...</div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-[#C8DCF0] rounded-xl">
              No approved users found.
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div 
                  key={user.email}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    user.email === currentUserEmail.toLowerCase().trim()
                      ? "bg-[#EAF2ED]/40 border-[#A3D1B9]/40"
                      : "bg-white hover:bg-gray-50/50 border-[#EBF1F5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      user.email === currentUserEmail.toLowerCase().trim()
                        ? "bg-[#2D5A4E] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800 font-mono">
                          {user.email}
                        </span>
                        {user.email === currentUserEmail.toLowerCase().trim() && (
                          <span className="bg-[#2D5A4E]/10 text-[#2D5A4E] text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Approved {new Date(user.addedAt).toLocaleDateString()} by {user.addedBy === "system" ? "System" : user.addedBy}
                      </p>
                    </div>
                  </div>

                  {user.email !== currentUserEmail.toLowerCase().trim() && (
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={actionLoading}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-45"
                      title="Revoke dashboard access"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-t border-[#F0F4F8] text-[11px] text-gray-400">
          <span>Active Session Database Access secure.</span>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
