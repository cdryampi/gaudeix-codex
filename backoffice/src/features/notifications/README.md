# Notifications Feature

Backoffice tool for sending push notifications to mobile app users.

## Structure

```
notifications/
├── api.ts              # API integration
├── types.ts            # TypeScript interfaces
└── pages/
    └── SendNotificationPage.tsx  # Form to compose and send notifications
```

## Features

- **Compose**: Title, Body, and optional Deep Link.
- **Targeting**: All users or specific segments (future).
- **Preview**: Live iOS-style preview of the notification.
- **History**: Log of previously sent notifications.
