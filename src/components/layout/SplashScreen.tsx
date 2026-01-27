"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        // Wait for 1.8 seconds (or user configured time) then start fading out
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1800);

        // Wait for fade out animation to finish before unmounting
        const unmountTimer = setTimeout(() => {
            setShouldRender(false);
        }, 2300); // 1800ms delay + 500ms fade duration

        return () => {
            clearTimeout(timer);
            clearTimeout(unmountTimer);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-700 ease-in-out ${isVisible ? "opacity-100 backdrop-blur-none" : "opacity-0 pointer-events-none backdrop-blur-xl"
                }`}
        >
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                {/* Using video tag for WebM loader */}
                <video
                    src="/logo-loader.webm"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    suppressHydrationWarning
                    onLoadedData={() => setVideoLoaded(true)}
                    className={`w-full h-full object-contain transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>
        </div>
    );
}
