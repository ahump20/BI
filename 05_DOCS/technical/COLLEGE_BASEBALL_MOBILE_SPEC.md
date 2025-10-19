# College Baseball Mobile App - Feature Specification

**Blaze Intelligence - Mobile Product**  
**Platform:** iOS (MVP), Android (Post-MVP)  
**Framework:** React Native 0.72+  
**Version:** 1.0  
**Last Updated:** October 2025

---

## Overview

This document specifies the mobile app features, user experience, screen designs, navigation flows, and technical implementation details for the college baseball mobile-first product.

### Design Philosophy

1. **Thumb-Friendly First:** All primary actions reachable with one hand
2. **Speed Over Completeness:** Show most important data instantly, load details progressively
3. **Offline-Graceful:** Cache aggressively, show stale data with indicators
4. **Push-Driven Engagement:** Timely, relevant notifications drive daily usage
5. **Fan-Centric:** Focus on following favorite teams/players, not exhaustive coverage

---

## Information Architecture

```
App Structure
├── Home (Bottom Tab 1)
│   ├── Today's Games
│   ├── Live Games (if any)
│   ├── Favorites Feed
│   └── Featured Content
├── Scores (Bottom Tab 2)
│   ├── Game List (by date)
│   ├── Game Detail → Box Score
│   └── Schedule (team/conference filters)
├── Standings (Bottom Tab 3)
│   ├── Conference Selector
│   ├── Conference Standings
│   └── Team Detail → Roster → Player
├── More (Bottom Tab 4)
│   ├── Favorites Management
│   ├── Notifications Settings
│   ├── Diamond Pro Upsell
│   └── Settings
└── Modal Screens
    ├── Game Center (full box score)
    ├── Player Profile
    ├── Team Page
    └── Search / Filter
```

---

## Feature Specifications

### 1. Home Screen (Dashboard)

**Purpose:** Quick glance at most relevant games and content for the user

**Components:**

**1.1 Header**
- App logo (left)
- Date selector (center): "Today", "Yesterday", "Tomorrow" swipeable carousel
- Search icon (right): Opens global search modal

**1.2 Live Games Section** (Conditional: only when games are live)
- Horizontal scrollable cards
- Each card shows:
  - Team logos and names (abbr)
  - Current score (large, bold)
  - Inning/status (e.g., "Bot 7th" or "Final")
  - Tap to open Game Center
- Live indicator: Pulsing red dot + "LIVE" badge
- Auto-refresh every 30 seconds

**1.3 Favorites Feed**
- Vertical list of favorite teams' games
- Today's games first, then upcoming games (next 7 days)
- Each item shows:
  - Date and time
  - Team matchup (home vs away)
  - Venue (if notable or neutral site)
  - TV/streaming info (if available)
  - Game status (Scheduled / Live / Final)
- Empty state: "Add favorite teams to see their games here"

**1.4 Featured Content** (Below fold)
- Automated game recaps (NLG-generated)
- Top performers of the day
- Trending storylines
- Upcoming marquee matchups
- Diamond Pro upsell card (free users only)

**User Interactions:**
- Pull-to-refresh: Refresh all data
- Tap game card: Open Game Center modal
- Tap team name: Open Team Page
- Long-press game: Quick actions menu (Add to calendar, Share)

**Offline Behavior:**
- Show cached data with "Last updated X minutes ago" indicator
- Disable auto-refresh
- Show network error banner with "Retry" button

---

### 2. Scores Screen (Game List)

**Purpose:** Browse all games by date, filterable by conference/team

**Components:**

**2.1 Header**
- Date picker (prominent): Calendar icon + "March 15, 2025"
- Filter button (right): Opens filter modal

**2.2 Date Navigation**
- Horizontal date strip above game list
- Today highlighted, past 3 days and future 7 days visible
- Swipe or tap to change date
- "Today" button to quickly return

**2.3 Game List**
- Grouped by status: Live → Final → Scheduled
- Each game card shows:
  - Away team (top): Logo, Name, Score (if started)
  - Home team (bottom): Logo, Name, Score (if started)
  - Status: "Live - Bot 5th" / "Final" / "3:00 PM ET"
  - Venue (for neutral sites or notable stadiums)
  - Conference badge (if conference game)
- Live games have animated background gradient
- Tap card: Open Game Center

