"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Key, Eye, EyeOff, Save } from "lucide-react";

const AngelCredentials = () => {
    const [clientId, setClientId] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [totpKey, setTotpKey] = useState("");
    const [mpin, setMpin] = useState("");
    const [showMpin, setShowMpin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setClientId(data.user.angelClientCode || "");
                        setApiKey(data.user.angelApiKey || "");
                        setTotpKey(data.user.angelTOTPKey || "");
                        setMpin(data.user.angelPassword || "");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await fetch('/api/angelcredentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    angelClientCode: clientId,
                    angelApiKey: apiKey,
                    angelTOTPKey: totpKey,
                    angelPassword: mpin,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save credentials');
            }

            setMessage({ type: 'success', text: 'Credentials saved securely!' });

            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Angel One Credentials</h1>
                <p className="text-gray-500 mt-2">
                    Configure your trading API keys securely. These are stored locally and used to authenticate requests.
                </p>
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Key className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
                        <p className="text-sm text-gray-500">Enter your SmartAPI details below.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <Input
                        label="Client ID"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter Client ID"
                        helperText="Your Angel One Client ID."
                    />

                    <Input
                        label="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter API Key"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="TOTP Key"
                            value={totpKey}
                            onChange={(e) => setTotpKey(e.target.value)}
                            placeholder="Enter TOTP Key"
                        />

                        <Input
                            label="Angel One MPIN"
                            type={showMpin ? "text" : "password"}
                            value={mpin}
                            onChange={(e) => setMpin(e.target.value)}
                            placeholder="Enter your 4-digit MPIN"
                            helperText="Required instead of password for new Angel One security policy."
                            endIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowMpin(!showMpin)}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors focus:outline-none"
                                >
                                    {showMpin ? (
                                        <EyeOff className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                            }
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            isLoading={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Securely
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AngelCredentials;