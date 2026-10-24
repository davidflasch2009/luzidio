import type { ReminderText, SignTemplate } from '../logic/realityCheckPlanner';

/**
 * Texte für Realitätscheck-Erinnerungen. Jeder Text verbindet eine konkrete
 * Prüfung mit der eigentlichen Frage „Träume ich gerade?“ – ein Check wirkt nur,
 * wenn er aufmerksam und ernsthaft gemacht wird, nicht als Routine.
 */
export const realityCheckTexts: ReminderText[] = [
  { title: 'Nase zu – atmen?', body: 'Halte dir die Nase zu und versuch, trotzdem durch sie zu atmen. Strömt Luft? Dann träumst du.' },
  { title: 'Zweimal lesen', body: 'Lies ein Wort in deiner Nähe, schau kurz weg und lies es noch einmal. Ist es gleich geblieben?' },
  { title: 'Blick auf die Hände', body: 'Schau dir deine Hände genau an und zähl die Finger. Sehen sie aus wie immer?' },
  { title: 'Wie bin ich hier gelandet?', body: 'Erinnere dich an die letzten zehn Minuten. Kannst du lückenlos erklären, wie du hierhergekommen bist?' },
  { title: 'Die Uhr-Probe', body: 'Schau auf eine Uhr, wende den Blick ab und schau erneut. Springt die Zeit oder verändern sich die Ziffern?' },
  { title: 'Finger gegen Handfläche', body: 'Drück einen Finger sanft gegen deine Handfläche und stell dir dabei vor, er gleitet hindurch. Was passiert?' },
  { title: 'Kurz innehalten', body: 'Bleib einen Atemzug lang stehen und frag dich ehrlich: Träume ich gerade? Woran erkennst du das?' },
  { title: 'Drei Details', body: 'Such dir drei Dinge um dich herum aus. Passen Licht, Farben und Größen zusammen – oder wirkt etwas seltsam?' },
  { title: 'Spiegel-Check', body: 'Falls ein Spiegel in der Nähe ist: Sieht dein Spiegelbild aus wie sonst? Wenn nicht, mach die Nasen-Probe.' },
  { title: 'Was war heute ungewöhnlich?', body: 'Gab es heute etwas Merkwürdiges? Stell dir vor, es wäre ein Traum gewesen – und prüf jetzt deine Realität.' },
  { title: 'Ein kleiner Hüpfer', body: 'Wenn es passt: Hüpf ein kleines Stück hoch. Landest du ganz normal – oder schwebst du einen Moment zu lang?' },
  { title: 'Text im Blick', body: 'Such einen Satz auf einem Schild, Bildschirm oder Etikett. Lies ihn zweimal. Im Traum verrutschen Buchstaben oft.' },
  { title: 'Atme bewusst', body: 'Nimm einen tiefen Atemzug und spüre deinen Körper. Halte dann die Nase zu: Kommt trotzdem Luft durch?' },
  { title: 'Wo warst du vor einer Stunde?', body: 'Versuche dich zu erinnern, wo du vor einer Stunde warst. Träume haben oft keine klare Vorgeschichte.' },
  { title: 'Finger zählen', body: 'Zähl langsam die Finger einer Hand – zweimal hintereinander. Kommt jedes Mal fünf heraus?' },
  { title: 'Moment der Wachheit', body: 'Halte kurz an und frag dich mit voller Aufmerksamkeit: Ist das hier ein Traum? Prüfe es mit der Nase.' },
  { title: 'Licht und Farben', body: 'Achte auf das Licht um dich herum. Ist es zu hell, zu dunkel oder kommt es aus einer seltsamen Richtung?' },
  { title: 'Vorsatz für heute Nacht', body: 'Stell dir vor, du stehst in einem Traum und machst genau diesen Check. Mach ihn jetzt ernsthaft: Nase zu und atmen.' },
  { title: 'Die Personen um dich', body: 'Sind die Menschen um dich herum die, die du erwartest? Würde ihr Verhalten in einem Traum auffallen?' },
  { title: 'Hände umdrehen', body: 'Dreh deine Hände langsam um und wieder zurück. Bleiben Form und Linien stabil?' },
  { title: 'Gewicht spüren', body: 'Spüre dein Gewicht auf dem Boden oder Stuhl. Fühlt sich alles stimmig an? Frag dich: Träume ich?' },
  { title: 'Die Handy-Probe', body: 'Schalte den Bildschirm aus und wieder ein. Ist der Text derselbe wie vorher?' },
  { title: 'Ein Augenblick Neugier', body: 'Betrachte deine Umgebung, als sähest du sie zum ersten Mal. Was würdest du bemerken, wenn es ein Traum wäre?' },
  { title: 'Zurückspulen', body: 'Spul in Gedanken zum Aufwachen heute Morgen zurück. Lässt sich der Tag sinnvoll zusammensetzen?' },
];

/** Vorlagen für eigene Traumzeichen. {sign} wird durch das Traumzeichen ersetzt. */
export const signTemplates: SignTemplate[] = [
  { title: 'Traumzeichen: {sign}', body: '„{sign}“ taucht oft in deinen Träumen auf. Stell dir vor, es passiert gerade – und mach jetzt die Nasen-Probe.' },
  { title: 'Achtung: {sign}?', body: 'Wenn dir heute „{sign}“ begegnet, prüfe sofort, ob du träumst. Übe es jetzt einmal: zweimal lesen.' },
  { title: 'Dein Signal: {sign}', body: 'Nimm dir vor: Sobald ich „{sign}“ erlebe, merke ich, dass ich träume. Prüfe jetzt deine Hände.' },
  { title: 'Erinnerung an {sign}', body: 'Denk an deinen letzten Traum mit „{sign}“. Was hättest du bemerken können? Mach jetzt einen echten Check.' },
];

/** Benachrichtigung, wenn keine weiteren Erinnerungen mehr geplant sind. */
export const refillReminder: ReminderText = {
  title: 'Luzidio kurz öffnen',
  body: 'Öffne die App, damit neue Realitätscheck-Erinnerungen für die nächsten Tage geplant werden.',
};

export const morningReminder: ReminderText = {
  title: 'Guten Morgen – woran erinnerst du dich?',
  body: 'Bleib noch kurz liegen und halte deinen Traum fest. Ein paar Stichworte reichen.',
};
