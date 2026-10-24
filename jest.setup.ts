// Alle Tests laufen in einer Zeitzone mit Sommerzeit, damit DST-Fälle echt geprüft werden.
process.env.TZ = 'Europe/Berlin';

// Icon-Schriften werden in Tests nicht geladen; Icons als schlichte Platzhalter-Views rendern.
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: (props: { name: string }) => React.createElement(View, { testID: `icon-${props.name}` }),
  };
});
