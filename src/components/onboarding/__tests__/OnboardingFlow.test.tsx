import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { OnboardingFlow } from '../OnboardingFlow';

const initial = { wakeMinutes: 7 * 60, bedMinutes: 23 * 60, realityChecksPerDay: 6 };

async function goToStep(user: ReturnType<typeof userEvent.setup>, n: number) {
  for (let i = 0; i < n; i++) await user.press(screen.getByRole('button', { name: 'Weiter' }));
}

describe('OnboardingFlow', () => {
  it('führt durch alle Schritte und übernimmt Zeiten und Erlaubnis', async () => {
    const user = userEvent.setup();
    const request = jest.fn(async () => 'granted' as const);
    const onFinish = jest.fn(async () => undefined);
    await render(<OnboardingFlow initial={initial} requestNotifications={request} onFinish={onFinish} />);

    expect(screen.getByText('Willkommen bei Luzidio')).toBeOnTheScreen();
    expect(screen.getByLabelText('Schritt 1 von 4')).toBeOnTheScreen();
    await goToStep(user, 1);
    expect(screen.getByText('So läuft dein Programm')).toBeOnTheScreen();
    expect(screen.getByText(/kein Medizinprodukt/)).toBeOnTheScreen();
    await goToStep(user, 1);
    expect(screen.getByText('Deine Schlafzeiten')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Ich wache auf um erhöhen' }));
    await user.press(screen.getByRole('button', { name: 'Ich gehe schlafen um verringern' }));
    await user.press(screen.getByRole('button', { name: 'Realitätschecks pro Tag erhöhen' }));
    expect(screen.getByText('07:15')).toBeOnTheScreen();
    expect(screen.getByText('22:45')).toBeOnTheScreen();

    await goToStep(user, 1);
    expect(screen.getByText('Erinnerungen erlauben')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Benachrichtigungen erlauben' }));
    expect(await screen.findByText('✓ Benachrichtigungen sind erlaubt.')).toBeOnTheScreen();
    expect(request).toHaveBeenCalledTimes(1);

    await user.press(screen.getByRole('button', { name: "Los geht's" }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ wakeMinutes: 435, bedMinutes: 1365, realityChecksPerDay: 7 }));
  });

  it('erklärt verweigerte Benachrichtigungen und lässt trotzdem starten', async () => {
    const user = userEvent.setup();
    const onFinish = jest.fn(async () => undefined);
    await render(<OnboardingFlow initial={initial} requestNotifications={async () => 'denied'} onFinish={onFinish} />);
    await goToStep(user, 3);
    await user.press(screen.getByRole('button', { name: 'Benachrichtigungen erlauben' }));
    expect(await screen.findByText(/Benachrichtigungen sind blockiert/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: "Los geht's" }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith(initial));
  });

  it('erlaubt „Später“ und Zurückblättern, zeigt Fehler beim Speichern', async () => {
    const user = userEvent.setup();
    const onFinish = jest.fn(async () => {
      throw new Error('kaputt');
    });
    await render(<OnboardingFlow initial={initial} requestNotifications={async () => 'granted'} onFinish={onFinish} />);
    await goToStep(user, 2);
    await user.press(screen.getByRole('button', { name: 'Zurück' }));
    expect(screen.getByText('So läuft dein Programm')).toBeOnTheScreen();
    await goToStep(user, 2);
    await user.press(screen.getByRole('button', { name: 'Später' }));
    expect(await screen.findByText('Speichern fehlgeschlagen. Bitte versuch es noch einmal.')).toBeOnTheScreen();
  });
});
