"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useMotionValueEvent, useDragControls } from 'framer-motion';

const isoValues = ["50", "100", "200", "400", "800", "1600", "3200", "6400", "12800", "25600", "51200"];
const step = 30; // degrees per ISO value
const defaultIndex = 0; // Starts at ISO 50

interface IsoWheelProps {
    onValueChange: (progress: number) => void;
}

export const IsoWheel: React.FC<IsoWheelProps> = ({ onValueChange }) => {
    // Controls dragging without moving the visual container
    const dragControls = useDragControls();

    // x controls the drag pixel position.
    const x = useMotionValue(0);
    // 1 pixel of drag = 0.4 degrees of rotation
    const rotation = useTransform(x, (val) => val * 0.4);
    
    const maxIndex = isoValues.length - 1;
    const minRotation = -maxIndex * step; // -300 degrees
    const maxRotation = 0; // 0 degrees

    // x bounds corresponding to those rotations
    const minX = minRotation / 0.4;
    const maxX = maxRotation / 0.4;
    const stepX = step / 0.4;

    useMotionValueEvent(rotation, "change", (val) => {
        let idx = defaultIndex - Math.round(val / step);
        idx = Math.max(0, Math.min(maxIndex, idx));
        onValueChange(idx / maxIndex); 
    });

    useEffect(() => {
        // trigger initial callback
        onValueChange(defaultIndex / maxIndex);
    }, []);

    const wheelTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const handleWheel = (e: React.WheelEvent) => {
        const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const delta = rawDelta * 0.5; 
        
        let nextX = x.get() - delta;
        nextX = Math.max(minX, Math.min(maxX, nextX));
        
        x.stop();
        x.set(nextX);

        if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
        wheelTimeout.current = setTimeout(() => {
            const snappedX = Math.round(x.get() / stepX) * stepX;
            // animate is available from framer-motion instance
            import('framer-motion').then(({ animate }) => {
                animate(x, snappedX, {
                    type: "spring",
                    stiffness: 1000,
                    damping: 40
                });
            });
        }, 150);
    };

    return (
        <div 
            className="relative w-full h-full select-none touch-none rounded-full flex items-center justify-center p-2 cursor-grab active:cursor-grabbing z-30" 
            style={{ touchAction: "none" }}
            onPointerDown={(e) => dragControls.start(e)}
            onWheel={handleWheel}
        >
            
            {/* Background disc representing the wheel body */}
            <div className="absolute inset-0 rounded-full bg-transparent" />
            
            {/* STATIC OUTER RING: Ticks */}
            <div className="absolute inset-[4%] md:inset-[6%] pointer-events-none">
                {Array.from({ length: 72 }).map((_, i) => {
                    const angle = i * 5; // 72 * 5 = 360 degrees
                    const isTopMarker = i === 0;
                    const isMajorTick = i % 6 === 0; // Every 30 degrees (6 * 5 = 30)

                    return (
                        <div key={i} className="absolute top-0 left-0 w-full h-full flex justify-center" style={{ transform: `rotate(${angle}deg)` }}>
                            <div 
                                className={`bg-white rounded-full ${
                                    isTopMarker 
                                        ? 'w-[2px] h-[12%] mt-0' 
                                        : isMajorTick 
                                            ? 'w-[1.5px] h-[8%] mt-[1%] opacity-80' 
                                            : 'w-[1px] h-[5%] mt-[2.5%] opacity-40'
                                }`} 
                            />
                        </div>
                    );
                })}
            </div>

            {/* ROTATING INNER RING: Numbers */}
            <motion.div 
               style={{ rotate: rotation }}
               className="absolute inset-0 rounded-full pointer-events-none"
            >
                {isoValues.map((iso, i) => {
                    // Angle relative to the default index
                    const angle = (i - defaultIndex) * step;
                    
                    return (
                        <div key={iso} className="absolute top-0 left-0 w-full h-full flex justify-center" style={{ transform: `rotate(${angle}deg)` }}>
                            {/* Inner numbers placed relative to the diameter using top% */}
                            <div 
                                className="absolute text-white font-mono text-[9px] sm:text-[12px] md:text-[16px] font-bold tracking-tighter mix-blend-normal origin-center"
                                style={{ transform: 'rotate(90deg)', top: '19%' }}
                            >
                                {iso}
                            </div>
                        </div>
                    )
                })}
            </motion.div>

            {/* Drag Receiver - Invisible physical dragger decoupled from interaction area */}
            <motion.div 
               drag="x"
               dragControls={dragControls}
               dragListener={false}
               dragConstraints={{ left: minX, right: maxX }}
               // Modify target ensures the drag stops cleanly on detent intervals with camera dial stiffness
               dragTransition={{ 
                   power: 0.2,
                   timeConstant: 150,
                   modifyTarget: target => Math.round(target / stepX) * stepX,
                   bounceStiffness: 1000,
                   bounceDamping: 40
               }}
               style={{ x }}
               className="absolute pointer-events-none opacity-0"
            />
        </div>
    );
};
