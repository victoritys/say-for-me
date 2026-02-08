'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type BankScenario = 'delivery' | 'ordering' | 'hotel' | 'store' | 'greeting' | 'how-are-you' | 'answering-how-are-you' | 'saying-goodbye' | 'making-friends' | 'asking-for-help' | 'asking-for-directions' | 'phone-problems' | 'problems-emergencies' | 'paying-money';
type Scenario = BankScenario | 'saved';

const BASE_SCENARIOS: { id: Scenario; label: string; showOnMainUI?: boolean; keywords?: string[] }[] = [
  // Removed 'saved' from here to hide it from list. It is now accessed via icon.
  { id: 'delivery', label: 'Delivery Courier', showOnMainUI: true, keywords: ['доставка', 'курьер', 'food', 'order', 'pizza', 'еда', 'заказ'] },
  { id: 'ordering', label: 'Ordering at Café', showOnMainUI: true, keywords: ['кафе', 'ресторан', 'заказ', 'кофе', 'coffee', 'restaurant', 'food'] },
  { id: 'hotel', label: 'Hotel Check-in', showOnMainUI: true, keywords: ['отель', 'гостиница', 'заселение', 'room', 'check-in', 'booking'] },
  { id: 'store', label: 'Buying in Store', showOnMainUI: true, keywords: ['магазин', 'покупки', 'одежда', 'shopping', 'clothes', 'buy', 'size'] },
  { id: 'greeting', label: 'Greeting Someone', showOnMainUI: true, keywords: ['приветствие', 'знакомство', 'hello', 'hi', 'meet'] },
  { id: 'how-are-you', label: 'Asking “How Are You?”', showOnMainUI: false, keywords: ['как дела', 'how are you', 'sup'] },
  { id: 'answering-how-are-you', label: 'Answering “How Are You?”', showOnMainUI: false, keywords: ['ответ', 'answer', 'fine', 'good'] },
  { id: 'saying-goodbye', label: 'Saying Goodbye', showOnMainUI: false, keywords: ['прощание', 'пока', 'bye', 'see you'] },
  { id: 'making-friends', label: 'Making Friends', showOnMainUI: false, keywords: ['друзья', 'знакомство', 'friends', 'meet'] },
  { id: 'asking-for-help', label: 'Asking for Help', showOnMainUI: false, keywords: ['помощь', 'help', 'assist'] },
  { id: 'asking-for-directions', label: 'Asking for Directions', showOnMainUI: false, keywords: ['направление', 'дорога', 'где', 'where', 'direction', 'map'] },
  { id: 'phone-problems', label: 'Phone Problems', showOnMainUI: false, keywords: ['телефон', 'связь', 'интернет', 'phone', 'connection', 'wifi'] },
  { id: 'problems-emergencies', label: 'Problems & Emergencies', showOnMainUI: false, keywords: ['проблема', 'срочно', 'помощь', 'emergency', 'help', 'lost'] },
  { id: 'paying-money', label: 'Paying & Money', showOnMainUI: false, keywords: ['деньги', 'оплата', 'счет', 'money', 'pay', 'bill', 'check'] },
];

interface PhraseEntry {
  id: string; // Unique ID (e.g., 'delivery-1')
  text: string; // The English phrase
  translations: {
    RU: string;
    SR?: string;
    CHI?: string;
  };
  // Smart Filters
  // 'casual' | 'polite' | 'formal' | 'urgent' | 'friendly' | 'direct'
  tags: string[];
  // Mini-context
  context?: string; // "Use when..." hint
}

