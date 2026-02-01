# Gamification Feature

Implements the user engagement layer with points, levels, and rankings.

## Structure

```
gamification/
├── api.ts              # API mocks/integration
├── types.ts            # TypeScript interfaces
├── components/
│   └── UserPointsCard.tsx  # User stats summary card
└── pages/
    └── RankingsPage.tsx    # Leaderboard view
```

## Features

- **User Profile**: Shows current level, points, and progress bar to next level.
- **Rankings**: Global and Monthly leaderboards.
- **Achievements**: (Planned) Unlockable badges.
