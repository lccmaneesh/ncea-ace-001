
import React, { useState } from 'react';
import { Question } from '../types';
import { Icons } from '../constants';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onSubmit: (answer: string) => void;
  onGetHint?: () => void;
  isLoading: boolean;
  isSubmitted: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber, onSubmit, onGetHint, isLoading, isSubmitted }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-100">
      <p className="text-sm font-semibold text-teal-600 mb-2">Question {questionNumber}</p>
      <p className="text-slate-800 text-lg mb-4 whitespace-pre-wrap">{question.questionText}</p>
      <form onSubmit={handleSubmit}>
        {question.questionType === 'written' ? (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your detailed answer here..."
            className="w-full h-40 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            disabled={isLoading || isSubmitted}
          />
        ) : (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            disabled={isLoading || isSubmitted}
          />
        )}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
                type="submit"
                disabled={!answer.trim() || isLoading || isSubmitted}
                className="w-full sm:w-auto flex-grow bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
            >
                Submit
            </button>
            {onGetHint && (
                <button
                    type="button"
                    onClick={onGetHint}
                    disabled={isLoading || isSubmitted}
                    className="w-full sm:w-auto flex items-center justify-center bg-amber-400 text-amber-900 font-bold py-2 px-4 rounded-lg hover:bg-amber-500 disabled:bg-amber-200 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50"
                >
                    {Icons.lightbulb}
                    Hint
                </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default QuestionCard;
