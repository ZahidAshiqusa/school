interface ExamTimerProps {
  timeLeft: number;
  total: number;
}

export default function ExamTimer({ timeLeft, total }: ExamTimerProps) {
  const percentage = (timeLeft / total) * 100;
  const isWarning = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div className={`flex items-center gap-3 ${isCritical ? 'animate-pulse' : ''}`}>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            className="stroke-gray-200"
            strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            className={`transition-all duration-300 ${
              isCritical ? 'stroke-red-500' : isWarning ? 'stroke-amber-500' : 'stroke-green-500'
            }`}
            strokeWidth="3"
            strokeDasharray={`${percentage} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${
          isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-800'
        }`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
}
