// app/theme/theme.js
export const COLORS = {
  redBurgundy: '#8B0000',
  redLight: '#DC2626',
  navyBlue: '#0D2461',
  navyBlueMid: '#1E3A8A',
  black: '#000000',
  white: '#FFFFFF',
  pinkBg: '#FFF0F3',       // conservé mais utilisé différemment (fond wallpaper)
  pinkBorder: '#FFB3C1',
  grayLight: '#E8E8E8',    // gris-clair pour les cartes
  grayMid: '#9CA3AF',
  grayBorder: '#D1D5DB',
  cardBg: '#E4E4E4',       // fond gris-clair des cartes (nouvelle couleur globale)
  roomOccupied: '#DC2626',
  roomFree: '#FFFFFF',
  roomSpecial: '#C8C8C8',  // gris plus foncé pour salles spéciales
  selectedCard: 'rgba(220,38,38,0.13)',
  selectedBorder: '#DC2626',
  statusTaken: '#F59E0B',
  statusReturned: '#10B981',
  statusValidated: '#3B82F6',
  statusMissing: '#EF4444',
  green: '#16A34A',
};

export const FONT = { family: 'serif', weight: '800', style: 'italic' };

export const T = { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#000000' };

export const RADIUS = { pill: 50, card: 22, button: 18, small: 10 };

// Lueur noire prononcée — s'applique à TOUTES les cartes sur TOUS les écrans
export const CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.95,
  shadowRadius: 18,
  elevation: 22,
};

export const PILL_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.6,
  shadowRadius: 8,
  elevation: 10,
};

// Alias pour les anciens écrans qui utilisent SHADOWS.card / SHADOWS.pill
export const SHADOWS = {
  card: CARD_SHADOW,
  pill: PILL_SHADOW,
};

export const HEADER = {
  container: {
    backgroundColor: '#8B0000',
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 44,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 28,   // grand espace sous le header
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 10,
  },
  text: {
    color: '#FFFFFF', fontFamily: 'serif', fontWeight: '800',
    fontStyle: 'italic', fontSize: 19, textTransform: 'uppercase', letterSpacing: 1,
  },
};

export const NAVY_BTN = {
  container: {
    backgroundColor: '#0D2461', borderRadius: 50,
    paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 10,
  },
  text: {
    color: '#FFFFFF', fontFamily: 'serif', fontWeight: '800',
    fontStyle: 'italic', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5,
  },
};