const BANK: Record<BankScenario, PhraseEntry[]> = {
  delivery: [
    {
      id: 'delivery-1',
      text: 'I’m on my way down right now.',
      translations: { RU: 'Я уже спускаюсь.', SR: 'Silazim odmah.', CHI: '我现在就下来。' },
      tags: ['urgent', 'direct'],
    },
    {
      id: 'delivery-2',
      text: 'I’ll be there in just a moment.',
      translations: { RU: 'Я буду там через минуту.', SR: 'Biću tamo za trenutak.', CHI: '我马上就到。' },
      tags: ['polite', 'urgent'],
    },
    {
      id: 'delivery-3',
      text: 'I’m coming downstairs, please hold on.',
      translations: { RU: 'Я спускаюсь, пожалуйста, подождите.', SR: 'Silazim, sačekajte molim vas.', CHI: '我正下楼，请稍等。' },
      tags: ['polite', 'urgent'],
    },
    {
      id: 'delivery-4',
      text: 'I’ll meet you at the entrance in a minute.',
      translations: { RU: 'Я встречу вас у входа через минуту.', SR: 'Naći ćemo se na ulazu za minut.', CHI: '我一分钟后在入口见你。' },
      tags: ['direct'],
      context: 'When courier is outside'
    },
    {
      id: 'delivery-5',
      text: 'Give me a second, I’m heading out.',
      translations: { RU: 'Секундочку, я выхожу.', SR: 'Samo sekund, izlazim.', CHI: '稍等，我这就出来。' },
      tags: ['casual', 'urgent'],
    },
    {
      id: 'delivery-6',
      text: 'I’m stepping out now, see you shortly.',
      translations: { RU: 'Я уже выхожу, скоро буду.', SR: 'Izlazim sada, vidimo se uskoro.', CHI: '我现在出来，一会儿见。' },
      tags: ['polite'],
    },
    {
      id: 'delivery-7',
      text: 'I’ll be with you shortly, thank you for waiting.',
      translations: { RU: 'Я сейчас подойду, спасибо за ожидание.', SR: 'Brzo ću doći, hvala na čekanju.', CHI: '我很快就到，谢谢等待。' },
      tags: ['formal', 'polite'],
      context: 'If you are late'
    },
    {
      id: 'delivery-8',
      text: 'I’m leaving my apartment now.',
      translations: { RU: 'Я выхожу из квартиры.', SR: 'Upravo izlazim iz stana.', CHI: '我现在离开公寓。' },
      tags: ['direct'],
    },
    {
      id: 'delivery-9',
      text: 'I’m heading to the door as we speak.',
      translations: { RU: 'Я уже иду к двери.', SR: 'Krenuo/la sam ka vratima.', CHI: '我正走向门口。' },
      tags: ['urgent', 'casual'],
    },
    {
      id: 'delivery-10',
      text: 'I’m on my way.',
      translations: { RU: 'Я уже иду / Я в пути / Я выхожу.', SR: 'Na putu sam.', CHI: '我在路上了。' },
      tags: ['casual', 'direct'],
    },
    {
      id: 'delivery-11',
      text: 'I’ll be right there.',
      translations: { RU: 'Я сейчас подойду / Я уже почти там / Сейчас буду.', SR: 'Odmah stižem.', CHI: '我马上到。' },
      tags: ['casual', 'urgent'],
    },
  ],
  ordering: [
    {
      id: 'ordering-1',
      text: 'Hey, can I get a menu?',
      translations: { RU: 'Привет, можно меню?', SR: 'Hej, mogu li dobiti meni?', CHI: '嘿，可以给我菜单吗？' },
      tags: ['casual'],
      context: 'When you sit down'
    },
    {
      id: 'ordering-2',
      text: 'Yeah, I’m ready to order.',
      translations: { RU: 'Да, я готов(а) заказать.', SR: 'Da, spreman/na sam da naručim.', CHI: '是的，我准备好点餐了。' },
      tags: ['direct'],
    },
    {
      id: 'ordering-3',
      text: 'What’s good here?',
      translations: { RU: 'Что у вас тут вкусного?', SR: 'Šta je ovde dobro?', CHI: '这也什么好吃？' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'ordering-4',
      text: 'Can I get this to take away?',
      translations: { RU: 'Можно с собой?', SR: 'Mogu li dobiti ovo za poneti?', CHI: '这个可以打包吗？' },
      tags: ['direct'],
    },
    {
      id: 'ordering-5',
      text: 'Could we get the check?',
      translations: { RU: 'Можно счёт?', SR: 'Možemo li dobiti račun?', CHI: '买单。' },
      tags: ['polite'],
      context: 'After meal'
    },
    {
      id: 'ordering-6',
      text: 'Everything was awesome, thanks!',
      translations: { RU: 'Всё было супер, спасибо!', SR: 'Sve je bilo super, hvala!', CHI: '一切都很棒，谢谢！' },
      tags: ['friendly', 'polite'],
    },
    {
      id: 'ordering-7',
      text: 'Let me get + dish',
      translations: { RU: 'Можно мне (блюдо)', SR: 'Mogu li dobiti (jelo)', CHI: '我要一份（菜名）' },
      tags: ['casual'],
      context: 'Template'
    },
    {
      id: 'ordering-8',
      text: 'Let me get the pasta, no cheese please.',
      translations: { RU: 'Можно мне пасту без сыра, пожалуйста.', SR: 'Mogu li dobiti pastu, bez sira molim.', CHI: '请给我一份意面，不要芝士。' },
      tags: ['polite', 'direct'],
    },
  ],
  hotel: [
    {
      id: 'hotel-1',
      text: 'Hi, I’m here to check in.',
      translations: { RU: 'Привет, я на заселение.', SR: 'Zdravo, došao sam da se prijavim.', CHI: '你好，我来办理入住。' },
      tags: ['direct'],
      context: 'At reception'
    },
    {
      id: 'hotel-2',
      text: 'I have a reservation under [Name].',
      translations: { RU: 'У меня бронь на имя [Имя].', SR: 'Imam rezervaciju na ime [Ime].', CHI: '我预订了房间，名字是 [名字]。' },
      tags: ['direct'],
      context: 'Template'
    },
    {
      id: 'hotel-3',
      text: 'I just arrived — is my room ready?',
      translations: { RU: 'Я только приехал(а), номер уже готов?', SR: 'Upravo sam stigao — da li je moja soba spremna?', CHI: '我刚到，请问我的房间准备好了吗？' },
      tags: ['polite', 'urgent'],
    },
    {
      id: 'hotel-4',
      text: 'Can I get a room with a view/balcony?',
      translations: { RU: 'Можно номер с видом / балконом?', SR: 'Mogu li dobiti sobu sa pogledom / balkonom?', CHI: '我可以要一间有风景/阳台的房间吗？' },
      tags: ['polite'],
    },
    {
      id: 'hotel-5',
      text: 'Is it possible to change the room?',
      translations: { RU: 'Можно поменять номер?', SR: 'Da li je moguće promeniti sobu?', CHI: '请问可以换个房间吗？' },
      tags: ['polite', 'urgent'],
      context: 'If there is an issue'
    },
  ],
  store: [
    {
      id: 'store-1',
      text: 'Hi there, could you help me find this in another size?',
      translations: { RU: 'Здравствуйте, поможете найти это в другом размере?', SR: 'Zdravo, možete li mi pomoći da nađem ovo u drugoj veličini?', CHI: '你好，能帮我找一下这个的别的尺码吗？' },
      tags: ['polite'],
    },
    {
      id: 'store-2',
      text: 'Hey, do you happen to have this in a different color?',
      translations: { RU: 'Привет, случайно нет этого в другом цвете?', SR: 'Hej, da li slučajno imate ovo u drugoj boji?', CHI: '嘿，请问这个有别的颜色吗？' },
      tags: ['casual'],
    },
    {
      id: 'store-3',
      text: 'Hi, is there any chance you’ve got this in stock?',
      translations: { RU: 'Здравствуйте, есть шанс, что это есть в наличии?', SR: 'Zdravo, da li možda imate ovo na stanju?', CHI: '你好，请问这个有现货吗？' },
      tags: ['polite', 'urgent'],
    },
    {
      id: 'store-4',
      text: 'Hey there, I’m looking for something like this, but a bit bigger.',
      translations: { RU: 'Привет, я ищу что-то похожее, но чуть больше.', SR: 'Hej, tražim nešto ovako, ali malo veće.', CHI: '嘿，我想找个像这样的，但是大一点的。' },
      tags: ['casual'],
    },
    {
      id: 'store-5',
      text: 'Hi, would you mind checking if you have this in medium?',
      translations: { RU: 'Здравствуйте, не могли бы вы проверить, есть ли это в размере M?', SR: 'Zdravo, da li biste mogli proveriti da li imate ovo u M veličini?', CHI: '你好，介意帮我查一下这个有M号吗？' },
      tags: ['polite'],
    },
    {
      id: 'store-6',
      text: 'Hey, do you know if this comes in other styles?',
      translations: { RU: 'Привет, вы знаете, бывает ли это в других вариантах?', SR: 'Hej, znate li da li ovo dolazi u drugim verzijama?', CHI: '嘿，你知道这个还有别的款式吗？' },
      tags: ['casual'],
    },
    {
      id: 'store-7',
      text: 'Hi there, is this the only model you have?',
      translations: { RU: 'Здравствуйте, это единственная модель, которая у вас есть?', SR: 'Zdravo, da li je ovo jedini model koji imate?', CHI: '你好，请问只有这一种型号吗？' },
      tags: ['direct'],
    },
    {
      id: 'store-8',
      text: 'Hey, could you show me something similar to this?',
      translations: { RU: 'Привет, можете показать что-то похожее?', SR: 'Hej, možete li mi pokazati nešto slično ovome?', CHI: '嘿，能给我看下类似的东西吗？' },
      tags: ['friendly'],
    },
    {
      id: 'store-9',
      text: 'Hey there, what would you recommend instead?',
      translations: { RU: 'Привет, что бы вы посоветовали вместо этого?', SR: 'Hej, šta biste preporučili umesto toga?', CHI: '嘿，如果不买这个，你有什么推荐的吗？' },
      tags: ['friendly', 'casual'],
    },
  ],
  greeting: [
    {
      id: 'greeting-1',
      text: 'Hey, how’s it going?',
      translations: { RU: 'Привет, как дела?', SR: 'Ćao, kako ide?', CHI: '嘿，最近怎么样？' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'greeting-2',
      text: 'Hi there, nice to see you.',
      translations: { RU: 'Привет, рад(а) тебя видеть.', SR: 'Zdravo, drago mi je što te vidim.', CHI: '你好，很高兴见到你。' },
      tags: ['polite', 'friendly'],
    },
    {
      id: 'greeting-3',
      text: 'Hey, what’s up?',
      translations: { RU: 'Привет, как оно?', SR: 'Hej, šta ima?', CHI: '嘿，有什么新鲜事？' },
      tags: ['casual'],
    },
    {
      id: 'greeting-4',
      text: 'Hi, how are you doing today?',
      translations: { RU: 'Привет, как ты сегодня?', SR: 'Zdravo, kako si danas?', CHI: '你好，你今天过得怎么样？' },
      tags: ['polite'],
    },
    {
      id: 'greeting-5',
      text: 'Hey there, good to see you.',
      translations: { RU: 'Привет, рад(а) видеть.', SR: 'Hej, lepo te je videti.', CHI: '嘿，很高兴见到你。' },
      tags: ['friendly'],
    },
    {
      id: 'greeting-6',
      text: 'Hi, hope you’re doing well.',
      translations: { RU: 'Привет, надеюсь, у тебя всё хорошо.', SR: 'Zdravo, nadam se da si dobro.', CHI: '你好，希望你一切都好。' },
      tags: ['polite', 'friendly'],
    },
    {
      id: 'greeting-7',
      text: 'Hey, how’ve you been?',
      translations: { RU: 'Привет, как ты поживаешь?', SR: 'Hej, kako si u poslednje vreme?', CHI: '嘿，最近过得怎么样？' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'greeting-8',
      text: 'Hi there, everything good?',
      translations: { RU: 'Привет, всё ок?', SR: 'Zdravo, je l\' sve u redu?', CHI: '你好，一切顺利吗？' },
      tags: ['casual'],
    },
    {
      id: 'greeting-9',
      text: 'Hey, long time no see.',
      translations: { RU: 'Привет, давно не виделись.', SR: 'Hej, dugo se nismo videli.', CHI: '嘿，好久不见。' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'greeting-10',
      text: 'Hi, how’s everything?',
      translations: { RU: 'Привет, как всё?', SR: 'Zdravo, kako je sve?', CHI: '你好，一切都好吗？' },
      tags: ['casual'],
    },
  ],
  'how-are-you': [
    {
      id: 'how-are-you-1',
      text: 'Hey, how’s it going?',
      translations: { RU: 'Привет, как дела?', SR: 'Ćao, kako ide?', CHI: '嘿，最近怎么样？' },
      tags: ['casual'],
    },
    {
      id: 'how-are-you-2',
      text: 'How are things?',
      translations: { RU: 'Как у тебя дела?', SR: 'Kako stvari stoje?', CHI: '最近怎么样？' },
      tags: ['casual'],
    },
    {
      id: 'how-are-you-3',
      text: 'How have you been?',
      translations: { RU: 'Как ты поживал(а)?', SR: 'Kako si bio?', CHI: '你最近过得怎么样？' },
      tags: ['polite', 'friendly'],
    },
    {
      id: 'how-are-you-4',
      text: 'How’s everything?',
      translations: { RU: 'Как всё?', SR: 'Kako je sve?', CHI: '一切都好吗？' },
      tags: ['casual'],
    },
    {
      id: 'how-are-you-5',
      text: 'What’s new with you?',
      translations: { RU: 'Что нового?', SR: 'Šta ima novo kod tebe?', CHI: '你有什么确切的新鲜事吗？' },
      tags: ['friendly'],
    },
    {
      id: 'how-are-you-6',
      text: 'How’s life treating you?',
      translations: { RU: 'Как жизнь?', SR: 'Kako te život tretira?', CHI: '最近生活怎么样？' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'how-are-you-7',
      text: 'You doing okay?',
      translations: { RU: 'Всё нормально?', SR: 'Da li si dobro?', CHI: '你还好吗？' },
      tags: ['casual', 'direct'],
    },
    {
      id: 'how-are-you-8',
      text: 'How are you holding up?',
      translations: { RU: 'Как ты держишься?', SR: 'Kako se držiš?', CHI: '你还能撑得住吗？' },
      tags: ['friendly', 'urgent'],
      context: 'If they had a hard time'
    },
    {
      id: 'how-are-you-9',
      text: 'Everything good on your end?',
      translations: { RU: 'У тебя всё хорошо?', SR: 'Je l\' sve u redu kod tebe?', CHI: '你那边一切都好吗？' },
      tags: ['casual'],
    },
    {
      id: 'how-are-you-10',
      text: 'How are you feeling these days?',
      translations: { RU: 'Как ты себя сейчас чувствуешь?', SR: 'Kako se osećaš ovih dana?', CHI: '这几天感觉怎么样？' },
      tags: ['polite', 'friendly'],
    },
  ],
  'answering-how-are-you': [
    {
      id: 'answering-how-are-you-1',
      text: 'I’m doing great, thanks.',
      translations: { RU: 'У меня всё отлично, спасибо.', SR: 'Odlično sam, hvala.', CHI: '我很好，谢谢。' },
      tags: ['positive', 'polite'],
    },
    {
      id: 'answering-how-are-you-2',
      text: 'Pretty good, actually.',
      translations: { RU: 'На самом деле, довольно хорошо.', SR: 'Prilično dobro, zapravo.', CHI: '其实还不错。' },
      tags: ['positive', 'casual'],
    },
    {
      id: 'answering-how-are-you-3',
      text: 'Can’t complain.',
      translations: { RU: 'Не жалуюсь.', SR: 'Ne mogu da se žalim.', CHI: '没什么可抱怨的。' },
      tags: ['casual'],
    },
    {
      id: 'answering-how-are-you-4',
      text: 'All good on my side.',
      translations: { RU: 'У меня всё ок.', SR: 'Kod mene je sve dobro.', CHI: '我这边一切都好。' },
      tags: ['casual'],
    },
    {
      id: 'answering-how-are-you-5',
      text: 'Doing well, thanks for asking.',
      translations: { RU: 'Всё хорошо, спасибо, что спросил(а).', SR: 'Dobro sam, hvala na pitanju.', CHI: '一切顺利，谢谢关心。' },
      tags: ['polite'],
    },
    {
      id: 'answering-how-are-you-6',
      text: 'I’m good, just busy.',
      translations: { RU: 'Всё нормально, просто занят(а).', SR: 'Dobro sam, samo sam zauzet.', CHI: '我还好，就是有点忙。' },
      tags: ['casual'],
      context: 'If you want to end conversation'
    },
    {
      id: 'answering-how-are-you-7',
      text: 'Feeling great today.',
      translations: { RU: 'Сегодня отлично себя чувствую.', SR: 'Osećam se odlično danas.', CHI: '今天感觉很棒。' },
      tags: ['positive', 'friendly'],
    },
    {
      id: 'answering-how-are-you-8',
      text: 'Things are going well.',
      translations: { RU: 'Всё идёт хорошо.', SR: 'Stvari idu dobro.', CHI: '一切都在往好的方向发展。' },
      tags: ['positive'],
    },
    {
      id: 'answering-how-are-you-9',
      text: 'Not bad at all.',
      translations: { RU: 'Вполне нормально.', SR: 'Nije loše uopšte.', CHI: '一点也不差。' },
      tags: ['casual'],
    },
    {
      id: 'answering-how-are-you-10',
      text: 'Better than ever.',
      translations: { RU: 'Лучше, чем когда-либо.', SR: 'Bolje nego ikad.', CHI: '前所未有的好。' },
      tags: ['positive', 'friendly'],
    },
  ],
  'saying-goodbye': [
    {
      id: 'saying-goodbye-1',
      text: 'Alright, see you later.',
      translations: { RU: 'Ладно, увидимся.', SR: 'Važi, vidimo se kasnije.', CHI: '好的，回头见。' },
      tags: ['casual'],
    },
    {
      id: 'saying-goodbye-2',
      text: 'I’d better get going.',
      translations: { RU: 'Мне пора идти.', SR: 'Bolje da krenem.', CHI: '我得走了。' },
      tags: ['casual', 'direct'],
    },
    {
      id: 'saying-goodbye-3',
      text: 'It was nice talking to you.',
      translations: { RU: 'Было приятно пообщаться.', SR: 'Bilo je lepo razgovarati s tobom.', CHI: '很高兴和你聊天。' },
      tags: ['polite', 'friendly'],
    },
    {
      id: 'saying-goodbye-4',
      text: 'Catch you later.',
      translations: { RU: 'Увидимся позже.', SR: 'Vidimo se kasnije.', CHI: '回头见。' },
      tags: ['casual'],
    },
    {
      id: 'saying-goodbye-5',
      text: 'Take care.',
      translations: { RU: 'Береги себя.', SR: 'Čuvaj se.', CHI: '保重。' },
      tags: ['friendly'],
    },
    {
      id: 'saying-goodbye-6',
      text: 'Talk to you soon.',
      translations: { RU: 'Скоро созвонимся.', SR: 'Čujemo se uskoro.', CHI: '再聊。' },
      tags: ['friendly'],
    },
    {
      id: 'saying-goodbye-7',
      text: 'Have a good one.',
      translations: { RU: 'Хорошего дня.', SR: 'Prijatan dan.', CHI: '祝你过得愉快。' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'saying-goodbye-8',
      text: 'Let’s stay in touch.',
      translations: { RU: 'Давай будем на связи.', SR: 'Ostanimo u kontaktu.', CHI: '保持联系。' },
      tags: ['friendly'],
    },
    {
      id: 'saying-goodbye-9',
      text: 'See you around.',
      translations: { RU: 'Ещё увидимся.', SR: 'Vidimo se.', CHI: '回见。' },
      tags: ['casual'],
    },
    {
      id: 'saying-goodbye-10',
      text: 'Enjoy the rest of your day.',
      translations: { RU: 'Хорошего остатка дня.', SR: 'Uživaj u ostatku dana.', CHI: '祝你今天过得愉快。' },
      tags: ['polite', 'friendly'],
    },
  ],
  'making-friends': [
    {
      id: 'making-friends-1',
      text: 'So, where are you from?',
      translations: { RU: 'Ты откуда?', SR: 'Odakle si?', CHI: '你是哪里人？' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'making-friends-2',
      text: 'How long have you been here?',
      translations: { RU: 'Как давно ты здесь?', SR: 'Koliko dugo si ovde?', CHI: '你在这里多久了？' },
      tags: ['casual'],
    },
    {
      id: 'making-friends-3',
      text: 'What do you do?',
      translations: { RU: 'Чем ты занимаешься?', SR: 'Čime se baviš?', CHI: '你是做什么的？' },
      tags: ['casual'],
    },
    {
      id: 'making-friends-4',
      text: 'Is this your first time here?',
      translations: { RU: 'Ты здесь впервые?', SR: 'Da li si prvi put ovde?', CHI: '你是第一次来这里吗？' },
      tags: ['casual'],
    },
    {
      id: 'making-friends-5',
      text: 'Do you live around here?',
      translations: { RU: 'Ты тут живёшь рядом?', SR: 'Da li živiš u blizini?', CHI: '你住在这附近吗？' },
      tags: ['casual'],
    },
    {
      id: 'making-friends-6',
      text: 'What brought you here?',
      translations: { RU: 'Что тебя сюда привело?', SR: 'Šta te je dovelo ovde?', CHI: '什么风把你吹来了？' },
      tags: ['friendly'],
    },
    {
      id: 'making-friends-7',
      text: 'Are you new to the city too?',
      translations: { RU: 'Ты тоже недавно в городе?', SR: 'Da li si i ti nov u gradu?', CHI: '你也是刚来这个城市吗？' },
      tags: ['friendly'],
    },
    {
      id: 'making-friends-8',
      text: 'Do you like it here so far?',
      translations: { RU: 'Тебе тут нравится?', SR: 'Da li ti se sviđa ovde do sada?', CHI: '到目前为止你喜欢这里吗？' },
      tags: ['casual', 'friendly'],
    },
    {
      id: 'making-friends-9',
      text: 'Have you been here long?',
      translations: { RU: 'Ты давно здесь?', SR: 'Da li si dugo ovde?', CHI: '你待在这里很久了吗？' },
      tags: ['casual'],
    },
    {
      id: 'making-friends-10',
      text: 'What do you usually do in your free time?',
      translations: { RU: 'Чем ты обычно занимаешься в свободное время?', SR: 'Šta obično radiš u slobodno vreme?', CHI: '你空闲时间通常做什么？' },
      tags: ['friendly'],
    },
  ],
  'asking-for-help': [
    {
      id: 'asking-for-help-1',
      text: 'Could you help me out for a second?',
      translations: { RU: 'Можешь помочь на секундочку?', SR: 'Možeš li mi pomoći na sekundu?', CHI: '能帮我一下吗？' },
      tags: ['casual', 'polite'],
    },
    {
      id: 'asking-for-help-2',
      text: 'Hey, could I ask you something?',
      translations: { RU: 'Привет, можно тебя кое-что спросить?', SR: 'Hej, mogu li te nešto pitati?', CHI: '嘿，我可以问你点事吗？' },
      tags: ['casual'],
    },
    {
      id: 'asking-for-help-3',
      text: 'Sorry to bother you, but I need some help.',
      translations: { RU: 'Извини, что отвлекаю, но мне нужна помощь.', SR: 'Izvini što smetam, ali treba mi pomoć.', CHI: '抱歉打扰你，但我需要帮助。' },
      tags: ['polite', 'urgent'],
    },
    {
      id: 'asking-for-help-4',
      text: 'Would you mind giving me a hand?',
      translations: { RU: 'Не мог(ла) бы ты помочь?', SR: 'Da li bi mogao/la da mi pomogneš?', CHI: '介意帮把手吗？' },
      tags: ['polite'],
    },
    {
      id: 'asking-for-help-5',
      text: 'I’m a bit lost — could you help me?',
      translations: { RU: 'Я немного потерялся(ась), поможешь?', SR: 'Malo sam se izgubio/la — možeš li mi pomoći?', CHI: '我有点迷路了——能帮帮我吗？' },
      tags: ['polite', 'urgent'],
    },
    {
      id: 'asking-for-help-6',
      text: 'Can you help me figure this out?',
      translations: { RU: 'Поможешь мне с этим разобраться?', SR: 'Možeš li mi pomoći da ovo rešim?', CHI: '能帮我弄明白这个吗？' },
      tags: ['casual'],
    },
    {
      id: 'asking-for-help-7',
      text: 'I could really use some help here.',
      translations: { RU: 'Мне бы тут очень пригодилась помощь.', SR: 'Stvarno bi mi dobro došla pomoć ovde.', CHI: '我这里真的需要一些帮助。' },
      tags: ['direct', 'urgent'],
    },
    {
      id: 'asking-for-help-8',
      text: 'Any chance you could help me?',
      translations: { RU: 'Есть шанс, что ты мне поможешь?', SR: 'Ima li šanse da mi pomogneš?', CHI: '有机会帮我一下吗？' },
      tags: ['casual', 'polite'],
    },
    {
      id: 'asking-for-help-9',
      text: 'Do you have a minute to help me?',
      translations: { RU: 'У тебя есть минутка помочь?', SR: 'Imaš li minut da mi pomogneš?', CHI: '有时间帮我一下吗？' },
      tags: ['polite'],
    },
    {
      id: 'asking-for-help-10',
      text: 'I’m not sure what to do — can you help?',
      translations: { RU: 'Я не уверен(а), что делать — поможешь?', SR: 'Nisam siguran/na šta da radim — možeš li pomoći?', CHI: '我不确定该怎么做——能帮帮我吗？' },
      tags: ['polite', 'urgent'],
    },
  ],
  'asking-for-directions': [
    {
      id: 'asking-for-directions-1',
      text: 'Excuse me, how do I get to this place?',
      translations: { RU: 'Извините, как мне сюда пройти?', SR: 'Izvinite, kako da stignem do ovog mesta?', CHI: '打扰一下，请问怎么去这里？' },
      tags: ['polite'],
    },
    {
      id: 'asking-for-directions-2',
      text: 'Is this far from here?',
      translations: { RU: 'Это далеко отсюда?', SR: 'Da li je ovo daleko odavde?', CHI: '这离这里远吗？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-3',
      text: 'Am I going the right way?',
      translations: { RU: 'Я правильно иду?', SR: 'Da li idem pravim putem?', CHI: '我走的方向对吗？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-4',
      text: 'Could you point me in the right direction?',
      translations: { RU: 'Не подскажете направление?', SR: 'Možete li mi pokazati pravi smer?', CHI: '你能给我指个方向吗？' },
      tags: ['polite'],
    },
    {
      id: 'asking-for-directions-5',
      text: 'Which way is the metro?',
      translations: { RU: 'Где метро?', SR: 'Kuda se ide do metroa?', CHI: '地铁在哪边？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-6',
      text: 'How long does it take to walk there?',
      translations: { RU: 'Сколько туда идти пешком?', SR: 'Koliko treba peške do tamo?', CHI: '走到那里要多久？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-7',
      text: 'Is it easier to take a bus?',
      translations: { RU: 'Проще поехать на автобусе?', SR: 'Da li je lakše ići autobusom?', CHI: '坐公交车会更方便吗？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-8',
      text: 'Can I get there on foot?',
      translations: { RU: 'Туда можно дойти пешком?', SR: 'Mogu li stići tamo peške?', CHI: '可以走路去吗？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-9',
      text: 'Where exactly is the entrance?',
      translations: { RU: 'Где именно вход?', SR: 'Gde je tačno ulaz?', CHI: '入口确切在哪里？' },
      tags: ['direct'],
    },
    {
      id: 'asking-for-directions-10',
      text: 'Could you show me on the map?',
      translations: { RU: 'Можете показать на карте?', SR: 'Možete li mi pokazati na mapi?', CHI: '能在地图上指给我看吗？' },
      tags: ['polite'],
    },
  ],
  'phone-problems': [
    {
      id: 'phone-problems-1',
      text: 'Sorry, I didn’t catch that.',
      translations: { RU: 'Извините, я не расслышал(а).', SR: 'Izvinite, nisam vas najbolje čuo.', CHI: '抱歉，我没听清。' },
      tags: ['polite'],
      context: 'When you didn’t hear'
    },
    {
      id: 'phone-problems-2',
      text: 'Could you say that again?',
      translations: { RU: 'Можете повторить?', SR: 'Možete li ponoviti?', CHI: '能再说一遍吗？' },
      tags: ['polite'],
    },
    {
      id: 'phone-problems-3',
      text: 'The connection is bad.',
      translations: { RU: 'Плохая связь.', SR: 'Veza je loša.', CHI: '信号不好。' },
      tags: ['direct'],
    },
    {
      id: 'phone-problems-4',
      text: 'You’re breaking up.',
      translations: { RU: 'Вас прерывает.', SR: 'Prekidate se.', CHI: '你的声音断断续续的。' },
      tags: ['direct'],
    },
    {
      id: 'phone-problems-5',
      text: 'Can you speak a bit slower?',
      translations: { RU: 'Можете говорить помедленнее?', SR: 'Možete li govoriti malo sporije?', CHI: '能说慢一点吗？' },
      tags: ['polite'],
    },
    {
      id: 'phone-problems-6',
      text: 'I can barely hear you.',
      translations: { RU: 'Я вас почти не слышу.', SR: 'Jedva vas čujem.', CHI: '我几乎听不见你说话。' },
      tags: ['direct', 'urgent'],
    },
    {
      id: 'phone-problems-7',
      text: 'Let me call you back.',
      translations: { RU: 'Я вам перезвоню.', SR: 'Pozvaću vas ponovo.', CHI: '我待会儿打给你。' },
      tags: ['direct'],
    },
    {
      id: 'phone-problems-8',
      text: 'There’s a lot of noise here.',
      translations: { RU: 'Тут очень шумно.', SR: 'Ovde je velika buka.', CHI: '这里很吵。' },
      tags: ['direct'],
    },
    {
      id: 'phone-problems-9',
      text: 'Can you text me instead?',
      translations: { RU: 'Можете написать сообщение?', SR: 'Možete li mi napisati poruku?', CHI: '能给我发短信吗？' },
      tags: ['polite'],
    },
    {
      id: 'phone-problems-10',
      text: 'I think we got disconnected.',
      translations: { RU: 'Кажется, нас разъединило.', SR: 'Mislim da se veza prekinula.', CHI: '我想我们的电话断了。' },
      tags: ['direct'],
    },
  ],
  'problems-emergencies': [
    {
      id: 'problems-emergencies-1',
      text: 'I need help right now.',
      translations: { RU: 'Мне срочно нужна помощь.', SR: 'Treba mi pomoć odmah.', CHI: '我现在需要帮助。' },
      tags: ['urgent', 'direct'],
    },
    {
      id: 'problems-emergencies-2',
      text: 'Something’s wrong.',
      translations: { RU: 'Что-то не так.', SR: 'Nešto nije u redu.', CHI: '出问题了。' },
      tags: ['urgent'],
    },
    {
      id: 'problems-emergencies-3',
      text: 'I’ve lost my phone.',
      translations: { RU: 'Я потерял(а) телефон.', SR: 'Izgubio/la sam telefon.', CHI: '我的手机丢了。' },
      tags: ['urgent', 'direct'],
    },
    {
      id: 'problems-emergencies-4',
      text: 'My wallet was stolen.',
      translations: { RU: 'У меня украли кошелёк.', SR: 'Ukraden mi je novčanik.', CHI: '我的钱包被偷了。' },
      tags: ['urgent', 'direct'],
    },
    {
      id: 'problems-emergencies-5',
      text: 'I don’t feel safe here.',
      translations: { RU: 'Мне здесь небезопасно.', SR: 'Ne osećam se bezbedno ovde.', CHI: '我在这里感觉不安全。' },
      tags: ['urgent'],
    },
    {
      id: 'problems-emergencies-6',
      text: 'This is an emergency.',
      translations: { RU: 'Это срочно.', SR: 'Ovo je hitan slučaj.', CHI: '这是紧急情况。' },
      tags: ['urgent'],
    },
    {
      id: 'problems-emergencies-7',
      text: 'I need medical help.',
      translations: { RU: 'Мне нужна медицинская помощь.', SR: 'Treba mi medicinska pomoć.', CHI: '我需要医疗帮助。' },
      tags: ['urgent'],
    },
    {
      id: 'problems-emergencies-8',
      text: 'Can someone help me, please?',
      translations: { RU: 'Кто-нибудь, помогите, пожалуйста.', SR: 'Može li neko da mi pomogne, molim vas?', CHI: '有人能帮帮我吗，拜托？' },
      tags: ['urgent', 'polite'],
    },
    {
      id: 'problems-emergencies-9',
      text: 'I don’t know what to do.',
      translations: { RU: 'Я не знаю, что делать.', SR: 'Ne znam šta da radim.', CHI: '我不知道该怎么办。' },
      tags: ['urgent'],
    },
  ],
  'paying-money': [
    {
      id: 'paying-money-1',
      text: 'Can I pay by card?',
      translations: { RU: 'Можно картой?', SR: 'Mogu li platiti karticom?', CHI: '我可以刷卡吗？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-2',
      text: 'Do you take cash?',
      translations: { RU: 'Вы принимаете наличные?', SR: 'Da li primate gotovinu?', CHI: '你们收现金吗？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-3',
      text: 'My card didn’t go through.',
      translations: { RU: 'Карта не прошла.', SR: 'Moja kartica nije prošla.', CHI: '我的卡刷不过去。' },
      tags: ['urgent', 'direct'],
    },
    {
      id: 'paying-money-4',
      text: 'Can I split the bill?',
      translations: { RU: 'Можно разделить счёт?', SR: 'Možemo li podeliti račun?', CHI: '我们可以分开付吗？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-5',
      text: 'Is service included?',
      translations: { RU: 'Обслуживание включено?', SR: 'Da li je usluga uračunata?', CHI: '服务费包含在内吗？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-6',
      text: 'How much do I owe you?',
      translations: { RU: 'Сколько я должен(на)?', SR: 'Koliko sam vam dužan?', CHI: '我该付多少钱？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-7',
      text: 'Can I get a receipt?',
      translations: { RU: 'Можно чек?', SR: 'Mogu li dobiti račun?', CHI: '可以给我收据吗？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-8',
      text: 'Is there a fee for this?',
      translations: { RU: 'Есть комиссия?', SR: 'Da li se naplaćuje naknada?', CHI: '这项有手续费吗？' },
      tags: ['direct'],
    },
    {
      id: 'paying-money-9',
      text: 'I’ll pay for this one.',
      translations: { RU: 'Я заплачу за это.', SR: 'Ja ću platiti za ovo.', CHI: '这个我来付。' },
      tags: ['polite', 'friendly'],
    },
    {
      id: 'paying-money-10',
      text: 'Keep the change.',
      translations: { RU: 'Сдачи не надо.', SR: 'Zadržite kusur.', CHI: '不用找了。' },
      tags: ['polite', 'friendly'],
    },
  ],
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

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="black" strokeWidth="2.2" />
      <path d="M16.8 16.8 21 21" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 20" fill="none" aria-hidden="true">
      <path d="M4 6h16" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 18h16" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9 6a2 2 0 1 0 0.01 0Z" fill="black" />
      <path d="M15 12a2 2 0 1 0 0.01 0Z" fill="black" />
      <path d="M11 18a2 2 0 1 0 0.01 0Z" fill="black" />
    </svg>
  );
}


function SpeakerIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function HeartIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? '#FF3B30' : 'none'}
        stroke={filled ? '#FF3B30' : 'black'}
        strokeWidth="2"
      />
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

function SavedList({
  favorites,
  onRemove,
  onSpeak,
  lang,
}: {
  favorites: string[];
  onRemove: (id: string) => void;
  onSpeak: (text: string, language: 'EN' | 'SR' | 'CHI') => void;
  lang: 'EN' | 'SR' | 'CHI';
}) {
  const allPhrases = useMemo(() => Object.values(BANK).flat(), []);
  const savedPhrases = useMemo(() => allPhrases.filter((p) => favorites.includes(p.id)), [allPhrases, favorites]);

  // Swipe logic state
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitX, setExitX] = useState<number | null>(null); // For animation

  const touchStartPos = useRef<number | null>(null);

  // Sync active index if favorites change
  useEffect(() => {
    if (activeIndex >= savedPhrases.length && savedPhrases.length > 0) {
      setActiveIndex(savedPhrases.length - 1);
    }
  }, [savedPhrases.length, activeIndex]);

  if (savedPhrases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-4xl mb-4">❤️</div>
        <div className="text-lg font-bold text-black/60">No saved phrases yet</div>
        <div className="text-sm text-black/40 mt-2">
          Click the heart icon on any phrase to save it here for later.
        </div>
      </div>
    );
  }

  const handleEnd = () => {
    if (Math.abs(dragX) > 70) {
      const isNext = dragX < 0; // Swipe left to go next
      setExitX(isNext ? -500 : 500);

      setTimeout(() => {
        if (isNext) {
          setActiveIndex((prev) => (prev + 1) % savedPhrases.length);
        } else {
          setActiveIndex((prev) => (prev - 1 + savedPhrases.length) % savedPhrases.length);
        }
        setDragX(0);
        setExitX(null);
      }, 150);
    } else {
      setDragX(0);
    }
    touchStartPos.current = null;
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = e.touches[0].clientX;
    setIsDragging(true);
    setExitX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPos.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartPos.current;

    // Resistance at edges if only 1 phrase
    if (savedPhrases.length <= 1) {
      setDragX(diff * 0.3);
    } else {
      setDragX(diff);
    }
  };

  const handleTouchEnd = () => handleEnd();

  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartPos.current = e.clientX;
    setIsDragging(true);
    setExitX(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartPos.current === null) return;
    const currentX = e.clientX;
    const diff = currentX - touchStartPos.current;

    if (savedPhrases.length <= 1) {
      setDragX(diff * 0.3);
    } else {
      setDragX(diff);
    }
  };

  const handleMouseUp = () => handleEnd();

  const currentPhrase = savedPhrases[activeIndex];

  return (
    <div className="h-full w-full relative">
      {/* DESKTOP: Scrollable list */}
      <div className="hidden min-[1200px]:block absolute inset-x-0 top-0 max-h-[480px] overflow-y-auto thin-scroll px-0 py-2">
        <div className="space-y-3 px-6">
          {savedPhrases.map((p) => (
            <div key={p.id} className="bg-white/60 backdrop-blur-md rounded-[24px] p-5 relative group transition-all hover:bg-white/80 shadow-sm border border-white/40">
              <div className="pr-8">
                <div className="font-bold text-black text-lg leading-tight">
                  {lang === 'EN' ? p.text : (p.translations[lang] || p.text)}
                </div>
                <div className="text-black/60 text-sm mt-1 font-medium">
                  {p.translations.RU}
                </div>
              </div>
              <button
                onClick={() => onRemove(p.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
              >
                <HeartIcon filled={true} />
              </button>
              <div className="flex items-center gap-3 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onSpeak(p.text, lang)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                  <SpeakerIcon />
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(p.text)}
                  className="text-[10px] font-bold uppercase tracking-wider text-black/40 hover:text-black transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
          <div className="h-4" />
        </div>
      </div>

      {/* MOBILE: Swipeable Stack */}
      <div className="min-[1200px]:hidden flex flex-col items-center justify-start h-full pt-4">
        <div className="relative w-full max-w-[320px] aspect-[16/10] perspective-[1000px]">
          {/* Card Stack (Visual Only) */}
          {savedPhrases.length > 1 && (
            <div className="absolute inset-x-4 top-4 bottom-[-4px] bg-white/30 backdrop-blur-sm rounded-[24px] border border-white/20 transform translate-z-[-10px] scale-[0.95]" />
          )}

          {/* Active Card */}
          <div
            key={currentPhrase.id} // Force re-render on card change
            className={`absolute inset-0 bg-white/60 backdrop-blur-md rounded-[24px] p-4 shadow-xl border border-white/40 flex flex-col justify-between select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              transform: `translateX(${exitX !== null ? exitX : dragX}px) rotate(${(exitX !== null ? exitX : dragX) * 0.08}deg)`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-black/40 text-[10px] font-bold tracking-widest uppercase">
                  Saved {activeIndex + 1} / {savedPhrases.length}
                </div>
              </div>
              <div className="font-bold text-black text-xl leading-snug mb-1">
                {lang === 'EN' ? currentPhrase.text : (currentPhrase.translations[lang] || currentPhrase.text)}
              </div>
              <div className="text-black/50 text-base font-medium leading-tight">
                {currentPhrase.translations.RU}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSpeak(currentPhrase.text, lang)}
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center active:bg-black/10"
                >
                  <SpeakerIcon size={20} />
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(currentPhrase.text)}
                  className="text-[10px] font-bold uppercase tracking-wider text-black/40 active:text-black"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => onRemove(currentPhrase.id)}
                className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shadow-sm"
              >
                <HeartIcon filled={true} size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-8 text-black/30 text-xs font-medium uppercase tracking-widest">
          {savedPhrases.length > 1 ? '← Swipe to browse →' : 'Your saved phrase'}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [scenario, setScenario] = useState<Scenario>('delivery');

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<PhraseEntry | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('safm_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch { }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavs = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('safm_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const [lang, setLang] = useState<'EN' | 'SR' | 'CHI'>('EN');

  const [searchOpenDesktop, setSearchOpenDesktop] = useState(false);
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);
  const [settingsOpenMobile, setSettingsOpenMobile] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchBtnRef = useRef<HTMLButtonElement>(null);
  const mobileSettingsRef = useRef<HTMLDivElement>(null);

  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Default to "Delivery" being the primary/top item
  const [topItem, setTopItem] = useState<DropdownItem>({ label: BASE_SCENARIOS[0].label, scenario: 'delivery' });
  const [activeLabel, setActiveLabel] = useState<string>(BASE_SCENARIOS[0].label);

  const [searchQuery, setSearchQuery] = useState('');

  const dropdownItems = useMemo<DropdownItem[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return BASE_SCENARIOS.map((s) => ({ label: s.label, scenario: s.id }));

    return BASE_SCENARIOS.filter((s) => {
      const labelMatch = s.label.toLowerCase().includes(q);
      const keywordMatch = s.keywords?.some((k) => k.toLowerCase().includes(q));
      return labelMatch || keywordMatch;
    }).map((s) => ({ label: s.label, scenario: s.id }));
  }, [searchQuery]);

  // Initial state: filter visible scenarios, limit to first 5
  const [scenariosOnUI, setScenariosOnUI] = useState(() => {
    return BASE_SCENARIOS.filter((s) => s.showOnMainUI !== false).slice(0, 5);
  });

  const handleSearchSelect = (item: DropdownItem) => {
    setScenario(item.scenario);
    setActiveLabel(item.label);
    setTopItem(item); // For mobile header
    hideResult();
    setActiveTags([]); // Reset tags on scenario change
    setSearchQuery(''); // Clear search on select

    setScenariosOnUI((prev) => {
      // Find the selected scenario object in BASE_SCENARIOS
      const selectedScenario = BASE_SCENARIOS.find((s) => s.id === item.scenario);
      if (!selectedScenario) return prev;

      // Check if it's already in the UI list
      const existsIndex = prev.findIndex((s) => s.id === item.scenario);

      if (existsIndex === 0) {
        // Already at top, do nothing
        return prev;
      }

      // Remove it if it exists elsewhere, or filter out the rest
      const otherScenarios = prev.filter((s) => s.id !== item.scenario);

      // New list: [Selected, ...others]
      const newList = [selectedScenario, ...otherScenarios];

      // Enforce max 5 items: slice if needed
      return newList.slice(0, 5);
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchOpenDesktop &&
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node) &&
        desktopSearchBtnRef.current &&
        !desktopSearchBtnRef.current.contains(event.target as Node)
      ) {
        setSearchOpenDesktop(false);
        setSearchQuery('');
      }
      if (settingsOpenMobile && mobileSettingsRef.current && !mobileSettingsRef.current.contains(event.target as Node)) {
        setSettingsOpenMobile(false);
        setSearchOpenMobile(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpenDesktop, settingsOpenMobile]);






  const girlSrc = showResult ? '/girl_after.png' : '/girl.png';

  function hideResult() {
    setShowResult(false);
  }

  function toggleTag(tag: string) {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    hideResult();
  }

  function generateNext() {
    if (scenario === 'saved') return;

    const list = BANK[scenario];
    if (!list?.length) return;

    // Filter by tags (logic remains for future use if tags are re-enabled)
    const filtered = activeTags.length > 0
      ? list.filter(p => activeTags.every(t => p.tags.includes(t)))
      : list;

    // Fallback if no matches
    const finalList = filtered.length > 0 ? filtered : list;

    let next = pick(finalList);

    if (finalList.length > 1) {
      let guard = 0;
      while (next.id === result?.id && guard < 20) {
        next = pick(finalList);
        guard++;
      }
      if (next.id === result?.id) {
        const idx = finalList.findIndex(i => i.id === result.id);
        next = finalList[(idx + 1) % finalList.length];
      }
    }

    setResult(next);
    setShowResult(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(displayResult);
    } catch { }
  }

  function speak() {
    const txt = displayResult;
    if (!txt) return;
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return;

    synth.cancel();

    const u = new SpeechSynthesisUtterance(txt);
    u.lang = lang === 'EN' ? 'en-US' : lang === 'SR' ? 'sr-RS' : 'zh-CN';
    u.rate = 1;
    u.pitch = 1;

    synth.speak(u);
  }

  function speakText(text: string, language: 'EN' | 'SR' | 'CHI') {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Use target language or default to english if EN
    u.lang = language === 'EN' ? 'en-US' : language === 'SR' ? 'sr-RS' : 'zh-CN';
    synth.speak(u);
  }

  const displayResult = useMemo(() => {
    if (!result) return '';
    if (lang === 'EN') return result.text;
    return result.translations[lang] || result.text;
  }, [result, lang]);

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
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .thin-scroll:hover {
          scrollbar-color: rgba(0, 0, 0, 0.28) transparent;
        }
        .thin-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .thin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .thin-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 999px;
          transition: background 0.3s;
        }
        .thin-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.28);
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
            <div className="flex items-center gap-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (scenario === 'saved') {
                    setScenario(topItem.scenario);
                    setActiveLabel(topItem.label);
                  } else {
                    setScenario('saved');
                    setActiveLabel('Saved ❤️');
                    hideResult();
                    setSearchOpenDesktop(false);
                  }
                }}
                className={`w-9 h-9 grid place-items-center rounded-full transition-none ${scenario === 'saved' ? 'bg-black text-white' : 'bg-transparent hover:bg-white/60 text-black'}`}
                aria-label={scenario === 'saved' ? "Close saved" : "Saved phrases"}
                title={scenario === 'saved' ? "Close saved" : "Saved phrases"}
              >
                <HeartIcon filled={scenario === 'saved'} />
              </button>
              <button
                type="button"
                ref={desktopSearchBtnRef}
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
          </div>

          {searchOpenDesktop && (
            <div
              ref={desktopSearchRef}
              className="absolute left-11 right-11 top-[152px] z-50 rounded-[26px] bg-white shadow-lg overflow-hidden flex flex-col"
            >
              <div className="px-5 pt-4 pb-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Find situation..."
                  className="w-full bg-[#f2f3f5] rounded-xl px-4 py-3 text-sm font-bold text-black outline-none placeholder:text-black/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-[290px] overflow-auto py-2 thin-scroll">
                {dropdownItems.length === 0 && (
                  <div className="px-5 py-4 text-center text-sm text-black/40 font-bold">No matches found 😔</div>
                )}
                {dropdownItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearchSelect(item);
                      setSearchOpenDesktop(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-black select-none transition-none hover:bg-black/5"
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

        <div
          className={`absolute right-12 top-32 z-10 ${scenario === 'saved' ? '' : glass} ${scenario === 'saved' ? '' : panelRadius} ${panelW} ${panelH} flex flex-col overflow-hidden transition-opacity duration-300`}
          style={{ visibility: (showResult || scenario === 'saved') ? 'visible' : 'hidden' }}
          aria-hidden={!(showResult || scenario === 'saved')}
        >
          {scenario === 'saved' ? (
            <div className="h-full flex flex-col py-4">
              {/* Language toggle for Saved list - TOP on Desktop */}
              <div className="flex justify-center mb-6 z-20">
                <div className="bg-white/70 backdrop-blur-md rounded-full px-1 py-1 flex gap-1 shadow-lg border border-white/20">
                  <LangPill label="EN" active={lang === 'EN'} onClick={() => setLang('EN')} />
                  <LangPill label="SR" active={lang === 'SR'} onClick={() => setLang('SR')} />
                  <LangPill label="CHI" active={lang === 'CHI'} onClick={() => setLang('CHI')} />
                </div>
              </div>

              {/* No glass background here, just the list */}
              <div className="flex-1 relative">
                <SavedList
                  favorites={favorites}
                  onRemove={toggleFavorite}
                  onSpeak={speakText}
                  lang={lang}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col px-11 pt-28 pb-16">
              <div className="flex items-center justify-center gap-2">
                <LangPill label="EN" active={lang === 'EN'} onClick={() => setLang('EN')} />
                <LangPill label="SR" active={lang === 'SR'} onClick={() => setLang('SR')} />
                <LangPill label="CHI" active={lang === 'CHI'} onClick={() => setLang('CHI')} />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-2">
                <div className="text-black text-[18px] font-bold leading-tight text-center whitespace-pre-line max-w-[260px]">
                  {displayResult}
                  {result?.translations.RU && (
                    <div className="mt-1 text-sm text-black/60 font-medium whitespace-pre-line">
                      {result.translations.RU}
                    </div>
                  )}
                  {result?.context && lang === 'EN' && (
                    <div className="mt-2 text-xs text-black/40 font-medium italic whitespace-normal">
                      Use when: {result.context}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-0">
                  <button onClick={speak} className={iconOnlyBtn} aria-label="Voice" title="Voice">
                    <SpeakerIcon />
                  </button>
                  <button
                    onClick={() => result && toggleFavorite(result.id)}
                    className={`${iconOnlyBtn} -ml-2`}
                    aria-label="Save"
                    title="Save for later"
                  >
                    <HeartIcon size={22} filled={!!result && favorites.includes(result.id)} />
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
          )}
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
              <div className="h-[460px] md:h-[520px] flex items-start justify-center relative">
                {scenario === 'saved' ? (
                  /* No glass background wrapper here */
                  <div className="w-full h-full overflow-hidden flex flex-col relative py-2">
                    <SavedList
                      favorites={favorites}
                      onRemove={toggleFavorite}
                      onSpeak={speakText}
                      lang={lang}
                    />
                    <div className="absolute bottom-44 left-0 right-0 flex justify-center z-20 pointer-events-none">
                      <div className="pointer-events-auto bg-white/70 backdrop-blur-md rounded-full padding-1 px-1 py-1 flex gap-1 shadow-lg border border-white/20">
                        <LangPill label="EN" active={lang === 'EN'} onClick={() => setLang('EN')} />
                        <LangPill label="SR" active={lang === 'SR'} onClick={() => setLang('SR')} />
                        <LangPill label="CHI" active={lang === 'CHI'} onClick={() => setLang('CHI')} />
                      </div>
                    </div>
                  </div>
                ) : showResult ? (
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
                        {result && (
                          <button
                            onClick={() => toggleFavorite(result.id)}
                            className={`${iconOnlyBtn} -ml-2`}
                            aria-label="Save"
                          >
                            <HeartIcon size={22} filled={favorites.includes(result.id)} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 md:mt-7 text-black text-center max-w-full px-2">
                      <div className="text-[17px] md:text-[21px] font-bold leading-snug whitespace-pre-line">
                        {displayResult}
                      </div>
                      {result?.translations.RU && (
                        <div className="mt-1 text-sm md:text-base text-black/60 font-medium whitespace-pre-line">
                          {result.translations.RU}
                        </div>
                      )}
                      {result?.context && lang === 'EN' && (
                        <div className="mt-2 text-xs text-black/40 font-medium italic whitespace-normal">
                          Use when: {result.context}
                        </div>
                      )}
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
            <div className="absolute left-4 md:left-6 right-4 md:right-6 bottom-[84px] z-50 pointer-events-none">
              <div ref={mobileSettingsRef} className={`${glass} rounded-[26px] px-5 pt-6 pb-5 pointer-events-auto`} style={{ maxHeight: 'calc(100svh - 210px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-black/70">Search</div>
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

                <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100svh - 300px)' }}>
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search situations..."
                        className="w-full bg-white/80 rounded-full px-5 py-3 text-sm font-bold text-black outline-none placeholder:text-black/30 shadow-sm border border-black/5"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
                        <SearchIcon />
                      </div>
                    </div>
                  </div>

                  <div className="thin-scroll overflow-auto flex-1 pr-1">
                    {dropdownItems.length === 0 && (
                      <div className="px-5 py-4 text-center text-sm text-black/40 font-bold">No matches found 😔</div>
                    )}
                    <div className="space-y-2">
                      {dropdownItems.map((item) => {
                        const isActive = scenario === item.scenario;
                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              handleSearchSelect(item);
                              setSettingsOpenMobile(false);
                            }}
                            className={[
                              'w-full text-left px-5 py-4 text-sm font-bold select-none transition-none rounded-2xl',
                              isActive
                                ? 'bg-black text-white shadow-md'
                                : 'bg-white/40 text-black/70 hover:bg-white/60 active:bg-white/80'
                            ].join(' ')}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`${glass} ${mobileRound} h-[64px] md:h-[70px] px-4 md:px-5 flex items-center gap-3`} onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 min-w-0 font-bold text-black/70 truncate">
              {scenario === 'saved' ? 'Saved ❤️' : topItem.label}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (scenario === 'saved') {
                  setScenario(topItem.scenario);
                  setActiveLabel(topItem.label);
                } else {
                  setScenario('saved');
                  setActiveLabel('Saved ❤️');
                  hideResult();
                  setSettingsOpenMobile(false);
                }
              }}
              className={`w-11 h-11 md:w-12 md:h-12 rounded-full grid place-items-center transition-none ${scenario === 'saved' ? 'bg-black text-white' : 'bg-white/70 text-black'}`}
              aria-label="Saved phrases"
            >
              <HeartIcon filled={scenario === 'saved'} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpenMobile((v) => !v);
                if (!settingsOpenMobile) setSearchOpenMobile(false);
              }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/70 grid place-items-center transition-none"
              aria-label="Search situations"
            >
              <SearchIcon />
            </button>

            {scenario !== 'saved' && (
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
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
