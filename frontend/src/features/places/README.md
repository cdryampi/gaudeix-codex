# Places Feature

Feature for managing and displaying places of interest, including restaurants and accommodations.

## Structure

```
places/
├── api.ts              # API integration (getPlaces, getPlaceBySlug)
├── constants.ts        # Category definitions and icons
├── types.ts            # TypeScript interfaces (Place, Restaurant, Accommodation)
├── components/         # UI Components
│   └── PlaceCard.tsx   # Card component for list views
└── pages/              # Page Components
    ├── PlacesPage.tsx      # Main list view with map and filters
    └── PlaceDetailPage.tsx # Detailed view for a single place
```

## API

The feature consumes the `/api/v1/places/` endpoint.

### Functions

- `getPlaces(params)`: Fetches a list of places. Supports filtering by `category`, `search`, `is_published`.
- `getPlaceBySlug(slug)`: Fetches a single place by its slug.
- `getFeaturedPlaces()`: Fetches a list of featured places (limit 6).

## Types

### Place

Base interface for all places.

- `template_key`: Determines the type of place (e.g., 'restaurants', 'accommodations') to render specific fields.

### Restaurant (extends Place)

Specific fields: `cuisine_type`, `amenities`, `capacity`.

### Accommodation (extends Place)

Specific fields: `type`, `stars`, `check_in_time`, `check_out_time`.

## Components

### PlaceCard

Renders a summary of the place.

- Handles hover states.
- Displays category icon and label.
- Fallback image logic.

### PlacesPage

Main explorer page.

- **View Modes**: List, Map, Split.
- **Filters**: Category toggle.
- **Search**: Text search by title/description.

### PlaceDetailPage

Detailed information page.

- Adapts UI based on `template_key` (Restaurant vs Accommodation).
- Displays contact info, map link, and rich description.
