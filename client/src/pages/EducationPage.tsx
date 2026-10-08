import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Layers,
  Recycle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Info
} from 'lucide-react';

export const EducationPage: React.FC = () => {
  const { t, addPoints, showToast } = useApp();

  const [expandedMyth, setExpandedMyth] = useState<number | null>(null);

  // Mini Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const MYTHS = [
    {
      myth: 'Myth: "All plastics with the triangular recycling triangle can be binned in household dry recycling."',
      fact: 'Fact: The number inside the triangle indicates the resin type (1 to 7). While #1 (PET) and #2 (HDPE) are widely recycled, #3 (PVC), #6 (Polystyrene/Styrofoam), and #7 (Other) are rarely processed by municipal recyclers and contaminate batches.'
    },
    {
      myth: 'Myth: "Greasy pizza delivery boxes can be recycled with regular newspapers."',
      fact: 'Fact: Food oils and cheese grease cannot be separated from paper fibers during the water pulping process, ruining entire batches of recycled paper pulp. Only clean, unsoiled cardboard is recyclable. Tear off greasy lids and compost greasy parts!'
    },
    {
      myth: 'Myth: "Throwing old dead AA batteries into regular trash is harmless because they are small."',
      fact: 'Fact: Even small alkaline and lithium batteries contain heavy metals that corrode in landfills, contaminating groundwater. Furthermore, compressed batteries in garbage trucks cause severe vehicular chemical fires.'
    },
    {
      myth: 'Myth: "Biodegradable plastic bags break down harmlessly in home compost bins."',
      fact: 'Fact: Most certified biodegradable or oxo-degradable bags require industrial composting facilities reaching 55°C+ with specialized microbes. In home pits, they break down into microplastic fragments.'
    }
  ];

  const QUIZ_QUESTIONS = [
    {
      question: 'Where should a broken ceramic coffee mug or ceramic plate be disposed?',
      options: [
        'Blue Dry Recyclable Bin',
        'Green Compost Bin',
        'Wrapped securely and placed in Inert / Residual Waste (Black Bin)',
        'E-waste Depot'
      ],
      correct: 2,
      explanation: 'Ceramics cannot be melted down with container glass due to different melting points. They must be safely wrapped in residual waste.'
    },
    {
      question: 'What is the most critical preparation step before disposing of a used lithium battery?',
      options: [
        'Wash it under running tap water',
        'Tape both metal terminals with non-conductive electrical tape',
        'Puncture the casing with scissors',
        'Leave it outside in direct sunlight'
      ],
      correct: 1,
      explanation: 'Taping the terminals prevents accidental electrical short-circuits and potential thermal runaway fire hazards.'
    },
    {
      question: 'In home kitchen composting, what is the ideal ratio between "Greens" (wet kitchen scraps) and "Browns" (dry leaves/cardboard)?',
      options: [
        '100% Greens only',
        'Roughly 1 part Greens to 2-3 parts Browns for optimal aeration & odor control',
        '10 parts Greens to 1 part Browns',
        'Browns should never be added to compost'
      ],
      correct: 1,
      explanation: 'Browns provide carbon and airflow, preventing foul anaerobic odors and soggy rotting heaps.'
    }
  ];

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleGradeQuiz = () => {
    if (Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length) {
      showToast('Please answer all 3 questions before submitting.', 'error');
      return;
    }

    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === 3) {
      addPoints(25, 'Eco Quiz Master – 100% Correct!');
      showToast('Perfect score! +25 Eco Points awarded!', 'success');
    } else {
      addPoints(10, 'Eco Quiz Completed!');
      showToast(`Quiz completed (${score}/3 correct). +10 Eco Points awarded!`, 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Circular Literacy & Practical Action</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          EcoSort Education Hub
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Clear, science-backed guidance to empower homes, schools, and communities to achieve zero-waste living.
        </p>
      </div>

      {/* Module 1: Waste Segregation 101 Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            1. Waste Segregation Master Guide
          </h2>
          <p className="text-xs text-slate-500">
            Source segregation is the single most decisive factor determining whether waste is recycled or dumped.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Wet Waste */}
          <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-2">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">
              Green Bin
            </span>
            <h3 className="text-base font-bold text-emerald-950">Wet / Organic</h3>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Vegetable peels, fruit scraps, cooked food, tea leaves, eggshells, garden clippings.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-emerald-800 border-t border-emerald-200">
              Rule: NEVER line with plastic bags. Bin directly or use newspaper liner.
            </div>
          </div>

          {/* Dry Waste */}
          <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-400 space-y-2">
            <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider block">
              Blue Bin
            </span>
            <h3 className="text-base font-bold text-blue-950">Dry / Recyclables</h3>
            <p className="text-xs text-blue-900/80 leading-relaxed">
              Paper, cardboard boxes, clean plastics, glass bottles, aluminum soda cans, clean fabrics.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-blue-800 border-t border-blue-200">
              Rule: Keep 100% clean and dry. Rinse out food sauces and allow to air dry.
            </div>
          </div>

          {/* Sanitary Waste */}
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 space-y-2">
            <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block">
              Red Cross Bag
            </span>
            <h3 className="text-base font-bold text-rose-950">Sanitary / Medical</h3>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              Sanitary pads, baby diapers, used bandages, expired pharmaceuticals, syringes.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-rose-800 border-t border-rose-200">
              Rule: Wrap securely in paper and mark with a red X. Protects sanitation workers.
            </div>
          </div>

          {/* Domestic Hazardous */}
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-500 space-y-2">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider block">
              Special Stream
            </span>
            <h3 className="text-base font-bold text-amber-950">Hazardous & E-Waste</h3>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Batteries, old phones, pesticide cans, solvents, paint thinners, fluorescent bulbs.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-amber-900 border-t border-amber-200">
              Rule: Never mix into general garbage. Hand over to authorized e-waste depots.
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Composting Basics */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">
            2. Home Composting: Turning Food Waste Into Black Gold
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Over 55% of urban municipal waste is organic matter. Composting at home cuts your household garbage volume in half and generates organic fertilizer for terrace gardens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <strong className="text-emerald-900 font-bold block">🟢 Greens (Nitrogen Rich):</strong>
            <ul className="space-y-1 text-emerald-800 list-disc list-inside">
              <li>Raw vegetable peels & fruit skins</li>
              <li>Spent coffee grounds & tea leaves</li>
              <li>Fresh grass clippings and green leaves</li>
              <li>Cooked rice & lentils (in moderate portions)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <strong className="text-amber-900 font-bold block">🟤 Browns (Carbon Rich):</strong>
            <ul className="space-y-1 text-amber-800 list-disc list-inside">
              <li>Dry fallen leaves & shredded coconut coir</li>
              <li>Shredded unprinted cardboard and egg cartons</li>
              <li>Dry sawdust (untreated wood only)</li>
              <li>Dry straw or coco peat blocks</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Module 3: Recycling Myths vs Facts */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            3. Recycling Myths vs. Ground Realities
          </h2>
          <p className="text-xs text-slate-500">
            Click on any myth below to reveal why well-intentioned sorting often goes wrong.
          </p>
        </div>

        <div className="space-y-3">
          {MYTHS.map((item, idx) => {
            const isExpanded = expandedMyth === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition"
              >
                <button
                  onClick={() => setExpandedMyth(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {item.myth}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-700 bg-slate-50/50 border-t border-slate-100 leading-relaxed animate-in fade-in">
                    <p className="font-medium text-emerald-950 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      {item.fact}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Module 4: Interactive Quick Eco Quiz */}
      <section className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-lg font-bold">Interactive Eco Knowledge Challenge</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Test your segregation mastery and earn bonus Eco Points!
            </p>
          </div>

          {quizSubmitted && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Score: {quizScore} / {QUIZ_QUESTIONS.length}
            </span>
          )}
        </div>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIdx) => (
            <div key={qIdx} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-bold text-white">
                {qIdx + 1}. {q.question}
              </h4>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  const isCorrect = q.correct === optIdx;

                  let optClass = 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300';
                  if (quizSubmitted) {
                    if (isCorrect) optClass = 'bg-emerald-900/60 border-emerald-400 text-emerald-200 font-bold';
                    else if (isSelected && !isCorrect) optClass = 'bg-rose-900/60 border-rose-400 text-rose-200';
                  } else if (isSelected) {
                    optClass = 'bg-emerald-500/30 border-emerald-400 text-white font-bold';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(qIdx, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <p className="text-[11px] text-slate-400 italic pt-1">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {!quizSubmitted ? (
          <button
            onClick={handleGradeQuiz}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition shadow-md"
          >
            Submit Quiz & Collect Eco Points
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedAnswers({});
              setQuizSubmitted(false);
            }}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition"
          >
            Retake Quiz
          </button>
        )}
      </section>
    </div>
  );
};

