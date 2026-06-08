interface ShortAnswerQuestionProps {
  question: string;
  answer: string;
  onChange: (answer: string) => void;
  disabled?: boolean;
}

export default function ShortAnswerQuestion({ question, answer, onChange, disabled }: ShortAnswerQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{question}</h2>
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none disabled:opacity-50"
        placeholder="Type your answer here..."
      />
    </div>
  );
}
