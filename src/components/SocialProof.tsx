"use client";

import React from 'react';

const users = [
    "/images/users/air4future.jpg",
    "/images/users/ashramana.jpg",
    "/images/users/ioanna.jpg",
    "/images/users/chris.jpg"
];

export const SocialProof = () => {
    return (
        <div className="flex flex-col-reverse md:flex-row items-center md:flex-nowrap gap-4 relative z-50">
            <span
                className="text-white tracking-tight-custom font-sans font-bold relative inline-block z-10 whitespace-nowrap"
                style={{ fontSize: '15px' }}
            >
                <span className="relative z-10">4 500+ tvůrců prošlo mými programy</span>
                {/* Hand-drawn marker red underline */}
                <svg className="absolute left-[-2%] bottom-[-8px] w-[104%] h-3 text-[#FF0E00] z-0 pointer-events-none" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 9C50 3 150 3 298 9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
            </span>

            <div className="flex -space-x-3">
                {users.map((url, i) => (
                    <div
                        key={i}
                        className="w-10 h-10 rounded-full border border-white/20 overflow-hidden relative"
                        style={{
                            boxShadow: "inset 0px 1px 2px 0px rgba(255, 255, 255, 0.06), 0px 8px 20px 0px rgba(0, 0, 0, 0.4)",
                            zIndex: users.length - i // Ensures left-to-right stacking
                        }}
                    >
                        <img
                            src={url}
                            alt="Creator profile"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
