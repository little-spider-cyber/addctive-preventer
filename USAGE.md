# Mindful Browsing - Usage Guide

## 🎯 What is This Extension?

This Chrome extension helps you develop more mindful browsing habits by providing gentle, reflective interventions when you visit potentially addictive websites. Instead of blocking sites, it encourages self-awareness and conscious decision-making.

## 🚀 Quick Start

### 1. Installation

1. Run `npm run build` to build the extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` folder
5. The 🧘 Mindful Browsing icon should appear in your extensions toolbar

### 2. Initial Setup

1. Click the extension icon to open settings
2. Go to the "Websites" tab and add your first website (e.g., `www.baidu.com`)
3. Optionally customize timing in the "Timing" tab
4. Review and customize prompts in the "Prompts" tab

### 3. First Experience

1. Visit a blacklisted website (e.g., www.baidu.com)
2. After 30 seconds, a gentle modal will appear with a reflection prompt
3. Type your honest reflection and choose an action:
   - **Take a Break**: Redirect to a new tab
   - **Continue Mindfully**: Stay on site with awareness
   - **Go Elsewhere**: Leave the current site

## 📊 Features Overview

### 🌐 Website Management

- Add/remove websites you want to monitor
- Simple domain-based matching (supports subdomains)
- Default: `www.baidu.com` (as requested)

### 💭 Reflection Prompts

- 8 thoughtful default prompts covering intention, awareness, purpose, and alternatives
- Fully customizable - add your own prompts
- Smart selection based on effectiveness
- Categories: Intention, Awareness, Purpose, Alternative, Custom

### ⏱️ Flexible Timing

- **Initial delay**: 30 seconds (customizable 10s-5min)
- **Follow-up intervals**: 10, 30, 60 minutes (fully customizable)
- **Max interventions**: 4 per session (customizable 1-10)
- **Smart settings**: Require reflection, show timers, etc.

### 📈 Progress Tracking

- **Mindful sessions**: Times you made conscious choices
- **Time reclaimed**: Minutes saved from mindless browsing
- **Reflection entries**: Total moments of self-awareness
- **Success rate**: How often reminders help redirect you
- **Recent activity**: Your last 10 interactions with the extension

## 🎨 How It Works

### The Gentle Approach

- **Non-blocking**: Never prevents you from accessing websites
- **Supportive tone**: Encouraging, not judgmental
- **Reflection-based**: Focuses on awareness rather than restriction
- **Customizable**: Adapts to your personal needs and patterns

### Smart Features

- **Effectiveness tracking**: Learns which prompts work best for you
- **Timing flexibility**: Adjust intervals based on your browsing patterns
- **Privacy-first**: All data stored locally, nothing sent externally
- **Cross-session persistence**: Remembers your settings and progress

## ⚙️ Customization Options

### Timing Configuration

```
Initial Delay: 10s - 5min (default: 30s)
Intervals: Any combination of 5min - 2hr (default: 10, 30, 60min)
Max Interventions: 1-10 per session (default: 4)
```

### Prompt Behavior

- **Show timer**: Display how long you've been on the site
- **Require reflection**: Must write something to continue
- **Minimum length**: How much reflection is required
- **Selection method**: Smart/Sequential/Random

### Example Custom Prompts

- "What would my best self do right now?"
- "Am I using this site as a tool or entertainment?"
- "What am I avoiding by being here?"
- "How does this align with my goals for today?"

## 🔧 Troubleshooting

### Extension Not Working?

1. Check if the site is in your blacklist
2. Ensure the extension has permissions for the site
3. Try refreshing the page after adding a new site
4. Check browser console for any error messages

### Modal Not Appearing?

1. Verify you've waited the full initial delay (30s default)
2. Check if you've already hit the max interventions for this session
3. Try hard-refreshing the page (Ctrl+Shift+R)

### Settings Not Saving?

1. Make sure Chrome has storage permissions
2. Try disabling and re-enabling the extension
3. Check that you're not in incognito mode (unless extension is enabled for incognito)

## 🌱 Best Practices

### Getting Started

1. **Start small**: Add just 1-2 sites initially
2. **Be honest**: Give genuine reflections, even if brief
3. **Adjust timing**: Fine-tune intervals based on your patterns
4. **Review progress**: Check your metrics weekly

### Long-term Success

1. **Regular updates**: Add new sites as needed, remove ones that are no longer problematic
2. **Prompt evolution**: Update prompts as your self-awareness grows
3. **Goal setting**: Use metrics to set and track meaningful goals
4. **Celebrate progress**: Acknowledge every moment of mindful choice

### Advanced Usage

1. **Pattern recognition**: Notice which prompts are most effective for you
2. **Context awareness**: Adjust settings based on work vs. leisure time
3. **Habit stacking**: Combine with other mindfulness practices
4. **Data insights**: Use the activity log to understand your browsing patterns

## 🔒 Privacy & Data

### What's Stored Locally

- Your blacklisted websites
- Custom prompts and settings
- Reflection entries (if enabled)
- Usage statistics and metrics

### What's NOT Collected

- Browsing history outside of blacklisted sites
- Personal information or identifiers
- Reflection content (unless you choose to save it)
- Any data transmitted to external servers

### Data Control

- Full export/import of settings
- Selective data deletion
- Configurable retention periods
- Complete uninstall removes all data

## 💡 Tips for Mindful Browsing

1. **Pause before clicking**: Take a breath before opening potentially distracting sites
2. **Set intentions**: Before browsing, decide what you want to accomplish
3. **Time boundaries**: Use the extension alongside other time management tools
4. **Regular check-ins**: Review your progress and adjust settings monthly
5. **Be kind to yourself**: This is about awareness, not perfection

---

## 🚧 Future Enhancements

This extension is designed to be expandable. Future versions might include:

- Mobile companion app
- Advanced analytics
- Social accountability features
- Integration with productivity tools
- Machine learning for smarter interventions

---

_Remember: The goal isn't to eliminate enjoyable browsing, but to make sure it's intentional rather than compulsive. Every moment of awareness is progress! 🌱_
