import React, { useState } from 'react';
import { Subject, Topic } from './types';
import SubjectSelector from './components/SubjectSelector';
import LessonView from './components/LessonView';
import ReportsListView from './components/ReportsListView';
import { Icons } from './constants';

type View = 'selector' | 'lesson' | 'reports';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('selector');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleTopicSelect = (subject: Subject, topic: Topic) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setCurrentView('lesson');
  };

  const handleGoHome = () => {
    setSelectedSubject(null);
    setSelectedTopic(null);
    setCurrentView('selector');
  };

  const handleGoToReports = () => {
    setCurrentView('reports');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'lesson':
        return <LessonView subject={selectedSubject!} topic={selectedTopic!} onComplete={handleGoHome} />;
      case 'reports':
        return <ReportsListView />;
      case 'selector':
      default:
        return <SubjectSelector onTopicSelect={handleTopicSelect} />;
    }
  };
  
  const getHeaderText = () => {
      if (currentView === 'reports') return 'Session Reports';
      if (currentView === 'lesson') return 'NCEA Ace';
      return 'NCEA Ace';
  }

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <div className="container mx-auto max-w-2xl p-4 sm:p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {currentView !== 'selector' && (
              <button
                onClick={handleGoHome}
                className="p-2 rounded-full hover:bg-slate-200 transition-colors mr-2"
                aria-label="Back to home"
              >
                {Icons.back}
              </button>
            )}
             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {getHeaderText()}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {currentView === 'selector' && (
                <button 
                    onClick={handleGoToReports}
                    className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                    aria-label="View reports"
                >
                    {Icons.reports}
                </button>
            )}
            {currentView === 'lesson' && selectedTopic && (
                <div className="text-right">
                    <div className="font-semibold text-slate-700">{selectedSubject}</div>
                    <div className="text-sm text-slate-500">{selectedTopic.name}</div>
                </div>
            )}
          </div>
        </header>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;