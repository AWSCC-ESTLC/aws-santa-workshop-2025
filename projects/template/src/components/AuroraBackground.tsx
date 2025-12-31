import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function AuroraBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate stars
    const generatedStars: Star[] = [];
    for (let i = 0; i < 40; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
      });
    }
    setStars(generatedStars);

    // Generate snowflakes
    const generatedSnowflakes: Snowflake[] = [];
    for (let i = 0; i < 35; i++) {
      generatedSnowflakes.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 12,
        size: Math.random() * 0.6 + 0.4,
      });
    }
    setSnowflakes(generatedSnowflakes);
  }, []);

  return (
    <>
      {/* Christmas gradient background */}
      <div className="aurora-bg" />
      
      {/* Subtle floating orbs with Christmas colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="orb w-80 h-80 bg-primary/10 -top-40 -left-40"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="orb w-64 h-64 bg-secondary/8 top-1/4 -right-32"
          style={{ animationDelay: '4s' }}
        />
        <div 
          className="orb w-48 h-48 bg-accent/6 bottom-24 left-1/3"
          style={{ animationDelay: '8s' }}
        />
      </div>

      {/* Twinkling stars */}
      <div className="stars">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Falling snowflakes */}
      <div className="snowflakes">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
              fontSize: `${flake.size}rem`,
            }}
          >
            ❄
          </div>
        ))}
      </div>
    </>
  );
}
