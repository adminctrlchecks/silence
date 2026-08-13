/**
 * Demo content seed: realistic astrology Q&A + remedies so Silence shows a
 * complete question -> chart -> remedy journey.
 *
 * Idempotent rules:
 * - questions are matched by level + category + text
 * - remedies are matched by category + title
 * - each seeded question gets one reviewed admin answer at the same level/category
 *
 * Run with:
 *   pnpm --filter @silence/api content:seed
 */
import { PrismaClient } from '@prisma/client';
import { CATEGORIES, type Category, type Level } from '@silence/shared';

const prisma = new PrismaClient();

type Translations = Record<string, string>;

interface QuestionSeed {
  level: Level;
  order: number;
  text: string;
  answer: string;
  translations?: Translations;
  answerTranslations?: Translations;
}

interface RemedySeed {
  title: string;
  text: string;
  linkedLevel?: Level;
  translations?: Record<string, { title: string; text: string }>;
}

const CONTENT: Record<Category, QuestionSeed[]> = {
  male: [
    {
      level: 'common',
      order: 10,
      text: 'Where do you feel the strongest pull right now: career, family, relationship, health, or purpose?',
      answer:
        'The first area you name is usually where your chart is asking for attention. Treat it as a signal, not a pressure point, and begin with one honest next step.',
      translations: {
        hi: 'इस समय आपको सबसे मजबूत खिंचाव कहां महसूस होता है: करियर, परिवार, संबंध, स्वास्थ्य या उद्देश्य?',
        es: 'Donde sientes el mayor llamado ahora: carrera, familia, relacion, salud o proposito?',
      },
      answerTranslations: {
        hi: 'जिस क्षेत्र का नाम आप पहले लेते हैं, वही अक्सर आपकी कुंडली में ध्यान मांगता है। इसे दबाव नहीं, संकेत मानें और एक ईमानदार अगला कदम चुनें।',
        es: 'El area que nombras primero suele ser donde tu carta pide atencion. Tomalo como una senal, no como presion, y empieza con un paso honesto.',
      },
    },
    {
      level: 'common',
      order: 20,
      text: 'When life becomes demanding, do you push harder, pause, or ask for support?',
      answer:
        'Your response pattern reveals how Mars and Saturn are being lived day to day. Strength grows when effort, rest, and support are allowed to work together.',
    },
    {
      level: 'common',
      order: 30,
      text: 'What responsibility feels heavy but meaningful at this stage of life?',
      answer:
        'A meaningful burden often points to Saturn: discipline, maturity, and structure. Honor the responsibility, but do not let it become your whole identity.',
    },
    {
      level: 'level1',
      order: 40,
      text: 'In decisions, do you trust planning, instinct, or the advice of someone close?',
      answer:
        'Use planning as the lamp and instinct as the compass. A trusted voice can help you check timing, but the final choice should feel steady in your own body.',
    },
    {
      level: 'level1',
      order: 50,
      text: 'Where do you want more confidence without becoming rigid?',
      answer:
        'Confidence is strongest when it stays flexible. Let the Sun in your chart show dignity and self-respect, while leaving room to learn from the moment.',
    },
    {
      level: 'level2',
      order: 60,
      text: 'Describe a recent moment when you chose patience over reaction.',
      answer:
        'That moment is important. It shows your chart moving from raw impulse into conscious strength, especially where Mars, Saturn, and the ascendant meet daily life.',
    },
    {
      level: 'level2',
      order: 70,
      text: 'What kind of legacy do you want your choices this year to build?',
      answer:
        'Legacy begins in repeated choices. Name the quality you want to leave behind, then let your chart reading focus on habits that can carry it quietly forward.',
    },
  ],
  female: [
    {
      level: 'common',
      order: 10,
      text: 'Which area of life is asking for tenderness and courage at the same time?',
      answer:
        'Tenderness and courage often arrive together when the Moon and Venus themes are active. Let the softer truth speak first, then choose the brave action.',
      translations: {
        hi: 'जीवन का कौन सा क्षेत्र इस समय कोमलता और साहस दोनों मांग रहा है?',
        es: 'Que area de tu vida esta pidiendo ternura y valentia al mismo tiempo?',
      },
      answerTranslations: {
        hi: 'जब चंद्र और शुक्र के विषय सक्रिय होते हैं, तो कोमलता और साहस अक्सर साथ आते हैं। पहले नरम सच्चाई को बोलने दें, फिर साहसी कदम चुनें।',
        es: 'La ternura y la valentia suelen llegar juntas cuando se activan temas de Luna y Venus. Deja hablar primero a la verdad suave y luego elige la accion valiente.',
      },
    },
    {
      level: 'common',
      order: 20,
      text: 'What emotion has visited you most often in the past few weeks?',
      answer:
        'The emotion that returns is a messenger. Rather than judging it, notice what it protects, what it requests, and where your chart may be asking for care.',
    },
    {
      level: 'common',
      order: 30,
      text: 'Where are you learning to receive instead of carrying everything alone?',
      answer:
        'Receiving is also a form of wisdom. Your chart may be inviting you to soften the old habit of over-responsibility and let support become part of the remedy.',
    },
    {
      level: 'level1',
      order: 40,
      text: 'In relationships, what helps you feel emotionally safe?',
      answer:
        'Emotional safety grows through consistency, clarity, and small trustworthy actions. Let your answer guide the relationship themes in the deeper reading.',
    },
    {
      level: 'level1',
      order: 50,
      text: 'When intuition speaks, how do you usually recognize it?',
      answer:
        'True intuition tends to be quiet and steady. Notice whether it arrives through the body, dreams, timing, or a clear inner sentence, then give it room.',
    },
    {
      level: 'level2',
      order: 60,
      text: 'Describe a turning point that changed how you see your own worth.',
      answer:
        'Worth is not something the chart gives or takes away; it reveals how you remember it. This turning point can help the interpretation speak more personally.',
    },
    {
      level: 'level2',
      order: 70,
      text: 'What are you ready to protect more carefully in the year ahead?',
      answer:
        'Protection can be gentle and firm. Naming what matters helps the reading turn toward boundaries, nourishment, and the habits that keep your light steady.',
    },
  ],
  other: [
    {
      level: 'common',
      order: 10,
      text: 'What part of your life is asking to be understood without being boxed in?',
      answer:
        'Your chart is a map, not a label. Begin by naming the area that wants more space, and let the reading honor complexity without forcing one fixed story.',
      translations: {
        hi: 'आपके जीवन का कौन सा हिस्सा बिना किसी खांचे में डाले समझे जाने की मांग कर रहा है?',
        es: 'Que parte de tu vida pide ser comprendida sin quedar encerrada en una etiqueta?',
      },
      answerTranslations: {
        hi: 'आपकी कुंडली एक नक्शा है, लेबल नहीं। पहले उस क्षेत्र का नाम लें जिसे अधिक जगह चाहिए, और रीडिंग को आपकी जटिलता का सम्मान करने दें।',
        es: 'Tu carta es un mapa, no una etiqueta. Empieza nombrando el area que necesita mas espacio y deja que la lectura honre tu complejidad.',
      },
    },
    {
      level: 'common',
      order: 20,
      text: 'Where do you feel between two worlds, roles, or versions of yourself?',
      answer:
        'Being between worlds can be a place of intelligence. The chart can help identify which part needs grounding and which part is ready to move.',
    },
    {
      level: 'common',
      order: 30,
      text: 'What rhythm helps you feel most like yourself?',
      answer:
        'Rhythm is practical astrology. The daily pattern that steadies you often reveals how your Moon, ascendant, and body wisdom prefer to work together.',
    },
    {
      level: 'level1',
      order: 40,
      text: 'When you need clarity, do you seek solitude, conversation, movement, or ritual?',
      answer:
        'Your clarity style matters. Let it become part of the remedy, because insight is easier to trust when it arrives through a channel that feels natural.',
    },
    {
      level: 'level1',
      order: 50,
      text: 'What boundary would make your next season feel more spacious?',
      answer:
        'A boundary is not a wall; it is a shape for your energy. The answer you give here helps the deeper chart reading focus on sustainable freedom.',
    },
    {
      level: 'level2',
      order: 60,
      text: 'Describe a recent choice that felt aligned, even if it was not easy.',
      answer:
        'Alignment is often quiet before it becomes obvious. This choice gives the interpretation a real-life anchor for your ascendant and planetary patterns.',
    },
    {
      level: 'level2',
      order: 70,
      text: 'What truth about yourself are you ready to live more openly?',
      answer:
        'Living a truth openly is a gradual practice. The chart can support the timing, but your own answer shows the direction your spirit already knows.',
    },
  ],
};

