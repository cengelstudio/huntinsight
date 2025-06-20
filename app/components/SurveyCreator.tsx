"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Survey, Question, Option } from "../types";

interface SurveyCreatorProps {
  onSave: (survey: Survey) => void;
  initialSurvey?: Survey | null;
  responses?: any[];
}

export default function SurveyCreator({ onSave, initialSurvey, responses = [] }: SurveyCreatorProps) {
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

  // Check if survey has responses (read-only mode)
  const hasResponses = initialSurvey && responses.some(response => response.surveyId === initialSurvey.id);
  const isReadOnly = hasResponses;

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

    // Map nextQuestionMap back to options for editing
    const optionsWithNextQuestion = question.options.map(option => ({
      ...option,
      nextQuestionId: question.nextQuestionMap?.[option.id] || undefined
    }));

    setCurrentQuestion({
      ...question,
      options: optionsWithNextQuestion
    });
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
      nextQuestionMap: (currentQuestion.options || []).reduce((map, opt) => {
        map[opt.id] = opt.nextQuestionId || null;
        return map;
      }, {} as Record<string, string | null>),
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
    if (isReadOnly) {
      alert("Bu anket düzenlenemez çünkü zaten yanıtlar alınmış.");
      return;
    }

    if (!survey.title || !survey.description || !survey.questions?.length) {
      alert("Lütfen anket başlığı, açıklaması ve en az bir soru ekleyin.");
      return;
    }

    const newSurvey: Survey = {
      id: initialSurvey?.id || Date.now().toString(),
      title: survey.title!,
      description: survey.description!,
      questions: survey.questions || [],
      createdAt: initialSurvey?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

        // API call will be handled by the parent component (AdminPanel)

    onSave(newSurvey);

    if (!initialSurvey) {
      setSurvey({
        title: "",
        description: "",
        questions: [],
      });
      setShowQuestionForm(false);
      setEditingQuestionId(null);
    }
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
    <div className="space-y-6 lg:space-y-8">
      {/* Read-Only Warning */}
      {isReadOnly && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-amber-600 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-amber-800 mb-2">⚠️ Anket Düzenlenemez</h3>
              <p className="text-amber-700">
                Bu ankete zaten <strong>{responses.filter(r => r.surveyId === initialSurvey?.id).length} yanıt</strong> verilmiş.
                Yanıt alınan anketler güvenlik nedeniyle düzenlenemez. Sadece görüntüleme modunda açılmıştır.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Survey Basic Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-100">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Anket Bilgileri
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Anket Başlığı
            </label>
            <input
              type="text"
              value={survey.title || ""}
              onChange={(e) => !isReadOnly && setSurvey(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Anket başlığını giriniz..."
              readOnly={!!isReadOnly}
              className={`w-full px-4 py-3 lg:py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 transition-all duration-200 backdrop-blur-sm ${
                isReadOnly
                  ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                  : 'border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Anket Açıklaması
            </label>
            <textarea
              value={survey.description || ""}
              onChange={(e) => !isReadOnly && setSurvey(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Anket açıklamasını giriniz..."
              rows={3}
              readOnly={!!isReadOnly}
              className={`w-full px-4 py-3 lg:py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 transition-all duration-200 backdrop-blur-sm resize-none ${
                isReadOnly
                  ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                  : 'border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
        <div className="p-6 lg:p-8 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sorular ({survey.questions?.length || 0})
              </h3>
              <p className="text-sm text-gray-600 mt-1">Anket sorularınızı ekleyin ve düzenleyin</p>
            </div>
            <button
              onClick={() => !isReadOnly && setShowQuestionForm(true)}
              disabled={!!isReadOnly}
              className={`inline-flex items-center px-4 py-2 lg:px-5 lg:py-3 text-sm font-medium rounded-xl shadow-sm transition-all duration-200 ${
                isReadOnly
                  ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  : 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Soru
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 lg:p-8">
          {survey.questions && survey.questions.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {survey.questions?.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 transition-all duration-200 ${
                              snapshot.isDragging
                                ? 'border-blue-300 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="p-4 lg:p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center mb-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 cursor-move hover:bg-blue-200 transition-colors duration-200"
                                    >
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
                                      Soru {index + 1}
                                    </span>
                                  </div>
                                  <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">
                                    {question.text}
                                  </h4>
                                  <div className="space-y-2">
                                    {question.options.map((option, optIndex) => (
                                      <div key={option.id} className="bg-white/70 rounded-lg px-3 py-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                          <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                            {optIndex + 1}
                                          </span>
                                          {option.text}
                                        </div>
                                        {option.nextQuestionId && (
                                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                                            → {survey.questions?.find(q => q.id === option.nextQuestionId)?.text || 'Bilinmeyen soru'}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => !isReadOnly && startEditingQuestion(question)}
                                    disabled={!!isReadOnly}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      isReadOnly
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                    title={isReadOnly ? "Düzenleme devre dışı" : "Düzenle"}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => !isReadOnly && removeQuestion(question.id)}
                                    disabled={!!isReadOnly}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      isReadOnly
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-red-600 hover:bg-red-50'
                                    }`}
                                    title={isReadOnly ? "Silme devre dışı" : "Sil"}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Soru Yok</h3>
              <p className="text-gray-600 mb-6">İlk sorunuzu eklemek için "Yeni Soru" butonuna tıklayın.</p>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                İlk Soruyu Ekle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
                  {editingQuestionId ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Question Text */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Soru Metni
                  </label>
                  <textarea
                    value={currentQuestion.text || ""}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Sorunuzu yazınız..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Cevap Seçenekleri
                    </label>
                    <button
                      onClick={addOption}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Seçenek Ekle
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={option.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-medium text-indigo-600 flex-shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`${index + 1}. seçenek`}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          />
                          {currentQuestion.options && currentQuestion.options.length > 1 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Seçeneği Sil"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Next Question Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Bu cevap seçilirse sonraki soru:
                          </label>
                          <select
                            value={option.nextQuestionId || ""}
                            onChange={(e) => updateNextQuestion(index, e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                          >
                            <option value="">Sonraki soru yok (anket bitsin)</option>
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={cancelEdit}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                  >
                    İptal
                  </button>
                  <button
                    onClick={addQuestion}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingQuestionId ? 'Güncelle' : 'Soruyu Ekle'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!!isReadOnly}
          className={`inline-flex items-center px-8 py-4 text-base font-medium rounded-xl shadow-lg transition-all duration-300 ${
            isReadOnly
              ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isReadOnly ? 'Düzenleme Devre Dışı' : (initialSurvey ? 'Anketi Güncelle' : 'Anketi Kaydet')}
        </button>
      </div>
    </div>
  );
}
