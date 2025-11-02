import React, { useState, useEffect } from 'react';
import { Subject, Topic, UserProfile } from '../types';
import { SUBJECTS } from '../constants';
import * as userService from '../services/userService';

interface SubjectSelectorProps {
  onTopicSelect: (subject: Subject, topic: Topic) => void;
}

const MasteryBar: React.FC<{ proficiency: number }> = ({ proficiency }) => {
    const width = `${Math.round(proficiency * 100)}%`;
    let bgColor = 'bg-slate-300';
    if (proficiency > 0.75) bgColor = 'bg-green-500';
    else if (proficiency > 0.4) bgColor = 'bg-teal-500';

    return (
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div
                className={`h-1.5 rounded-full ${bgColor} transition-all duration-500`}
                style={{ width }}
            ></div>
        </div>
    );
};


const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onTopicSelect }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(userService.getUserProfile());
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-700">Welcome!</h2>
        <p className="text-slate-500 mt-1">Select a topic to start preparing.</p>
      </div>
      {(Object.keys(SUBJECTS) as Subject[]).map((subject) => (
        <div key={subject}>
          <h3 className="text-lg font-bold text-teal-600 mb-3 border-b-2 border-teal-100 pb-2">{subject}</h3>
          <div className="space-y-3">
            {SUBJECTS[subject].topics.map((topic) => {
              const progress = profile ? profile[topic.id] : null;
              const proficiency = progress ? progress.proficiency : 0;
              
              return (
              <button
                key={topic.id}
                onClick={() => onTopicSelect(subject, topic)}
                className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-teal-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800">{topic.name}</p>
                    {proficiency > 0 && <span className="text-xs font-semibold text-slate-500">Mastery Level</span>}
                </div>
                <p className="text-sm text-slate-500 mt-1">{topic.description}</p>
                {progress && <MasteryBar proficiency={proficiency} />}
              </button>
            )})}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectSelector;
