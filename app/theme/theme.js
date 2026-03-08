// app/theme/theme.js
export const COLORS = {
  // Primaires
  redBurgundy: '#8B0000',
  redLight: '#DC2626',
  navyBlue: '#1E3A8A',
  navyBlueDark: '#0F1F5C',
  black: '#000000',
  white: '#FFFFFF',

  // UI
  backgroundDark: '#0A0A0A',
  cardBg: '#FFFFFF',
  grayLight: '#F3F4F6',
  grayMid: '#9CA3AF',
  grayBorder: '#D1D5DB',

  // États salle
  roomOccupied: '#DC2626',
  roomFree: '#FFFFFF',
  roomGlowOccupied: 'rgba(220,38,38,0.7)',
  roomGlowFree: 'rgba(220,38,38,0.5)',
  roomGlowSpecial: 'rgba(139,92,246,0.5)',

  // Sélection matériel
  selectedCard: 'rgba(220,38,38,0.15)',
  selectedBorder: '#DC2626',

  // Info card
  pinkLight: '#FFF0F3',
  pinkBorder: '#FFB3C1',

  // Status transactions
  statusTaken: '#F59E0B',
  statusReturned: '#10B981',
  statusValidated: '#3B82F6',
  statusMissing: '#EF4444',
};

export const FONTS = {
  family: '"Arial Black", "Arial Bold", Gadget, sans-serif',
  // React Native utilise fontWeight à la place
};

export const RADIUS = {
  pill: 50,
  card: 24,
  button: 20,
  small: 12,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pill: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  }),
};

export const HEADER_STYLE = {
  container: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
    ...SHADOWS.pill,
  },
  text: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};
