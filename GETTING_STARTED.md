# Quiz Game - Getting Started Guide

## 🎮 Ready to Play? Start Here!

This guide will get you up and running with the complete quiz game system in minutes.

## ⚡ Quick Start (5 Minutes)

### Step 1: Run Database Migrations
```bash
cd api
python manage.py migrate
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, quiz
Running migrations:
  ...
  Applying quiz.0003_groupchat_groupmessage: OK
```

### Step 2: Seed the Quiz Questions
```bash
python manage.py seed_questions
```

Expected output:
```
Successfully created 210 questions across 7 categories
```

✅ **Database is now ready with 210 questions!**

### Step 3: Start the Backend Server
```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 4: Start the Frontend (in a new terminal)
```bash
cd my-app
npx expo start
```

You'll see:
```
Expo Go requires development server.
...
Press 'i' to open iOS simulator
Press 'a' to open Android simulator
Press 'w' to open web
Press 'q' to quit
```

**Press 'w' for web, 'i' for iOS, or 'a' for Android**

### Step 5: Navigate to Questions Tab
- The app will open in your chosen platform
- Tap on the **Questions tab** in the navigation bar
- Select a category and start playing! 🎮

---

## 📱 Testing the Game

### Test Category Loading
When you open the Questions tab, you should see 7 categories:
- 🟣 Spiritual (Purple)
- 🔵 Mental (Blue)
- 🔴 Physical (Red)
- 🟠 Disagreeables (Orange)
- 🔗 Romantic (Pink)
- 🌶️ Erotic (Coral)
- 🎨 Creative (Teal)

### Test Playing a Game
1. Tap any category
2. You'll see the first question with a points badge
3. Try these actions:
   - **Answer**: +1-3 points, move to next
   - **Refuse**: Show consequence, move to next
   - **Skip**: Move to next without points
4. When done with all 30 questions, see final score

### Test API Directly
In another terminal, test the API:
```bash
# Get all categories
curl http://localhost:8000/api/quiz/questions/categories/

# Get spiritual questions
curl http://localhost:8000/api/quiz/questions/spiritual/

# Get random question
curl http://localhost:8000/api/quiz/questions/random/erotic/
```

---

## 🛠️ Troubleshooting

### "Failed to load categories" Error

**Problem**: API returns error when loading questions

**Solution 1**: Ensure backend is running
```bash
# In api directory
python manage.py runserver
# Should see "Starting development server at http://127.0.0.1:8000/"
```

**Solution 2**: Verify database has questions
```bash
# In api directory, open Python shell
python manage.py shell

# Check question count
from quiz.models import Question
print(Question.objects.count())  # Should print 210
```

**Solution 3**: Check API URL in frontend
- Edit `my-app/app/src/utils/api.js`
- Verify `baseURL` is set to `http://10.0.2.2:8000` (Android) or `http://localhost:8000` (Web/iOS)

### No Questions Showing

**Problem**: Questions tab shows category buttons but no questions load

**Solution**:
```bash
# Seed the database
cd api
python manage.py seed_questions
```

### Android Emulator Connection Issue

**Problem**: Can't connect to localhost from Android emulator

**Solution**: Use `http://10.0.2.2:8000` instead of `http://localhost:8000`

In `my-app/app/src/utils/api.js`:
```javascript
const baseURL = __DEV__ 
  ? Platform.select({
      android: 'http://10.0.2.2:8000',
      ios: 'http://localhost:8000',
      web: 'http://localhost:8000'
    })
  : 'https://your-production-url.com';
```

### Database Already Has Questions

**Problem**: Running seed_questions again creates duplicates

**Solution**: Questions with same text are skipped automatically
```bash
# Safe to run multiple times
python manage.py seed_questions
```

---

## 📊 Verifying Everything Works

