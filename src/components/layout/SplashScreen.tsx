"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Wait for 2 seconds (or user configured time) then start fading out
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);

        // Wait for fade out animation to finish before unmounting
        const unmountTimer = setTimeout(() => {
            setShouldRender(false);
        }, 2500); // 2000ms delay + 500ms fade duration

        return () => {
            clearTimeout(timer);
            clearTimeout(unmountTimer);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#FDFDFD] transition-all duration-700 ease-in-out ${isVisible ? "opacity-100 backdrop-blur-none" : "opacity-0 pointer-events-none backdrop-blur-xl"
                }`}
        >
            <div className="relative w-48 h-48 md:w-64 md:h-64">
                {/* Using video tag for WebM loader */}
                <video
                    src="/logo-loader.webm"
                    autoPlay
                    loop
                    muted
                    playsInline
                    suppressHydrationWarning
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}
