import { useEffect, useState } from 'react';

/**
 * Animated number component with count-up effect
 * @param {number} value - Target value to animate to
 * @param {string} suffix - Optional suffix (e.g., " min", "%")
 * @param {number} duration - Animation duration in ms (default 800)
 */
export default function AnimatedNumber({ value, suffix = '', duration = 800 }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime = null;
        const startValue = 0;
        const endValue = value || 0;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * easeOut;

            setDisplayValue(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className="tabular-nums">
            {displayValue}{suffix}
        </span>
    );
}
