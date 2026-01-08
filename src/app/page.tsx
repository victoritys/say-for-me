'use client';

import React, { useMemo, useState } from 'react';

type Audience = 'close' | 'coworker' | 'boss' | 'stranger';
type Tone = 'soft' | 'neutral' | 'firm' | 'short';

const audienceLabel: Record<Audience, string> = {
  close: 'Близкий человек',
  coworker: 'Коллега',
  boss: 'Руководитель',
  stranger: 'Незнакомец',
};

const toneLabel: Record<Tone, string> = {
  soft: 'Мягко',
  neutral: 'Нейтрально',
  firm: 'Твёрдо',
  short: 'Супер-коротко',
};

/**
 * MVP без API:
 * генерим “достаточно хорошие” варианты через шаблоны.
 * Потом легко заменишь на fetch('/api/generate', ...)
 */
function generateTemplates(input: string, a: Audience, t: Tone): string[] {
  const cleaned = input.trim().replace(/\s+/g, ' ');
  const who =
    a === 'boss'
      ? 'Коллеги,'
      : a === 'coworker'
      ? 'Привет!'
      : a === 'close'
      ? 'Привет.'
      : 'Здравствуйте.';

  const boundary =
    a === 'boss'
      ? 'Чтобы не сорвать сроки, мне нужно'
      : a === 'coworker'
      ? 'Чтобы нормально договориться, мне важно'
      : a === 'close'
      ? 'Мне важно'
      : 'Мне нужно';

  const soft = [
    `${who} Хочу аккуратно сказать: ${cleaned}. ${boundary} сделать это по-другому. Давай обсудим удобный вариант?`,
    `${who} Я немного волнуюсь, но скажу прямо: ${cleaned}. ${boundary} сохранить спокойный тон. Спасибо, что услышишь.`,
    `${who} Возможно, я не идеально сформулирую, но: ${cleaned}. ${boundary} обозначить границу и не спорить. Ок?`,
  ];

  const neutral = [
    `${who} По ситуации: ${cleaned}. ${boundary} договориться о следующем шаге: (1) что делаем, (2) до какого времени.`,
    `${who} Сообщаю: ${cleaned}. ${boundary} зафиксировать вариант решения. Напиши, что выбираем.`,
    `${who} Уточняю: ${cleaned}. ${boundary} прояснить ожидания и формат. Давай коротко синхронизируемся.`,
  ];

  const firm = [
    `${who} Скажу прямо: ${cleaned}. ${boundary} чтобы дальше было именно так. Это важно для меня.`,
    `${who} Я не готов(а) продолжать в таком формате: ${cleaned}. ${boundary} изменить условия, иначе я не смогу участвовать.`,
    `${who} Фиксирую позицию: ${cleaned}. ${boundary} соблюдать границу. Прошу не возвращаться к этому в прежнем виде.`,
  ];

  const short = [
    `${cleaned}. Давай так: без обсуждений — просто сделаем по-другому.`,
    `${cleaned}. Я так не могу/не буду. Предлагаю другой вариант.`,
    `${cleaned}. Пожалуйста, учти это дальше.`,
  ];

  if (t === 'soft') return soft;
  if (t === 'neutral') return neutral;
  if (t === 'firm') return firm;
  return short;
}

function clampText(s: string, max = 700) {
  return s.length > max ? s.slice(0, max).trim() + '…' : s;
}

