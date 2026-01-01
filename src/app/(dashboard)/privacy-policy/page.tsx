"use client";

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-200 my-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Introduction</h2>
          <p>
            At RevanceX, we value your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we handle your data, specifically regarding your trading credentials and personal details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Angel One Credentials</h2>
          <p>
            We understand the sensitivity of your trading credentials. Please be assured of the following:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              <strong>No Misuse:</strong> We will <strong>never</strong> use your Angel One credentials (API Key, Client Code, Password, TOTP Key) for any purpose other than fetching market data and account information explicitly requested by you within the application.
            </li>
            <li>
              <strong>No Unauthorized Trading:</strong> We do not execute any trades or transactions on your behalf without your direct manual intervention and consent.
            </li>
            <li>
              <strong>Storage:</strong> Your credentials are stored securely and are only accessed by the automated systems required to provide the dashboard services.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Data Security</h2>
          <p>
            Your data safety is our top priority. We implement robust security measures to ensure that your personal information and trading data are protected against unauthorized access, alteration, disclosure, or destruction. We do not sell or share your personal data with third parties.
          </p>
        </section>

        <section>
          <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-100">
            Last Updated: 01/01/2026
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;