const REMEDIES: Record<Category, RemedySeed[]> = {
  male: [
    {
      title: 'Sunrise steadiness',
      text: 'For seven mornings, stand near natural light, take twelve slow breaths, and name one duty you will do with dignity rather than pressure.',
      linkedLevel: 'level1',
      translations: {
        hi: {
          title: 'सूर्योदय की स्थिरता',
          text: 'सात सुबह प्राकृतिक रोशनी के पास खड़े होकर बारह धीमी सांस लें और एक जिम्मेदारी का नाम लें जिसे आप दबाव नहीं, गरिमा से निभाएंगे।',
        },
        es: {
          title: 'Firmeza al amanecer',
          text: 'Durante siete mananas, acercate a la luz natural, respira lento doce veces y nombra una responsabilidad que haras con dignidad, no con presion.',
        },
      },
    },
    {
      title: 'Saturn notebook',
      text: 'Once a week, write one pattern you are ready to mature, one support you will accept, and one action you can complete without rushing.',
      linkedLevel: 'level2',
    },
    {
      title: 'Evening release',
      text: 'Before sleep, unclench your jaw and hands, then place the day down mentally. Rest is part of strength, not the opposite of it.',
    },
  ],
  female: [
    {
      title: 'Moon water pause',
      text: 'At night, drink water slowly and write one sentence about what your heart needed today. Let the answer be simple and unedited.',
      linkedLevel: 'level1',
      translations: {
        hi: {
          title: 'चंद्र जल विराम',
          text: 'रात में धीरे-धीरे पानी पिएं और लिखें कि आज आपके हृदय को क्या चाहिए था। उत्तर को सरल और बिना संपादन के रहने दें।',
        },
        es: {
          title: 'Pausa lunar con agua',
          text: 'Por la noche, bebe agua despacio y escribe una frase sobre lo que tu corazon necesito hoy. Deja que sea simple y sin corregir.',
        },
      },
    },
    {
      title: 'Venus space reset',
      text: 'Refresh one small corner of your room with care: clean cloth, soft light, or a flower. Beauty can remind the nervous system that it is safe to soften.',
      linkedLevel: 'level2',
    },
    {
      title: 'Boundary breath',
      text: 'Before saying yes, take one full breath and ask: do I have the energy to mean this? Let the body answer before habit does.',
    },
  ],
  other: [
    {
      title: 'Name the shape',
      text: 'Each morning, choose one word for the shape of your energy: river, flame, stone, breeze, or your own word. Let the day meet that truth gently.',
      linkedLevel: 'level1',
      translations: {
        hi: {
          title: 'रूप को नाम दें',
          text: 'हर सुबह अपनी ऊर्जा के रूप के लिए एक शब्द चुनें: नदी, लौ, पत्थर, हवा या अपना कोई शब्द। दिन को उस सच्चाई से धीरे मिलने दें।',
        },
        es: {
          title: 'Nombra la forma',
          text: 'Cada manana, elige una palabra para la forma de tu energia: rio, llama, piedra, brisa o tu propia palabra. Deja que el dia encuentre esa verdad.',
        },
      },
    },
    {
      title: 'Threshold ritual',
      text: 'When moving from one role to another, touch your heart and exhale once. This tiny ritual tells the body: I can change shape and stay whole.',
      linkedLevel: 'level2',
    },
    {
      title: 'Gentle signal check',
      text: 'At midday, ask what feels clear, what feels noisy, and what needs space. Follow the quietest useful signal first.',
    },
  ],
};

