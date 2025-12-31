from django.core.management.base import BaseCommand
from django.db import transaction

from quiz.models import QuestionCategory, Question


GENERAL_QUESTIONS = [
    "What is my go-to comfort meal and why?",
    "Which season makes me feel most at home?",
    "What small habit says the most about me?",
    "What song would I play to reset my mood?",
    "Which value do I live by even when no one is watching?",
    "What morning ritual sets the tone for my day?",
    "Where do I go when I need to think clearly?",
    "What compliment lands deepest with me?",
    "What social setting energizes me the most?",
    "Which topic makes me light up in conversation?",
    "What childhood memory shaped my outlook the most?",
    "What kind of problem do people usually come to me to solve?",
    "What trait do I admire most in others?",
    "Which boundary quietly protects my peace?",
    "What hobby could I talk about for hours?",
    "What decision style do I trust—fast intuition or careful analysis?",
    "Which tradition do I hope to keep for life?",
    "What sign shows I’m fully comfortable around someone?",
    "What pet peeve reveals my standards?",
    "Which environment brings out my best work?",
    "What’s my favorite way to learn something new?",
    "What daily choice reflects my priorities?",
    "Which failure taught me the most?",
    "What simple gesture makes me feel seen?",
    "Which question do I wish people asked me more often?",
    "What do I collect—memories, objects, or ideas?",
    "What small luxury I never skip when I can?",
    "Which role do I take in a group by default?",
    "What rhythm do weekends follow for me?",
    "Which challenge brings out my resilience?",
    "What do I notice first when I enter a room?",
    "Which compliment do I give most freely to others?",
    "What routine I return to after setbacks?",
    "Which boundary I’ve learned to articulate clearly?",
    "What signals that I’m stressed before I say anything?",
    "Which kind of story always captures my attention?",
    "What tradition would I love to start with someone I love?",
    "Which past risk I’m still proud I took?",
    "What small act of kindness I never forget?",
    "Which future milestone matters most to me right now?",
]


class Command(BaseCommand):
    help = "Seed the 'General Knowing (1–40)' category with 40 questions"

    @transaction.atomic
    def handle(self, *args, **options):
        # Ensure the category exists
        cat, created = QuestionCategory.objects.get_or_create(
            category='general',
            defaults={
                'name': 'General Knowing (1-40)',
                'description': 'General knowing questions to understand a person',
            },
        )
        if not created and cat.name != 'General Knowing (1-40)':
            cat.name = 'General Knowing (1-40)'
            cat.description = 'General knowing questions to understand a person'
            cat.save(update_fields=['name', 'description'])

        # Clear existing questions under this category
        deleted, _ = Question.objects.filter(category=cat).delete()

        # Insert the 40 generated questions
        created_count = 0
        for idx, text in enumerate(GENERAL_QUESTIONS, start=1):
            Question.objects.create(
                category=cat,
                question_text=text,
                points=1,
                consequence='Skip loses 1 point.',
                order=idx,
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"General Knowing seeded: deleted {deleted}, created {created_count} questions."
        ))