**2.4 Filter Modal**
- Filter by Conference: Multi-select checkboxes (SEC, Big 12, ACC, etc.)
- Filter by Team: Search + multi-select
- Filter by Game Type: Regular, Conference, Tournament
- "Apply Filters" button
- Selected filters shown as chips below header with X to remove

**User Interactions:**
- Tap date: Open date picker modal (calendar view)
- Tap filter: Open filter modal
- Pull-to-refresh: Reload games for current date
- Swipe left on game card: Quick actions (Share, Remind me)

**Empty State:**
- "No games on this date"
- Suggest checking upcoming dates
- Button: "View Schedule"

---

### 3. Game Center (Modal)

**Purpose:** Full box score, live updates, play-by-play (future)

**Navigation:**
- Opens as full-screen modal from any game card
- Dismiss: Swipe down or tap X button (top-left)
- Share button (top-right)

**Components:**

**3.1 Header**
- Team logos and names
- Final score (large, bold)
- Game status and time
- Venue and attendance (if available)
- TV/streaming info

**3.2 Tab Navigation** (Horizontal tabs below header)
- Box Score (default)
- Stats
- Plays (future feature)
- Recap (NLG-generated)

**3.3 Box Score Tab**

**Line Score:**
```
         1  2  3  4  5  6  7  8  9   R  H  E
Texas    0  2  0  1  0  0  3  0  1   7 12  1
OK State 1  0  2  0  0  0  0  0  0   3  8  2
```
- Scrollable horizontally for extra innings
- Winning score row highlighted subtly

**Batting Stats:**
- Away team batting box (collapsible section)
- Home team batting box (collapsible section)
- Table columns: Player (Pos), AB, R, H, RBI, BB, SO, AVG
- Tap column header to sort
- Notable performances highlighted (3+ hits, 3+ RBIs)
- Tap player name: Open Player Profile modal

**Pitching Stats:**
- Away team pitching box
- Home team pitching box
- Table columns: Player, IP, H, R, ER, BB, SO, ERA
- Winning/Losing/Save pitcher labeled with (W), (L), (SV)
- Tap player name: Open Player Profile modal

**3.4 Stats Tab**
- Team batting stats: AVG, OBP, SLG, LOB, 2B, 3B, HR
- Team pitching stats: IP, H, R, ER, BB, SO, WHIP
- Head-to-head comparison charts
- Diamond Pro upsell: "Unlock advanced stats"

**3.5 Recap Tab** (NLG-generated)
- Headline: "Texas Rallies Past Cowboys 7-3"
- 2-3 paragraph summary
- Key bullet points
- Top performers with stats
- Next game preview
- Share button: Share to social media

**User Interactions:**
- Swipe between tabs
- Tap player name: Open Player Profile
- Tap team name: Open Team Page
- Pull-to-refresh: Reload game data (if live)
- Share button: Share game result, box score, or recap

**Live Game Behavior:**
- Auto-refresh every 15 seconds
- New plays fade in at top of Plays tab
- Score updates animate (bounce effect)
- Push notification when game ends

---

### 4. Standings Screen

**Purpose:** View conference standings, team records, trends

**Components:**

**4.1 Conference Selector**
- Dropdown or horizontal scrollable chips
- Conferences: SEC, Big 12, ACC, Big Ten, Pac-12, + Others
- Selected conference highlighted

**4.2 Standings Table**
- Columns: Rank, Team (logo + name), Conf (W-L), Overall (W-L), Streak
- Rows sorted by conference win percentage
- User's favorite teams highlighted subtly
- Tap team row: Open Team Page

**4.3 Standings Filters** (Optional, collapsed by default)
- Sort by: Conf Win%, Overall Win%, Last 10
- Division filter (for conferences with divisions)

**4.4 Last Updated Indicator**
- Timestamp: "Updated 12 minutes ago"
- Refresh button

**User Interactions:**
- Tap conference chip: Switch conference
- Tap team row: Open Team Page
- Pull-to-refresh: Reload standings

**Empty State:**
- "Standings not yet available for this season"
- "Check back after season starts"

---

### 5. Team Page (Modal)

**Purpose:** Team overview, roster, schedule, stats

**Navigation:**
- Opens as full-screen modal from team name anywhere
- Dismiss: Swipe down or back button

**Components:**

