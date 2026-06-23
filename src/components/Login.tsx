import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import { ShieldCheck, LogOut, Lock, AlertCircle, Sparkles } from "lucide-react";

interface LoginProps {
  onAuthSuccess: (user: User) => void;
}

export default function Login({ onAuthSuccess }: LoginProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Monitor auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await verifyUserApproval(user);
      } else {
        setCurrentUser(null);
        setIsApproved(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const verifyUserApproval = async (user: User) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const email = user.email?.toLowerCase().trim();
      if (!email) {
        setIsApproved(false);
        setErrorMsg("Your Google account does not have a valid email address.");
        setLoading(false);
        return;
      }

      // Check Firestore to see if approved users list has any entries.
      // We will make sure the two default users are always seeded if they don't exist.
      const defaultUsers = [
        "janie.houlgrave@compass.com",
        "alex.mcdowell@compass.com"
      ];

      for (const defaultEmail of defaultUsers) {
        const dDocRef = doc(db, "approved_users", defaultEmail.toLowerCase().trim());
        const dDocSnap = await getDoc(dDocRef);
        if (!dDocSnap.exists()) {
          await setDoc(dDocRef, {
            email: defaultEmail.toLowerCase().trim(),
            role: "editor",
            addedAt: new Date().toISOString(),
            addedBy: "system"
          });
        }
      }

      // Now check if the current user is approved
      const userDocRef = doc(db, "approved_users", email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setIsApproved(true);
        onAuthSuccess(user);
      } else {
        setIsApproved(false);
        setErrorMsg(`Access denied. The email "${user.email}" is not on the authorized list of approved users.`);
      }
    } catch (err: any) {
      console.error("Error during authorization checks:", err);
      setErrorMsg("An error occurred while verifying your permission. Please try again.");
      setIsApproved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      // Handle closed popup or cancelled operations elegantly
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsApproved(null);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Sign-out error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-sm w-full bg-white rounded-2xl border border-[#C8DCF0] p-10 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#EAF2ED] flex items-center justify-center mb-4 animate-pulse">
            <ShieldCheck className="h-6 w-6 text-[#2D5A4E]" />
          </div>
          <h3 className="font-serif text-[#2D5A4E] font-semibold text-lg mb-2">Verifying credentials...</h3>
          <p className="text-xs text-gray-500 mb-4">Please wait while we secure your session and check authorization.</p>
          <div className="w-8 h-8 border-4 border-[#2D5A4E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative gradient soft background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D5A4E]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C8DCF0]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-2xl border border-[#C8DCF0] p-10 shadow-sm relative z-10 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EAF2ED] text-[#2D5A4E] rounded-full text-[10px] font-bold tracking-wider uppercase mb-6">
          <Sparkles className="h-3 w-3" />
          Compass Attach Rate Portal
        </div>

        <h1 className="font-serif text-3xl text-[#2D5A4E] font-bold mb-3 tracking-tight">
          Attach Rate Dashboard
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm">
          A secure workspace to manage mortgage attach rates, generate reporting summaries, and export professional email summaries.
        </p>

        {/* Dynamic state layouts */}
        {currentUser && isApproved === false ? (
          <div className="w-full bg-red-50/70 border border-red-200/60 rounded-xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">Access Restrained</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  {errorMsg || "Your account is not approved to access this dashboard."}
                </p>
                <div className="mt-4 pt-4 border-t border-red-200/50 flex flex-col gap-1 text-[11px] text-gray-500">
                  <span>Logged in as:</span>
                  <span className="font-mono font-bold text-gray-700">{currentUser.email}</span>
                </div>
              </div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="w-full bg-amber-50/70 border border-amber-200/60 rounded-xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-1">Notice</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#F8FAFA] border border-[#E4ECE9] rounded-xl p-5 mb-8 text-left flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#EAF2ED] flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 text-[#2D5A4E]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1">Authorized Access Only</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                This app uses Google OAuth for authentication. Only approved users are authorized to view and modify mortgage reporting statistics.
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        {currentUser && isApproved === false ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out & Try Another Account
          </button>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#C8DCF0] hover:bg-[#F8FAFA] text-gray-700 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-[0.98] bg-white"
          >
            {/* Google Logo SVG */}
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.29c1.92,-1.77 3.03,-4.38 3.03,-7.38c0,-0.74 -0.07,-1.45 -0.31,-2.1c0,0 0,0 0,0Z" fill="#4285F4" />
                <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.29,-2.58c-0.91,0.61 -2.08,0.98 -3.37,0.98c-2.35,0 -4.34,-1.58 -5.05,-3.72H2.86v2.66c1.48,2.94 4.53,4.84 8.04,4.84Z" fill="#34A853" />
                <path d="M6.95,13.12c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7V7.06H2.86c-0.6,1.21 -0.95,2.57 -0.95,4.01s0.35,2.8 0.95,4.01l4.09,-3.12c0,0 0,0 0,0Z" fill="#FBBC05" />
                <path d="M12,6.38c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.68 14.42,3.12 12,3.12c-3.51,0 -6.56,1.9 -8.04,4.84l4.09,3.12c0.71,-2.14 2.7,-3.72 5.05,-3.72Z" fill="#EA4335" />
              </g>
            </svg>
            Continue with Google
          </button>
        )}

        {/* Footer / Contact admin details */}
        <div className="mt-8 text-[11px] text-gray-400">
          Authorized users can request dashboard invitations. <br />
          For help, contact <span className="font-semibold text-gray-500">janie.houlgrave@compass.com</span>
        </div>
      </div>
    </div>
  );
}
