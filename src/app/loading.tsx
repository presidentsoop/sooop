"use client";

import { useState, useEffect } from 'react';

export default function Loading() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 2000); // keep loader visible at least 2 seconds
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] z-50 animate-loaderDelay">
            <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    {/* Using video tag for WebM format */}
                    <video
                        src="/logo-loader.webm"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
