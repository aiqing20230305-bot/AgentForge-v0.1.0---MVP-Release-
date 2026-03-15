#!/bin/bash
# AgentForge Automated Promotion Script
# Usage: ./scripts/automate-promotion.sh

set -e  # Exit on error

echo "🚀 AgentForge Automated Promotion Workflow"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Generate Screenshots
echo -e "${BLUE}📸 Step 1: Generating Screenshots...${NC}"
if [ -f "scripts/take-screenshots.mjs" ]; then
  node scripts/take-screenshots.mjs
  echo -e "${GREEN}✅ Screenshots generated${NC}"
else
  echo -e "${YELLOW}⚠️  Screenshot script not found, skipping...${NC}"
fi

# Step 2: Create Demo GIF
echo -e "${BLUE}🎬 Step 2: Creating Demo GIF...${NC}"
if command -v ffmpeg &> /dev/null; then
  # Check if source video exists
  if [ -f "screenshots/demo-recording.mov" ]; then
    ffmpeg -i screenshots/demo-recording.mov \
      -vf "fps=15,scale=1000:-1:flags=lanczos" \
      -c:v gif screenshots/demo.gif -y

    # Optimize with gifsicle if available
    if command -v gifsicle &> /dev/null; then
      gifsicle -O3 --lossy=80 --colors 128 \
        screenshots/demo.gif -o screenshots/demo-optimized.gif
      mv screenshots/demo-optimized.gif screenshots/demo.gif
      echo -e "${GREEN}✅ Demo GIF created and optimized${NC}"
    else
      echo -e "${GREEN}✅ Demo GIF created (install gifsicle for optimization)${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Demo recording not found. Please record demo first:${NC}"
    echo "   1. Start app: npm run dev"
    echo "   2. Record screen: Cmd+Shift+5 (Mac) or OBS Studio"
    echo "   3. Save as: screenshots/demo-recording.mov"
  fi
else
  echo -e "${YELLOW}⚠️  ffmpeg not installed. Install: brew install ffmpeg${NC}"
fi

# Step 3: Update README with stats
echo -e "${BLUE}📊 Step 3: Updating README stats...${NC}"
COMPONENT_COUNT=$(find src/components -name "*.tsx" | wc -l | tr -d ' ')
LOC=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')

echo "   Components: $COMPONENT_COUNT"
echo "   Lines of code: $LOC"
echo -e "${GREEN}✅ Stats collected${NC}"

# Step 4: Prepare social media content
echo -e "${BLUE}📱 Step 4: Preparing social media posts...${NC}"
if [ -f "marketing/social-media-templates.md" ]; then
  echo -e "${GREEN}✅ Social media templates ready${NC}"
  echo "   Location: marketing/social-media-templates.md"
else
  echo -e "${YELLOW}⚠️  Templates not found${NC}"
fi

# Step 5: Check blog post
echo -e "${BLUE}📝 Step 5: Checking blog post...${NC}"
if [ -f "blog/building-real-time-agent-monitoring.md" ]; then
  WORD_COUNT=$(wc -w < blog/building-real-time-agent-monitoring.md)
  echo "   Word count: $WORD_COUNT"
  echo -e "${GREEN}✅ Blog post ready${NC}"
else
  echo -e "${YELLOW}⚠️  Blog post not found${NC}"
fi

# Step 6: Generate posting schedule
echo -e "${BLUE}📅 Step 6: Generating posting schedule...${NC}"
cat > marketing/posting-schedule.txt << 'EOF'
AgentForge v1.1.0 Promotion Schedule
====================================

WEEK 1: Launch Week
-------------------
Monday (Day 1):
  09:00 PT - Twitter: Product announcement (Template 1)
  10:00 PT - Reddit r/reactjs: Technical post
  11:00 PT - LinkedIn: Professional article

Tuesday (Day 2):
  09:00 PT - Twitter: Technical thread (Template 2)
  14:00 PT - Reddit r/webdev: Project showcase
  20:00 CN - 掘金: Technical deep-dive

Wednesday (Day 3):
  09:00 PT - Twitter: Feature showcase with GIF (Template 3)
  10:00 PT - V2EX: Community discussion
  20:00 CN - 知乎: Q&A post

Thursday (Day 4):
  09:00 PT - Twitter: Milestone update
  14:00 PT - Dev.to: Republish blog post