**5.1 Header**
- Team logo (large, centered)
- Team name and conference
- Record: "18-5 (3-1 Big 12)"
- Favorite star icon (tap to favorite/unfavorite)
- Colors: Header uses team's primary color

**5.2 Tab Navigation**
- Schedule
- Roster
- Stats
- Info

**5.3 Schedule Tab**
- Vertical list of games (past and future)
- Past games: Show result, score
- Future games: Show date, time, opponent, venue
- Tap game: Open Game Center
- Filter: All Games / Home / Away / Conference

**5.4 Roster Tab**
- Grouped by position: Pitchers, Catchers, Infielders, Outfielders
- Each player card:
  - Jersey number
  - Name
  - Position, Class Year
  - Key stat (AVG for batters, ERA for pitchers)
  - Photo (if available)
- Tap player: Open Player Profile
- Search bar at top to filter roster

**5.5 Stats Tab**
- Team season statistics
- Batting: AVG, OBP, SLG, HR, RBI, SB
- Pitching: ERA, WHIP, K/9, BB/9, SV
- Fielding: Fielding %, Errors, Double Plays
- Diamond Pro upsell: "Unlock historical stats and advanced metrics"

**5.6 Info Tab**
- Stadium name, capacity, address
- Head coach name and record
- Conference affiliation
- Social media links
- Recent news/articles (if available)

**User Interactions:**
- Tap favorite star: Add/remove from favorites
- Tap game: Open Game Center
- Tap player: Open Player Profile
- Share button: Share team page

---

### 6. Player Profile (Modal)

**Purpose:** Player bio, statistics, game log

**Navigation:**
- Opens as modal from player name anywhere
- Dismiss: Swipe down or back button

**Components:**

**6.1 Header**
- Player photo (if available, fallback to team logo)
- Name, Jersey Number
- Team, Position, Class Year
- Height, Weight, Bats/Throws
- Hometown

**6.2 Season Stats Card**
- Batting (if applicable): AVG, HR, RBI, SB, OPS
- Pitching (if applicable): ERA, W-L, IP, SO, WHIP
- Fielding: Position, FLD%, Errors
- Diamond Pro badge: "View career stats"

**6.3 Game Log** (Recent games)
- Table: Date, Opponent, Result (W/L), Stats
- Last 10 games by default
- Expand to view full season
- Tap game: Open Game Center

**6.4 Bio Section**
- High school or previous school
- Awards and honors
- MLB Draft projection (if applicable)
- Notable achievements

**6.5 Related Content**
- Recent news articles mentioning player
- Social media posts (if available)

**User Interactions:**
- Tap team name: Open Team Page
- Tap game in log: Open Game Center
- Share button: Share player profile
- Follow button (future): Get notifications for this player

---

### 7. Search & Filter (Modal)

**Purpose:** Global search for teams, players, games

**Components:**

**7.1 Search Bar**
- Prominent at top
- Placeholder: "Search teams, players..."
- Real-time suggestions as you type

**7.2 Recent Searches**
- List of last 5 searches
- Tap to repeat search
- Clear all button

**7.3 Search Results** (Grouped)
- Teams section
- Players section
- Games section (if date-specific search)
- Tap result: Navigate to appropriate page

**7.4 Filters**
- Conference filter
- Position filter (for player search)
- Date range filter (for game search)

**Empty State:**
- "No results found"
- Suggestions: Check spelling, try different keywords

---

### 8. Favorites Management (Settings)

**Purpose:** Manage favorite teams and players for personalized experience

**Components:**

**8.1 Favorite Teams**
- List of favorited teams
- Team logo, name, conference
- Reorder by dragging (priority for Home screen)
- Swipe left to remove
- "Add Team" button: Opens team search

**8.2 Favorite Players** (Future)
- List of favorited players
- Player photo, name, team, position
- Swipe left to remove
- "Add Player" button: Opens player search

**8.3 Notification Settings**
- Toggle for each favorite team:
  - Game start
  - Final score
  - Close game (within 2 runs, 8th inning+)
  - Breaking news
- Global quiet hours setting

**Empty State:**
- "No favorites yet"
- "Add your favorite teams to customize your experience"
- Button: "Browse Teams"

---

### 9. Push Notifications

**Purpose:** Drive engagement with timely, relevant updates

**Notification Types:**

