import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LandMap from './LandMap';
import DocumentUpload from './DocumentUpload';

const MarkMyLand = () => {
    const { t } = useTranslation();
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const [step, setStep] = useState(1);
    const [polygon, setPolygon] = useState([]);
    const [landData, setLandData] = useState(null);
    const [docData, setDocData] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [existingLands, setExistingLands] = useState([]);

    // Fetch existing lands on load
    React.useEffect(() => {
        fetch(`${apiBase}/api/feature1/lands`)
            .then(res => res.json())
            .then(data => setExistingLands(data))
            .catch(err => console.error("Failed to load lands:", err));
    }, []);

    const handlePolygonChange = (points) => {
        setPolygon(points);
    };

    const submitLand = async () => {
        if (polygon.length < 3) {
            alert(t('mark_3_points'));
            return;
        }

        setLoading(true);
        try {
            // Using a valid UUID for demo purposes to satisfy DB constraints
            const userId = "123e4567-e89b-12d3-a456-426614174000";

            const response = await fetch(`${apiBase}/api/feature1/land/record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    coordinates: polygon
                })
            });

            if (!response.ok) throw new Error('Failed to record land');

            const result = await response.json();
            console.log("Land record result:", result);
            // Assuming Supabase returns the inserted row in `data` array
            setLandData(result.data[0]);
            setStep(2); // Move to upload step
        } catch (error) {
            console.error(error);
            alert(t('error_recording_land') + ": " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = (documentData) => {
        console.log("Upload complete, doc data:", documentData);
        setDocData(documentData);
        setStep(3); // Move to OCR Review step
    };

    const verifyLandClaim = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBase}/api/feature1/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    land_id: landData.id,
                    document_id: docData.id
                })
            });

            if (!response.ok) throw new Error('Verification failed');

            const result = await response.json();
            setVerificationResult(result);
            setStep(4); // Move to Result step
        } catch (error) {
            console.error(error);
            alert(t('error_verifying'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-green-400">{t('mark_my_land')}</h1>

            {/* Progress Stepper */}
            <div className="flex justify-center mb-8 gap-4">
                <div className={`h-2 w-1/4 rounded ${step >= 1 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                <div className={`h-2 w-1/4 rounded ${step >= 2 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                <div className={`h-2 w-1/4 rounded ${step >= 3 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                <div className={`h-2 w-1/4 rounded ${step >= 4 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold">{t('step1_map_land')}</h2>
                    <p className="text-gray-400">{t('step1_desc')}</p>
                    <LandMap onPolygonChange={handlePolygonChange} otherLands={existingLands} />

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={submitLand}
                            disabled={polygon.length < 3 || loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all"
                        >
                            {loading ? t('saving') : t('save_continue')}
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && landData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold">{t('step2_verify_ownership')}</h2>
                    <div className="bg-gray-800 p-4 rounded text-sm">
                        <p><strong>{t('mapped_area')}:</strong> {landData.area_sqm?.toFixed(2)} sqm</p>
                        <p className="items-center text-xs text-gray-500 mt-1">ID: {landData.id}</p>
                    </div>

                    <DocumentUpload landId={landData.id} onUploadComplete={handleUploadComplete} />

                    {loading && <p className="text-center text-blue-400">{t('verifying_blockchain')}</p>}
                </div>
            )}

            {step === 3 && docData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold">{t('step3_review')}</h2>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400">{t('document_analysis')}</span>
                            <span className="font-semibold text-green-400">{t('ai_analysis')}</span>
                        </div>

                        {/* Structured Data Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                <span className="block text-xs text-gray-400 uppercase">{t('owner_name')}</span>
                                <span className="text-sm font-medium text-white">{docData?.ocr_data?.owner_name || t('not_found')}</span>
                            </div>
                            <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                <span className="block text-xs text-gray-400 uppercase">{t('survey_plot_no')}</span>
                                <span className="text-sm font-medium text-white">{docData?.ocr_data?.survey_number || t('not_found')}</span>
                            </div>
                            <div className="col-span-1 md:col-span-2 bg-gray-900 p-3 rounded border border-gray-700">
                                <span className="block text-xs text-gray-400 uppercase">{t('property_address')}</span>
                                <span className="text-sm font-medium text-white">{docData?.ocr_data?.property_address || t('not_found')}</span>
                            </div>
                            <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                <span className="block text-xs text-gray-400 uppercase">{t('registration_no')}</span>
                                <span className="text-sm font-medium text-white">{docData?.ocr_data?.registration_number || t('not_found')}</span>
                            </div>
                            <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                <span className="block text-xs text-gray-400 uppercase">{t('date_of_reg')}</span>
                                <span className="text-sm font-medium text-white">{docData?.ocr_data?.registration_date || t('not_found')}</span>
                            </div>
                        </div>

                        {/* Area Comparison */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                            <div className="bg-gray-700 p-3 rounded">
                                <p className="text-xs text-gray-400">{t('mapped_area')}</p>
                                <p className="text-lg font-bold text-blue-400">{landData?.area_sqm?.toFixed(2)} sqm</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded">
                                <p className="text-xs text-gray-400">{t('document_area')}</p>
                                <p className="text-lg font-bold text-purple-400">
                                    {docData?.extracted_area_sqm?.toFixed(2)} sqm
                                    <span className="block text-xs font-normal text-gray-300">({docData?.ocr_data?.area_text || "Raw"})</span>
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-center text-gray-500">
                            {t('ocr_quality')}: {(docData.confidence_score * 100).toFixed(1)}%
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={verifyLandClaim}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto transition-all"
                        >
                            {loading ? t('verifying_blockchain_btn') : t('verify_on_blockchain')}
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && verificationResult && (
                <div className="text-center space-y-6 animate-in zoom-in duration-500 max-w-lg mx-auto">
                    {/* Status Icon */}
                    <div className={`text-6xl ${verificationResult.status === 'VERIFIED' ? 'text-green-500' :
                        (verificationResult.status === 'REVIEW' ? 'text-yellow-500' : 'text-red-500')
                        }`}>
                        {verificationResult.status === 'VERIFIED' ? '✓' : (verificationResult.status === 'REVIEW' ? '!' : '✗')}
                    </div>

                    {/* Status Text */}
                    <h2 className="text-3xl font-bold">
                        {t('status')}: <span className={
                            verificationResult.status === 'VERIFIED' ? 'text-green-400' :
                                (verificationResult.status === 'REVIEW' ? 'text-yellow-400' : 'text-red-400')
                        }>
                            {verificationResult.status}
                        </span>
                    </h2>

                    {/* Confidence Score Card */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="text-gray-400 text-sm mb-1 uppercase tracking-wider">{t('confidence_score')}</div>
                        <div className="text-5xl font-black text-white mb-2">
                            {verificationResult.confidence_score}%
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${verificationResult.confidence_score > 80 ? 'bg-green-500' :
                                    (verificationResult.confidence_score > 50 ? 'bg-yellow-500' : 'bg-red-500')
                                    }`}
                                style={{ width: `${verificationResult.confidence_score}%` }}
                            ></div>
                        </div>

                        {/* Breakdown */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs text-gray-300">
                            <div className="bg-gray-700/50 p-2 rounded">
                                <span className="block text-gray-500">{t('area_match')}</span>
                                <span className="font-semibold">{100 - (verificationResult.details.details.area_diff_percent)}%</span>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded">
                                <span className="block text-gray-500">{t('location_match')}</span>
                                <span className="font-semibold">{verificationResult.details.details.location_match ? "YES" : "NO"}</span>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded">
                                <span className="block text-gray-500">{t('gps_accuracy')}</span>
                                <span className="font-semibold">~{Math.round(verificationResult.details.gps_accuracy || 5)}m</span>
                            </div>
                            <div className="bg-gray-700/50 p-2 rounded">
                                <span className="block text-gray-500">{t('walk_complete')}</span>
                                <span className="font-semibold">100%</span>
                            </div>
                        </div>
                    </div>

                    {verificationResult.status === 'REVIEW' && (
                        <div className="text-yellow-200 bg-yellow-900/30 p-4 rounded border border-yellow-700/50 text-sm">
                            <strong>{t('manual_review_required')}:</strong> {verificationResult.details.reason}
                        </div>
                    )}

                    {verificationResult.status === 'FAIL' && (
                        <div className="text-red-200 bg-red-900/30 p-4 rounded border border-red-700/50 text-sm">
                            <strong>{t('verification_failed')}:</strong> {verificationResult.details.reason}
                        </div>
                    )}

                    {verificationResult.status === 'VERIFIED' && (
                        <div className="bg-gray-900 p-4 rounded-lg text-left overflow-x-auto border border-green-800">
                            <h3 className="text-sm text-green-400 font-mono mb-2 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {t('blockchain_anchored')}
                            </h3>
                            <div className="space-y-1">
                                <p className="font-mono text-[10px] text-gray-500 uppercase">{t('transaction_hash')}</p>
                                <p className="font-mono text-xs text-gray-300 break-all select-all">
                                    {verificationResult.hash}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 text-gray-400 hover:text-white underline"
                    >
                        {t('start_over')}
                    </button>
                </div>
            )}

        </div>
    );
};

export default MarkMyLand;
