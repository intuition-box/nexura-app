# Layer3 Quest Platform Design Guidelines

## Design Approach
**Reference-Based Approach**: Creating an exact replica of the Layer3 quest platform (app.layer3.xyz/discover), focusing on Web3 aesthetics, card-based layouts, and gamified quest discovery.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary (Layer3's exact scheme)**:
- Background: Very dark navy/black gradient (220 15% 8%)
- Card backgrounds: Dark slate with subtle transparency (220 20% 12%)
- Primary accent: Electric blue (210 100% 60%)
- Secondary: Purple gradient accents (280 80% 65%)
- Text primary: Pure white (0 0% 100%)
- Text secondary: Light gray (220 20% 70%)

### B. Typography
- Primary: Inter or similar modern sans-serif via Google Fonts
- Headings: Bold weights (600-700) for quest titles and sections
- Body text: Regular (400) and medium (500) weights
- Small text: For participant counts and metadata

### C. Layout System
**Tailwind spacing primitives**: 2, 4, 6, 8, 12, 16, 24
- Card grids: 6-unit gaps between cards
- Section spacing: 16-24 units vertically
- Card padding: 6-8 units internal spacing

### D. Component Library

**Navigation**:
- Horizontal top navigation with Layer3 logo
- Tab-based quest filtering (All, New, Collections, Ecosystems, Campaigns, Streaks)

**Quest Cards**:
- Rounded corners with subtle shadows
- Project logo in top-left corner
- Hero image backgrounds
- Participant avatars in circular format
- Participant count badges
- Reward pool displays with token icons
- Level-lock overlays for restricted content

**Ecosystem Badges**:
- Circular blockchain network icons
- Horizontal scrollable row layout
- Network-specific color coding

**Campaign Cards**:
- Countdown timers with live/ended status
- Large participant numbers prominently displayed
- Reward pool amounts with token symbols

**Streak Cards**:
- Weekly/Daily frequency indicators
- Chain-specific branding
- Progress tracking elements

### E. Visual Effects
- Subtle card hover elevations
- Gradient overlays on hero images
- Smooth transitions between states
- No distracting animations - focus on content discovery

## Images
**Hero Images**: Each quest card features a custom hero image background. Cards should have gradient overlays to ensure text readability.

**Logos**: Extensive use of project/blockchain logos as circular avatars and badges throughout the interface.

**Avatar Grid**: Small circular user avatars displayed in overlapping grids to show community participation.

**No Large Hero Section**: The platform focuses on card-based discovery rather than a traditional hero section.