**9.1 Game Start Notifications**
- Trigger: 15 minutes before first pitch
- Title: "Texas vs Oklahoma State starting soon"
- Body: "First pitch at 7:00 PM CT • Disch-Falk Field"
- Action: Tap to open Game Center
- Frequency: All favorite teams (unless disabled)

**9.2 Final Score Notifications**
- Trigger: When game ends
- Title: "Texas defeats Oklahoma State 7-3"
- Body: "John Smith: 3-for-4, 2 RBI • Mike Johnson: 7 IP, 9 K"
- Action: Tap to open Game Center with Recap tab
- Frequency: All favorite teams

**9.3 Close Game Alerts** (Diamond Pro)
- Trigger: 8th inning or later, score within 2 runs
- Title: "Texas-Oklahoma State tied 3-3 in 9th!"
- Body: "Bases loaded, 1 out"
- Action: Tap to open Game Center with live updates
- Frequency: Favorite teams only

**9.4 Breaking News** (Future)
- Trigger: Major announcements (signings, injuries, awards)
- Title: "Texas RHP announces transfer to portal"
- Body: "First-team All-American enters transfer portal"
- Action: Tap to open news article
- Frequency: Favorite teams only

**Notification Settings:**
- Per-team granular controls
- Quiet hours: Default 11 PM - 8 AM local time
- DND mode: Disable all except close games
- Notification preview: Test before enabling

**Implementation:**
- Firebase Cloud Messaging (FCM) for cross-platform
- APNS for iOS-specific features (Live Activities)
- Delivery rate target: >95%
- Opt-in on first app launch with value prop

---

### 10. Diamond Pro Subscription (Paywall)

**Purpose:** Monetize power users with premium features

**Placement:**
- Upsell cards in Home feed (1 per 10 items)
- Locked features with "Upgrade" badges
- Settings > Diamond Pro section
- After 7 days of free usage: Full-screen paywall

**Premium Features:**

**Tier 1 (Included in Free):**
- Live scores and box scores
- Basic stats (AVG, ERA, etc.)
- Game notifications (start, final)
- Favorite teams (up to 3)
- Ads (non-intrusive)

**Tier 2 (Diamond Pro - $7.99/month or $59.99/year):**
- Ad-free experience
- Unlimited favorite teams
- Advanced statistics (OPS+, FIP, wOBA)
- Historical data (5+ years)
- Close game alerts (live)
- Player tracking and alerts
- Priority push notifications
- Exclusive editorial content
- Early access to new features

**Paywall Screen:**

**Design:**
- Hero image: College baseball action shot
- Headline: "Unlock the full experience"
- Feature list with checkmarks
- Pricing options: Monthly vs Annual (annual saves 2 months)
- 14-day free trial (no credit card required for existing users)
- CTA button: "Start Free Trial"
- Fine print: Cancel anytime, terms of service link

**User Flow:**
1. User taps locked feature or "Upgrade" button
2. Paywall screen appears
3. User selects Monthly or Annual
4. iOS StoreKit / Android Billing flow
5. Success: Unlock features, show confirmation
6. Failure: Retry or support contact

**Trial Management:**
- 14-day trial starts on first "Upgrade to Pro" tap
- Countdown shown in Settings: "10 days left in trial"
- Reminder notification: "3 days left in Diamond Pro trial"
- At trial end: Paywall reappears, no features locked until decision
- Trial can only be used once per account

**Revenue Sharing:**
- Apple: 70% to us, 30% to Apple (first year)
- Apple: 85% to us, 15% to Apple (subsequent years)
- Target: 5% conversion rate = $20K-50K ARR from 50K-100K users

---

### 11. Settings & More

**Purpose:** Account management, preferences, support

**Sections:**

**11.1 Account** (Future)
- Sign in / Create account
- Email, password management
- Subscription status (if Diamond Pro)

**11.2 Notifications**
- Master toggle: Enable/disable all notifications
- Link to Favorites Management for per-team settings
- Test notification button

**11.3 Appearance**
- Theme: Light / Dark / Auto (system)
- Default tab: Which tab opens on app launch

**11.4 Data & Storage**
- Cache size: "142 MB"
- Clear cache button
- Offline mode toggle

**11.5 About**
- App version
- What's new (changelog)
- Privacy policy link
- Terms of service link
- Licenses (open source)

