# Sound Effects

AgentForge uses sound effects to provide audio feedback for various actions.

## Required Sound Files

Place the following MP3 files in this directory:

1. **task-complete.mp3** - Played when a task is successfully completed
   - Suggested: Success/achievement sound (e.g., coin pickup, level up chime)
   - Duration: 0.5-1.5 seconds

2. **task-failed.mp3** - Played when a task fails
   - Suggested: Error/failure sound (e.g., buzz, error beep)
   - Duration: 0.5-1 second

3. **level-up.mp3** - Played when an agent levels up
   - Suggested: Epic achievement sound (e.g., fanfare, power-up)
   - Duration: 1-3 seconds

## Free Sound Resources

You can download free sound effects from:
- **Freesound.org** - https://freesound.org/
- **Mixkit.co** - https://mixkit.co/free-sound-effects/
- **Zapsplat.com** - https://www.zapsplat.com/
- **Pixabay** - https://pixabay.com/sound-effects/

## Fallback

If no sound files are present, the app will:
1. Use synthesized beep sounds via Web Audio API
2. Continue working silently (if audio generation fails)
3. Never crash due to missing sound files

## Custom Sounds

You can replace these files with your own sounds. Just ensure:
- Format: MP3 (most compatible)
- File size: < 1MB each
- File names match exactly (case-sensitive)
