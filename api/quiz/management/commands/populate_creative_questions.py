from django.core.management.base import BaseCommand
from django.db import transaction

from quiz.models import QuestionCategory, Question


class Command(BaseCommand):
    help = "Populate Creative & Fun category with creative questions."

    @transaction.atomic
    def handle(self, *args, **options):
        # Get or create the Creative & Fun category
        category, created = QuestionCategory.objects.get_or_create(
            category='creative',
            defaults={
                'name': 'Creative & Fun (161-200)',
                'description': 'Fun and creative questions to deepen connection',
            },
        )

        # If category already has questions, warn and skip
        if category.questions.exists():
            count = category.questions.count()
            self.stdout.write(
                self.style.WARNING(
                    f"Creative & Fun category already has {count} questions; skipping population."
                )
            )
            return

        # Creative & Fun questions
        questions_data = [
            {
                'question_text': "If you could create a brand new holiday, what would it be and how would people celebrate it?",
                'points': 2,
                'consequence': "Skip and do something silly together instead!",
                'order': 1,
            },
            {
                'question_text': "What's the most creative compliment someone has ever given you?",
                'points': 1,
                'consequence': "Give each other a creative compliment right now.",
                'order': 2,
            },
            {
                'question_text': "If you could design your own board game, what would it be called and how would you win?",
                'points': 2,
                'consequence': "Play charades together instead.",
                'order': 3,
            },
            {
                'question_text': "What's your most embarrassing dance move and would you show me?",
                'points': 3,
                'consequence': "You have to do it anyway!",
                'order': 4,
            },
            {
                'question_text': "If you could turn your life into a movie, what would the title be?",
                'points': 2,
                'consequence': "Come up with a movie title about me instead.",
                'order': 5,
            },
            {
                'question_text': "What's the silliest reason you've ever laughed so hard you cried?",
                'points': 2,
                'consequence': "Tell a knock-knock joke badly.",
                'order': 6,
            },
            {
                'question_text': "If you could only eat foods of one color for a week, which color would you choose?",
                'points': 1,
                'consequence': "Describe your ideal meal in detail.",
                'order': 7,
            },
            {
                'question_text': "What superpower would you give me and why?",
                'points': 2,
                'consequence': "I get to choose your superpower instead.",
                'order': 8,
            },
            {
                'question_text': "If our life was a song, what would it sound like?",
                'points': 2,
                'consequence': "Hum a random tune together.",
                'order': 9,
            },
            {
                'question_text': "What's the most creative thing you've ever made or built?",
                'points': 2,
                'consequence': "Design something together right now.",
                'order': 10,
            },
            {
                'question_text': "If you could have dinner with any fictional character, who would it be and what would you talk about?",
                'points': 2,
                'consequence': "Act out a scene with a fictional character.",
                'order': 11,
            },
            {
                'question_text': "What's your guilty pleasure TV show, movie, or book?",
                'points': 1,
                'consequence': "Describe the plot in the most dramatic way possible.",
                'order': 12,
            },
            {
                'question_text': "If you could reshape our relationship one aspect, what would it be and how would you change it?",
                'points': 3,
                'consequence': "Tell me what you love most about our dynamic.",
                'order': 13,
            },
            {
                'question_text': "What's the most spontaneous thing you've ever done?",
                'points': 2,
                'consequence': "Let me plan a surprise for you.",
                'order': 14,
            },
            {
                'question_text': "If you could write a book about us, what would the first chapter be titled?",
                'points': 2,
                'consequence': "I'll write the first chapter for us.",
                'order': 15,
            },
            {
                'question_text': "What's your most creative pickup line or compliment?",
                'points': 2,
                'consequence': "Try to make me laugh with a bad joke.",
                'order': 16,
            },
            {
                'question_text': "If we were in a sitcom, what would the show be called?",
                'points': 2,
                'consequence': "We'll improvise a scene together.",
                'order': 17,
            },
            {
                'question_text': "What's the most fun adventure you'd like us to have together?",
                'points': 3,
                'consequence': "Plan something spontaneous for next week.",
                'order': 18,
            },
            {
                'question_text': "If you could create a TikTok dance with me, what kind of music would it be to?",
                'points': 2,
                'consequence': "We'll make up a silly dance move together.",
                'order': 19,
            },
            {
                'question_text': "What's your favorite memory of us doing something fun or silly together?",
                'points': 2,
                'consequence': "Create a new silly memory right now!",
                'order': 20,
            },
        ]

        # Create all questions
        for q_data in questions_data:
            Question.objects.create(category=category, **q_data)

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {len(questions_data)} questions in Creative & Fun category."
            )
        )
