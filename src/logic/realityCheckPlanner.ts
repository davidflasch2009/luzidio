import { addDays, atMinutes, type DateKey } from './dates';
import { createRng, hashString, randomInt, shuffle } from './random';
import { awakeWindowMinutes } from './settings';

export type ReminderText = { title: string; body: string };
/** Vorlage mit Platzhalter {sign} für ein eigenes Traumzeichen. */
export type SignTemplate = { title: string; body: string };

export type PlannedReminder = {
  id: string;
  dayKey: DateKey;
  date: Date;
  title: string;
  body: string;
};

export type PlanInput = {
  startDay: DateKey;
  days: number;
  wakeMinutes: number;
  bedMinutes: number;
  perDay: number;
  now: Date;
  texts: readonly ReminderText[];
  signTemplates: readonly SignTemplate[];
  signs: readonly string[];
};

/** iOS erlaubt höchstens 64 geplante lokale Benachrichtigungen pro App. */
export const MAX_PENDING_REALITY_CHECKS = 48;
/** Abstand nach dem Aufwachen bzw. vor dem Schlafengehen ohne Erinnerungen. */
export const EDGE_BUFFER_MINUTES = 30;

export function daysAhead(perDay: number): number {
  return Math.max(1, Math.min(7, Math.floor(MAX_PENDING_REALITY_CHECKS / Math.max(1, perDay))));
}

/**
 * Verteilt `perDay` Zeitpunkte zufällig, aber gleichmäßig über das Wachfenster:
 * Das Fenster wird in gleich große Abschnitte geteilt, in jedem liegt genau ein
 * Zeitpunkt mit Mindestabstand zum Rand. So gibt es keine Duplikate und keine Häufungen.
 * Ergebnis: Minuten ab Mitternacht des Tages (können ≥ 1440 sein, wenn die Schlafenszeit nach Mitternacht liegt).
 */
export function planDayMinutes(dayKey: DateKey, wakeMinutes: number, bedMinutes: number, perDay: number): number[] {
  const windowLen = awakeWindowMinutes(wakeMinutes, bedMinutes);
  const buffer = Math.min(EDGE_BUFFER_MINUTES, Math.floor(windowLen / 6));
  const start = wakeMinutes + buffer;
  const usable = windowLen - 2 * buffer;
  const count = Math.max(0, Math.min(perDay, usable));
  if (count === 0) return [];
  const rng = createRng(hashString(`${dayKey}|${wakeMinutes}|${bedMinutes}|${perDay}`));
  const slot = usable / count;
  const margin = Math.min(10, Math.floor(slot / 4));
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const lo = Math.ceil(start + i * slot + margin);
    const hi = Math.floor(start + (i + 1) * slot - margin) - 1;
    const minute = hi >= lo ? randomInt(rng, lo, hi) : lo;
    if (out.length === 0 || minute > (out[out.length - 1] as number)) out.push(minute);
  }
  return out;
}

function fillSign(t: SignTemplate, sign: string): ReminderText {
  return { title: t.title.replace('{sign}', sign), body: t.body.replace('{sign}', sign) };
}

/** Wählt für einen Tag unterschiedliche Texte; etwa jede dritte Erinnerung nutzt ein eigenes Traumzeichen. */
export function pickTexts(
  dayKey: DateKey,
  count: number,
  texts: readonly ReminderText[],
  signTemplates: readonly SignTemplate[],
  signs: readonly string[],
): ReminderText[] {
  if (texts.length === 0) throw new Error('Keine Erinnerungstexte vorhanden');
  const rng = createRng(hashString(`texts|${dayKey}`));
  const generic = shuffle(texts, rng);
  const templates = shuffle(signTemplates, rng);
  const signOrder = shuffle(signs, rng);
  const out: ReminderText[] = [];
  let g = 0;
  let s = 0;
  for (let i = 0; i < count; i++) {
    const useSign = signOrder.length > 0 && templates.length > 0 && i % 3 === 1;
    if (useSign) {
      out.push(fillSign(templates[s % templates.length] as SignTemplate, signOrder[s % signOrder.length] as string));
      s++;
    } else {
      out.push(generic[g % generic.length] as ReminderText);
      g++;
    }
  }
  return out;
}

/** Plant alle Realitätscheck-Erinnerungen für die nächsten Tage (nur Zeitpunkte in der Zukunft). */
export function planRealityChecks(input: PlanInput): PlannedReminder[] {
  const result: PlannedReminder[] = [];
  const earliest = input.now.getTime() + 60_000;
  for (let d = 0; d < input.days; d++) {
    const dayKey = addDays(input.startDay, d);
    const minutes = planDayMinutes(dayKey, input.wakeMinutes, input.bedMinutes, input.perDay);
    const texts = pickTexts(dayKey, minutes.length, input.texts, input.signTemplates, input.signs);
    minutes.forEach((m, i) => {
      const date = atMinutes(dayKey, m);
      if (date.getTime() < earliest) return;
      const text = texts[i] as ReminderText;
      result.push({ id: `rc-${dayKey}-${i}`, dayKey, date, title: text.title, body: text.body });
    });
  }
  // Doppelte Zeitpunkte ausschließen (z. B. Zeitumstellung, die zwei Uhrzeiten auf dieselbe Minute legt).
  const seen = new Set<number>();
  return result.filter((r) => {
    const key = Math.floor(r.date.getTime() / 60_000);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Nächste geplante Erinnerung nach `now` oder null. */
export function nextReminder(plan: readonly PlannedReminder[], now: Date): PlannedReminder | null {
  let best: PlannedReminder | null = null;
  for (const r of plan) {
    if (r.date.getTime() > now.getTime() && (!best || r.date.getTime() < best.date.getTime())) best = r;
  }
  return best;
}

/**
 * Welcher Tag ist „heute“ für die Planung? Liegt die Schlafenszeit nach Mitternacht
 * und ist es noch vor dem Aufwachen, gehört die Nacht noch zum Vortag.
 */
export function planningStartDay(now: Date, wakeMinutes: number, bedMinutes: number, todayKey: DateKey): DateKey {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const crossesMidnight = bedMinutes <= wakeMinutes;
  if (crossesMidnight && minutes < bedMinutes) return addDays(todayKey, -1);
  return todayKey;
}
