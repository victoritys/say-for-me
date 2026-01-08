'use client';

import { useMemo, useState } from 'react';

type Scenario = 'no' | 'reset' | 'apology' | 'ask';
type Tone = 'soft' | 'firm';

const BASE_SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'no', label: 'A clean, guilt-free "NO"' },
  { id: 'reset', label: 'Reset the conversation' },
  { id: 'apology', label: 'Own up and apologize' },
  { id: 'ask', label: 'Ask confidently' },
];

const EXTRA_SITUATIONS = [
  'Set a firm boundary',
  'Push back with ease',
  'Redirect the conversation',
  'Decline for now',
  'Say no, clearly',
  'Set expectations',
  'Pause the discussion',
  'Hold your ground',
  'Disagree with composure',
  'Close the conversation',
] as const;

type ExtraSituation = (typeof EXTRA_SITUATIONS)[number];

const EXTRA_TO_SCENARIO: Record<ExtraSituation, Scenario> = {
  'Set a firm boundary': 'no',
  'Push back with ease': 'no',
  'Redirect the conversation': 'reset',
  'Decline for now': 'no',
  'Say no, clearly': 'no',
  'Set expectations': 'ask',
  'Pause the discussion': 'reset',
  'Hold your ground': 'no',
  'Disagree with composure': 'reset',
  'Close the conversation': 'reset',
};

