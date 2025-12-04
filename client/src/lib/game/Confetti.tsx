import React, { useEffect, useRef } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const lastTimeRef = useRef<number>(0);

  const getRandomColor = () => {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addConfetti = (x: number, y: number, count: number = 50) => {
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 10 + 5;
      const color = getRandomColor();
      const velocityX = (Math.random() - 0.5) * 100;
      const velocityY = Math.random() * -100 - 50;
      const rotation = Math.random() * Math.PI * 2;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;
      const lifetime = 0;
      const maxLifetime = Math.random() * 2 + 1;

      newParticles.push({
        x, y, size, color, velocityX, velocityY,
        rotation, rotationSpeed, lifetime, maxLifetime
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  const updateParticles = (deltaTime: number) => {
    const updatedParticles = particlesRef.current.filter(particle => {
      particle.x += particle.velocityX * deltaTime;
      particle.y += particle.velocityY * deltaTime;
      particle.velocityY += 100 * deltaTime; // gravity
      particle.rotation += particle.rotationSpeed;
      particle.lifetime += deltaTime;

      return particle.lifetime < particle.maxLifetime;
    });
    particlesRef.current = updatedParticles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    let animationFrameId: number;
    const animate = (time: number) => {
      if (!ctx) return;

      const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and render particles
      updateParticles(deltaTime);

      // Render particles
      for (const particle of particlesRef.current) {
        ctx.save();
        ctx.fillStyle = particle.color;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Add some initial confetti
  useEffect(() => {
    addConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    />
  );
};