**11.6 Support**
- Contact support (email)
- FAQ / Help center (web view)
- Report a bug
- Request a feature

**11.7 Legal**
- Attributions: "Data provided by NCAA, D1Baseball"
- Disclaimer: "Not affiliated with NCAA"
- DMCA policy

**11.8 Social**
- Follow us on Twitter
- Join our subreddit
- Rate the app (App Store / Play Store)

---

## User Flows

### Flow 1: First-Time User Onboarding

1. **Welcome Screen**
   - App logo and tagline: "College Baseball, Done Right"
   - CTA: "Get Started"

2. **Select Favorite Teams**
   - "Follow your favorite teams"
   - Search bar + conference chips
   - Select 1-3 teams (required)
   - CTA: "Continue"

3. **Enable Notifications**
   - "Never miss a game"
   - Explain notification types with icons
   - CTA: "Enable Notifications" (triggers iOS permission)
   - Skip button (less prominent)

4. **Quick Tour** (Optional, 3 screens)
   - Screen 1: "Live scores update every 30 seconds"
   - Screen 2: "Full box scores with sortable stats"
   - Screen 3: "Get notified when your teams play"
   - CTA: "Start Exploring"

5. **Home Screen**
   - Show favorite teams' games immediately
   - Success!

**Onboarding Time:** 60-90 seconds target

---

### Flow 2: Following a Live Game

1. **Entry Point:** User sees live game on Home or Scores screen
2. **Tap game card:** Opens Game Center modal
3. **Box Score Tab:** Line score, batting/pitching stats visible
4. **Auto-Refresh:** Game updates every 15 seconds
   - Score changes animate
   - New plays fade in (when Plays tab is added)
5. **Tap player name:** Opens Player Profile modal
6. **Dismiss:** Swipe down to close modal, return to previous screen

**User Engagement:** Average 3-5 minutes per live game check

---

### Flow 3: Discovering New Teams/Players

1. **Entry Point:** User taps Search icon (Home screen)
2. **Search Modal:** Type "Johnny Player"
3. **Results:** Players section shows matching results
4. **Tap player:** Opens Player Profile modal
5. **View stats:** Season stats, game log, bio
6. **Tap team name:** Opens Team Page modal
7. **Tap favorite star:** Adds team to favorites
8. **Confirm:** Toast notification "Added to favorites"

**Discovery Time:** 30-60 seconds per entity

---

### Flow 4: Upgrading to Diamond Pro

1. **Trigger:** User taps locked advanced stat (e.g., OPS+ in Player Profile)
2. **Paywall Screen:** Shows premium features, pricing options
3. **Select Plan:** User taps "Annual - $59.99/year"
4. **iOS Payment:** StoreKit purchase flow
5. **Success:** "Welcome to Diamond Pro!" screen
6. **Return:** Player Profile now shows unlocked stats
7. **Confirmation Email:** Receipt and welcome email sent

**Conversion Time:** 30-60 seconds (if decided)

---

## Design Specifications

### Typography

**Font Family:** Inter (system fallback: SF Pro / Roboto)

**Text Styles:**
- **Heading 1:** 28pt, Bold (screen titles)
- **Heading 2:** 22pt, Semibold (section headers)
- **Heading 3:** 18pt, Semibold (card titles)
- **Body:** 16pt, Regular (main content)
- **Caption:** 14pt, Regular (metadata, timestamps)
- **Small:** 12pt, Regular (fine print)

**Score Text:** 32pt, Bold (game scores)

### Color Palette

**Brand Colors:**
- Primary: `#FF6B35` (Blaze Orange)
- Secondary: `#004E89` (Navy Blue)
- Accent: `#F7B538` (Gold)

**System Colors:**
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Amber)
- Error: `#F44336` (Red)
- Info: `#2196F3` (Blue)

**Neutrals:**
- Black: `#000000`
- Gray 900: `#1A1A1A`
- Gray 700: `#4A4A4A`
- Gray 500: `#888888`
- Gray 300: `#CCCCCC`
- Gray 100: `#F5F5F5`
- White: `#FFFFFF`

**Live Indicator:**
- Live Red: `#FF0000` (pulsing)
- Live Gradient: `linear-gradient(90deg, #FF0000 0%, #FF6B35 100%)`