const BANK: Record<Scenario, Record<Tone, string[]>> = {
  no: {
    soft: [
      'Thanks for asking — I can’t do this right now.',
      'I appreciate it, but I’ll have to say no.',
      'I don’t have the capacity right now.',
      'Not today, but I appreciate the offer.',
      'I can’t commit to this. Hope you understand.',
      'I’m going to pass this time — thank you.',
      'I’m not able to do that, but thank you for thinking of me.',
      'I can’t do that, and I want to be honest about it.',
      'I’m going to say no, but I’m grateful you asked.',
      'I can’t help with this one, but I hope it goes well.',
    ],
    firm: [
      'No — I’m not available for this.',
      'That won’t work for me.',
      'I’m not taking this on.',
      'I’m saying no.',
      'This isn’t something I’ll do.',
      'No. I’m not changing my decision.',
      'Please move forward without me.',
      'I’m not open to this.',
      'No — and I need you to respect that.',
      'I’m not available. Please plan without me.',
    ],
  },
  reset: {
    soft: [
      'Can we restart this calmly?',
      'Let’s take a breath and talk without blame.',
      'I want to understand you — can we reset the tone?',
      'Can we try again, slower and kinder?',
      'I think we’re missing each other — can we rephrase?',
      'Let’s pause and come back to this calmly.',
      'I care about this conversation. Can we reset?',
      'Let’s clarify what we’re trying to solve.',
      'Can we focus on the point and keep it kind?',
      'I’d like to continue, but in a calmer way.',
    ],
    firm: [
      'This tone doesn’t work for me.',
      'Pause. We can continue when it’s respectful.',
      'I’m not continuing this conversation like this.',
      'We can talk, but not in this format.',
      'Stop. Let’s reset and speak normally.',
      'If we continue — it has to be respectful.',
      'We’re going in circles. Reset.',
      'Let’s continue later when it’s calmer.',
      'Let’s stick to facts and next steps.',
      'I’m willing to talk, not to argue.',
    ],
  },
  apology: {
    soft: [
      'I’m sorry — I came off harsh.',
      'I didn’t mean to hurt you.',
      'You didn’t deserve that tone. I’m sorry.',
      'I see how that landed. I’m sorry.',
      'I should’ve handled that better. I’m sorry.',
      'I’m sorry for my part in this.',
      'I hear you. I’m sorry.',
      'I’m sorry. I want to make it right.',
      'I’m sorry — I was overwhelmed and it showed.',
      'I’m sorry, and I appreciate you telling me.',
    ],
    firm: [
      'I was wrong. I take responsibility.',
      'I’ll fix this by (time).',
      'I apologize. Here’s what I’ll change: …',
      'You’re right. That was on me.',
      'I own that mistake.',
      'I’m sorry. I’ll correct it today.',
      'I accept responsibility. I’ll do better.',
      'I apologize. Let’s move to the solution.',
      'I’m sorry. I understand the impact.',
      'I’ll make sure this doesn’t repeat.',
    ],
  },
  ask: {
    soft: [
      'Could you help me with this?',
      'Would you be open to helping me?',
      'Can I ask for your support on this?',
      'Could you please take a look when you have a moment?',
      'Can you help me figure this out?',
      'Would you mind doing (…)? It would help a lot.',
      'If you have time, could you assist me with (…)?',
      'Could you share your opinion on this?',
      'Could you help me by (time), if possible?',
      'If you can, please confirm you’re able to help.',
    ],
    firm: [
      'I need this by (time). Can you confirm?',
      'Please respond by (time) so I can proceed.',
      'Can you do this today — yes or no?',
      'I need a decision by (time).',
      'Confirm your availability by (time).',
      'I need your answer today.',
      'Please confirm you’ll handle it.',
      'I need a clear yes/no.',
      'I’m moving forward at (time). Are you in?',
      'Please prioritize this and update me.',
    ],
  },
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function SparklesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21L14.5 9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M12.8 6.2l1-2.7 1 2.7 2.7 1-2.7 1-1 2.7-1-2.7-2.7-1 2.7-1Z"
        fill="white"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="black" strokeWidth="2.2" />
      <path d="M16.8 16.8 21 21" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckInCircleIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="#0A0A0A" />
      <path
        d="M16.8 24.6l4.6 4.7 10-10.2"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type DropdownItem = { label: string; scenario: Scenario };

export default function Page() {
  const [scenario, setScenario] = useState<Scenario>('no');
  const [tone, setTone] = useState<Tone>('soft');

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState('');

  const [searchOpen, setSearchOpen] = useState(false);

  const [topItem, setTopItem] = useState<DropdownItem>({ label: BASE_SCENARIOS[0].label, scenario: 'no' });
  const [activeLabel, setActiveLabel] = useState<string>(BASE_SCENARIOS[0].label);

  const scenariosOnUI = useMemo(() => {
    return [
      { id: topItem.scenario, label: topItem.label },
      BASE_SCENARIOS[1],
      BASE_SCENARIOS[2],
      BASE_SCENARIOS[3],
    ];
  }, [topItem]);

  const dropdownItems: DropdownItem[] = useMemo(() => {
    const extras: DropdownItem[] = EXTRA_SITUATIONS.map((t) => ({
      label: t,
      scenario: EXTRA_TO_SCENARIO[t],
    }));

    const baseTop: DropdownItem = { label: BASE_SCENARIOS[0].label, scenario: 'no' };

    const filteredExtras = extras.filter((x) => x.label !== topItem.label);

    if (topItem.label !== baseTop.label) return [baseTop, ...filteredExtras];
    return filteredExtras;
  }, [topItem]);

  const girlSrc = showResult ? '/girl_after.png' : '/girl.png';

  function hideResult() {
    setShowResult(false);
  }

  function generateNext() {
    const list = BANK[scenario][tone];
    if (!list?.length) return;

    let next = pick(list);

    if (list.length > 1) {
      let guard = 0;
      while (next === result && guard < 20) {
        next = pick(list);
        guard++;
      }
      if (next === result) {
        const idx = list.indexOf(result);
        next = list[(idx + 1) % list.length];
      }
    }

    setResult(next);
    setShowResult(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result);
    } catch {}
  }

  // ---------- styles ----------
  const textSize = 'text-sm';

  // ✅ МОМЕНТАЛЬНО: без duration и без delay
  // ✅ Hover белый только на неактивных
  const btnBaseCommon = `w-full text-left px-6 py-3 ${textSize} font-bold select-none rounded-full transition-none`;

  // inactive: hover = белый + микролёгкий lift (моментально)
  const btnInactive =
    `${btnBaseCommon} bg-[#e8eaed] text-black ` +
    `hover:bg-white hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] ` +
    `active:translate-y-0 active:shadow-none`;

  // active: НИКАКИХ hover эффектов
  const btnActive = `${btnBaseCommon} bg-black text-white`;

  const toneBtnBaseCommon = `flex-1 px-6 py-3 ${textSize} font-bold rounded-full select-none transition-none`;

  const toneInactive =
    `${toneBtnBaseCommon} bg-[#e8eaed] text-black ` +
    `hover:bg-white hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] ` +
    `active:translate-y-0 active:shadow-none`;

  const toneActive = `${toneBtnBaseCommon} bg-black text-white`;

  const panelW = 'w-[340px]';
  const panelH = 'h-[610px]';
  const panelRadius = 'rounded-[160px]';

  const panelGlass =
    'bg-white/28 backdrop-blur-xl border border-white/35 shadow-[0_18px_60px_rgba(0,0,0,0.10)]';

  const actionBtn =
    'w-16 h-16 rounded-full font-bold shadow-xl transition-none hover:scale-105 active:scale-100';

  const panelPadLeft = 'px-11 pt-28 pb-16';
  const panelPadRight = 'px-11 pt-32 pb-16';

  return (
    <div className="w-full h-screen bg-[#c5cdd8] relative overflow-hidden text-black">
      {/* ✅ тонкий серый скролл (только для этой страницы) */}
      <style jsx global>{`
        .thin-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.28) transparent;
        }
        .thin-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .thin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .thin-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.28);
          border-radius: 999px;
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('${girlSrc}')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          backgroundSize: '520px auto',
        }}
      />

      <div className="absolute top-8 left-8 z-10">
        <img src="/Logo.svg" alt="Logo" className="w-12 h-12" />
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <img src="/title.svg" alt="SAY IT FOR ME" className="h-[64px] w-auto mx-auto" draggable={false} />
        <p className="text-lg text-black mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>
          Your assistant when words are hard to find
        </p>
      </div>

      {/* LEFT PANEL */}
      <div
        className={`absolute left-12 top-32 z-30 relative ${panelGlass} ${panelRadius} ${panelW} ${panelH} ${panelPadLeft} flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`${textSize} font-bold text-black/70`}>Situation</div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchOpen((v) => !v);
            }}
            className="w-9 h-9 grid place-items-center bg-transparent hover:bg-white/60 rounded-full transition-none"
            aria-label="Search situations"
          >
            <SearchIcon />
          </button>
        </div>

        {/* Dropdown — белый + тонкий серый скролл */}
        {searchOpen && (
          <div className="absolute left-11 right-11 top-[152px] z-50 rounded-[26px] bg-white shadow-lg overflow-hidden">
            <div className="max-h-[290px] overflow-auto py-2 thin-scroll">
              {dropdownItems.map((item) => (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    // ✅ активное состояние меняется “моментально” (hover тоже сразу станет черным)
                    setTopItem(item);
                    setScenario(item.scenario);
                    setActiveLabel(item.label);
                    setSearchOpen(false);
                    hideResult();
                  }}
                  className={
                    'w-full text-left px-5 py-3 text-sm font-bold text-black select-none transition-none ' +
                    'hover:bg-white hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] ' +
                    'active:translate-y-0 active:shadow-none'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Situation buttons */}
        <div className="space-y-3">
          {scenariosOnUI.map((s) => {
            const isActive = activeLabel === s.label;
            return (
              <button
                key={s.label}
                onClick={() => {
                  setScenario(s.id);
                  setActiveLabel(s.label);
                  hideResult();
                }}
                className={isActive ? btnActive : btnInactive}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Tone */}
        <div className="mt-5">
          <div className={`${textSize} font-bold text-black/70 mb-3`}>Tone</div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTone('soft');
                hideResult();
              }}
              className={tone === 'soft' ? toneActive : toneInactive}
            >
              Softly
            </button>

            <button
              onClick={() => {
                setTone('firm');
                hideResult();
              }}
              className={tone === 'firm' ? toneActive : toneInactive}
            >
              Firmly
            </button>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex justify-center mt-4">
          <button
            onClick={generateNext}
            className={`${actionBtn} bg-[#6fbf3f] text-white flex items-center justify-center`}
            aria-label="Generate phrase"
          >
            <SparklesIcon />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`absolute right-12 top-32 z-10 ${panelGlass} ${panelRadius} ${panelW} ${panelH} ${panelPadRight} flex flex-col`}
        style={{ visibility: showResult ? 'visible' : 'hidden' }}
        aria-hidden={!showResult}
      >
        <div className="flex justify-center">
          <CheckInCircleIcon />
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-black text-[18px] font-bold leading-tight text-center whitespace-pre-line max-w-[260px]">
            {result}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button onClick={copy} className={`${actionBtn} bg-[#6fbf3f] text-white`}>
            Copy
          </button>
          <button onClick={generateNext} className={`${actionBtn} bg-black text-white`}>
            Again
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-12 text-2xl font-normal text-black z-10">Atoyiae</div>
    </div>
  );
}
