'use client';

import { Survey, Question, Response } from '@/app/types/index';
import { useEffect, useState } from 'react';

interface SurveyFlowModalProps {
  survey: Survey;
  userResponse: Response;
  onClose: () => void;
}

interface QuestionNode {
  question: Question;
  isAnswered: boolean;
  answer?: string;
  selectedOptionId?: string;
  nextQuestionId?: string | null;
  displayIndex: number;
}

export default function SurveyFlowModal({ survey, userResponse, onClose }: SurveyFlowModalProps) {
  const [questionFlow, setQuestionFlow] = useState<QuestionNode[]>([]);

  useEffect(() => {
    const buildQuestionFlow = () => {
      const flow: QuestionNode[] = [];
      let displayIndex = 1;

      // İlk soruyu bul ve akışı başlat
      const firstQuestion = survey.questions[0];
      if (!firstQuestion) return [];

      let currentQuestionId = firstQuestion.id;
      const processedQuestions = new Set<string>();

      while (currentQuestionId && !processedQuestions.has(currentQuestionId)) {
        // Mevcut soruyu bul
        const currentQuestion = survey.questions.find(q => q.id === currentQuestionId);
        if (!currentQuestion) break;

        // Bu soruya ait yanıtı bul
        const answer = userResponse.answers.find(a => a.questionId === currentQuestionId);

        // Seçilen seçeneği bul
        const selectedOption = answer
          ? currentQuestion.options.find(o => o.id === answer.optionId)
          : null;

        // Soru düğümünü oluştur
        const questionNode: QuestionNode = {
          question: currentQuestion,
          isAnswered: !!answer,
          answer: selectedOption?.text,
          selectedOptionId: answer?.optionId,
          nextQuestionId: selectedOption ? currentQuestion.nextQuestionMap[selectedOption.id] : null,
          displayIndex: displayIndex++
        };

        flow.push(questionNode);
        processedQuestions.add(currentQuestionId);

        // Bir sonraki soruya geç
        if (selectedOption) {
          const nextId = currentQuestion.nextQuestionMap[selectedOption.id];
          currentQuestionId = nextId || '';
        } else {
          break;
        }
      }

      // Akışta olmayan soruları sona ekle
      survey.questions.forEach(question => {
        if (!processedQuestions.has(question.id)) {
          const answer = userResponse.answers.find(a => a.questionId === question.id);
          const selectedOption = answer
            ? question.options.find(o => o.id === answer.optionId)
            : null;

          flow.push({
            question,
            isAnswered: !!answer,
            answer: selectedOption?.text,
            selectedOptionId: answer?.optionId,
            nextQuestionId: selectedOption ? question.nextQuestionMap[selectedOption.id] : null,
            displayIndex: displayIndex++
          });
        }
      });

      return flow;
    };

    setQuestionFlow(buildQuestionFlow());
  }, [survey, userResponse]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Anket Akışı</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {questionFlow.map((node) => (
              <div
                key={node.question.id}
                className={`p-4 rounded-xl border-2 ${
                  node.isAnswered
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-lg font-medium">
                      {node.displayIndex}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-lg font-medium text-gray-900">
                      {node.question.text}
                    </p>
                    {node.isAnswered && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-500">Cevap:</span>{' '}
                        <span className="text-sm text-gray-900">{node.answer}</span>
                      </div>
                    )}
                    {node.nextQuestionId && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        Sonraki Soru: {questionFlow.find(q => q.question.id === node.nextQuestionId)?.displayIndex || '?'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
