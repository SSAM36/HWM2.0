import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Loader2, Navigation } from 'lucide-react';
import { useVoiceStore, useLanguageStore } from '../../store/themeStore';
import { processVoiceLocally } from '../../utils/localVoiceProcessor';

const VoiceFloatingButton = () => {
    const { t } = useTranslation();
    const {
        isListening,
        startListening,
        stopListening,
        transcript,
        setTranscript,
        isProcessing,
        setIsProcessing,
        feedback,
        setFeedback,
        setLastAction
    } = useVoiceStore();

    const { language } = useLanguageStore();
    const navigate = useNavigate();
    const location = useLocation();
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);



    const executeAction = (action) => {
        if (!action) return;

        try {
            if (action.type === 'fill') {
                // 1. Try direct selector or common attributes
                const s = action.selector;
                let element = document.querySelector(s) ||
                    document.querySelector(`input[name*="${s}" i]`) ||
                    document.querySelector(`input[id*="${s}" i]`) ||
                    document.querySelector(`input[placeholder*="${s}" i]`);

                // 2. If not found, search by labels
                if (!element) {
                    const labels = Array.from(document.querySelectorAll('label'));
                    const targetLabel = labels.find(l =>
                        l.innerText?.toLowerCase().includes(s.toLowerCase())
                    );

                    if (targetLabel) {
                        if (targetLabel.htmlFor) {
                            element = document.getElementById(targetLabel.htmlFor);
                        } else {
                            element = targetLabel.querySelector('input, select, textarea');
                        }
                    }
                }

                if (element) {
                    element.focus();
                    element.value = action.value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.blur();
                }
            } else if (action.type === 'multi') {
                action.actions.forEach(act => executeAction(act));
            } else if (action.type === 'click') {
                if (action.selector === 'refresh') {
                    window.location.reload();
                    return;
                }

                let target = document.querySelector(action.selector);

                if (!target) {
                    const interactives = Array.from(document.querySelectorAll('button, a, input[type="button"], [role="button"], label'));
                    target = interactives.find(el => {
                        const text = el.innerText?.toLowerCase().trim();
                        const search = action.selector.toLowerCase().trim();
                        return text && (text.includes(search) || search.includes(text));
                    });
                }

                if (target) {
                    target.click();
                }
            } else if (action.type === 'chat') {
                // Find chat input (e.g., on Schemes page)
                const chatInput = document.querySelector('input[placeholder*="Ask about subsidies"]') ||
                    document.querySelector('input[placeholder*="Ask me anything"]');
                if (chatInput) {
                    chatInput.value = action.query;
                    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                    chatInput.dispatchEvent(new Event('change', { bubbles: true }));

                    // Click the send button (usually the sibling or nearby)
                    const sendBtn = chatInput.parentElement.querySelector('button');
                    if (sendBtn) sendBtn.click();
                }
            } else if (action.type === 'scroll') {
                window.scrollBy({ top: action.value === 'down' ? 500 : -500, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Action execution failed", err);
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : (language === 'mr' ? 'mr-IN' : 'en-IN');

            recognitionRef.current.onresult = (event) => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                silenceTimerRef.current = setTimeout(() => {
                    recognitionRef.current.stop();
                }, 2000);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setFeedback(t('voice_error'));
                stopListening();
                setIsProcessing(false);
            };

            recognitionRef.current.onend = async () => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                const finalTranscript = useVoiceStore.getState().transcript;

                if (finalTranscript && finalTranscript.trim().length > 0) {
                    stopListening();
                    setIsProcessing(true);

                    // Process locally using the browser's webkit transcript
                    const result = processVoiceLocally(finalTranscript, location.pathname);

                    // Clean feedback for display and speech (removes ** markdown)
                    const cleanFeedback = result.feedback.replace(/\*\*/g, '');
                    setFeedback(cleanFeedback);

                    // Speak the feedback back to user
                    const utterance = new SpeechSynthesisUtterance(cleanFeedback);
                    utterance.lang = language === 'hi' ? 'hi-IN' : (language === 'mr' ? 'mr-IN' : 'en-IN');
                    window.speechSynthesis.speak(utterance);

                    if (result.targetPath) {
                        setTimeout(() => {
                            navigate(result.targetPath);
                            setIsProcessing(false);
                            setTimeout(() => setFeedback(''), 3000);
                        }, 1000);
                    } else if (result.action) {
                        setLastAction(result.action);
                        executeAction(result.action);
                        setIsProcessing(false);
                        setTimeout(() => setFeedback(''), 3000);
                    } else {
                        setIsProcessing(false);
                        setTimeout(() => setFeedback(''), 3000);
                    }
                } else {
                    stopListening();
                    setFeedback("");
                }
            };
        } else {
            setFeedback(t('voice_not_supported'));
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [language, navigate, location.pathname, setFeedback, setIsProcessing, setTranscript, stopListening, setLastAction]);


    const handleToggle = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            stopListening();
        } else {
            setTranscript('');
            setFeedback(t('voice_listening') + '...');
            startListening();
            recognitionRef.current?.start();
        }
    };

    // Hide on Auth pages
    if (location.pathname === '/auth' || location.pathname === '/auth-face') {
        return null;
    }

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">

            <AnimatePresence>
                {(isListening || isProcessing || feedback) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-dark-navy/90 backdrop-blur-md border border-organic-green/30 p-4 rounded-xl shadow-2xl mb-2 max-w-xs text-right"
                    >
                        {/* Status Header */}
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wider text-organic-green font-bold">
                                {isProcessing ? t('ai_processing') : isListening ? t('voice_listening') : t('voice_assistant')}
                            </span>
                            {isProcessing && <Loader2 className="animate-spin w-3 h-3 text-organic-green" />}
                        </div>

                        {/* Transcript / Feedback */}
                        <p className="text-white text-sm font-medium leading-relaxed">
                            {feedback || transcript || "..."}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                {/* Pulse Effect */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1.5, 2, 1.5] }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 bg-neon-green rounded-full opacity-20 blur-xl pointer-events-none"
                            transition={{
                                duration: 1.5,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                        />
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggle}
                    disabled={isProcessing}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all border-2 z-10 ${isListening
                        ? 'bg-organic-green border-neon-green text-dark-navy shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                        : isProcessing
                            ? 'bg-dark-navy border-organic-green text-organic-green cursor-wait'
                            : 'bg-dark-navy border-white/10 text-white hover:border-organic-green'
                        }`}
                >
                    {isProcessing ? (
                        <Navigation className="animate-pulse" size={28} />
                    ) : isListening ? (
                        <Mic className="animate-pulse" size={28} />
                    ) : (
                        <Mic size={28} />
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default VoiceFloatingButton;
