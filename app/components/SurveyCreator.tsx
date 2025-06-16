"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Survey, Question, QuestionOption } from "../types";

interface SurveyCreatorProps {
  onSave: (survey: Survey) => void;
  initialSurvey?: Survey | null;
}

export default function SurveyCreator({ onSave, initialSurvey }: SurveyCreatorProps) {
  const [survey, setSurvey] = useState<Partial<Survey>>({
    title: initialSurvey?.title || "",
    description: initialSurvey?.description || "",
    questions: initialSurvey?.questions || [],
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: "",
    options: [{ id: crypto.randomUUID(), text: "", nextQuestionId: undefined }],
  });

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), { id: crypto.randomUUID(), text: "", nextQuestionId: undefined }],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) =>
        i === index ? { ...opt, text: value } : opt
      ),
    }));
  };

  const updateNextQuestion = (optionIndex: number, nextQuestionId: string | undefined) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) =>
        i === optionIndex ? { ...opt, nextQuestionId } : opt
      ),
    }));
  };

  const startEditingQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const questions = Array.from(survey.questions || []);
    const [reorderedQuestion] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedQuestion);

    // Update nextQuestionId references after reordering
    const updatedQuestions = questions.map(question => ({
      ...question,
      options: question.options.map(option => ({
        ...option,
        nextQuestionId: option.nextQuestionId
      }))
    }));

    setSurvey(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const updateQuestionOrder = (questionId: string, newOrder: number) => {
    if (newOrder < 1 || !survey.questions || newOrder > survey.questions.length) {
      alert("Geçersiz sıra numarası!");
      return;
    }

    const questions = Array.from(survey.questions);
    const questionIndex = questions.findIndex(q => q.id === questionId);
    const [movedQuestion] = questions.splice(questionIndex, 1);
    questions.splice(newOrder - 1, 0, movedQuestion);

    // Update nextQuestionId references after reordering
    const updatedQuestions = questions.map(question => ({
      ...question,
      options: question.options.map(option => ({
        ...option,
        nextQuestionId: option.nextQuestionId
      }))
    }));

    setSurvey(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.options?.length) {
      alert("Lütfen soru metni ve en az bir seçenek girin.");
      return;
    }

    const newQuestion: Question = {
      id: editingQuestionId || crypto.randomUUID(),
      text: currentQuestion.text,
      options: currentQuestion.options.filter(opt => opt.text.trim() !== ""),
    };

    setSurvey((prev) => ({
      ...prev,
      questions: editingQuestionId
        ? prev.questions?.map(q => q.id === editingQuestionId ? newQuestion : q)
        : [...(prev.questions || []), newQuestion],
    }));

    // Reset form
    setCurrentQuestion({
      text: "",
      options: [{ id: crypto.randomUUID(), text: "", nextQuestionId: undefined }],
    });
    setShowQuestionForm(false);
    setEditingQuestionId(null);
  };

  const cancelEdit = () => {
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    setCurrentQuestion({
      text: "",
      options: [{ id: crypto.randomUUID(), text: "", nextQuestionId: undefined }],
    });
  };

  const handleSave = () => {
    if (!survey.title || !survey.description || !survey.questions?.length) {
      alert("Lütfen anket başlığı, açıklaması ve en az bir soru ekleyin.");
      return;
    }

    const newSurvey: Survey = {
      id: initialSurvey?.id || Date.now().toString(),
      title: survey.title,
      description: survey.description,
      questions: survey.questions,
    };

    onSave(newSurvey);
    setSurvey({
      title: "",
      description: "",
      questions: [],
    });
    setShowQuestionForm(false);
    setEditingQuestionId(null);
  };

  const removeOption = (index: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  };

  const removeQuestion = (questionId: string) => {
    // Remove this question from nextQuestionId references
    setSurvey((prev) => {
      const updatedQuestions = prev.questions?.map(question => ({
        ...question,
        options: question.options.map(option => ({
          ...option,
          nextQuestionId: option.nextQuestionId === questionId ? undefined : option.nextQuestionId
        }))
      }));

      return {
        ...prev,
        questions: updatedQuestions?.filter(q => q.id !== questionId),
      };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Anket Başlığı</label>
        <input
          type="text"
          value={survey.title}
          onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Anket Açıklaması</label>
        <textarea
          value={survey.description}
          onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {survey.questions && survey.questions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Eklenen Sorular</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {survey.questions.map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={question.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400 hover:text-gray-600"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sıra:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={survey.questions.length}
                                  value={index + 1}
                                  onChange={(e) => updateQuestionOrder(question.id, parseInt(e.target.value))}
                                  className="w-16 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <p className="font-medium">{question.text}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditingQuestion(question)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Düzenle"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeQuestion(question.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Sil"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {question.options.map((option) => (
                              <li key={option.id} className="text-sm text-gray-600">
                                • {option.text}
                                {option.nextQuestionId && (
                                  <span className="text-blue-600 ml-2">
                                    → {survey.questions?.find(q => q.id === option.nextQuestionId)?.text}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {!showQuestionForm ? (
        <button
          type="button"
          onClick={() => setShowQuestionForm(true)}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Yeni Soru Ekle
        </button>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingQuestionId ? 'Soruyu Düzenle' : 'Yeni Soru'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Soru Metni</label>
              <input
                type="text"
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, text: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seçenekler</label>
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder={`Seçenek ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sonraki Soru</label>
                      <select
                        value={option.nextQuestionId || ""}
                        onChange={(e) => updateNextQuestion(index, e.target.value || undefined)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Sonraki soru yok</option>
                        {survey.questions?.map((q) => (
                          q.id !== editingQuestionId && (
                            <option key={q.id} value={q.id}>
                              {q.text}
                            </option>
                          )
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Seçenek Ekle
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingQuestionId ? 'Kaydet' : 'Soru Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Anketi Kaydet
      </button>
    </div>
  );
}
