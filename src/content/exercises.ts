export type ExerciseId = 'mild' | 'sleep';

export type Exercise = {
  id: ExerciseId;
  title: string;
  intro: string;
  /** Abschnitte der Anleitung; nach jedem folgt eine Pause in Millisekunden. */
  segments: { text: string; pauseMs: number }[];
  /** Kurze Sätze, die nach der Anleitung bis zum Timer-Ende wiederholt werden. */
  repeat: { phrases: string[]; everyMs: number };
};

export const exercises: Record<ExerciseId, Exercise> = {
  mild: {
    id: 'mild',
    title: 'MILD-Übung',
    intro:
      'Mach diese Übung im Bett, am besten nach nächtlichem Aufwachen oder beim WBTB. Leg das Handy danach weg – der Timer beendet die Anleitung automatisch.',
    segments: [
      { text: 'Mach es dir bequem und schließ die Augen. Atme ein paarmal langsam ein und wieder aus.', pauseMs: 6000 },
      { text: 'Erinnere dich an den Traum, aus dem du gerade aufgewacht bist. Geh ihn in Gedanken von Anfang bis Ende durch.', pauseMs: 15000 },
      { text: 'Wenn du dich an keinen Traum erinnerst, nimm einen Traum aus den letzten Tagen. Das funktioniert genauso.', pauseMs: 8000 },
      { text: 'Such dir eine Stelle, an der etwas seltsam war. Ein Ort, eine Person, etwas Unmögliches. Das ist dein Traumzeichen.', pauseMs: 12000 },
      { text: 'Sag dir jetzt innerlich und mit voller Absicht: Wenn ich das nächste Mal träume, erkenne ich, dass ich träume.', pauseMs: 10000 },
      { text: 'Stell dir vor, du bist wieder in diesem Traum. Du bemerkst das Traumzeichen und hältst inne.', pauseMs: 10000 },
      { text: 'Du hältst dir die Nase zu und atmest – und die Luft strömt trotzdem. Du weißt: Ich träume.', pauseMs: 10000 },
      { text: 'Spüre, wie ruhig und klar du wirst. Schau auf deine Hände. Sieh dich in der Traumwelt um.', pauseMs: 12000 },
      { text: 'Wiederhole jetzt im eigenen Tempo: die Absicht, dann die Vorstellung. Wenn deine Gedanken abschweifen, kehr freundlich zurück.', pauseMs: 15000 },
      { text: 'Lass den letzten Gedanken vor dem Einschlafen deine Absicht sein. Gute Nacht.', pauseMs: 4000 },
    ],
    repeat: {
      phrases: [
        'Beim nächsten Traum erkenne ich, dass ich träume.',
        'Ich bemerke mein Traumzeichen und werde klar.',
        'Ruhig atmen. Beim nächsten Traum weiß ich, dass ich träume.',
      ],
      everyMs: 75000,
    },
  },
  sleep: {
    id: 'sleep',
    title: 'Einschlaf-Anleitung',
    intro:
      'Eine ruhige Entspannung für den Weg in den Schlaf. Du kannst sie allein nutzen oder vor der MILD-Übung. Der Timer beendet die Anleitung automatisch.',
    segments: [
      { text: 'Leg dich bequem hin und lass dein Gewicht in die Matratze sinken.', pauseMs: 6000 },
      { text: 'Atme langsam durch die Nase ein, zähle bis vier. Und atme noch langsamer aus, zähle bis sechs.', pauseMs: 12000 },
      { text: 'Noch einmal. Einatmen, zwei, drei, vier. Ausatmen, zwei, drei, vier, fünf, sechs.', pauseMs: 12000 },
      { text: 'Richte deine Aufmerksamkeit auf deine Stirn. Lass sie weich werden. Auch die Augen und den Kiefer.', pauseMs: 12000 },
      { text: 'Spüre deine Schultern. Lass sie mit dem nächsten Ausatmen ein kleines Stück sinken.', pauseMs: 12000 },
      { text: 'Wandere mit der Aufmerksamkeit zu deinen Armen und Händen. Sie werden schwer und warm.', pauseMs: 12000 },
      { text: 'Dein Bauch hebt und senkt sich ganz von selbst. Du musst nichts tun.', pauseMs: 12000 },
      { text: 'Nun deine Beine, bis hinunter zu den Füßen. Schwer, warm und entspannt.', pauseMs: 12000 },
      { text: 'Gedanken dürfen kommen und gehen, wie Wolken am Nachthimmel. Du schaust ihnen nur zu.', pauseMs: 15000 },
      { text: 'Bleib bei deinem ruhigen Atem. Mit jedem Ausatmen sinkst du ein wenig tiefer in den Schlaf.', pauseMs: 6000 },
    ],
    repeat: {
      phrases: ['Einatmen … und langsam ausatmen.', 'Alles darf schwer und ruhig werden.', 'Du sinkst tiefer in den Schlaf.'],
      everyMs: 60000,
    },
  },
};

export const timerOptions = [0, 5, 10, 15, 20, 30] as const;

export function isExerciseId(v: unknown): v is ExerciseId {
  return v === 'mild' || v === 'sleep';
}