### Backend Verification Checklist
- [ ] `python manage.py runserver` starts without errors
- [ ] http://localhost:8000/api/quiz/questions/categories/ returns 7 categories
- [ ] http://localhost:8000/api/quiz/questions/spiritual/ returns 30 questions
- [ ] http://localhost:8000/api/quiz/questions/random/ returns a single question

### Frontend Verification Checklist
- [ ] App loads without crashes
- [ ] Questions tab is visible in navigation
- [ ] Category grid displays all 7 categories
- [ ] Tapping a category loads questions
- [ ] Score tracking works when clicking Answer
- [ ] Refuse button shows consequence modal
- [ ] Skip button advances to next question
- [ ] Final score displays when game completes

---

## 🎓 Understanding the Game

### Scoring System
- **1 Point Questions**: Easy conversation starters
- **2 Point Questions**: Moderate vulnerability required
- **3 Point Questions**: Deep intimacy/honesty required
- **Score Multiplier**: (Points Earned) / (Total Points Available)

### Three Actions
1. **Answer**: You answer the question
   - Earn the points
   - Move to next question

2. **Refuse**: You refuse to answer
   - See the consequence
   - Must perform the consequence
   - Move to next question

3. **Skip**: You don't want to play
   - No points earned or lost
   - Move to next question

### Game Flow
1. Category Selection → 2. First Question → 3. Your Action → 4. Stats Update → 5. Next Question → ... → Final Score

---

## 🔐 Production Setup

When ready to deploy:

### Backend (Production)
```bash
# Update settings.py
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']

# Use a production database (PostgreSQL, MySQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'quiz_game',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Run migrations
python manage.py migrate

# Seed questions
python manage.py seed_questions

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn api.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (Production)
```bash
# Build for production
eas build --platform ios  # iOS
eas build --platform android  # Android
eas submit  # App Store / Google Play

# Or use Expo Go
eas update
```

---

## 📚 Documentation

Quick links to other guides:

- **[QUIZ_GAME_QUICKSTART.md](./QUIZ_GAME_QUICKSTART.md)** - Feature overview
- **[QUIZ_GAME_API_REFERENCE.md](./QUIZ_GAME_API_REFERENCE.md)** - API endpoints & examples
- **[QUIZ_GAME_SETUP.md](./QUIZ_GAME_SETUP.md)** - Detailed setup & customization
- **[QUIZ_GAME_IMPLEMENTATION.md](./QUIZ_GAME_IMPLEMENTATION.md)** - Complete documentation
- **[QUIZ_GAME_CHECKLIST.md](./QUIZ_GAME_CHECKLIST.md)** - Implementation checklist

---

## 🎯 Next Steps

### After Playing
- Customize questions by editing `api/quiz/management/commands/seed_questions.py`
- Restrict to authenticated users by changing permissions in views
- Add user authentication to track individual scores
- Create leaderboards or statistics dashboard

### To Add Features
- **Multiplayer**: Track couple's shared score
- **History**: Save completed games
- **Achievements**: Unlock badges for milestones
- **Custom Questions**: Allow couples to add their own

---

## 💬 Frequently Asked Questions

**Q: Can I modify the questions?**
A: Yes! Edit `api/quiz/management/commands/seed_questions.py` and re-run the seed command.

**Q: How do I restrict to logged-in users?**
A: Change `permission_classes = [AllowAny]` to `[IsAuthenticated]` in views.py

**Q: Where are questions stored?**
A: In SQLite at `api/db.sqlite3` (or your configured database)

**Q: How many questions are there?**
A: 210 total - 30 per category across 7 categories

**Q: Can I use this offline?**
A: Not yet, but you can add offline support with a local cache

**Q: Is the game free to use?**
A: Yes! It's built with open-source frameworks.

---

## 🚀 You're All Set!

Everything is ready to go. Just run the quick start commands above and start playing!

If you encounter any issues:
1. Check troubleshooting section above
2. Verify all setup commands ran successfully
3. Check that backend is running and accessible
4. Verify database was seeded with 210 questions

**Enjoy the game! 🎮**

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: ✅ Ready to Use
