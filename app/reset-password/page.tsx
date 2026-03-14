"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Step 1: Input
  const [contactMethod, setContactMethod] = useState("email");

  // Step 2: Verification
  const [otp, setOpt] = useState("");

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate sending OTP to either email or phone
    setTimeout(() => {
      setLoading(false);
      setSuccess(`A 6-digit verification code has been sent to ${contactMethod === 'email' ? 'ericmwiseneza@gmail.com' : '0782020352'}.`);
      setStep(2);
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      // Accept '123456' as fake OTP or any 6 digit test code for demo
      if (otp === "123456" || otp.length === 6) { 
        setSuccess("Verification successful! Please choose a new password.");
        setStep(3);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess("Password successfully updated! Logging you in...");
      
      // Auto login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ericmwiseneza@gmail.com", password: newPassword }),
      });
      
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        router.push(loginData.redirectUrl);
      } else {
        router.push("/login");
      }
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Secure Recovery
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Merico Spot Bar & Grill System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-4 text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Cancel and relative to Login
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 py-8 px-8 shadow-xl border border-zinc-200 dark:border-zinc-800 sm:rounded-xl">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 h-1 bg-yellow-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
            
            <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 1 ? 'bg-yellow-500 text-zinc-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>1</div>
            <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 2 ? 'bg-yellow-500 text-zinc-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>2</div>
            <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 3 ? 'bg-yellow-500 text-zinc-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>3</div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {step === 1 && (
               <form className="space-y-6" onSubmit={handleSendReset}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Where to send OTP?</h3>
                    <p className="text-sm text-zinc-500 mt-1">Select an authorized contact method</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${contactMethod === 'email' ? 'border-yellow-500 ring-1 ring-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-yellow-300 dark:hover:border-yellow-700'}`}>
                      <input 
                        type="radio" 
                        name="contact" 
                        value="email"
                        checked={contactMethod === "email"}
                        onChange={() => setContactMethod("email")}
                        className="h-5 w-5 text-yellow-600 border-zinc-300 focus:ring-yellow-500" 
                      />
                      <div className="ml-4 flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">Email Address</span>
                        <span className="text-sm text-zinc-500">ericmwiseneza@gmail.com</span>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${contactMethod === 'phone' ? 'border-yellow-500 ring-1 ring-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-yellow-300 dark:hover:border-yellow-700'}`}>
                      <input 
                        type="radio" 
                        name="contact" 
                        value="phone"
                        checked={contactMethod === "phone"}
                        onChange={() => setContactMethod("phone")}
                        className="h-5 w-5 text-yellow-600 border-zinc-300 focus:ring-yellow-500" 
                      />
                      <div className="ml-4 flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">Phone / WhatsApp</span>
                        <span className="text-sm text-zinc-500">+250 782 ... 352</span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-yellow-500/20 text-sm font-bold text-zinc-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Requesting OTP...
                        </span>
                      ) : "Get OTP Code"}
                    </button>
                  </div>
                </form>
            )}

            {step === 2 && (
              <form className="space-y-6" onSubmit={handleVerify}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Enter OTP</h3>
                    <p className="text-sm text-zinc-500 mt-1">{success}</p>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <div className="mt-1">
                      <input
                        type="text"
                        required
                        placeholder="••••••"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOpt(e.target.value.replace(/[^0-9]/g, ''))}
                        className="appearance-none block w-full px-3 py-4 text-center tracking-[1em] text-3xl font-mono font-bold border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-zinc-50 dark:bg-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-yellow-500/20 text-sm font-bold text-zinc-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Verifying...
                        </span>
                      ) : "Confirm OTP"}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
                      Didn't get it? Try another method
                    </button>
                  </div>
                </form>
            )}

            {step === 3 && (
              <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create New Password</h3>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1 font-medium">{success}</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-zinc-950 dark:text-white"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600">
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-zinc-950 dark:text-white ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-yellow-500/20 text-sm font-bold text-zinc-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Updating...
                        </span>
                      ) : "Save Password & Login"}
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