**Theme Support:**
- Light mode: White background, dark text
- Dark mode: Gray 900 background, white text
- Auto: Follow system preference

### Spacing System

**Base Unit:** 4px

**Spacing Scale:**
- XXS: 4px
- XS: 8px
- S: 12px
- M: 16px (default)
- L: 24px
- XL: 32px
- XXL: 48px

**Component Spacing:**
- Card padding: 16px
- Screen padding: 16px horizontal, 0px vertical
- Section spacing: 24px vertical
- List item spacing: 12px vertical

### Iconography

**Icon Library:** Lucide React Native (or SF Symbols for iOS)

**Common Icons:**
- Home: Home icon
- Scores: List icon
- Standings: Bar Chart icon
- More: Menu icon
- Search: Search icon
- Calendar: Calendar icon
- Star (favorite): Star icon
- Share: Share icon
- Close: X icon
- Back: Arrow Left icon
- Notifications: Bell icon
- Settings: Settings icon
- Live: Radio icon (animated)

**Icon Sizes:**
- Small: 16x16px
- Medium: 24x24px (default)
- Large: 32x32px

### Animations

**Principles:**
- **Purposeful:** Every animation serves a functional purpose
- **Subtle:** Avoid distracting or overdone effects
- **Fast:** Animations should be 200-300ms max

**Animation Types:**

**1. Page Transitions:**
- Modal slide up: 250ms ease-out
- Modal dismiss: 200ms ease-in
- Tab switch: 150ms ease-in-out (no animation, instant switch)

**2. Element Animations:**
- Score update: Bounce effect, 300ms
- Live indicator pulse: 1000ms infinite ease-in-out
- Pull-to-refresh spinner: 500ms rotation
- Skeleton loading: 1500ms shimmer effect

**3. Micro-interactions:**
- Button press: Scale 0.95, 100ms
- Favorite star fill: 200ms ease-out with small bounce
- Card tap: Subtle shadow/elevation change, 100ms
- Notification badge: Fade in + scale, 200ms

**4. List Animations:**
- Item appear: Fade in + slide up, 200ms, staggered 50ms per item
- Item remove: Fade out + slide right, 200ms

### Accessibility

**WCAG 2.1 Level AA Compliance:**

**1. Color Contrast:**
- Text on background: Min 4.5:1 ratio
- Large text (18pt+): Min 3:1 ratio
- Interactive elements: Min 3:1 ratio

**2. Touch Targets:**
- Minimum: 44x44pt (iOS), 48x48dp (Android)
- Spacing: 8pt between targets

**3. Text Sizing:**
- Support Dynamic Type (iOS)
- Scale factor: 1.0x - 2.0x
- Layout should adapt without horizontal scrolling

**4. VoiceOver / TalkBack:**
- All interactive elements labeled
- State changes announced (score updates, live status)
- Logical navigation order
- Group related content

**5. Reduced Motion:**
- Respect system preference
- Disable animations if enabled
- Use instant transitions instead

**6. Keyboard Navigation:**
- All features accessible without touch
- Logical tab order
- Clear focus indicators

---

## Technical Implementation

### React Native Architecture

**Directory Structure:**
```
/mobile-app/
├── src/
│   ├── screens/
│   │   ├── CollegeBaseball/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ScoresScreen.tsx
│   │   │   ├── StandingsScreen.tsx
│   │   │   ├── MoreScreen.tsx
│   │   │   ├── GameCenterModal.tsx
│   │   │   ├── TeamPageModal.tsx
│   │   │   └── PlayerProfileModal.tsx
│   │   └── Onboarding/
│   │       └── OnboardingFlow.tsx
│   ├── components/
│   │   ├── GameCard.tsx
│   │   ├── TeamCard.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── StatTable.tsx
│   │   ├── LiveIndicator.tsx
│   │   ├── ScoreBoard.tsx
│   │   └── PushNotificationManager.tsx
│   ├── services/
│   │   ├── NCAABaseballAPI.ts
│   │   ├── CollegeBaseballCache.ts
│   │   ├── PushNotifications.ts
│   │   └── Analytics.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── CollegeBaseballTabNavigator.tsx
│   ├── hooks/
│   │   ├── useGames.ts
│   │   ├── useTeam.ts
│   │   ├── usePlayer.ts
│   │   └── useFavorites.ts
│   ├── store/
│   │   ├── store.ts (Redux or Zustand)
│   │   ├── slices/
│   │   │   ├── gamesSlice.ts
│   │   │   ├── favoritesSlice.ts
│   │   │   └── userSlice.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── Theme.tsx (ThemeProvider)
│   └── utils/
│       ├── dateHelpers.ts
│       ├── statFormatters.ts
│       └── errorHandlers.ts
```