async function main() {
  let createdQuestions = 0;
  let createdAnswers = 0;
  let createdRemedies = 0;
  let createdTranslations = 0;
  const firstQuestionByLevel = new Map<string, string>();

  for (const category of CATEGORIES) {
    for (const seed of CONTENT[category]) {
      let question = await prisma.question.findFirst({
        where: { level: seed.level, category, text: seed.text },
      });

      if (!question) {
        question = await prisma.question.create({
          data: { level: seed.level, category, text: seed.text, order: seed.order },
        });
        createdQuestions++;
      }

      const levelKey = `${category}:${seed.level}`;
      if (!firstQuestionByLevel.has(levelKey)) firstQuestionByLevel.set(levelKey, question.id);

      if (seed.translations) {
        for (const [lang, text] of Object.entries(seed.translations)) {
          await prisma.questionTranslation.upsert({
            where: { questionId_lang: { questionId: question.id, lang } },
            create: { questionId: question.id, lang, text },
            update: { text },
          });
          createdTranslations++;
        }
      }

      let answer = await prisma.answer.findFirst({
        where: { questionId: question.id, level: seed.level, category },
      });

      if (!answer) {
        answer = await prisma.answer.create({
          data: {
            questionId: question.id,
            level: seed.level,
            category,
            text: seed.answer,
            source: 'admin',
            reviewed: true,
          },
        });
        createdAnswers++;
      }

      if (seed.answerTranslations) {
        for (const [lang, text] of Object.entries(seed.answerTranslations)) {
          await prisma.answerTranslation.upsert({
            where: { answerId_lang: { answerId: answer.id, lang } },
            create: { answerId: answer.id, lang, text },
            update: { text },
          });
          createdTranslations++;
        }
      }
    }

    for (const seed of REMEDIES[category]) {
      const linkedQuestionId = seed.linkedLevel
        ? firstQuestionByLevel.get(`${category}:${seed.linkedLevel}`)
        : undefined;
      let remedy = await prisma.remedy.findFirst({ where: { category, title: seed.title } });

      if (!remedy) {
        remedy = await prisma.remedy.create({
          data: {
            category,
            title: seed.title,
            text: seed.text,
            linkedLevel: seed.linkedLevel,
            linkedQuestionId,
          },
        });
        createdRemedies++;
      }

      if (seed.translations) {
        for (const [lang, translation] of Object.entries(seed.translations)) {
          await prisma.remedyTranslation.upsert({
            where: { remedyId_lang: { remedyId: remedy.id, lang } },
            create: { remedyId: remedy.id, lang, title: translation.title, text: translation.text },
            update: { title: translation.title, text: translation.text },
          });
          createdTranslations++;
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Content seed complete: ${createdQuestions} questions, ${createdAnswers} answers, ` +
      `${createdRemedies} remedies, ${createdTranslations} translations touched.`,
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