export default function Page() {
  const [input, setInput] = useState('');
  const [audience, setAudience] = useState<Audience>('coworker');
  const [tone, setTone] = useState<Tone>('neutral');
  const [results, setResults] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const canGenerate = input.trim().length >= 8;

  const previewCards = useMemo(
    () => [
      {
        title: 'Say.//ForMe',
        metaLeft: 'Confidence',
        metaRight: 'No drama',
        chip: 'OPEN NOW',
      },
      {
        title: 'Message\nGenerator',
        metaLeft: '3 варианты',
        metaRight: '1 клик',
        chip: 'GENERATE',
      },
      {
        title: 'Boundary.//Mode',
        metaLeft: 'Tone',
        metaRight: 'Short',
        chip: 'LIMITED',
      },
    ],
    []
  );

  function onGenerate() {
    if (!canGenerate) return;
    const list = generateTemplates(clampText(input), audience, tone);
    setResults(list);
    setCopiedIdx(null);
  }

  async function copy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch {
      // ignore
    }
  }

  function nudge(kind: 'shorter' | 'softer' | 'firmer') {
    if (!results.length) return;
    if (kind === 'shorter') setTone('short');
    if (kind === 'softer') setTone('soft');
    if (kind === 'firmer') setTone('firm');
    const list = generateTemplates(clampText(input), audience, kind === 'shorter' ? 'short' : kind === 'softer' ? 'soft' : 'firm');
    setResults(list);
    setCopiedIdx(null);
  }

  return (
    <main className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_800px_at_20%_20%,rgba(168,85,247,0.55),transparent_55%),radial-gradient(1000px_700px_at_80%_30%,rgba(99,102,241,0.55),transparent_55%),radial-gradient(1000px_700px_at_60%_80%,rgba(34,197,94,0.22),transparent_55%),linear-gradient(180deg,#2b0a48_0%,#0a0616_55%,#05040b_100%)]" />
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/15 backdrop-blur" />
            <div className="leading-tight">
              <div className="text-sm text-white/70">Vibe MVP</div>
              <div className="font-semibold tracking-tight">Say.//ForMe</div>
            </div>
          </div>
          <a
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/15 backdrop-blur hover:bg-white/15"
            href="#generator"
          >
            Open
          </a>
        </header>

        {/* Hero */}
        <section className="mt-10 grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-6xl">
              Message
              <span className="block text-white/80">without drama</span>
            </h1>

            <p className="mt-4 max-w-xl text-pretty text-base text-white/70 md:text-lg">
              Одна боль — одно решение: сложно написать сообщение? Введи ситуацию → выбери «кому» и тон → получи 3 готовых
              варианта, которые держат границу и звучат нормально.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#generator"
                className="group inline-flex items-center gap-2 rounded-full bg-lime-400 px-5 py-3 text-sm font-extrabold tracking-wide text-black shadow-[0_18px_50px_rgba(163,230,53,0.35)] hover:bg-lime-300"
              >
                GENERATE NOW
                <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm ring-1 ring-white/15 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-lime-400" />
                No login • No signup • MVP
              </div>
            </div>
          </div>

          {/* Phone cards mock */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-10 -top-10 h-44 w-44 rounded-[36px] bg-white/10 blur-2xl" />
            <div className="absolute -right-6 top-10 h-36 w-36 rounded-full bg-lime-400/20 blur-2xl" />

            <div className="grid gap-4">
              {previewCards.map((c, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-[34px] bg-black/65 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15 backdrop-blur"
                >
                  {/* “Notch” */}
                  <div className="mx-auto mb-4 h-6 w-28 rounded-full bg-white/10" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="whitespace-pre-line text-3xl font-extrabold leading-[0.95] tracking-tight">
                      {c.title}
                    </div>
                    <div className="rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold tracking-wide text-black">
                      {c.chip}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/70">
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-white/50">Left</div>
                      <div className="font-semibold text-white/85">{c.metaLeft}</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-white/50">Right</div>
                      <div className="font-semibold text-white/85">{c.metaRight}</div>
                    </div>
                  </div>

                  {/* “3D blob” */}
                  <div className="pointer-events-none absolute -right-10 -top-8 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#d1d5db_25%,#6b7280_60%,rgba(0,0,0,0)_70%)] opacity-60 blur-[0.2px]" />
                  <div className="pointer-events-none absolute -left-12 bottom-[-48px] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff_0%,#e5e7eb_25%,#9ca3af_58%,rgba(0,0,0,0)_72%)] opacity-35" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Generator */}
        <section id="generator" className="mt-12 md:mt-16">
          <div className="rounded-[36px] bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Generate a message</h2>
                <p className="mt-1 text-sm text-white/65">
                  Опиши ситуацию простыми словами. Мы соберём сообщение, которое можно сразу отправить.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => nudge('shorter')}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                  type="button"
                >
                  Короче
                </button>
                <button
                  onClick={() => nudge('softer')}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                  type="button"
                >
                  Мягче
                </button>
                <button
                  onClick={() => nudge('firmer')}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15"
                  type="button"
                >
                  Жёстче
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.9fr]">
              {/* Left */}
              <div className="rounded-[28px] bg-black/55 p-4 ring-1 ring-white/10 md:p-5">
                <label className="text-sm font-semibold text-white/80">Ситуация</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Например: Мне снова поставили задачу в последний момент, и я не успеваю без переработок."
                  className="mt-2 h-36 w-full resize-none rounded-2xl bg-white/5 p-4 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/25"
                />

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/55">Кому</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['close', 'coworker', 'boss', 'stranger'] as Audience[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setAudience(k)}
                          className={[
                            'rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition',
                            audience === k
                              ? 'bg-white text-black ring-white'
                              : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10',
                          ].join(' ')}
                        >
                          {audienceLabel[k]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/55">Тон</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['soft', 'neutral', 'firm', 'short'] as Tone[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setTone(k)}
                          className={[
                            'rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition',
                            tone === k
                              ? 'bg-lime-400 text-black ring-lime-300'
                              : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10',
                          ].join(' ')}
                        >
                          {toneLabel[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={!canGenerate}
                  className={[
                    'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold tracking-wide shadow-[0_18px_50px_rgba(163,230,53,0.20)] transition',
                    canGenerate ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-white/10 text-white/40',
                  ].join(' ')}
                >
                  <span className="h-2 w-2 rounded-full bg-black/70" />
                  Сгенерировать
                </button>

                <div className="mt-3 text-xs text-white/45">
                  Подсказка: минимум 8 символов. Сейчас: {input.trim().length}
                </div>
              </div>

              {/* Right */}
              <div className="rounded-[28px] bg-black/45 p-4 ring-1 ring-white/10 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white/80">Результаты</div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65 ring-1 ring-white/15">
                    {audienceLabel[audience]} • {toneLabel[tone]}
                  </div>
                </div>

                <div className="mt-3 grid gap-3">
                  {results.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/55 ring-1 ring-white/10">
                      Тут появятся 3 варианта сообщения. Нажми “Сгенерировать”.
                    </div>
                  ) : (
                    results.map((r, idx) => (
                      <div key={idx} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                        <div className="text-xs font-semibold text-white/45">Option {idx + 1}</div>
                        <div className="mt-2 text-sm leading-relaxed text-white/85">{r}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => copy(r, idx)}
                            className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold ring-1 ring-white/15 hover:bg-white/15"
                            type="button"
                          >
                            {copiedIdx === idx ? 'Скопировано ✓' : 'Копировать'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-white/5 p-4 text-xs text-white/55 ring-1 ring-white/10">
                  MVP сейчас без AI-API, чтобы работало бесплатно. Когда захочешь — добавим /api/generate и подключим модель.
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 pb-6 text-center text-xs text-white/40">
          Made for vibe-coding • Next.js + Tailwind
        </footer>
      </div>
    </main>
  );
}