### State Management

**Recommended:** Zustand (lightweight) or Redux Toolkit

**Slices:**
- `gamesSlice`: Active games, live updates, cache
- `favoritesSlice`: User's favorite teams/players
- `userSlice`: Account, preferences, subscription status
- `notificationsSlice`: Notification settings, delivery log

**Example (Zustand):**
```typescript
// /mobile-app/src/store/slices/gamesSlice.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { NCAABaseballAPI } from '../services/NCAABaseballAPI';

interface GamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: (date: string) => Promise<void>;
  refreshGames: () => Promise<void>;
}

export const useGamesStore = create<GamesState>()(
  persist(
    (set, get) => ({
      games: [],
      loading: false,
      error: null,
      
      fetchGames: async (date: string) => {
        set({ loading: true, error: null });
        try {
          const api = new NCAABaseballAPI();
          const games = await api.getGames({ date });
          set({ games, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      
      refreshGames: async () => {
        // Force refresh without cache
        const date = new Date().toISOString().split('T')[0];
        await get().fetchGames(date);
      }
    }),
    {
      name: 'games-storage',
      // Only persist games, not loading/error states
      partialize: (state) => ({ games: state.games })
    }
  )
);
```

### Navigation

**Library:** React Navigation 6+

**Navigator Types:**
- Stack Navigator: Modal screens (Game Center, Team Page, Player Profile)
- Bottom Tab Navigator: Main app sections
- Modal Stack: Overlays (Search, Filters)

**Example:**
```typescript
// /mobile-app/src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CollegeBaseballTabNavigator } from './CollegeBaseballTabNavigator';
import GameCenterModal from '../screens/CollegeBaseball/GameCenterModal';
import TeamPageModal from '../screens/CollegeBaseball/TeamPageModal';
import PlayerProfileModal from '../screens/CollegeBaseball/PlayerProfileModal';

const Stack = createStackNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="Main" 
          component={CollegeBaseballTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="GameCenter" 
          component={GameCenterModal} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TeamPage" 
          component={TeamPageModal} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PlayerProfile" 
          component={PlayerProfileModal} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Data Fetching & Caching

**Strategy:** Offline-first with stale-while-revalidate

**Implementation:**
```typescript
// /mobile-app/src/hooks/useGames.ts
import { useEffect } from 'react';
import { useGamesStore } from '../store/slices/gamesSlice';
import { CollegeBaseballCache } from '../services/CollegeBaseballCache';

export const useGames = (date: string) => {
  const { games, loading, error, fetchGames } = useGamesStore();
  
  useEffect(() => {
    const loadGames = async () => {
      // Try cache first
      const cached = await CollegeBaseballCache.get(`games:${date}`);
      
      if (cached) {
        // Serve from cache immediately
        useGamesStore.setState({ games: cached, loading: false });
        
        // Fetch fresh data in background
        fetchGames(date).then(freshGames => {
          CollegeBaseballCache.set(`games:${date}`, freshGames, 300);
        });
      } else {
        // No cache, fetch fresh
        await fetchGames(date);
      }
    };
    
    loadGames();
  }, [date]);
  
  return { games, loading, error };
};
```

### Push Notifications

**Service:** Firebase Cloud Messaging (FCM)

**Setup:**
```typescript
// /mobile-app/src/services/PushNotifications.ts
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class PushNotifications {
  static async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
  }
  
  static async getToken(): Promise<string> {
    const token = await messaging().getToken();
    await AsyncStorage.setItem('fcm_token', token);
    return token;
  }
  
  static async registerDevice(userId: string) {
    const token = await this.getToken();
    // Send token to backend to associate with user
    await fetch('https://api.blazeintelligence.com/v1/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token, platform: 'ios' })
    });
  }
  
  static onNotification(callback: (notification: any) => void) {
    // Foreground notifications
    messaging().onMessage(async remoteMessage => {
      callback(remoteMessage);
    });
    
    // Background notifications
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      callback(remoteMessage);
    });
  }
}
```

### Performance Optimization

**1. Image Optimization:**
- Use `react-native-fast-image` for caching
- Serve WebP images from CDN
- Lazy load images below fold
- Thumbnail → Full resolution progressive loading

**2. List Optimization:**
- Use `FlatList` with `getItemLayout` for fixed-height items
- Implement `windowSize` prop (default: 10)
- Use `removeClippedSubviews` on Android
- Memo-ize list item components

**3. Navigation Optimization:**
- Lazy load tab screens
- Preload commonly accessed modals
- Avoid unnecessary re-renders with `React.memo`

**4. Bundle Optimization:**
- Code splitting for onboarding vs main app
- Tree-shaking unused dependencies
- Compress assets with `react-native-asset`

**Target Metrics:**
- App launch time: <2s (cold start)
- Screen transition: <100ms (60 FPS)
- List scroll: 60 FPS consistently
- API response: <200ms cached, <1s uncached

---

## Testing Strategy

### Unit Tests

**Framework:** Jest + React Native Testing Library

**Coverage Targets:**
- Services: 80%+
- Hooks: 70%+
- Components: 60%+

**Example:**
```typescript
// /mobile-app/src/services/__tests__/NCAABaseballAPI.test.ts
import { NCAABaseballAPI } from '../NCAABaseballAPI';

