'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';

export default function DebugPage() {
    const { user } = useAuth();
    const [claims, setClaims] = useState<any>(null);
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const checkClaims = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            // Force refresh token
            const tokenResult = await auth.currentUser.getIdTokenResult(true);
            setClaims(tokenResult.claims);
            setToken(tokenResult.token);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) checkClaims();
    }, [user]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Claims</h1>
            
            <div className="mb-4">
                <button 
                    onClick={checkClaims}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Refrescando...' : 'Forzar Refresco de Token'}
                </button>
            </div>

            <div className="bg-gray-100 p-4 rounded overflow-auto max-w-3xl">
                <h2 className="font-bold">User Info:</h2>
                <pre>{JSON.stringify({ 
                    uid: user?.uid, 
                    email: user?.email,
                    emailVerified: user?.emailVerified
                }, null, 2)}</pre>
                
                <h2 className="font-bold mt-4">Custom Claims:</h2>
                <pre className="text-green-700 font-bold">{JSON.stringify(claims, null, 2)}</pre>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
                <p>Si "platformAdmin" no aparece arriba como true, las reglas fallarán.</p>
            </div>
        </div>
    );
}
