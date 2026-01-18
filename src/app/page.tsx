'use client';

import { useEffect, useMemo, useState } from 'react';

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

function TwoStarsIcon({ color = 'white', size = 30 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.3 14 7.4 19.1 9.4 14 11.4 12 16.5 10 11.4 4.9 9.4 10 7.4 12 2.3Z" fill={color} />
      <path
        d="M18.2 12 19.4 15.1 22.5 16.3 19.4 17.5 18.2 20.6 17 17.5 13.9 16.3 17 15.1 18.2 12Z"
        fill={color}
        opacity="0.95"
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

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 18h16" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9 6a2 2 0 1 0 0.01 0Z" fill="black" />
      <path d="M15 12a2 2 0 1 0 0.01 0Z" fill="black" />
      <path d="M11 18a2 2 0 1 0 0.01 0Z" fill="black" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 5 7.8 7.6H5.2A2.2 2.2 0 0 0 3 9.8v4.4A2.2 2.2 0 0 0 5.2 16.4h2.6L11 19V5Z"
        fill="black"
        opacity="0.9"
      />
      <path d="M15.2 8.6c1 .8 1.6 2 1.6 3.4s-.6 2.6-1.6 3.4" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17.8 6.2c1.8 1.5 3 3.6 3 5.8s-1.2 4.3-3 5.8"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** ✅ Translate icon: "RU" letters only (bigger + not cropped) */
function TranslateRuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 28" fill="none" aria-hidden="true">
      <text x="2" y="21" fontSize="16" fontWeight="900" fontFamily="Arial, sans-serif" fill="black">
        RU
      </text>
    </svg>
  );
}

function TelegramButton({ size = 40 }: { size?: number }) {
  const inner = Math.round(size * 0.72);
  return (
    <a
      href="https://t.me/atoyiae"
      target="_blank"
      rel="noreferrer"
      className="grid place-items-center rounded-full bg-white/28 backdrop-blur-xl border border-white/35 transition-none hover:bg-white/40 hover:shadow-[0_14px_34px_rgba(0,0,0,0.12)]"
      style={{ width: size, height: size }}
      aria-label="Telegram"
    >
      <img src="/telegram.png" alt="" className="select-none pointer-events-none" style={{ width: inner, height: inner }} draggable={false} />
    </a>
  );
}

function LangPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-10 h-10 rounded-full grid place-items-center font-black text-[12px] select-none transition-none',
        active
          ? 'bg-white/28 backdrop-blur-xl border border-white/35 text-black shadow-[0_12px_30px_rgba(0,0,0,0.10)]'
          : 'bg-white/18 backdrop-blur-xl border border-white/25 text-black/55 hover:text-black hover:bg-white/24',
      ].join(' ')}
      aria-label={label}
    >
      {label}
    </button>
  );
}

type DropdownItem = { label: string; scenario: Scenario };

