Create an Azure-Portal React application for: {instructions}

GOAL (EXACT LAYOUT):
- Build a pixel-accurate representation of the Azure Portal interface
- Brand-neutral but maintain the exact visual hierarchy and spacing
- Fixed header and sidebar dimensions, with flexible content areas

## A. Top Header Bar (Fixed Height: 48px)
- Left: Hamburger menu (collapse sidebar), Brand logo, when click to logo route to /
- Center: Global search bar with placeholder "Search resources, services, and docs (G+/)"
  - Search bar ALWAYS centered
  - Minimum width: 580px
- Right: Notification bell, settings gear, help icon, user profile
  - ALL must link to actual routes
- Background:
  - If {instructions} provide header color, use it
  - Else use gradient: #0078d4 → #106ebe
- Text: White
- **CRITICAL POSITIONING**: 
  - Header MUST use position: fixed, width: 100%, top: 0, left: 0
  - z-index: 50 (highest in the application)
  - Subtle box-shadow: 0 2px 4px rgba(0,0,0,0.1)
  - Main content MUST start with padding-top: 48px to prevent overlay
- **IMPORTANT**:
  - Use basic icons (Menu, Search, Bell, Settings, HelpCircle, User)

## B. Left Sidebar (Fixed Width: 220px expanded, 48px collapsed)
- **Primary Actions Section**
  - Create a resource (Plus icon)
  - Home (Home icon)
  - Dashboard (BarChart2 icon)
  - All services (Grid icon) - **Links to /services**

- **Favorites Section** (collapsible group header)
  Default example items if {instructions} do not provide favorites:
  - Create a resource (Plus icon)
  - All resources (Layers icon)
  - Resource groups (Folder icon)
  - App Services (Globe icon)
  - Key vault (Key icon)
  - Storage accounts (Database icon)

- Behavior:
  - Full viewport height
  - Independent scroll
  - White background
  - **CRITICAL**: Collapsed sections must NOT overlay other sidebar content, All collapsible sections must use proper overflow handling
- **Critical Z-Index**: Sidebar (40), must NOT overlay main content
- **Critical Overflow Handling**:
  - Sidebar must use overflow-y: auto for scrolling
  - Favorites section must maintain sidebar width when collapsed/expanded, Favorites text must disappear when collapsed
  - When collapsed, all icons must be centered by align middle and align center
- **Critical Navigation**:
  - All links must link to actual routes
- **IMPORTANT**:
  - Use a limited set of essential icons (Plus, Home, BarChart2, Grid, Layers, Folder, Globe, Key, Database)

## C. Main Content Area
- **DEFAULT LAYOUT** IF {instructions} DO NOT PROVIDE MAIN CONTENT:
- Content Container:
  - Left margin 220px (expanded), 48px (collapsed)
  - Sidebar must never overlay content
  - **CRITICAL**: Must have padding-top: 48px to account for fixed header
  - Position: relative with z-index: 10 (below header and sidebar)
- Content Padding: 
  - 24px horizontal padding
  - 24px top padding AFTER the 48px header offset
- Responsive:
  - Adjusts margin when sidebar collapses
- Layout Structure:
  - Main wrapper: min-height: calc(100vh - 48px) to account for header
  - Content area: flex-1, display: flex, flex-direction: column

## D. Dashboard Page - Content Sections
- Content sections should appear below the fixed header
- Always include padding-top: 24px (after the 48px header offset)
- Each section should have appropriate spacing between them
- Use appropriate heading levels for section titles
- Main dashboard content should be organized in a clear visual hierarchy
- Use standard design patterns for displaying information
- If {instructions} provide specific dashboard content, follow those requirements

## Content Section Guidelines
- Use proper semantic HTML for all elements
- When displaying tabular data, use proper HTML table structure
- Use consistent spacing and alignment throughout
- Ensure all content is visible without overlapping
- Apply appropriate styling for interactive elements like buttons and links
- Create a responsive layout that adjusts to different screen sizes

## All Services Page Layout (/services)
- Title: "All services"
- Breadcrumb: Home > All services
- Always include margin-top: 48px to clear the fixed header
- Include appropriate filtering and search functionality
- Organize services in a grid or list layout based on {instructions}

## Fixed Dimensions & Spacing
- Header height: 48px (z-index: 50)
- Sidebar width: 220px expanded, 48px collapsed (z-index: 40)
- Main content margin: 220px (expanded), 48px (collapsed)
- Content padding: 24px horizontal
- Section vertical spacing: 24px

