
import React from 'react';
import { Subject, Feedback, MathFeedback } from '../types';

interface FeedbackPanelProps {
  subject: Subject;
  feedback: Feedback | MathFeedback;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ subject, feedback }) => {
  if (subject === Subject.English) {
    const englishFeedback = feedback as Feedback;
    return (
      <div className="bg-white p-5 rounded-lg shadow-md border border-slate-100 space-y-4">
        <div>
          <h4 className="font-bold text-green-700 text-lg">What you did well</h4>
          <p className="text-slate-700 mt-1 whitespace-pre-wrap">{englishFeedback.wellDone}</p>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-blue-700 text-lg">How to improve for Excellence</h4>
          <p className="text-slate-700 mt-1 whitespace-pre-wrap">{englishFeedback.toImprove}</p>
        </div>
      </div>
    );
  } else {
    const mathFeedback = feedback as MathFeedback;
    return (
      <div className={`p-5 rounded-lg shadow-md border-l-4 ${mathFeedback.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
        <h4 className={`font-bold text-lg ${mathFeedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
          {mathFeedback.isCorrect ? "Correct!" : "Not Quite"}
        </h4>
        <div className="text-slate-700 mt-2 space-y-2 whitespace-pre-wrap">
          <p className="font-semibold">Explanation:</p>
          <p>{mathFeedback.explanation}</p>
        </div>
      </div>
    );
  }
};

export default FeedbackPanel;