export default function Page() {
  const [scenario, setScenario] = useState<Scenario>('no');
  const [tone, setTone] = useState<Tone>('soft');

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState('');

  const [searchOpenDesktop, setSearchOpenDesktop] = useState(false);

  const [settingsOpenMobile, setSettingsOpenMobile] = useState(false);
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);

  const [topItem, setTopItem] = useState<DropdownItem>({ label: BASE_SCENARIOS[0].label, scenario: 'no' });
  const [activeLabel, setActiveLabel] = useState<string>(BASE_SCENARIOS[0].label);

  const [lang, setLang] = useState<'EN' | 'SR' | 'CHI'>('EN');

  const [showRu, setShowRu] = useState(false);
  const [ruText, setRuText] = useState<string>('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpenDesktop(false);
        setSettingsOpenMobile(false);
        setSearchOpenMobile(false);
      }
    };
    const onClick = () => {
      setSearchOpenDesktop(false);
      setSettingsOpenMobile(false);
      setSearchOpenMobile(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('click', onClick);
    };
  }, []);

  const scenariosOnUI = useMemo(() => {
    return [
      { id: topItem.scenario, label: topItem.label },
      BASE_SCENARIOS[1],
      BASE_SCENARIOS[2],
      BASE_SCENARIOS[3],
    ];
  }, [topItem]);

  const dropdownItems: DropdownItem[] = useMemo(() => {
    const extras: DropdownItem[] = EXTRA_SITUATIONS.map((t) => ({ label: t, scenario: EXTRA_TO_SCENARIO[t] }));
    const baseTop: DropdownItem = { label: BASE_SCENARIOS[0].label, scenario: 'no' };
    const filtered = extras.filter((x) => x.label !== topItem.label);
    return topItem.label !== baseTop.label ? [baseTop, ...filtered] : filtered;
  }, [topItem]);

  const girlSrc = showResult ? '/girl_after.png' : '/girl.png';

  function hideResult() {
    setShowResult(false);
    setShowRu(false);
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
    setShowRu(false);
    setRuText('');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(showRu ? ruText || result : result);
    } catch {}
  }

  function speak() {
    const txt = showRu ? ruText || result : result;
    if (!txt) return;
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return;

    synth.cancel();

    const u = new SpeechSynthesisUtterance(txt);
    u.lang = showRu ? 'ru-RU' : lang === 'EN' ? 'en-US' : lang === 'SR' ? 'sr-RS' : 'zh-CN';
    u.rate = 1;
    u.pitch = 1;

    synth.speak(u);
  }

  function translateToRuOffline(en: string) {
    const dict: Record<string, string> = {
      'Thanks for asking — I can’t do this right now.': 'Спасибо, что спросили — сейчас я не могу это сделать.',
      'I appreciate it, but I’ll have to say no.': 'Ценю это, но мне придётся отказаться.',
      'I don’t have the capacity right now.': 'Сейчас у меня нет ресурса на это.',
      'That won’t work for me.': 'Мне это не подходит.',
      'Can we restart this calmly?': 'Давай начнём заново и спокойнее?',
      'I’m sorry — I came off harsh.': 'Прости — я прозвучала слишком резко.',
      'Could you help me with this?': 'Можешь помочь мне с этим?',
    };
    return dict[en] ?? 'Перевод скоро будет здесь 🙂';
  }

  function toggleRu() {
    if (!result) return;
    if (!showRu) {
      setRuText(translateToRuOffline(result));
      setShowRu(true);
      return;
    }
    setShowRu(false);
  }

  const textSize = 'text-sm';
  const glass = 'bg-white/28 backdrop-blur-xl border border-white/35 shadow-[0_18px_60px_rgba(0,0,0,0.10)]';

  const btnBaseCommon = `w-full text-left px-6 py-3 ${textSize} font-bold select-none rounded-full transition-none`;
  const btnInactive =
    `${btnBaseCommon} bg-[#e8eaed] text-black ` +
    `hover:bg-white hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] ` +
    `active:translate-y-0 active:shadow-none`;
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

  const mobileRound = 'rounded-[26px]';

  const iconOnlyBtn = 'w-10 h-10 rounded-full grid place-items-center transition-none bg-transparent hover:bg-white/55';

  return (
    <div className="w-full h-[100svh] bg-[#c5cdd8] relative overflow-hidden text-black">
      <style jsx global>{`
        .desktopOnly {
          display: none;
        }
        .mobileOnly {
          display: block;
        }
        @media (min-width: 1200px) {
          .desktopOnly {
            display: block;
          }
          .mobileOnly {
            display: none;
          }
        }

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

        /* girl image sizing (matches your previous bg-size behavior) */
        .girl-img {
          width: 420px;
        }
        @media (min-width: 768px) {
          .girl-img {
            width: 500px;
          }
        }
        @media (min-width: 1200px) {
          .girl-img {
            width: 520px;
          }
        }

        /* floating stickers animation */
        @keyframes float1 {
          0% {
            transform: translateY(0px) rotate(-1deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
          100% {
            transform: translateY(0px) rotate(-1deg);
          }
        }
        @keyframes float2 {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(12px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float3 {
          0% {
            transform: translateY(0px) rotate(1deg);
          }
          50% {
            transform: translateY(-8px) rotate(-1deg);
          }
          100% {
            transform: translateY(0px) rotate(1deg);
          }
        }
        .sticker-float-1 {
          animation: float1 9s ease-in-out infinite;
        }
        .sticker-float-2 {
          animation: float2 11s ease-in-out infinite;
        }
        .sticker-float-3 {
          animation: float3 10s ease-in-out infinite;
        }
      `}</style>

      {/* ✅ STICKERS — clearly visible left / right of the girl */}
<div className="absolute inset-0 pointer-events-none z-[1]">
  {/* LEFT sticker — fully outside girl's body */}
  <img
    src="/stickers/say-it-for-me.png"
    alt=""
    draggable={false}
    className="absolute sticker-float-2 opacity-70 select-none w-[150px] md:w-[200px] lg:w-[230px]"
    style={{
      left: '30%',
      top: '60%',
      transform: 'translateX(-480px) rotate(-8deg)',
    }}
  />

  {/* RIGHT sticker — fully outside girl's body */}
  <img
    src="/stickers/set-a-boundary.png"
    alt=""
    draggable={false}
    className="absolute sticker-float-3 opacity-75 select-none w-[170px] md:w-[220px] lg:w-[250px]"
    style={{
      left: '55%',
      top: '30%',
      transform: 'translateX(480px) rotate(8deg)',
    }}
  />

  {/* CENTER / TOP sticker — above head, not inside silhouette */}
  <img
    src="/stickers/find-the-words.png"
    alt=""
    draggable={false}
    className="absolute sticker-float-1 opacity-60 select-none w-[140px] md:w-[180px] lg:w-[210px]"
    style={{
      left: '30%',
      top: '30%',
      transform: 'translateX(-50%) rotate(-4deg)',
    }}
  />
</div>




      {/* ✅ GIRL (above stickers) */}
      <img
        src={girlSrc}
        alt=""
        draggable={false}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-[2] girl-img h-auto"
      />

      {/* =============== DESKTOP =============== */}
      <div className="desktopOnly">
        <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
          <div className="text-base font-bold tracking-wide text-black/85">atoyiae</div>
          <TelegramButton size={40} />
        </div>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
          <img src="/title.svg" alt="SAY IT FOR ME" className="h-[64px] w-auto mx-auto" draggable={false} />
          <p className="text-lg text-black mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>
            Your assistant when words are hard to find
          </p>
        </div>

        {/* LEFT PANEL */}
        <div className={`absolute left-12 top-32 z-10 ${glass} ${panelRadius} w-[340px] h-[610px] px-11 pt-28 pb-16 flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`${textSize} font-bold text-black/70`}>Situation</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchOpenDesktop((v) => !v);
              }}
              className="w-9 h-9 grid place-items-center bg-transparent hover:bg-white/60 rounded-full transition-none"
              aria-label="Search situations"
            >
              <SearchIcon />
            </button>
          </div>

          {searchOpenDesktop && (
            <div className="absolute left-11 right-11 top-[152px] z-50 rounded-[26px] bg-white shadow-lg overflow-hidden">
              <div className="max-h-[290px] overflow-auto py-2 thin-scroll">
                {dropdownItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTopItem(item);
                      setScenario(item.scenario);
                      setActiveLabel(item.label);
                      setSearchOpenDesktop(false);
                      hideResult();
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-black select-none transition-none hover:bg-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              className="w-16 h-16 rounded-full shadow-xl transition-none hover:scale-105 active:scale-100 bg-[#6fbf3f] text-white flex items-center justify-center"
              aria-label="Generate phrase"
            >
              <TwoStarsIcon size={34} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className={`absolute right-12 top-32 z-10 ${glass} ${panelRadius} ${panelW} ${panelH} px-11 pt-28 pb-16 flex flex-col`}
          style={{ visibility: showResult ? 'visible' : 'hidden' }}
          aria-hidden={!showResult}
        >
          <div className="flex items-center justify-center gap-2">
            <LangPill label="EN" active={lang === 'EN'} onClick={() => setLang('EN')} />
            <LangPill label="SR" active={lang === 'SR'} onClick={() => setLang('SR')} />
            <LangPill label="CHI" active={lang === 'CHI'} onClick={() => setLang('CHI')} />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="text-black text-[18px] font-bold leading-tight text-center whitespace-pre-line max-w-[260px]">
              {showRu ? ruText || result : result}
            </div>

            {/* ✅ DESKTOP: icons closer */}
            <div className="mt-3 flex items-center justify-center gap-0">
              <button onClick={speak} className={iconOnlyBtn} aria-label="Voice" title="Voice">
                <SpeakerIcon />
              </button>
              <button onClick={toggleRu} className={`${iconOnlyBtn} -ml-2`} aria-label="Translate to RU" title="Translate to RU">
                <TranslateRuIcon />
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4 items-center">
            <button
              onClick={copy}
              className="w-14 h-14 rounded-full bg-[#6fbf3f] text-white font-bold shadow-xl transition-none hover:scale-105 active:scale-100 text-[11px]"
            >
              Copy
            </button>
            <button
              onClick={generateNext}
              className="w-14 h-14 rounded-full bg-black text-white font-bold shadow-xl transition-none hover:scale-105 active:scale-100 text-[11px]"
            >
              Again
            </button>
          </div>
        </div>
      </div>

      {/* =============== MOBILE / TABLET (<1200) =============== */}
      <div className="mobileOnly">
        <div className="absolute top-5 left-5 z-10">
          <TelegramButton size={38} />
        </div>

        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center z-10">
          <img src="/title.svg" alt="SAY IT FOR ME" className="h-[52px] md:h-[60px] w-auto mx-auto" draggable={false} />
          <p className="text-base md:text-lg text-black mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>
            Your assistant when words are hard to find
          </p>
        </div>

        <div className="absolute left-0 right-0 top-[148px] md:top-[148px] bottom-[92px] px-4 md:px-6 z-20">
          <div className="h-full flex flex-col items-center">
            <div className="w-full max-w-[560px] md:max-w-[860px]">
              <div className="h-[460px] md:h-[520px] flex items-start justify-center">
                {showResult ? (
                  <div className={`${glass} rounded-[34px] md:rounded-[44px] px-5 py-5 md:px-10 md:py-8 w-full`}>
                    {/* ✅ MOBILE/TABLET: languages LEFT, icons RIGHT */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 md:gap-3 md:[&>button]:w-12 md:[&>button]:h-12 md:[&>button]:text-[13px]">
                        <LangPill label="EN" active={lang === 'EN'} onClick={() => setLang('EN')} />
                        <LangPill label="SR" active={lang === 'SR'} onClick={() => setLang('SR')} />
                        <LangPill label="CHI" active={lang === 'CHI'} onClick={() => setLang('CHI')} />
                      </div>

                      <div className="flex items-center gap-0 md:[&>button]:w-12 md:[&>button]:h-12">
                        <button onClick={speak} className={iconOnlyBtn} aria-label="Voice">
                          <SpeakerIcon />
                        </button>
                        <button onClick={toggleRu} className={`${iconOnlyBtn} -ml-2`} aria-label="Translate to RU">
                          <TranslateRuIcon />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 md:mt-7 text-black text-[16px] md:text-[20px] font-bold leading-snug text-center whitespace-pre-line">
                      {showRu ? ruText || result : result}
                    </div>

                    <div className="mt-5 md:mt-7 flex items-center justify-center gap-3 md:gap-4">
                      <button
                        onClick={copy}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#6fbf3f] text-white font-bold shadow-xl transition-none active:scale-100 text-[11px] md:text-[12px]"
                      >
                        Copy
                      </button>
                      <button
                        onClick={generateNext}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white font-bold shadow-xl transition-none active:scale-100 text-[11px] md:text-[12px]"
                      >
                        Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>

            <div className="flex-1" />
          </div>
        </div>

        {/* bottom bar + settings */}
        <div className="fixed left-0 right-0 bottom-0 z-40 px-4 md:px-6 pb-4">
          {settingsOpenMobile && (
            <div className="absolute left-4 md:left-6 right-4 md:right-6 bottom-[84px] z-50" onClick={(e) => e.stopPropagation()}>
              <div className={`${glass} rounded-[26px] px-5 pt-6 pb-5`} style={{ maxHeight: 'calc(100svh - 210px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-black/70">Settings</div>
                  <button
                    onClick={() => {
                      setSettingsOpenMobile(false);
                      setSearchOpenMobile(false);
                    }}
                    className="w-9 h-9 rounded-full bg-black/10 grid place-items-center"
                    aria-label="Close"
                  >
                    <span className="text-[20px] leading-none">×</span>
                  </button>
                </div>

                <div className="thin-scroll overflow-auto pr-1" style={{ maxHeight: 'calc(100svh - 300px)' }}>
                  <button
                    onClick={() => setSearchOpenMobile((v) => !v)}
                    className="w-full rounded-full bg-white/80 px-4 py-3 flex items-center justify-between transition-none"
                  >
                    <span className="text-sm font-bold text-black/40">Choose situation</span>
                    <SearchIcon />
                  </button>

                  {searchOpenMobile && (
                    <div className="mt-3 rounded-[22px] bg-white shadow-lg overflow-hidden">
                      <div className="max-h-[240px] overflow-auto py-2 thin-scroll">
                        {dropdownItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              setTopItem(item);
                              setScenario(item.scenario);
                              setActiveLabel(item.label);
                              setSearchOpenMobile(false);
                              hideResult();
                            }}
                            className="w-full text-left px-5 py-3 text-sm font-bold text-black select-none transition-none hover:bg-white"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 space-y-3">
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
                </div>
              </div>
            </div>
          )}

          <div className={`${glass} ${mobileRound} h-[64px] md:h-[70px] px-4 md:px-5 flex items-center gap-3`} onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 min-w-0 font-bold text-black/70 truncate">{topItem.label}</div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpenMobile((v) => !v);
                if (!settingsOpenMobile) setSearchOpenMobile(false);
              }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/70 grid place-items-center transition-none"
              aria-label="Open settings"
            >
              <SettingsIcon />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (settingsOpenMobile) {
                  setSettingsOpenMobile(false);
                  setSearchOpenMobile(false);
                }
                generateNext();
              }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#6fbf3f] text-white grid place-items-center shadow-xl transition-none active:scale-100"
              aria-label="Generate"
            >
              <TwoStarsIcon size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
