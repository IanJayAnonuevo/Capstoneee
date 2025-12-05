import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api';

const getAuthToken = () => {
    try {
        return localStorage.getItem('access_token');
    } catch (err) {
        console.warn('Unable to read access token', err);
        return null;
    }
};

const getAuthHeaders = (extra = {}) => {
    const token = getAuthToken();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra
    };
};

const GenerateRoutesButton = ({ onRoutesGenerated }) => {
    const [showModal, setShowModal] = useState(false);
    const [generateDate, setGenerateDate] = useState(new Date().toISOString().split('T')[0]);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        setResult(null);

        try {
            // Use generate_daily_routes.php to generate routes
            const url = buildApiUrl('generate_daily_routes.php');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: generateDate
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setResult({
                    success: true,
                    date: generateDate,
                    routes_generated: data.routes_generated || 0,
                    tasks_generated: 0,
                    routes: data.routes || []
                });

                // Call parent callback to refresh routes
                if (onRoutesGenerated) {
                    onRoutesGenerated();
                }
            } else {
                throw new Error(data.message || 'Failed to generate routes');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error generating routes:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setResult(null);
        setError(null);
    };

    return (
        <>
            <button
                className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                onClick={() => setShowModal(true)}
            >
                Generate Routes
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
                    onClick={handleClose}
                >
                    <div
                        className="bg-white rounded-xl w-11/12 max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Generate Daily Routes</h2>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                onClick={handleClose}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {!result ? (
                                <>
                                    <p className="text-gray-600 mb-5 leading-relaxed">
                                        This will automatically generate tasks and routes for all sessions (AM & PM) based on schedules and attendance for the selected date.
                                    </p>

                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Date:
                                        </label>
                                        <input
                                            type="date"
                                            value={generateDate}
                                            onChange={(e) => setGenerateDate(e.target.value)}
                                            disabled={generating}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>

                                    {error && (
                                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-5 flex items-start gap-2">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-3 justify-end">
                                        <button
                                            className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            onClick={handleClose}
                                            disabled={generating}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                            onClick={handleGenerate}
                                            disabled={generating}
                                        >
                                            {generating ? 'Generating...' : 'Generate Routes'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 mb-5">
                                        <div className="flex items-center gap-2 font-medium mb-2">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Successfully generated for {result.date}</span>
                                        </div>
                                        <div className="ml-7 text-sm space-y-1">
                                            <div>✓ {result.tasks_generated || 0} task(s) created</div>
                                            <div>✓ {result.routes_generated || 0} route(s) created</div>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <h3 className="text-base font-semibold text-gray-900 mb-3">Generated Routes:</h3>
                                        <div className="space-y-2">
                                            {result.routes.map((route, index) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <strong className="text-sm text-gray-900">{route.name}</strong>
                                                        <span className="text-xs text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                                                            {route.stops_count} stops
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {route.barangays.join(', ')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button
                                            className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
                                            onClick={handleClose}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenerateRoutesButton;
