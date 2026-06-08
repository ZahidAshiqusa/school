interface MCQQuestionProps {
  question: string;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export default function MCQQuestion({ question, options, selectedIndex, onSelect, disabled }: MCQQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{question}</h2>
      <div className="space-y-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedIndex === idx
                ? 'border-primary bg-blue-50 text-primary font-medium'
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="inline-flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                selectedIndex === idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
