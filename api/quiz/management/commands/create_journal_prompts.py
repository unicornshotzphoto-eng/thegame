from django.core.management.base import BaseCommand
from quiz.models import JournalPrompt


class Command(BaseCommand):
    help = 'Create 100 journal prompts for connecting with others'

    def handle(self, *args, **options):
        prompts = [
            # Easy prompts
            ("What's one thing about yourself you wish more people knew?", "easy"),
            ("How do you like to be greeted by new people?", "easy"),
            ("What's your favorite way to spend time with others?", "easy"),
            ("What quality do you value most in a friend?", "easy"),
            ("What's something you recently learned from someone else?", "easy"),
            ("How do you usually celebrate wins with people you care about?", "easy"),
            ("What's a compliment you've given someone lately?", "easy"),
            ("When do you feel most understood by others?", "easy"),
            ("What's your go-to conversation starter?", "easy"),
            ("How do you show appreciation to people who matter to you?", "easy"),
            ("What's a hobby you'd like to share with someone?", "easy"),
            ("How do you handle disagreements with people you care about?", "easy"),
            ("What's a memory with someone that makes you smile?", "easy"),
            ("How do you like to be supported when you're struggling?", "easy"),
            ("What's something you admire about your closest friend?", "easy"),
            ("When have you felt most connected to someone?", "easy"),
            ("What's your favorite quality in yourself?", "easy"),
            ("How do you usually reach out to someone you miss?", "easy"),
            ("What's a shared interest that brings you closer to people?", "easy"),
            ("How do you celebrate diversity in your relationships?", "easy"),
            
            # Medium prompts
            ("What prevents you from being vulnerable with others?", "medium"),
            ("How has a difficult conversation strengthened your relationship?", "medium"),
            ("What's a fear you have about connecting with others?", "medium"),
            ("How do you balance your own needs with others' needs?", "medium"),
            ("What does genuine connection mean to you?", "medium"),
            ("How have you grown through a relationship conflict?", "medium"),
            ("What's a boundary you've had to set, and how did it go?", "medium"),
            ("How do you navigate differences in values with people you care about?", "medium"),
            ("What's something you've forgiven someone for, and why?", "medium"),
            ("How do you stay authentic while adapting to different groups?", "medium"),
            ("What role does trust play in your closest relationships?", "medium"),
            ("How do you express love or care to different people in your life?", "medium"),
            ("What's a misconception about you that you'd like to clear up?", "medium"),
            ("How do you handle jealousy or insecurity in relationships?", "medium"),
            ("What's something you've learned about yourself through someone else's perspective?", "medium"),
            ("How do you maintain connection during difficult times?", "medium"),
            ("What does it mean to truly listen to someone?", "medium"),
            ("How have you supported someone through their darkest moment?", "medium"),
            ("What's a relationship pattern you're working to change?", "medium"),
            ("How do you decide who to open up to and who to maintain distance from?", "medium"),
            
            # Challenging prompts
            ("How has being misunderstood shaped who you are?", "challenging"),
            ("What emotional wounds are you still working to heal?", "challenging"),
            ("How do you reconcile your need for independence with your need for connection?", "challenging"),
            ("What's the hardest truth you've ever told someone?", "challenging"),
            ("How do past relationships influence your present connections?", "challenging"),
            ("What role does shame play in preventing you from connecting?", "challenging"),
            ("How do you hold space for someone's pain without taking it on yourself?", "challenging"),
            ("What does it mean to love someone unconditionally, and have you experienced it?", "challenging"),
            ("How do you navigate power dynamics in your relationships?", "challenging"),
            ("What's a secret you've kept that affects your relationships?", "challenging"),
            ("How do you heal from betrayal?", "challenging"),
            ("What does acceptance look like in your closest relationships?", "challenging"),
            ("How do you integrate your different selves across different relationships?", "challenging"),
            ("What's the most vulnerable you've ever been with someone?", "challenging"),
            ("How do you maintain your identity while being part of a partnership?", "challenging"),
            ("What ancestral patterns are you breaking in your relationships?", "challenging"),
            ("How do you practice forgiveness, especially toward yourself?", "challenging"),
            ("What does it mean to truly see another person?", "challenging"),
            ("How do you navigate the fear of abandonment in relationships?", "challenging"),
            ("What would it take for you to feel truly belonging?", "challenging"),
            
            # Additional connecting-focused prompts (easy)
            ("What's your love language, and how do you prefer to receive affection?", "easy"),
            ("When was the last time you felt like someone really understood you?", "easy"),
            ("What's a small act of kindness that had a big impact on you?", "easy"),
            ("How do you show up for the people in your life?", "easy"),
            ("What makes you feel safe with someone?", "easy"),
            ("What's something you want to tell a friend but haven't yet?", "easy"),
            ("How do you keep relationships alive when life gets busy?", "easy"),
            ("What's a tradition you have with someone special?", "easy"),
            ("How do you react when someone shows interest in really knowing you?", "easy"),
            ("What's your ideal way to spend quality time with someone?", "easy"),
            
            # Additional connecting-focused prompts (medium)
            ("How do you create safe spaces for others to be themselves?", "medium"),
            ("What role does humor play in your connections?", "medium"),
            ("How do you express needs without fear of rejection?", "medium"),
            ("What's the most meaningful conversation you've had recently?", "medium"),
            ("How do you know when a relationship is worth fighting for?", "medium"),
            ("What does friendship mean to you?", "medium"),
            ("How do you balance giving and receiving in relationships?", "medium"),
            ("What's something you wish you could say to someone from your past?", "medium"),
            ("How do you celebrate others' successes?", "medium"),
            ("What's a time you felt truly seen by another person?", "medium"),
            
            # Additional connecting-focused prompts (challenging)
            ("How do you work through the fear that you're not enough for someone?", "challenging"),
            ("What does self-love look like in your relationships?", "challenging"),
            ("How do you grieve relationships that have ended?", "challenging"),
            ("What's your biggest fear about being close to someone?", "challenging"),
            ("How do you honor both your needs and another person's needs?", "challenging"),
            ("What patterns do you repeat in relationships, and why?", "challenging"),
            ("How do you navigate being loved differently than you love?", "challenging"),
            ("What would genuine intimacy require of you?", "challenging"),
            ("How do you deal with the vulnerability of being truly known?", "challenging"),
            ("What's the deepest fear beneath your relationship struggles?", "challenging"),
        ]

        # Check how many already exist
        existing_count = JournalPrompt.objects.count()
        
        if existing_count > 0:
            self.stdout.write(
                self.style.WARNING(f'Found {existing_count} existing prompts. Skipping creation.')
            )
            return

        # Create prompts
        created_count = 0
        for prompt_text, difficulty in prompts:
            JournalPrompt.objects.create(
                prompt_text=prompt_text,
                difficulty=difficulty,
                category='connect'
            )
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} journal prompts')
        )
