"use client";

import Image from "next/image";

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Check your email</h2>
          <p className="text-emerald-600 mb-8">
            A sign in link has been sent to your email address.
          </p>
          
          <div className="space-y-4 text-sm text-emerald-700">
            <p>
              The link will expire in 24 hours. If you don't see the email, check your spam folder.
            </p>
            <p>
              You can close this window and click the link in your email to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 