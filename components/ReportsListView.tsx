import React, { useState, useEffect } from 'react';
import * as reportService from '../services/reportService';
import * as pdfService from '../services/pdfService';
import { Report, SessionData, Subject, Feedback, MathFeedback } from '../types';

const ReportDetails: React.FC<{ report: Report }> = ({ report }) => {
    return (
        <div className="p-4 bg-slate-50 mt-2 rounded-b-lg space-y-6">
            {report.sessionData.map((data, index) => (
                <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0">
                    <p className="font-bold text-slate-700">Question {index + 1}</p>
                    <p className="mt-1 text-slate-600 whitespace-pre-wrap">{data.question.questionText}</p>
                    
                    <p className="font-bold text-slate-700 mt-3">Your Answer</p>
                    <p className="mt-1 text-slate-600 bg-slate-100 p-2 rounded whitespace-pre-wrap">{data.answer || 'N/A'}</p>

                    <p className="font-bold text-slate-700 mt-3">Feedback</p>
                    <div className="mt-1">
                        {report.subject === Subject.English ? (
                            <div className="space-y-2">
                                <p className="text-green-700"><span className="font-semibold">Well done:</span> {(data.feedback as Feedback).wellDone}</p>
                                <p className="text-blue-700"><span className="font-semibold">To improve:</span> {(data.feedback as Feedback).toImprove}</p>
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <p className={(data.feedback as MathFeedback).isCorrect ? 'text-green-700' : 'text-red-700'}>
                                    <span className="font-semibold">Result:</span> {(data.feedback as MathFeedback).isCorrect ? ' Correct' : ' Incorrect'}
                                </p>
                                <p className="text-slate-700"><span className="font-semibold">Explanation:</span> {(data.feedback as MathFeedback).explanation}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};


const ReportsListView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    setReports(reportService.getReports());
  }, []);

  if (reports.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-slate-700">No Reports Found</h2>
        <p className="text-slate-500 mt-2">Complete a lesson and save the report to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <details key={report.id} className="bg-white border border-slate-200 rounded-lg shadow-sm open:shadow-md transition-shadow">
            <summary className="p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-800">
                <div>
                    <p>{report.topicName} <span className="text-sm font-normal text-slate-500">({report.subject})</span></p>
                    <p className="text-xs font-normal text-slate-400 mt-1">{new Date(report.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            pdfService.generatePdfReport(report);
                        }}
                        className="text-sm bg-teal-500 text-white font-bold py-1 px-3 rounded-md hover:bg-teal-600 transition-colors"
                    >
                        PDF
                    </button>
                    <span className="text-slate-400 transform transition-transform details-arrow group-open:rotate-90">▶</span>
                </div>
            </summary>
            <ReportDetails report={report} />
        </details>
      ))}
       <style>{`
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] > summary span:last-child { transform: rotate(90deg); }
      `}</style>
    </div>
  );
};

export default ReportsListView;
