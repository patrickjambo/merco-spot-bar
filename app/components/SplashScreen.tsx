"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Canvas Fireworks "Advanced Technology"
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];
    const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ffffff", "#fdfd96"];

    function createFirework(x: number, y: number) {
      const particleCount = 100 + Math.random() * 80;
      for (let i = 0; i < particleCount; i++) {
        const speed = 2 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: Math.random() * 2.5 + 1.5,
          decay: Math.random() * 0.015 + 0.015,
          gravity: 0.05
        });
      }
    }

    const interval = setInterval(() => {
      createFirework(
        Math.random() * width,
        Math.random() * (height * 0.5) + height * 0.1
      );
    }, 600);
    
    // Initial burst
    createFirework(width / 2, height / 3);

    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);
      ctx!.fillStyle = "rgba(0, 0, 0, 0.2)"; // Creates a trail effect
      ctx!.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Fade out timers
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 3800);

    const timer = setTimeout(() => {
      setShow(false);
    }, 4500);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(fadeTimer);
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        .splash-bg {
          background-color: #000;
          overflow: hidden;
        }

        .cinematic-zoom {
          animation: epicZoom 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          transform-origin: center center;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          inset: 0;
          z-index: 10;
        }

        @keyframes epicZoom {
          0% { 
            transform: scale(0.3); 
            opacity: 0; 
            filter: drop-shadow(0 0 0px rgba(255,255,255,0));
          }
          15% { 
            opacity: 1; 
          }
          100% { 
            transform: scale(1.6);
            opacity: 1; 
            filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));
          }
        }

        .logo-wrap {
          position: relative;
          width: 350px;
          height: 350px;
        }

        /* Separate text animation so it doesn't wrap/zoom exactly like the logo */
        .welcome-text {
          position: absolute;
          bottom: 12vh;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          font-size: 2.5rem;
          font-weight: 900;
          text-align: center;
          background: linear-gradient(to right, #fbbf24, #ffffff, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0px 4px 20px rgba(0,0,0,0.8);
          animation: textFadeIn 2.5s ease-out forwards;
          opacity: 0;
          line-height: 1.2;
          width: 90vw;
        }

        @keyframes textFadeIn {
          0% { opacity: 0; transform: translate(-50%, 30px); }
          30% { opacity: 0; transform: translate(-50%, 30px); } /* delayed start */
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        
        @media (max-width: 600px) {
          @keyframes epicZoom {
            0% { transform: scale(0.3); opacity: 0; }
            15% { opacity: 1; }
            100% { transform: scale(1.1); opacity: 1; }
          }
          .welcome-text {
            font-size: 1.8rem;
            bottom: 15vh;
          }
          .logo-wrap {
            width: 250px;
            height: 250px;
          }
        }
      `}</style>
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center splash-bg transition-opacity duration-700 pointer-events-none ${fade ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Advanced HTML5 Canvas Fireworks Background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0" 
          style={{ width: '100vw', height: '100vh', display: 'block' }} 
        />

        {/* Cinematic Zoom Logo Content - Isolated from text */}
        <div className="cinematic-zoom">
          <div className="logo-wrap">
            <Image 
              src="/logo.png" 
              alt="Merico Spot Logo" 
              fill 
              className="object-contain" 
              priority 
            />
          </div>
        </div>

        {/* Separated Welcome Text */}
        <div className="welcome-text">
          Welcome to<br/>Merico Spot Bar & Grill
        </div>
      </div>
    </>
  );
}
