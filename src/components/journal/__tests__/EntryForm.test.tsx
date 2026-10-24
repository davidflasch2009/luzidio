import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';

import type { EntryInput } from '../../../db/types';
import { emptyDraft } from '../../../logic/entryDraft';
import { EntryForm } from '../EntryForm';

jest.mock('expo-router', () => ({
  usePreventRemove: jest.fn(),
  useNavigation: () => ({ dispatch: jest.fn() }),
}));

const mockRequestPermission = jest.fn();
jest.mock('expo-audio', () => ({
  RecordingPresets: { HIGH_QUALITY: { extension: '.m4a' } },
  useAudioRecorder: () => ({ stop: jest.fn(), record: jest.fn(), prepareToRecordAsync: jest.fn(), uri: null }),
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0 }),
  requestRecordingPermissionsAsync: () => mockRequestPermission(),
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn(async () => undefined) }),
  useAudioPlayerStatus: () => ({ playing: false, isLoaded: true, currentTime: 0, duration: 12, didJustFinish: false }),
}));

jest.mock('../../../services/audioFiles', () => ({
  audioUri: (name: string) => `file:///audio/${name}`,
  deleteAudio: jest.fn(),
  deleteUri: jest.fn(),
  persistRecording: jest.fn(async () => 'memo-neu.m4a'),
}));

function setup(initial: EntryInput = emptyDraft('2026-10-24')) {
  const onSubmit = jest.fn(async (_input: EntryInput) => undefined);
  const onDone = jest.fn();
  return { onSubmit, onDone, initial };
}

describe('EntryForm', () => {
  beforeEach(() => mockRequestPermission.mockReset());

  it('speichert einen Traum mit Text, Klartraum-Häkchen und Tag', async () => {
    const user = userEvent.setup();
    const { onSubmit, onDone, initial } = setup();
    await render(
      <EntryForm
        initial={initial}
        today="2026-10-24"
        tagSuggestions={['Fliegen']}
        submitLabel="Traum speichern"
        onSubmit={onSubmit}
        onDone={onDone}
        night
        detailsInitiallyOpen={false}
      />,
    );
    await user.type(screen.getByLabelText('Traumbeschreibung'), 'Ich bin über einen See geflogen');
    await fireEvent(screen.getByRole('switch', { name: 'Das war ein Klartraum' }), 'valueChange', true);
    await user.press(screen.getByRole('button', { name: 'Details hinzufügen' }));
    await user.press(screen.getByRole('checkbox', { name: '+ Fliegen' }));
    await user.press(screen.getByRole('radio', { name: 'Angenehm' }));
    await user.press(screen.getByRole('button', { name: 'Traum speichern' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({
      dreamDate: '2026-10-24',
      title: 'Ich bin über einen See geflogen',
      body: 'Ich bin über einen See geflogen',
      audioFile: null,
      mood: 4,
      clarity: 0,
      isLucid: true,
      tags: ['Fliegen'],
    });
  });

  it('zeigt einen Hinweis, wenn weder Text noch Sprachmemo vorhanden sind', async () => {
    const user = userEvent.setup();
    const { onSubmit, onDone, initial } = setup();
    await render(
      <EntryForm initial={initial} today="2026-10-24" tagSuggestions={[]} submitLabel="Speichern" onSubmit={onSubmit} onDone={onDone} />,
    );
    await user.press(screen.getByRole('button', { name: 'Speichern' }));
    expect(await screen.findByText('Schreib ein paar Worte oder nimm ein Sprachmemo auf.')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('erlaubt kein Datum in der Zukunft und kann zurückblättern', async () => {
    const user = userEvent.setup();
    const { onSubmit, onDone, initial } = setup();
    await render(
      <EntryForm initial={initial} today="2026-10-24" tagSuggestions={[]} submitLabel="Speichern" onSubmit={onSubmit} onDone={onDone} />,
    );
    expect(screen.getByText('Traum vom: Heute')).toBeOnTheScreen();
    await user.press(screen.getByLabelText('Einen Tag früher'));
    expect(screen.getByText('Traum vom: Gestern')).toBeOnTheScreen();
    await user.press(screen.getByLabelText('Einen Tag später'));
    await user.press(screen.getByLabelText('Einen Tag später'));
    expect(screen.getByText('Traum vom: Heute')).toBeOnTheScreen();
  });

  it('erklärt verweigerte Mikrofon-Erlaubnis und bietet die Einstellungen an', async () => {
    mockRequestPermission.mockResolvedValue({ granted: false, canAskAgain: false });
    const user = userEvent.setup();
    const { onSubmit, onDone, initial } = setup();
    await render(
      <EntryForm initial={initial} today="2026-10-24" tagSuggestions={[]} submitLabel="Speichern" onSubmit={onSubmit} onDone={onDone} />,
    );
    await user.press(screen.getByRole('button', { name: 'Sprachmemo aufnehmen' }));
    expect(await screen.findByText(/Ohne Mikrofon-Erlaubnis/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Einstellungen öffnen' })).toBeOnTheScreen();
  });

  it('übernimmt ein vorhandenes Sprachmemo und kann es entfernen', async () => {
    const user = userEvent.setup();
    const { onSubmit, onDone } = setup();
    const initial = { ...emptyDraft('2026-10-20'), body: 'Alt', audioFile: 'memo-alt.m4a' };
    await render(
      <EntryForm initial={initial} today="2026-10-24" tagSuggestions={[]} submitLabel="Speichern" onSubmit={onSubmit} onDone={onDone} />,
    );
    await user.press(screen.getByRole('button', { name: 'Sprachmemo entfernen' }));
    expect(screen.getByRole('button', { name: 'Sprachmemo aufnehmen' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Speichern' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ audioFile: null, body: 'Alt' })));
  });
});
