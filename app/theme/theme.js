// app/theme/theme.js
export const COLORS = {
  redBurgundy: '#8B0000',
  redLight: '#DC2626',
  navyBlue: '#0D2461',
  navyBlueMid: '#1E3A8A',
  black: '#000000',
  white: '#FFFFFF',
  pinkBg: '#FFF0F3',
  pinkBorder: '#FFB3C1',
  grayLight: '#F3F4F6',
  grayMid: '#9CA3AF',
  grayBorder: '#D1D5DB',
  roomOccupied: '#DC2626',
  roomFree: '#FFFFFF',
  selectedCard: 'rgba(220,38,38,0.13)',
  selectedBorder: '#DC2626',
  statusTaken: '#F59E0B',
  statusReturned: '#10B981',
  statusValidated: '#3B82F6',
  statusMissing: '#EF4444',
};

export const FONT = { family: 'serif', weight: '800', style: 'italic' };

export const T = { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#000000' };

export const RADIUS = { pill: 50, card: 22, button: 18, small: 10 };

export const CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.85,
  shadowRadius: 12,
  elevation: 14,
};

export const PILL_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.5,
  shadowRadius: 6,
  elevation: 8,
};

export const HEADER = {
  container: {
    backgroundColor: '#8B0000',
    borderRadius: 50,
    paddingVertical: 11,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 8,
  },
  text: {
    color: '#FFFFFF', fontFamily: 'serif', fontWeight: '800',
    fontStyle: 'italic', fontSize: 17, textTransform: 'uppercase', letterSpacing: 1,
  },
};

export const NAVY_BTN = {
  container: {
    backgroundColor: '#0D2461', borderRadius: 50,
    paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 8,
  },
  text: {
    color: '#FFFFFF', fontFamily: 'serif', fontWeight: '800',
    fontStyle: 'italic', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5,
  },
};
