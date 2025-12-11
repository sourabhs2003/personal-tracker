import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight Canvas Confetti
 * Triggers a single burst of confetti
 */
export default function Confetti({ trigger, onComplete }) {
    const canvasRef = useRef(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsActive(true);
            fireConfetti();
        }
    }, [trigger]);

    const fireConfetti = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20 - 10,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        let animationFrame;
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;

            particles.forEach(p => {
                if (p.opacity <= 0) return;
                activeParticles++;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5; // Gravity
                p.rotation += p.rotationSpeed;
                p.opacity -= 0.005;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            if (activeParticles > 0) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setIsActive(false);
                if (onComplete) onComplete();
            }
        };

        animate();

        return () => cancelAnimationFrame(animationFrame);
    };

    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}