Friday (Day 5):
  09:00 PT - Twitter: Poll (Template 5)

Saturday (Day 6):
  10:00 PT - Reddit r/SideProject: Personal journey

Sunday (Day 7):
  Rest day - Monitor and respond to comments

WEEK 2-4: Engagement & Growth
------------------------------
- Post 2-3 times per week on Twitter
- Respond to all comments within 2 hours
- Share user testimonials/feedback
- Post milestone updates (10, 25, 50 stars)

Content Ideas:
- Behind-the-scenes development
- Code snippet showcases
- Performance comparison charts
- User success stories
- Feature deep-dives

Tools for Automation:
- Buffer.com (Twitter, LinkedIn scheduling)
- Hootsuite (multi-platform)
- Later.com (visual planning)
- Analytics: Google Analytics + GitHub traffic
EOF

echo -e "${GREEN}✅ Schedule generated: marketing/posting-schedule.txt${NC}"

# Step 7: Create analytics tracking script
echo -e "${BLUE}📈 Step 7: Creating analytics script...${NC}"
cat > scripts/track-analytics.sh << 'EOF'
#!/bin/bash
# GitHub Analytics Tracker
# Usage: ./scripts/track-analytics.sh

# Fetch GitHub stats using API
REPO="aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-"

echo "📊 GitHub Analytics Report - $(date +%Y-%m-%d)"
echo "=============================================="

# Get star count
STARS=$(curl -s https://api.github.com/repos/$REPO | jq -r '.stargazers_count')
echo "⭐ Stars: $STARS"

# Get fork count
FORKS=$(curl -s https://api.github.com/repos/$REPO | jq -r '.forks_count')
echo "🔱 Forks: $FORKS"

# Get watchers
WATCHERS=$(curl -s https://api.github.com/repos/$REPO | jq -r '.subscribers_count')
echo "👁️  Watchers: $WATCHERS"

# Get open issues
ISSUES=$(curl -s https://api.github.com/repos/$REPO | jq -r '.open_issues_count')
echo "🐛 Open Issues: $ISSUES"

# Log to file
echo "$(date +%Y-%m-%d),$STARS,$FORKS,$WATCHERS,$ISSUES" >> analytics/github-stats.csv

echo ""
echo "✅ Stats logged to analytics/github-stats.csv"
EOF

chmod +x scripts/track-analytics.sh
echo -e "${GREEN}✅ Analytics script created${NC}"

# Step 8: Summary and next actions
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Automation Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📋 Next Actions:"
echo ""
echo "1. 📸 SCREENSHOTS:"
echo "   - Review generated screenshots in screenshots/"
echo "   - Record demo video: npm run dev → Cmd+Shift+5"
echo "   - Run this script again to generate GIF"
echo ""
echo "2. 📱 SOCIAL MEDIA:"
echo "   - Review templates: marketing/social-media-templates.md"
echo "   - Review schedule: marketing/posting-schedule.txt"
echo "   - Set up Buffer.com or Hootsuite for scheduling"
echo ""
echo "3. 📝 BLOG:"
echo "   - Review: blog/building-real-time-agent-monitoring.md"
echo "   - Publish to:"
echo "     • Dev.to: https://dev.to/new"
echo "     • Medium: https://medium.com/new-story"
echo "     • 掘金: https://juejin.cn/editor/drafts"
echo ""
echo "4. 📊 TRACKING:"
echo "   - Run daily: ./scripts/track-analytics.sh"
echo "   - Set up cron job: crontab -e"
echo "   - Add: 0 9 * * * cd /path/to/AgentForge && ./scripts/track-analytics.sh"
echo ""
echo "5. 🎬 VIDEOS:"
echo "   - Review scripts: marketing/demo-video-script.md"
echo "   - Record with OBS Studio or Cmd+Shift+5"
echo "   - Edit with DaVinci Resolve or CapCut"
echo "   - Upload to YouTube & B站"
echo ""
echo "📧 For automated posting, consider:"
echo "   - Buffer: https://buffer.com (Twitter, LinkedIn)"
echo "   - Zapier: https://zapier.com (complex workflows)"
echo "   - IFTTT: https://ifttt.com (simple automation)"
echo ""
echo "🎯 Goal: 100 GitHub stars in 90 days"
echo "📈 Track progress: https://github.com/$REPO/stargazers"
echo ""
echo -e "${BLUE}Good luck with your launch! 🚀${NC}"
