# U-AUBEN Supplies Tracker

Application mobile de gestion du matériel pédagogique — Université.

## Stack technique
- **React Native** (Expo SDK 51)
- **SQLite** (expo-sqlite) — 100% offline
- **ML Kit** — OCR carte étudiante (offline)
- **react-native-signature-canvas** — signatures
- **React Navigation** — navigation
- **Orientation** : paysage forcé

---

## Structure du projet

```
/app
  /screens          ← 14 écrans
  /components       ← composants réutilisables
  /database         ← SQLite queries
  /context          ← AppContext global
  /theme            ← couleurs, ombres, styles
App.js              ← point d'entrée + navigation
app.json            ← config Expo
codemagic.yaml      ← pipeline CI/CD
```

---

## Installation

```bash
npm install
```

## Démarrage (développement)

```bash
npm run android
# ou
npx expo start
```

## Build Android (via EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Build via Codemagic

1. Push le projet sur GitHub
2. Connecter le repo sur [codemagic.io](https://codemagic.io)
3. Le fichier `codemagic.yaml` configure automatiquement le pipeline
4. Build → APK disponible en téléchargement

---

## Flux principal

```
Accueil (salles)
  └─► Identification (scan carte / QR / manuel)
        └─► Liste des profils
              └─► Profil utilisateur
                    └─► Profil salle
                          ├─► Sélection matériel → Signature prise → Accueil
                          ├─► Ajouter matériel
                          ├─► Liste matériel pris
                          └─► Signature remise → Accueil
```

---

## Charte graphique

| Élément | Style |
|---|---|
| Headers | Pill rouge bordeaux (#8B0000) |
| Boutons action | Pill bleu marine (#1E3A8A) |
| Salle occupée | Rouge vif + lueur |
| Fond général | Wallpaper configurable (admin) |
| Écrans paramètres/signature | Fond blanc |
| Orientation | Paysage uniquement |

---

## Accès administrateur

Bouton invisible en haut à gauche de l'accueil.  
Mot de passe par défaut : `U-AUBEN SUPPLIES TRACKER`

---

## Base de données SQLite

Tables : `users`, `biometric_cards`, `materials`, `rooms`, `transactions`, `app_settings`

Toutes les données sont stockées localement sur l'appareil.
