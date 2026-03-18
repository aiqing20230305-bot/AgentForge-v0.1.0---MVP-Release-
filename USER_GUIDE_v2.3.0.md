# 📖 AgentForge v2.3.0 User Guide

**Complete guide for using all v2.3.0 features**

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Gamification System](#gamification-system)
3. [Notification Management](#notification-management)
4. [Multi-language & RTL Support](#multi-language--rtl-support)
5. [SSO Login](#sso-login)
6. [Report System](#report-system)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What's New in v2.3.0?

AgentForge v2.3.0 brings **5 major new systems** to enhance your AI Agent development experience:

🎮 **Gamification System v2.0** - Level up, unlock achievements, earn currency
🔔 **Smart Notifications** - Never miss important updates
🌍 **RTL Support** - Full Arabic language support
🔐 **SSO Login** - Sign in with Google or GitHub
📊 **Powerful Reports** - Visualize your Agent performance

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android 8+
- **Internet**: Required for real-time features

### First Time Setup

1. **Access AgentForge**
   - Visit: `http://localhost:5173` (or your deployment URL)
   - Or use our web app (no installation): `https://app.agentforge.dev`

2. **Create Account or Sign In**
   - Email + Password
   - Or Google/GitHub SSO (new in v2.3.0!)

3. **Complete Your Profile**
   - Set username and avatar
   - Choose your preferred language
   - Configure notification preferences

4. **Create Your First Agent**
   - Click "Create Agent" button
   - Follow the guided wizard
   - Or use AI-powered creation (dialog mode)

---

## Gamification System

### Overview

The Gamification System makes Agent development fun and rewarding! Earn XP, level up, unlock achievements, and compete on leaderboards.

### 🎯 Levels & Experience (XP)

**Your Level Progress:**
- Check your level in the top-right corner (next to your avatar)
- XP bar shows progress to next level
- Earn XP by:
  - Creating agents
  - Completing tasks
  - Unlocking achievements
  - Daily challenges
  - Team collaboration

**XP Requirements:**
- Level 1 → Level 2: 1,000 XP
- Each level requires 1,000 additional XP
- Level 10 = 10,000 total XP
- No level cap!

**How to Earn XP:**
```
Action                    XP Earned
-----------------------------------
Create first agent        +50 XP
Complete task            +20-100 XP (based on complexity)
Unlock bronze achievement +50 XP
Unlock silver achievement +100 XP
Unlock gold achievement   +200 XP
Daily challenge           +100-500 XP
Team task completion      +150 XP
7-day streak              +500 XP
```

### 💰 Virtual Currency System

**3 Types of Currency:**

**1. Coins 🪙 (Common)**
- Earned frequently from tasks and daily activities
- Used for basic items in shop
- Typical earn: 10-100 coins per action

**2. Gems 💎 (Rare)**
- Earned from achievements and special events
- Used for premium items
- Typical earn: 1-10 gems per achievement

**3. Tickets 🎫 (Special)**
- Earned from daily challenges and events
- Used for exclusive rewards
- Typical earn: 1-5 tickets per challenge

**How to Earn Currency:**
- Complete tasks → Coins + occasional Gems
- Unlock achievements → Coins + Gems
- Daily challenges → All three currencies
- Level up → Bonus coins based on new level
- Participate in events → Tickets + Gems

**Currency Display:**
- Top-right corner shows your balances
- Click to see detailed breakdown
- Animated effects when earning currency

### 🏆 Achievement System

**105 Achievements Across 10 Categories:**

#### 1. **Basics** (Bronze tier)
- First Steps: Create your first Agent
- Getting Started: Complete your profile
- Explorer: Visit all main pages
- Quickstart: Complete first task in <5 minutes

#### 2. **Agent Master** (Bronze → Diamond)
- Agent Creator: Create 10 agents
- Agent Army: Create 100 agents
- Diverse Portfolio: Create agents with 5+ different models
- Elite Squad: Have 10 Level 10+ agents

#### 3. **Task Champion** (Bronze → Diamond)
- Task Starter: Complete 1 task
- Task Runner: Complete 100 tasks
- Task Marathon: Complete 1000 tasks
- Speed Demon: Complete 10 tasks in 1 day
- Perfect Execution: Complete 50 tasks with 100% success rate

#### 4. **Team Player** (Silver → Platinum)
- Team Builder: Create your first team
- Collaboration King: Complete 50 team tasks
- Team Manager: Manage team with 5+ members
- Team Champion: Lead team to #1 on leaderboard

#### 5. **Performance Pro** (Gold → Diamond)
- Optimizer: Improve agent performance by 50%
- Token Saver: Complete 100 tasks using <50% avg tokens
- Efficiency Expert: Maintain 90%+ task success rate
- Speed Master: Achieve <30s avg task completion

#### 6. **Social Butterfly** (Silver → Gold)
- Socialite: Connect with 5 friends
- Popular: Get 100 profile views
- Influencer: Get 50 followers
- Community Leader: Help 20 users in Discord

#### 7. **Streak Master** (Bronze → Diamond)
- 3 Day Streak: Active for 3 days
- Week Warrior: Active for 7 days
- Month Master: Active for 30 days
- Year Champion: Active for 365 days

#### 8. **Explorer** (Silver → Platinum)
- Feature Explorer: Use all main features
- Report Master: Generate 10 different reports
- Plugin Pioneer: Install 5 plugins
- Customization King: Customize all theme options

#### 9. **Gamification** (Bronze → Diamond)
- Currency Collector: Earn 10,000 coins
- Gem Hunter: Earn 100 gems
- Ticket Master: Earn 50 tickets
- Achievement Hunter: Unlock 50 achievements
- Perfect Challenger: Complete 30 daily challenges

#### 10. **Special Events** (Platinum → Diamond)
- Early Adopter: Joined before official v1.0
- Beta Tester: Participated in v2.3.0 beta
- Contest Winner: Won a plugin contest
- Community Champion: 100+ contributions

**Achievement Rarity:**
- 🥉 **Bronze**: Common (60% of players unlock)
- 🥈 **Silver**: Uncommon (30% unlock)
- 🥇 **Gold**: Rare (10% unlock)
- 💍 **Platinum**: Very Rare (3% unlock)
- 💎 **Diamond**: Legendary (1% unlock)

**Viewing Achievements:**
1. Click "Gamification" in sidebar
2. Navigate to "Achievements" tab
3. Filter by:
   - Status: Unlocked / Locked
   - Category: Choose from 10 categories
   - Rarity: Choose tier
4. Search by name
5. Click achievement for details and unlock conditions

**Achievement Unlock Animation:**
- Full-screen celebration 🎉
- Particle effects
- Reward display
- XP and currency earned
- Share button (optional)

### 🎯 Daily Challenges

**Fresh Challenges Every Day!**

**Challenge Types:**
- **Easy** (Green): Complete 3 tasks → 100 XP, 50 coins
- **Medium** (Yellow): Create 2 agents → 200 XP, 100 coins, 1 gem
- **Hard** (Orange): Complete 10 tasks in <1 hour → 300 XP, 200 coins, 3 gems
- **Expert** (Red): Win team battle → 500 XP, 500 coins, 5 gems, 2 tickets

**How It Works:**
1. Challenges refresh at midnight (your timezone)
2. You get 3-5 new challenges each day
3. Track progress in real-time
4. Complete challenges to earn rewards
5. Claim rewards manually or auto-claim

**Daily Challenge Panel:**
- Shows all active challenges
- Progress bars with %-completion
- Reward preview
- Difficulty badges
- Time remaining to refresh

**Strategy Tips:**
- Complete easy challenges first
- Stack challenge progress (e.g., creating agents counts for multiple challenges)
- Check challenges before starting your day
- Expert challenges are worth 5x the rewards!

### 🏅 Leaderboards

**Compete with the Community!**

**4 Leaderboard Types:**

**1. Global 🌍**
- Compete with all users worldwide
- Shows top 100 players
- Your rank displayed at bottom

**2. Team 👥**
- Compete with your team members
- Internal team rankings
- Fosters team collaboration

**3. Friends 🤝**
- Compete with connected friends
- Private and friendly competition
- See who's the best in your group

**4. Region 📍**
- Compete with users in your region
- Based on account location
- Regional pride!

**5 Ranking Metrics:**

**1. XP** ⚡ (Total Experience Points)
- Shows overall progress and activity
- Most popular metric

**2. Agents** 🤖 (Total Agents Created)
- Rewards prolific creators
- Quality over quantity

**3. Tasks** ✅ (Total Tasks Completed)
- Measures productivity
- Completion rate matters

**4. Achievements** 🏆 (Total Achievements Unlocked)
- For completionists
- Shows dedication

**5. Streak** 🔥 (Current Active Streak)
- Days of consecutive activity
- Consistency rewarded

**4 Time Periods:**
- **Today** 📅: Reset at midnight
- **This Week** 📆: Reset every Monday
- **This Month** 📈: Reset on 1st of month
- **All Time** ⏰: Historical rankings

**Special Ranks:**
- 🥇 **#1 Gold Medal**: Golden highlight + crown icon
- 🥈 **#2 Silver Medal**: Silver highlight + medal icon
- 🥉 **#3 Bronze Medal**: Bronze highlight + medal icon
- **Top 10**: Special background color
- **Top 100**: Listed on leaderboard

**Your Rank Card:**
- Always visible at bottom
- Shows your current position
- XP/metric value
- Distance to next rank
- Climb rate (arrows showing if you're rising/falling)

**How to Climb Leaderboards:**
1. Stay active daily (streak bonus)
2. Complete high-XP activities
3. Participate in events
4. Collaborate in teams
5. Unlock rare achievements
6. Master daily challenges

### 📈 Progress Tracker

**Set and Track Your Goals!**

**Creating Goals:**
1. Go to Gamification → Progress Tracker
2. Click "Create New Goal"
3. Fill in:
   - Goal title (e.g., "Reach Level 10")
   - Description
   - Target metric (XP/Agents/Tasks/Achievements)
   - Target value
   - Deadline (optional)
   - Priority (Low/Medium/High/Urgent)

**Goal Categories:**
- Personal goals (private)
- Team goals (shared with team)
- Event goals (time-limited)

**Milestone System:**
- Break large goals into milestones
- Track incremental progress
- Celebrate intermediate wins
- Example: "Reach Level 10"
  - Milestone 1: Level 5 (50%)
  - Milestone 2: Level 7 (70%)
  - Milestone 3: Level 10 (100%)

**Progress Visualization:**
- Circular progress rings
- Linear progress bars
- Percentage completion
- Days/hours remaining
- Projected completion date

**Goal Statistics Dashboard:**
- Active goals count
- Completed goals count
- Total XP earned toward goals
- Average completion rate
- Success rate

### 🎲 Game Statistics Dashboard

**Your Complete Gamification Overview:**

**Overview Cards:**
1. **Level & XP**
   - Current level + progress bar
   - XP to next level
   - Total XP earned

2. **Core Statistics**
   - Total agents created
   - Total tasks completed
   - Total teams joined
   - Current streak (days)

3. **Achievement Collection**
   - Unlocked / Total achievements
   - Completion percentage
   - Rarity breakdown

4. **Currency Totals**
   - Total coins earned
   - Total gems earned
   - Total tickets earned
   - All-time currency (including spent)

**Activity Heatmap (7 Days × 24 Hours):**
- Visual grid showing your activity patterns
- Color intensity = activity level
- Hover for exact activity counts
- Find your peak productivity hours!

**Leaderboard Positions:**
- Global rank
- Regional rank
- Team rank
- Friend rank
- Quick links to full leaderboards

**Recent Achievements:**
- Last 5 achievements unlocked
- Unlock dates
- Quick share buttons

---

## Notification Management

### Overview

Never miss important updates! The notification system keeps you informed about agents, tasks, achievements, and more.

### 🔔 Notification Center

**Accessing Notifications:**
- Click bell icon in top-right corner
- Badge shows unread count
- Opens notification panel

**Notification Types:**
- 🔧 **System**: Platform updates, maintenance
- 🤖 **Agent**: Agent status changes, errors
- ✅ **Task**: Task completion, failures
- 🏆 **Achievement**: Achievement unlocks
- 💬 **Social**: Friend requests, messages
- 👥 **Team**: Team invites, updates

**Priority Levels:**
- 🔴 **Urgent**: Red badge, sound alert
- 🟠 **High**: Orange badge, sound alert
- 🟡 **Medium**: Yellow badge, silent
- 🟢 **Low**: Green badge, silent

**Notification Actions:**
- **Read/Unread**: Toggle read status
- **Archive**: Hide from main list
- **Delete**: Permanently remove
- **Mark All as Read**: Bulk action
- **Click**: Navigate to related content

### ⚙️ Notification Settings

**Accessing Settings:**
1. Notification Center → Settings icon
2. Or: User Menu → Settings → Notifications

**Channel Configuration:**

**1. Email 📧**
- **Enabled**: On/Off toggle
- **Frequency**:
  - Instant: Real-time emails
  - Hourly: Digest every hour
  - Daily: Summary at 9 AM
  - Weekly: Monday morning summary
- **Email address**: Verify/change email

**2. Push Notifications 📱**
- **Enabled**: On/Off toggle
- **Sound**: Enable/disable sound alerts
- **Vibrate**: Enable/disable vibration (mobile)
- **Badge**: Show/hide badge count on icon
- **Permission**: Browser permission required

**3. In-App Notifications 💬**
- **Enabled**: On/Off toggle
- **Toast**: Popup notifications in app
- **Badge**: Show count on bell icon
- **Duration**: Auto-dismiss after 5s/10s/Never

**Type × Channel Matrix:**

Configure which types go to which channels:

| Type | Email | Push | In-App |
|------|-------|------|--------|
| System | ✅ | ✅ | ✅ |
| Agent | ✅ | ✅ | ✅ |
| Task | ✅ | ❌ | ✅ |
| Achievement | ❌ | ✅ | ✅ |
| Social | ❌ | ✅ | ✅ |
| Team | ✅ | ✅ | ✅ |

*Customize each checkbox individually!*

**Do Not Disturb Mode 🌙:**
- **Enable DND**: On/Off toggle
- **Start Time**: e.g., 10:00 PM
- **End Time**: e.g., 8:00 AM
- **Allow Urgent**: Bypass DND for urgent notifications
- **Active Days**: Select days (default: every day)

**Quick Actions:**
- **Mute All**: Temporarily disable all notifications (1h/3h/8h/24h)
- **Important Only**: Only receive high/urgent priority
- **Email Only**: Disable push/in-app, keep email

### 🔍 Advanced Filtering

**Filter Panel:**
- Click "Filter" button in Notification Center
- Multiple filters can be combined

**Filter Options:**

**1. Search 🔎**
- Full-text search in title and message
- Real-time results as you type
- Clear button to reset

**2. Read Status**
- All
- Unread only
- Read only

**3. Type (Multi-select)**
- System
- Agent
- Task
- Achievement
- Social
- Team
- Select multiple types

**4. Priority (Multi-select)**
- Urgent
- High
- Medium
- Low

**5. Date Range**
- Today
- Last 7 days
- Last 30 days
- Custom range (date picker)

**6. Quick Presets**
- Today's notifications
- This week
- This month
- Unread urgent
- Achievements only

**Active Filters Badge:**
- Shows count of active filters
- Click to see filter summary
- "Reset All Filters" button

### 🎯 Batch Operations

**Selecting Notifications:**
- Click checkbox on left of each notification
- Or use "Select All" at top
- Selection count displayed

**Batch Actions:**

**1. Mark as Read** ✅
- Marks all selected as read
- Updates unread badge count
- Instant action

**2. Mark as Unread** 📧
- Marks all selected as unread
- Useful for "remind me later"
- Instant action

**3. Archive** 📦
- Moves to archive folder
- Hidden from main list
- Can be retrieved from archive

**4. Export** 💾
- Export selected notifications
- JSON format
- Download to your device

**5. Delete** 🗑️
- Permanently delete selected
- Confirmation dialog
- Cannot be undone

**Select All Options:**
- Select all on current page
- Select all matching filters
- Deselect all

---

## Multi-language & RTL Support

### Overview

AgentForge v2.3.0 supports multiple languages including Right-to-Left (RTL) languages like Arabic.

### 🌍 Changing Language

**Language Selector:**
1. Click language icon in top-right corner (🌐)
2. Or: User Menu → Settings → Language & Region
3. Select your preferred language:
   - 🇺🇸 English (en-US)
   - 🇨🇳 简体中文 (zh-CN)
   - 🇸🇦 العربية (ar-SA) - **New in v2.3.0!**

**What Gets Translated:**
- ✅ All UI text and labels
- ✅ Navigation menus
- ✅ Button labels
- ✅ Form fields
- ✅ Error messages
- ✅ Success messages
- ✅ Achievement names and descriptions
- ✅ Notification titles
- ✅ Report template names
- ⚠️ User-generated content (agents, tasks) remains in original language

### 🔄 RTL Layout (Arabic)

**Automatic RTL Switching:**
When you select Arabic (ar-SA), the entire layout automatically switches to Right-to-Left:

**Layout Changes:**
- Text aligns to the right
- Menus open from right side
- Icons flip direction (arrows, chevrons)
- Scrollbars move to left
- Forms flow right-to-left

**RTL-Optimized Components:**
- Navigation sidebar (now on right)
- Modal dialogs (align right)
- Dropdown menus
- Date pickers
- Currency display (flipped)
- Progress bars (fill from right)

**Testing RTL:**
Visit `/rtl-test` page to see RTL examples:
- Text alignment demos
- Flex/Grid containers
- Icon flipping
- Real components (Currency, Notifications)
- Form inputs

### 🎨 Language Preferences

**Regional Settings:**
- **Date Format**: DD/MM/YYYY or MM/DD/YYYY
- **Time Format**: 12h or 24h
- **Number Format**: Comma vs. period separators
- **Currency Symbol**: Local currency display

**Browser Integration:**
- Respects browser language preference
- Auto-detects on first visit
- Saved in user preferences

---

## SSO Login

### Overview

Sign in quickly and securely using your existing Google or GitHub account. No need to create and remember another password!

### 🔐 Available SSO Providers

**1. Google** (accounts.google.com)
- Sign in with any Gmail account
- Or Google Workspace account
- Sync profile picture automatically

**2. GitHub** (github.com)
- Sign in with GitHub username
- Access developer-friendly features
- Link to your repositories (coming soon)

### 🚀 How to Sign In with SSO

**New Users:**
1. Visit AgentForge login page
2. Click "Continue with Google" or "Continue with GitHub"
3. Popup window opens (allow popups!)
4. Sign in to Google/GitHub if not already
5. Grant permissions to AgentForge
6. Automatically redirected to AgentForge
7. Complete profile (username, preferences)
8. Start using AgentForge!

**Existing Users (Link Account):**
1. Log in with email/password
2. Go to Settings → Account Security
3. Click "Link Google Account" or "Link GitHub Account"
4. Follow authorization flow
5. Account linked! Can now use SSO to login

**Permissions Requested:**

**Google:**
- ✅ View your email address
- ✅ View your profile information
- ✅ View your profile picture
- ❌ No access to Gmail, Drive, or other services

**GitHub:**
- ✅ View your profile (username, avatar)
- ✅ View your email address
- ❌ No access to repositories or code

### 🔗 Managing Linked Accounts

**View Linked Accounts:**
- Settings → Account Security → Linked Accounts
- Shows all connected SSO providers
- Connection status and linked date

**Unlink Account:**
1. Settings → Account Security → Linked Accounts
2. Find provider to unlink
3. Click "Unlink" button
4. Confirm action

**Important:**
- Must have at least one authentication method
- Cannot unlink last SSO provider if no password set
- Set password first before unlinking all SSO

**Switch Authentication Methods:**
You can use multiple methods to login:
- Email + Password
- Google SSO
- GitHub SSO
All methods access the same account!

### 🔒 Security Features

**OAuth 2.0 Standard:**
- Industry-standard secure protocol
- No password shared with AgentForge
- Token-based authentication
- Automatic token expiration

**Token Management:**
- Access tokens expire after 1 hour
- Refresh tokens renew automatically
- Revoke access anytime in Settings

**Privacy:**
- AgentForge never sees your Google/GitHub password
- Only minimal profile information accessed
- You can revoke access from Google/GitHub settings
- GDPR compliant data handling

---

## Report System

### Overview

Visualize your Agent performance, task analytics, team collaboration, and more with powerful, customizable reports.

### 📊 Report Templates

**10 Pre-built Templates:**

**1. Agent Performance Report** 🤖
- **Purpose**: Analyze Agent execution performance
- **Metrics**: Tasks completed, avg duration, tokens used, success rate
- **Chart**: Bar chart
- **Use Case**: Identify top-performing agents, optimize slow agents

**2. Task Completion Report** ✅
- **Purpose**: Track task completion trends
- **Metrics**: Completed/pending/failed tasks, completion rate
- **Chart**: Pie chart + Time series
- **Use Case**: Monitor project progress, identify bottlenecks

**3. Team Collaboration Report** 👥
- **Purpose**: Analyze team efficiency
- **Metrics**: Team tasks, member contributions, collaboration score
- **Chart**: Bar chart (team comparison)
- **Use Case**: Evaluate team performance, balance workload

**4. System Performance Report** ⚡
- **Purpose**: Monitor system health
- **Metrics**: API response time, error rate, uptime
- **Chart**: Line chart (time series)
- **Use Case**: Detect performance issues, track improvements

**5. User Activity Report** 📊
- **Purpose**: Understand user engagement
- **Metrics**: Active users, session duration, feature usage
- **Chart**: Area chart
- **Use Case**: Product analytics, user insights

**6. Achievement Unlocks Report** 🏆
- **Purpose**: Track gamification engagement
- **Metrics**: Achievements unlocked, rarity distribution, unlock rate
- **Chart**: Pie chart + Bar chart
- **Use Case**: Gamification effectiveness, user motivation

**7. Revenue Analysis Report** 💰
- **Purpose**: Financial insights (for premium features)
- **Metrics**: Revenue, transactions, avg transaction value
- **Chart**: Line chart + Aggregations
- **Use Case**: Business metrics, growth tracking

**8. Error Logs Report** ⚠️
- **Purpose**: Debug issues and errors
- **Metrics**: Error count, error types, affected agents/tasks
- **Chart**: Table view (detailed logs)
- **Use Case**: Troubleshooting, quality assurance

**9. Agent Skills Distribution Report** 🎯
- **Purpose**: Analyze agent capabilities
- **Metrics**: Skill categories, skill levels, skill usage
- **Chart**: Pie chart
- **Use Case**: Identify skill gaps, plan agent creation

**10. Leaderboard Summary Report** 🏅
- **Purpose**: Gamification rankings
- **Metrics**: Top users, rank changes, score distribution
- **Chart**: Table view + Bar chart
- **Use Case**: Competition tracking, community engagement

### 🔨 Creating Reports

**Step 1: Select Template**
1. Navigate to Reports page
2. Browse template categories:
   - Agent
   - Task
   - Team
   - Performance
   - Analytics
   - Gamification
3. Or use search to find template
4. Click template card to select

**Step 2: Configure Filters**

**Common Filters:**
- **Status**: Active/Inactive/All
- **Date Range**:
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - Custom range (date picker)
- **Agent/Task/User**: Select specific items
- **Category/Tags**: Filter by classification

**Step 3: Generate Report**
- Click "Generate Report" button
- Processing indicator shown
- Report appears when ready (usually <5 seconds)

### 📈 Viewing Reports

**Chart View (Default):**
- Interactive visualizations
- Hover for details
- Zoom and pan (where applicable)
- Legend with color coding
- Responsive design (scales to screen)

**Chart Types:**
- **Line Chart**: Time series, trends
- **Bar Chart**: Comparisons, rankings
- **Pie Chart**: Proportions, distributions
- **Area Chart**: Cumulative trends
- **Table**: Detailed data

**Toggle View:**
- **Chart View** 📊: Visual representation
- **Table View** 📋: Tabular data
- Toggle button in top-right

**Table View Features:**
- Sortable columns (click header)
- Search within table
- Pagination (50 rows per page)
- Column visibility toggle
- Responsive (horizontal scroll on mobile)

**Aggregation Statistics:**
For reports with aggregations (e.g., Revenue Analysis):
- Summary cards at top
- Total, Average, Max, Min, Count
- Color-coded (green=positive, red=negative)
- Updated in real-time with filters

### 💾 Exporting Reports

**Export Formats:**

**1. CSV** 📄
- Comma-separated values
- Compatible with Excel, Google Sheets
- Best for: Data analysis, spreadsheets

**2. JSON** 🗂️
- JavaScript Object Notation
- Machine-readable format
- Best for: Programmatic processing, APIs

**3. PDF** 📑
- Portable Document Format
- Includes chart + table
- Best for: Sharing, printing, presentations

**4. Excel** 📊
- .xlsx format
- Multiple sheets (chart + data)
- Best for: Advanced analysis, pivot tables

**How to Export:**
1. Generate report
2. Click "Export" button (top-right)
3. Select format
4. File downloads automatically
5. Filename: `{template-name}-{date}.{ext}`

### 🔄 Refreshing Reports

**Manual Refresh:**
- Click "Refresh" button (↻ icon)
- Re-fetches data from server
- Updates chart and aggregations
- Generation timestamp updated

**Auto-Refresh (Coming Soon):**
- Set refresh interval (5m/15m/30m/1h)
- Real-time dashboard mode
- Pause/resume auto-refresh

### 📜 Report History

**Accessing History:**
- Reports page → "History" tab
- Shows all previously generated reports
- Saved for 90 days

**History Features:**
- **Search**: Find reports by name/date
- **Filter**: By template, date range
- **Sort**: By date, template, record count
- **Re-run**: Generate again with same filters
- **Delete**: Remove old reports

**Report Details:**
- Template name + icon
- Generation date/time
- Record count
- Filters applied
- Regenerate button
- Export button

---

## Tips & Best Practices

### 🎮 Gamification Tips

**Maximize XP Gains:**
1. Complete daily challenges every day (+500 XP/day)
2. Focus on team tasks (more XP bonus)
3. Maintain your streak (weekly/monthly bonuses)
4. Unlock achievements strategically (some give big XP)
5. Participate in events when available

**Currency Management:**
1. Don't spend all coins immediately (save for better items)
2. Gems are rare - use wisely on premium items
3. Tickets often expire - use before event ends
4. Check shop daily for limited-time deals

**Achievement Hunting:**
1. Track progress in Achievement Wall
2. Focus on bronze achievements first (easier, builds momentum)
3. Set specific achievement goals
4. Use achievement guide (hover for unlock conditions)
5. Some achievements have prerequisites - plan ahead

**Leaderboard Strategy:**
1. Pick one metric to focus on (e.g., XP or Tasks)
2. Consistent daily activity > occasional bursts
3. Team leaderboards are easier to rank on
4. Check your rank weekly to stay motivated
5. Learn from top players (analyze their stats)

### 🔔 Notification Best Practices

**Reduce Notification Fatigue:**
1. Disable low-priority types you don't need
2. Use email digest instead of instant for non-urgent
3. Enable DND during focus hours (coding/meetings)
4. Archive old notifications regularly
5. Use filters to see only what matters

**Stay Informed:**
1. Keep at least "urgent" notifications enabled
2. Enable push for critical system announcements
3. Check notification center at least once daily
4. Set up email backups for important types
5. Use notification search to find old messages

**Organization Tips:**
1. Use "Mark as Unread" for TODOs
2. Archive completed notifications
3. Use filters to review by type weekly
4. Export notifications for record-keeping
5. Set aside 5 minutes daily for notification review

### 📊 Report Best Practices

**Effective Report Usage:**
1. **Regular Monitoring**:
   - Agent Performance: Weekly
   - Task Completion: Daily
   - System Performance: Real-time dashboard
   - Team Collaboration: Weekly/Monthly

2. **Data-Driven Decisions**:
   - Identify underperforming agents → optimize
   - Track task trends → plan capacity
   - Monitor errors → prevent issues
   - Analyze team → balance workload

3. **Report Organization**:
   - Use history to compare over time
   - Export monthly summaries for records
   - Share PDF reports with stakeholders
   - Keep Excel reports for deep analysis

4. **Custom Filtering**:
   - Always set appropriate date ranges
   - Filter by relevant agents/tasks/users
   - Use status filters to focus on actionable items
   - Save common filter combinations mentally

**Report Interpretation:**
- Compare current vs. previous period
- Look for trends (up/down) not just absolute numbers
- Investigate anomalies (sudden spikes/drops)
- Correlate reports (e.g., errors vs. performance)
- Act on insights (don't just view reports)

### 🌍 Multi-language Tips

**Language Selection:**
- Choose your native language for best UX
- English has most complete translations
- Try RTL mode if you read Arabic/Hebrew/Persian
- Report translation issues via GitHub

**Content Creation:**
- Agent names/descriptions support Unicode (all languages)
- Use English for public plugins (wider audience)
- Add language tags to agents (e.g., "中文", "عربي")
- Provide multi-language documentation

### 🔐 SSO Security Tips

**Account Security:**
1. Link multiple SSO providers (backup access)
2. Also set a strong password (alternative login)
3. Enable 2FA on your Google/GitHub account
4. Review linked apps periodically in Google/GitHub settings
5. Unlink unused SSO providers

**Privacy:**
1. Review permissions before granting access
2. AgentForge only requests minimal permissions
3. You can revoke access anytime
4. No access to your emails, files, or code
5. GDPR-compliant data handling

---

## Troubleshooting

### Common Issues & Solutions

#### Gamification Issues

**Q: My XP didn't increase after completing a task**
- A: XP updates may take 5-10 seconds. Refresh the page.
- Check if task was completed successfully (status=completed)
- Verify XP amount in notification center
- Contact support if issue persists

**Q: Achievement unlocked but not showing**
- A: Clear browser cache and reload
- Check "Unlocked" filter in Achievement Wall
- Notification should confirm unlock + rewards
- Check history in Game Stats dashboard

**Q: Leaderboard rank is wrong**
- A: Leaderboards refresh every 5 minutes
- Your rank is always up-to-date at bottom
- Try manual refresh button
- Rank changes take effect at next update

**Q: Daily challenges not refreshing**
- A: Challenges refresh at midnight in your timezone
- Check system time on your device
- Log out and log back in
- Clear cache if persists

#### Notification Issues

**Q: Not receiving notifications**
- A: Check notification permissions in browser settings
- Verify preferences (Settings → Notifications)
- Ensure correct channels are enabled
- Check spam folder for emails
- Whitelist AgentForge email sender

**Q: Too many notifications**
- A: Adjust priorities (disable Low/Medium)
- Switch to digest emails (hourly/daily)
- Enable DND mode during specific hours
- Uncheck unnecessary types in Type Matrix
- Use "Important Only" quick action

**Q: Notification badge count wrong**
- A: Refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
- Mark all as read → page reload
- Clear browser cache
- Logout and login again

#### RTL/Language Issues

**Q: Layout broken in Arabic**
- A: Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Clear cache: Settings → Privacy → Clear browsing data
- Try different browser (Chrome/Firefox/Safari)
- Report specific issues to GitHub

**Q: Some text not translated**
- A: User-generated content isn't translated
- Check language file completeness
- Contribute translations via GitHub
- Fall back to English if needed

**Q: Mixed LTR/RTL text**
- A: This is expected for mixed content
- Use Unicode direction markers if needed
- Wrap text in <span dir="rtl/ltr"> if custom HTML

#### SSO Login Issues

**Q: Google/GitHub login button not working**
- A: Check if popups are blocked (allow popups)
- Try different browser
- Clear cookies for Google/GitHub
- Ensure you're logged into Google/GitHub
- Check OAuth app status (not suspended)

**Q: "Token expired" error**
- A: Token expiration is normal after 1 hour
- Refresh token should renew automatically
- If fails, log out and log in again
- Re-link SSO account if persists

**Q: Cannot unlink last SSO provider**
- A: Set a password first: Settings → Security → Change Password
- Need at least one authentication method
- Then unlink SSO providers safely

#### Report Issues

**Q: Report generation timeout**
- A: Large datasets take longer (up to 5 seconds)
- Reduce date range (try last 30 days)
- Limit results (use filters)
- Check internet connection
- Try again during off-peak hours

**Q: Chart not displaying**
- A: Refresh page
- Try different chart type
- Switch to table view temporarily
- Update browser to latest version
- Disable browser extensions (ad blockers)

**Q: Export fails**
- A: Check available disk space
- Allow downloads in browser settings
- Try different export format
- Reduce report size (filters)
- Try in incognito/private mode

**Q: Data seems incorrect**
- A: Verify date range includes expected period
- Check filters (might be excluding data)
- Compare with alternative sources
- Refresh report to get latest data
- Report data discrepancies to support

### Browser Compatibility

**Fully Supported:**
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Limited Support:**
- ⚠️ Chrome 80-89 (missing some features)
- ⚠️ Firefox 78-87 (missing some features)
- ⚠️ Safari 13 (limited PWA support)

**Not Supported:**
- ❌ Internet Explorer (any version)
- ❌ Chrome <80
- ❌ Firefox <78

### Performance Optimization

**If AgentForge is slow:**
1. **Clear Cache**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Preferences → Privacy → Clear Data
   - Safari: Preferences → Privacy → Manage Website Data

2. **Disable Extensions**:
   - Ad blockers may interfere
   - Try incognito/private mode
   - Re-enable one by one to find culprit

3. **Update Browser**:
   - Use latest version
   - Outdated browsers have performance issues

4. **Check Internet**:
   - Slow connection affects real-time features
   - Switch to wired connection if possible
   - Close other bandwidth-heavy apps

5. **Hardware**:
   - Close unused tabs
   - Restart browser
   - Restart computer
   - Check CPU/memory usage

### Getting Help

**Self-Help Resources:**
- 📖 **Documentation**: https://docs.agentforge.dev
- ❓ **FAQ**: https://docs.agentforge.dev/faq
- 🎥 **Video Tutorials**: https://youtube.com/agentforge
- 📝 **Blog**: https://blog.agentforge.dev

**Community Support:**
- 💬 **Discord**: https://discord.gg/agentforge
- 💡 **GitHub Discussions**: https://github.com/xxx/agentforge/discussions
- 🐦 **Twitter**: @agentforge (updates and tips)

**Direct Support:**
- 🐛 **Bug Reports**: https://github.com/xxx/agentforge/issues
- ✉️ **Email**: support@agentforge.dev
- 📧 **Premium Support**: enterprise@agentforge.dev (paid plans)

**Reporting Bugs:**
1. Check if already reported on GitHub Issues
2. Include:
   - Browser + version
   - Operating system
   - Steps to reproduce
   - Screenshots/videos
   - Error messages
3. Use bug report template
4. Tag appropriate labels

---

## Keyboard Shortcuts

**Global:**
- `Cmd/Ctrl + K`: Open search
- `Cmd/Ctrl + /`: Open command palette
- `Cmd/Ctrl + B`: Toggle sidebar
- `Cmd/Ctrl + ,`: Open settings

**Navigation:**
- `G then H`: Go to home
- `G then A`: Go to agents
- `G then T`: Go to tasks
- `G then M`: Go to teams
- `G then G`: Go to gamification
- `G then R`: Go to reports

**Actions:**
- `C`: Create new agent (on agents page)
- `N`: Create new task (on tasks page)
- `Esc`: Close modal/dialog
- `/`: Focus search
- `?`: Show keyboard shortcuts

---

## What's Next?

**Coming in v2.4.0** (Q2 2026):
- 📱 Mobile app (React Native)
- 🤝 Advanced team collaboration
- 🔍 Intelligent search
- 🎨 Custom themes

**Coming in v3.0.0** (Q3 2026):
- 🌐 10+ languages
- 🚀 Performance revolution (50% faster)
- 🤖 AI-powered agent optimization
- 🏢 Enterprise deployment

**Stay Updated:**
- Follow @agentforge on Twitter
- Join our Discord community
- Subscribe to newsletter
- Watch GitHub releases

---

## Feedback

We'd love to hear from you!

**How to Provide Feedback:**
- 💡 Feature requests: GitHub Discussions
- 🐛 Bug reports: GitHub Issues
- ⭐ Reviews: Share your experience
- 💬 General feedback: Discord or email

**Help Us Improve:**
- Complete our user survey (quarterly)
- Participate in beta testing
- Contribute to documentation
- Submit plugin ideas

---

**Thank you for using AgentForge v2.3.0!** 🎉

**Happy Agent Building!** 🤖

---

**Document Version**: 1.0
**Last Updated**: 2026-03-18
**AgentForge Version**: v2.3.0
