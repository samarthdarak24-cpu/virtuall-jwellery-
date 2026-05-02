import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestProfileSave() {
    const { data: session } = useSession();
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testSave = async () => {
        setLoading(true);
        setResult('');
        
        try {
            console.log('Session:', session);
            console.log('Email:', session?.user?.email);
            
            const payload = {
                email: session?.user?.email,
                fullName: 'Test User',
                phone: '9876543210',
                dob: '1990-01-01',
                gender: 'Male',
                ringSize: 'US 7',
                address: 'Test Address',
                city: 'Test City',
                country: 'Test Country',
                postalCode: '12345',
            };
            
            console.log('Sending payload:', payload);
            
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                setResult(`✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
            } else {
                setResult(`❌ ERROR: ${response.status} - ${JSON.stringify(data, null, 2)}`);
            }
        } catch (error: any) {
            console.error('Catch error:', error);
            setResult(`❌ EXCEPTION: ${error.message}\n${error.stack}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Profile Save Test Page</h1>
            
            <div className="mb-8 p-4 bg-gray-900 rounded">
                <h2 className="text-xl mb-4">Session Info:</h2>
                <pre className="text-sm overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
            
            <button
                onClick={testSave}
                disabled={loading || !session}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-bold"
            >
                {loading ? 'Testing...' : 'Test Profile Save'}
            </button>
            
            {result && (
                <div className="mt-8 p-4 bg-gray-900 rounded">
                    <h2 className="text-xl mb-4">Result:</h2>
                    <pre className="text-sm overflow-auto whitespace-pre-wrap">
                        {result}
                    </pre>
                </div>
            )}
            
            {!session && (
                <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700 rounded">
                    <p className="text-yellow-400">⚠️ You need to be logged in to test this feature.</p>
                    <a href="/auth/login" className="text-blue-400 underline">Go to Login</a>
                </div>
            )}
        </div>
    );
}
