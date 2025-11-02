import { Subject, Topic } from './types';

export const SUBJECTS: { [key in Subject]: { topics: Topic[] } } = {
  [Subject.English]: {
    topics: [
      { id: 'of-mice-and-men-themes', name: 'Of Mice and Men: Themes', description: 'Explore key themes like friendship, dreams, and loneliness.' },
      { id: 'of-mice-and-men-characters', name: 'Of Mice and Men: Characters', description: 'Analyze the main characters like George and Lennie.' },
      { id: 'unfamiliar-text', name: 'Unfamiliar Text', description: 'Practice analyzing unseen texts for language and purpose.' },
    ],
  },
  [Subject.Mathematics]: {
    topics: [
      { id: 'algebra', name: 'Algebra', description: 'Practice algebraic equations and expressions (AS91027).' },
      { id: 'trigonometry', name: 'Trigonometry', description: 'Solve problems using sine, cosine, and tangent.' },
    ],
  },
};

export const Icons = {
  back: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  lightbulb: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 100 2h.01a1 1 0 100-2H11zM10 1a1 1 0 00-1 1v1a1 1 0 002 0V2a1 1 0 00-1-1zM10 15a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM5.05 3.95a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 10a1 1 0 001 1h1a1 1 0 100-2H4a1 1 0 00-1 1zM15 10a1 1 0 001 1h1a1 1 0 100-2h-1a1 1 0 00-1 1zM14.24 14.95a1 1 0 00-1.414-1.414l-.707.707a1 1 0 101.414 1.414l.707-.707zM14.95 5.05a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM10 5a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
  ),
  reports: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};