import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ChristmasCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isChristmas, setIsChristmas] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let christmas = new Date(currentYear, 11, 25); // December 25th
      
      // If Christmas has passed this year, target next year
      if (now > christmas) {
        christmas = new Date(currentYear + 1, 11, 25);
      }
      
      const difference = christmas.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsChristmas(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  if (isChristmas) {
    return (
      <div className="rounded-xl bg-secondary p-5 text-secondary-foreground animate-fade-in">
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <span className="text-4xl animate-bounce-in">🎄</span>
          <h3 className="text-xl font-display font-semibold">Merry Christmas!</h3>
          <p className="text-sm opacity-80">The big day is here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-secondary p-5 text-secondary-foreground animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-medium flex items-center gap-2">
            🎄 Christmas Countdown
          </h3>
          <p className="text-sm opacity-80 mt-0.5">The big night is approaching</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {timeUnits.map((item, index) => (
            <div key={item.label} className="text-center">
              <div 
                className={cn(
                  "text-lg sm:text-2xl font-semibold bg-secondary-foreground/10 rounded-lg px-2 sm:px-3 py-1.5 tabular-nums min-w-[2.5rem] sm:min-w-[3rem] transition-all duration-300",
                  index === 3 && "animate-pulse-soft"
                )}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <p className="text-[9px] sm:text-[10px] mt-1 uppercase tracking-wide opacity-70">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChristmasCountdown;
