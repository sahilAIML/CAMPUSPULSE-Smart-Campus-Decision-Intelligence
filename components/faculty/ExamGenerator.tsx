'use client';

import React, { useState, useRef } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  Upload,
  Download,
  Eye,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { ClayButton } from '../ui/ClayButton';
import { ClayBadge } from '../ui/ClayBadge';
import { ClayInput } from '../ui/ClayInput';
import {
  Exam,
  ExamQuestion,
  createExam,
  getSampleQuestionsCSV,
  parseQuestionsFromCSV,
} from '@/lib/data/exams';

interface ExamGeneratorProps {
  onExamCreated?: (newExam: Exam) => void;
  onViewResults?: (examId: string) => void;
}

interface QuestionDraft {
  id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_index: number;
  topic: string;
  explanation: string;
}

export function ExamGenerator({ onExamCreated, onViewResults }: ExamGeneratorProps) {
  // Exam config state
  const [examName, setExamName] = useState('CIE-3: Systems Programming & Architecture');
  const [targetSection, setTargetSection] = useState<'all' | 'sec-a' | 'sec-b' | 'sec-c'>('all');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(10);

  // Questions state
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'qd-1',
      question_text: 'In UNIX process management, which system call creates a duplicate child process inheriting file descriptors?',
      options: ['fork()', 'exec()', 'clone()', 'pthread_create()'],
      correct_index: 0,
      topic: 'Process Management',
      explanation: 'fork() creates an exact duplicate copy of the calling process with a distinct PID.',
    },
    {
      id: 'qd-2',
      question_text: 'Which cache coherence protocol state indicates a cache line is valid, unmodified, and present in other caches?',
      options: ['Shared (S)', 'Modified (M)', 'Exclusive (E)', 'Invalid (I)'],
      correct_index: 0,
      topic: 'Cache Architecture',
      explanation: 'Under the MESI protocol, the Shared state signifies read-only sharing across processor caches.',
    },
  ]);

  // CSV Upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvSuccessMessage, setCsvSuccessMessage] = useState<string | null>(null);

  // Live Student Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  // Submitting states
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Question
  const handleAddQuestion = () => {
    const newQ: QuestionDraft = {
      id: `qd-${Date.now()}`,
      question_text: '',
      options: ['', '', '', ''],
      correct_index: 0,
      topic: 'General Concepts',
      explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  // Remove Question
  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  // Update Question text
  const handleUpdateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question_text = text;
    setQuestions(updated);
  };

  // Update Question Topic
  const handleUpdateTopic = (index: number, topic: string) => {
    const updated = [...questions];
    updated[index].topic = topic;
    setQuestions(updated);
  };

  // Update Option
  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  // Update Correct Answer
  const handleSetCorrectAnswer = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correct_index = optIndex;
    setQuestions(updated);
  };

  // Download Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const sample = getSampleQuestionsCSV();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CampusPulse_Exam_Questions_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload and parse CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvErrors([]);
    setCsvSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseQuestionsFromCSV(text);

      if (!result.success && result.errors.length > 0) {
        setCsvErrors(result.errors);
      } else {
        const loaded: QuestionDraft[] = result.questions.map((q, idx) => ({
          id: `csv-${Date.now()}-${idx}`,
          question_text: q.question_text,
          options: q.options,
          correct_index: q.correct_index,
          topic: q.topic,
          explanation: q.explanation || '',
        }));

        setQuestions(loaded);
        setCsvSuccessMessage(`Successfully imported ${loaded.length} questions from CSV!`);
        setTimeout(() => setCsvSuccessMessage(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save as Draft or Publish
  const handleSaveExam = async (status: 'draft' | 'published') => {
    if (!examName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a valid exam title.' });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setStatusMessage({ type: 'error', text: `Question #${i + 1} has empty text.` });
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setStatusMessage({
            type: 'error',
            text: `Question #${i + 1}, Option ${String.fromCharCode(65 + j)} is required.`,
          });
          return;
        }
      }
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const newExam = await createExam(
        {
          name: examName,
          section_id: targetSection,
          duration_minutes: durationMinutes,
          total_marks: totalMarks,
          status,
        },
        questions.map((q) => ({
          question_text: q.question_text,
          options: q.options,
          correct_index: q.correct_index,
          topic: q.topic,
          explanation: q.explanation,
        }))
      );

      setStatusMessage({
        type: 'success',
        text: status === 'published'
          ? `Exam "${examName}" published successfully! Accessible by students.`
          : `Exam "${examName}" saved as draft.`,
      });

      if (onExamCreated) onExamCreated(newExam);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save exam.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ClayBadge variant="coral" icon={<FileCheck2 className="h-3.5 w-3.5" />}>
              Faculty Assessment Engine
            </ClayBadge>
            <ClayBadge variant="teal" size="sm">
              Instant Analytics Fed
            </ClayBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Generate Dynamic Exam
          </h2>
          <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Configure assessments, build questions with automatic topic tagging, and preview live before publishing.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ClayButton
            variant="default"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4 text-[#5B6CFF]" />
            <span>Student Preview</span>
          </ClayButton>
          <ClayButton
            variant="default"
            size="sm"
            onClick={() => handleSaveExam('draft')}
            disabled={saving}
          >
            <Save className="h-4 w-4 text-[#FFC857]" />
            <span>Save Draft</span>
          </ClayButton>
          <ClayButton
            variant="coral"
            size="sm"
            onClick={() => handleSaveExam('published')}
            disabled={saving}
          >
            <Send className="h-4 w-4" />
            <span>{saving ? 'Publishing...' : 'Publish Exam'}</span>
          </ClayButton>
        </div>
      </div>

      {/* Status Toasts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Exam Configuration Card */}
      <ClayCard className="p-5 sm:p-6">
        <h3 className="font-heading font-extrabold text-base text-[var(--clay-text)] mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FF7A59]" />
          <span>Exam Configuration & Target Cohort</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <ClayInput
              label="Exam Title"
              placeholder="e.g. CIE-2: Data Structures & Algorithms"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-heading font-extrabold text-[var(--clay-text)] block mb-1.5 ml-1">
              Target Section
            </label>
            <select
              value={targetSection}
              onChange={(e) => setTargetSection(e.target.value as any)}
              className="w-full rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] px-4 py-2.5 text-xs font-bold outline-none min-h-[44px]"
            >
              <option value="all">All Sections (A, B, C)</option>
              <option value="sec-a">Section A</option>
              <option value="sec-b">Section B</option>
              <option value="sec-c">Section C</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-heading font-extrabold text-[var(--clay-text)] block mb-1.5 ml-1">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] px-3 py-2.5 text-xs font-bold outline-none min-h-[44px] tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-heading font-extrabold text-[var(--clay-text)] block mb-1.5 ml-1">
                Total Marks
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] px-3 py-2.5 text-xs font-bold outline-none min-h-[44px] tabular-nums"
              />
            </div>
          </div>
        </div>
      </ClayCard>

      {/* 2. CSV Bulk Importer Tray */}
      <ClayCard className="p-4 sm:p-5 bg-gradient-to-r from-[var(--clay-card)] to-[var(--clay-pressed)]/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-heading font-extrabold text-sm text-[var(--clay-text)] flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#2EC4B6]" />
              <span>Bulk Ingest Questions via CSV</span>
            </span>
            <p className="text-xs text-[var(--clay-muted)] mt-0.5">
              Rapidly populate exam sets with standardized questions and topics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <ClayButton variant="default" size="sm" onClick={handleDownloadSampleCSV}>
              <Download className="h-3.5 w-3.5 text-[#5B6CFF]" />
              <span>Sample CSV</span>
            </ClayButton>

            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#2EC4B6] text-white font-heading font-extrabold text-xs shadow-[var(--shadow-clay-teal)] hover:opacity-95 active:scale-95 transition-all">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </span>
            </label>
          </div>
        </div>

        {/* CSV Success Toast */}
        {csvSuccessMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{csvSuccessMessage}</span>
          </div>
        )}

        {/* CSV Error List */}
        {csvErrors.length > 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-400 space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span>CSV Parsing Warnings:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] font-normal space-y-0.5">
              {csvErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </ClayCard>

      {/* 3. Dynamic Question Builder List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-lg text-[var(--clay-text)]">
              Questions ({questions.length})
            </h3>
            <ClayBadge variant="sun" size="sm">
              {totalMarks} Total Marks
            </ClayBadge>
          </div>

          <ClayButton variant="default" size="sm" onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 text-[#FF7A59]" />
            <span>Add Question</span>
          </ClayButton>
        </div>

        {questions.map((q, qIndex) => (
          <ClayCard key={q.id} className="p-5 sm:p-6 relative space-y-4">
            {/* Question Card Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--clay-border)]">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-xl bg-[#5B6CFF]/15 text-[#5B6CFF] font-heading font-extrabold text-xs flex items-center justify-center">
                  Q{qIndex + 1}
                </span>
                <span className="font-heading font-extrabold text-sm text-[var(--clay-text)]">
                  Multiple Choice Question
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Topic Pill Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[var(--clay-muted)] uppercase">Topic:</span>
                  <input
                    type="text"
                    value={q.topic}
                    placeholder="e.g. Recursion"
                    onChange={(e) => handleUpdateTopic(qIndex, e.target.value)}
                    className="rounded-xl bg-[var(--clay-pressed)]/60 border border-[var(--clay-border)] px-3 py-1 text-xs font-bold text-[var(--clay-text)] outline-none w-36"
                  />
                </div>

                {questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Textarea */}
            <div>
              <label className="text-xs font-heading font-extrabold text-[var(--clay-text)] block mb-1.5 ml-1">
                Question Statement
              </label>
              <textarea
                rows={2}
                value={q.question_text}
                onChange={(e) => handleUpdateQuestionText(qIndex, e.target.value)}
                placeholder="Enter clear, concise question prompt..."
                className="w-full rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] text-[var(--clay-text)] shadow-[var(--shadow-clay-input)] p-3 text-xs font-medium outline-none placeholder:text-[var(--clay-muted)] focus:ring-2 focus:ring-[#FF7A59] transition-all resize-none"
              />
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {q.options.map((opt, optIndex) => {
                const optLetter = String.fromCharCode(65 + optIndex);
                const isCorrect = q.correct_index === optIndex;

                return (
                  <div
                    key={optIndex}
                    onClick={() => handleSetCorrectAnswer(qIndex, optIndex)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                        : 'bg-[var(--clay-card)] border-[var(--clay-border)] shadow-[var(--shadow-clay-badge)]'
                    }`}
                  >
                    {/* Radio Button */}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 transition-all ${
                        isCorrect
                          ? 'bg-emerald-500 text-white shadow-[var(--shadow-clay-teal)]'
                          : 'bg-[var(--clay-pressed)] text-[var(--clay-muted)]'
                      }`}
                    >
                      {optLetter}
                    </div>

                    {/* Option Text Input */}
                    <input
                      type="text"
                      value={opt}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Option ${optLetter}...`}
                      className="w-full bg-transparent text-xs font-semibold text-[var(--clay-text)] outline-none placeholder:text-[var(--clay-muted)]"
                    />

                    {isCorrect && (
                      <span className="text-[10px] font-heading font-extrabold text-emerald-600 dark:text-emerald-400 uppercase flex-shrink-0">
                        Correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </ClayCard>
        ))}

        <div className="pt-2 flex justify-center">
          <ClayButton variant="default" size="md" onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 text-[#FF7A59]" />
            <span>Add Next Question ({questions.length + 1})</span>
          </ClayButton>
        </div>
      </div>

      {/* 4. Live Student Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-[var(--clay-card)] border-2 border-[var(--clay-border)] rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--clay-border)]">
              <div>
                <ClayBadge variant="teal" size="sm">Student Live Simulation</ClayBadge>
                <h3 className="font-heading font-extrabold text-xl text-[var(--clay-text)] mt-1">
                  {examName || 'Untitled Exam'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-[var(--clay-pressed)] text-xs font-bold text-[var(--clay-muted)] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#FF7A59]" />
                  <span>{durationMinutes}:00</span>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="h-8 w-8 rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)] flex items-center justify-center text-[var(--clay-muted)] shadow-[var(--shadow-clay-btn)]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Simulated Question Card */}
            {questions[previewQuestionIndex] && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--clay-muted)]">
                  <span>Question {previewQuestionIndex + 1} of {questions.length}</span>
                  <ClayBadge variant="indigo" size="sm">{questions[previewQuestionIndex].topic}</ClayBadge>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--clay-pressed)]/40 border border-[var(--clay-border)]">
                  <p className="font-heading font-extrabold text-base text-[var(--clay-text)] leading-relaxed">
                    {questions[previewQuestionIndex].question_text || 'No question text provided yet.'}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {questions[previewQuestionIndex].options.map((opt, oIdx) => {
                    const optLetter = String.fromCharCode(65 + oIdx);
                    const isCorrect = questions[previewQuestionIndex].correct_index === oIdx;

                    return (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40'
                            : 'bg-[var(--clay-card)] border-[var(--clay-border)]'
                        }`}
                      >
                        <div
                          className={`h-7 w-7 rounded-xl flex items-center justify-center font-heading font-extrabold text-xs ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[var(--clay-pressed)] text-[var(--clay-text)]'
                          }`}
                        >
                          {optLetter}
                        </div>
                        <span className="text-xs font-bold text-[var(--clay-text)] flex-1">
                          {opt || `Option ${optLetter}`}
                        </span>
                        {isCorrect && (
                          <ClayBadge variant="risk-low" size="sm">Correct Answer</ClayBadge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Preview Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--clay-border)]">
                  <ClayButton
                    variant="default"
                    size="sm"
                    disabled={previewQuestionIndex === 0}
                    onClick={() => setPreviewQuestionIndex(previewQuestionIndex - 1)}
                  >
                    Previous
                  </ClayButton>

                  <div className="flex gap-1.5">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewQuestionIndex(idx)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                          previewQuestionIndex === idx
                            ? 'bg-[#FF7A59] text-white'
                            : 'bg-[var(--clay-pressed)] text-[var(--clay-muted)]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <ClayButton
                    variant="coral"
                    size="sm"
                    disabled={previewQuestionIndex === questions.length - 1}
                    onClick={() => setPreviewQuestionIndex(previewQuestionIndex + 1)}
                  >
                    Next
                  </ClayButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