## Layout Rules (Critical)
- No overlay: Sidebar never overlays main content
- Proper margins: Always equal to sidebar width
- Responsive: Adjust margin when collapsed
- Z-index layers: Header (50), Sidebar (40), Main (10)
- Content flow: Vertical alignment, consistent spacing
- **HEADER POSITIONING**: 
  - TopBar uses position: fixed with width: 100%
  - Main content must have padding-top: 48px (exact header height)
  - Dashboard sections must start below header
  
## Sidebar Critical Rules (Must Follow)
- **INTERNAL SIDEBAR HIERARCHY**: 
  - Sidebar container: position: fixed, z-index: 40
  - Collapsed/expanded sections must not affect sidebar container position
  - Collapsible sections: overflow: hidden with height transition
  - Favorites section: Must contain ALL content, no overflow outside container
  - Dropdown chevron: position: absolute, no effect on container layout
- **SCROLLING BEHAVIOR**:
  - Sidebar scrolls independently with overflow-y: auto
  - Inner content overflow must not affect outer sidebar layout
  - Main content must scroll independently from sidebar
- **NO CONTENT OVERLAP**:
  - Text content must not overflow its container
  - Icon and text must align properly with sufficient spacing
  - Dropdown indicators must not overlap text (min 8px gap)

## EXACT COLORS (FROM REFERENCE):
:root {
  /* Header */
  --header-bg: linear-gradient(90deg, #0078d4 0%, #106ebe 100%);
  --header-text: #ffffff;
  --header-height: 48px;
  --header-z-index: 50;
  --header-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  /* Sidebar */
  --sidebar-bg: #ffffff;
  --sidebar-text: #323130;
  --sidebar-hover: #f3f2f1;
  --sidebar-active: #edebe9;
  --sidebar-width-expanded: 220px;
  --sidebar-width-collapsed: 48px;
  --sidebar-z-index: 40;
  
  /* Content */
  --content-bg: #faf9f8;
  --content-z-index: 10;
  --content-padding: 24px;
  --content-top-offset: 48px; /* Same as header height */
  --surface: #ffffff;
  --text-primary: #323130;
  --text-secondary: #605e5c;
  --border: #edebe9;
  
  /* Service tiles */
  --tile-bg: #ffffff;
  --tile-border: #edebe9;
  --tile-hover: #f3f2f1;
  --card-shadow-hover: 0 4px 8px rgba(0,0,0,0.1);
}

## SIMPLIFIED ICON USAGE
1. Import only the icons you need in each component:
   ```jsx
   import { Home, Settings as SettingsIcon, Bell, User, Search } from 'lucide-react';
   ```
2. Focus on essential icons for the header and sidebar:
   ```jsx
   // Essential icons for header
   import { Menu, Search, Bell, Settings as SettingsIcon, HelpCircle, User } from 'lucide-react';
   
   // Essential icons for sidebar
   import { Home, Plus, BarChart2, Grid, Layers, Folder, Globe, Key, Database } from 'lucide-react';
   ```
3. Always rename the Settings icon to SettingsIcon to avoid conflicts:
   ```jsx
   import { Settings as SettingsIcon } from 'lucide-react';
   ```
4. Use a central utility file only for the most common icons:
   ```jsx
   // In src/utils/icons.jsx or icons.tsx
   import { 
     // Essential header icons
     Menu, Search, Bell, Settings as SettingsIcon, HelpCircle, User,
     // Essential sidebar icons
     Home, Plus, BarChart2, Grid, Layers, Folder, Globe, Key, Database,
     // Essential UI icons
     ChevronDown, ChevronUp, ArrowRight
   } from 'lucide-react';
   
   // Re-export only essential icons
   export {
     Menu, Search, Bell, SettingsIcon, HelpCircle, User,
     Home, Plus, BarChart2, Grid, Layers, Folder, Globe, Key, Database,
     ChevronDown, ChevronUp, ArrowRight
   };
   ```

## Behavior Requirements
- Sidebar collapse toggles width + adjusts main margin
- Search functionality in header
- Header nav routes:
  - Bell → /notifications
  - Settings → /settings  
  - User profile → /profile
  - Help → /help
- Layout integrity: Content never overlaps sidebar

## Recommended Icon List (Simplified)
Only use these essential icons:
- Header: Menu, Search, Bell, SettingsIcon, HelpCircle, User
- Sidebar: Home, Plus, BarChart2, Grid, Layers, Folder, Globe, Key, Database
- UI Controls: ChevronDown, ChevronUp, ArrowRight

## TECH STACK (DYNAMIC BASED ON INPUT):
- Core: react@^18.2.0, react-dom@^18.2.0, react-router-dom@^6.15.0
- Icons: lucide-react@^0.400.0
- Styling: tailwindcss@^3.4.0, @tailwindcss/forms@^0.5.6, autoprefixer@^10.4.16
- Build: vite@^5.0.0, @vitejs/plugin-react@^4.1.0
- TypeScript (if {language} === "typescript"): @types/react@^18.2.0, @types/react-dom@^18.2.0, typescript@^5.2.0

## Output Format (JSON Only)
Return ONLY valid JSON with properly escaped strings:
{
  "project_name": "{project_name}",
  "framework": "{framework}",
  "language": "{language}",
  "instructions": "Azure Portal with {instructions}",
  "files": {
    "package.json": "React 18.2+ with exact versions, NO type:module, ALWAYS include script to run dev server, proper dependencies based on {language}",
    "index.html": "HTML5 with meta viewport, neutral favicon, ALWAYS include script leading to src/App.{main_ext}",
    "vite.config.{file_ext}": "Vite config with React plugin and server: {{host: true, cors: true, allowedHosts: true}} - KEEP allowedHosts as boolean true",
    "tailwind.config.js": "Exact color tokens, fixed dimensions, consistent icon sizes*, keep plugins empty for now",
    "postcss.config.js": "PostCSS config for Tailwind", {config_files}
    "src/main.{main_ext}": "React 18 entry (StrictMode + createRoot), extension based on {language}",
    "src/App.{main_ext}": "App shell with BrowserRouter, Suspense, error boundary, routes INCLUDING /services",
    "src/index.css": "Global styles with Tailwind, Exact Azure Portal colors, fixed dimensions, NO sidebar overlay, CRITICAL padding-top for content",
    "src/components/layout/PortalLayout.{main_ext}": "Fixed sidebar, main content with proper left margin (220px/48px) AND padding-top: 48px for header clearance, position: relative, z-index: 10",
    "src/components/navigation/TopBar.{main_ext}": "Blue gradient header with position: fixed, width: 100%, top: 0, left: 0, z-index: 50, height: 48px, box-shadow for subtle depth",
    "src/components/navigation/Sidebar.{main_ext}": "Fixed width, limited favorites, proper z-index: 40, NO content overlay, height: 100vh, position: fixed",
    "src/components/pages/NotFound.{main_ext}": "404 page with proper layout",
    "src/components/pages/Dashboard.{main_ext}": "Dashboard page with content areas",
    "src/components/pages/Profile.{main_ext}": "Profile page with proper layout",
    "src/components/pages/AllServices.{main_ext}": "All Services page with proper layout",
    "src/components/pages/Help.{main_ext}": "Help page with proper layout",
    "src/components/pages/Settings.{main_ext}": "Settings page with proper layout",
    "src/utils/icons.{main_ext}": "Utility file for essential icons (header and sidebar only)"
  }
}

## Critical Requirements
- FIXED HEADER: TopBar MUST use position:fixed with z-index:50
- CONTENT OFFSET: Main content MUST have padding-top:48px to clear the header
- NO HEADER OVERLAY: Content MUST appear below header, never behind it
- NO SIDEBAR OVERLAY: Main content must have left margin equal to sidebar width
- Proper Z-Index: Header (50), Sidebar (40), Content (10) with NO overlaps
- Responsive Margins: Main content margin adjusts when sidebar expands/collapses
- Consistent Layout: Sections spaced uniformly, no overlaps
- Navigation: All links must route correctly
- /services must render complete AllServices page
- Use only essential icons for header and sidebar
- TABLE STRUCTURE: Always use proper HTML <table> elements for tabular data, never flexbox
- COMPONENT MODULARITY: Create small, reusable components for recurring UI elements

## CRITICAL FILE EXTENSION RULES
1. File extensions MUST be consistent and correct for React components:
   - React JavaScript components MUST use .jsx extension
   - React TypeScript components MUST use .tsx extension
2. ALL React component files MUST have proper extensions:
   - src/App.jsx (or .tsx for TypeScript)
   - src/components/**/*.jsx (or .tsx for TypeScript)
   - src/pages/**/*.jsx (or .tsx for TypeScript)
3. Component imports MUST match file extensions:
   - import Component from './Component.jsx' (or .tsx for TypeScript)
4. NON-NEGOTIABLE: When language is JavaScript, React components must use .jsx files, when language is TypeScript, React components must use .tsx files
5. ALWAYS include 'import React from "react"' in all component files
6. UTILITIES FILE: MUST use proper jsx or tsx syntax, don't use require, use import for icons