describe('NCAABaseballAPI', () => {
  let api: NCAABaseballAPI;
  
  beforeEach(() => {
    api = new NCAABaseballAPI('https://api.test.com', 'test_key');
  });
  
  it('should fetch games for a date', async () => {
    const games = await api.getGames({ date: '2025-03-15' });
    expect(games).toBeInstanceOf(Array);
    expect(games[0]).toHaveProperty('id');
  });
});
```

### Integration Tests

**Focus:** User flows, navigation, data fetching

**Example:**
```typescript
// /mobile-app/__tests__/GameCenterFlow.test.tsx
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../App';

describe('Game Center Flow', () => {
  it('should open game center and display box score', async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
    
    // Tap game card
    const gameCard = await waitFor(() => getByTestId('game-card-1'));
    fireEvent.press(gameCard);
    
    // Verify Game Center opened
    expect(getByText('Box Score')).toBeTruthy();
    
    // Verify stats displayed
    expect(getByText('John Smith')).toBeTruthy();
  });
});
```

### E2E Tests

**Framework:** Detox

**Critical Flows:**
- Onboarding → Select teams → Enable notifications
- View live game → Open Game Center → View box score
- Search team → Open Team Page → View roster
- Upgrade to Diamond Pro → Complete purchase

### Beta Testing

**TestFlight (iOS):**
- Internal: 50 users (team + family)
- External: 500-1,000 users (r/collegebaseball volunteers)
- Duration: 2-4 weeks before public launch
- Feedback: In-app feedback form + email

**Target Metrics:**
- Crash-free rate: >99.5%
- Session length: >3 minutes
- Retention (Day 7): >25%
- App Store rating (beta): >4.5 stars

---

## Launch Checklist

### Pre-Launch

- [ ] All MVP features implemented and tested
- [ ] Design review and approval
- [ ] Accessibility audit completed
- [ ] Performance benchmarks met
- [ ] Legal review (terms, privacy policy)
- [ ] App Store assets prepared (screenshots, description, keywords)
- [ ] Push notification infrastructure tested
- [ ] Analytics tracking verified
- [ ] Crash reporting configured (Sentry, Firebase Crashlytics)
- [ ] Beta testing completed
- [ ] App Store submission approved

### Launch Day

- [ ] Monitor crash reports and errors
- [ ] Track user acquisition metrics
- [ ] Respond to App Store reviews promptly
- [ ] Monitor push notification delivery
- [ ] Support team ready for user inquiries

### Post-Launch

- [ ] Weekly performance reviews
- [ ] User feedback aggregation and prioritization
- [ ] Bug fix releases (1-2 weeks cadence)
- [ ] Feature iteration based on usage data
- [ ] App Store Optimization (ASO) refinement

---

**Document Maintained By:** Blaze Intelligence Mobile Team  
**Next Review:** Post-MVP Launch (Month 6)  
**Questions:** Contact mobile-lead@blazeintelligence.com

