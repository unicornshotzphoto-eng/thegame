from django.core.management.base import BaseCommand
from quiz.models import Question


class Command(BaseCommand):
    help = 'Populate the database with spiritual knowing questions'

    def handle(self, *args, **kwargs):
        # Clear existing questions in this category
        Question.objects.filter(category='spiritual_knowing').delete()
        
        questions = [
            {
                'number': 1,
                'text': 'What brings me back to alignment the fastest?',
                'points': 2,
                'consequence': 'Share a grounding intention'
            },
            {
                'number': 2,
                'text': 'What emotion do I guard most spiritually?',
                'points': 2,
                'consequence': 'Share an emotional truth'
            },
            {
                'number': 3,
                'text': 'What part of my purpose am I most devoted to?',
                'points': 3,
                'consequence': 'Reveal your purpose with me'
            },
            {
                'number': 4,
                'text': 'What do I believe relationships are meant to teach?',
                'points': 2,
                'consequence': 'Share a lesson love taught you'
            },
            {
                'number': 5,
                'text': 'What spiritual habit do I want us to practice?',
                'points': 3,
                'consequence': 'Describe a ritual for us'
            },
            {
                'number': 6,
                'text': 'What season of life am I in right now?',
                'points': 2,
                'consequence': 'Share how you see our season'
            },
            {
                'number': 7,
                'text': 'What do I consider sacred intimacy?',
                'points': 3,
                'consequence': 'Reveal what intimacy means to you'
            },
            {
                'number': 8,
                'text': 'What energy do I lead with in love?',
                'points': 2,
                'consequence': 'Describe how my love feels'
            },
            {
                'number': 9,
                'text': 'What fear have I outgrown?',
                'points': 2,
                'consequence': 'Admit a fear you\'re releasing'
            },
            {
                'number': 10,
                'text': 'What do I spiritually need when overwhelmed?',
                'points': 2,
                'consequence': 'Offer reassurance'
            },
            {
                'number': 11,
                'text': 'What part of my healing am I protective of?',
                'points': 3,
                'consequence': 'Share a vulnerable truth'
            },
            {
                'number': 12,
                'text': 'What spiritual quality attracts me to you?',
                'points': 2,
                'consequence': 'Name a quality you admire'
            },
            {
                'number': 13,
                'text': 'What do I believe about soul connections?',
                'points': 2,
                'consequence': 'Share your belief'
            },
            {
                'number': 14,
                'text': 'What makes me feel spiritually safe?',
                'points': 3,
                'consequence': 'Say how you\'d protect my peace'
            },
            {
                'number': 15,
                'text': 'What intention do I set most in love?',
                'points': 2,
                'consequence': 'Set an intention for us'
            },
            {
                'number': 16,
                'text': 'What do I see as a spiritual red flag?',
                'points': 2,
                'consequence': 'Admit one of yours'
            },
            {
                'number': 17,
                'text': 'What do I pray never leaves me?',
                'points': 3,
                'consequence': 'Share what you hope never leaves us'
            },
            {
                'number': 18,
                'text': 'What gesture makes me feel spiritually seen?',
                'points': 2,
                'consequence': 'Give a heartfelt compliment'
            },
            {
                'number': 19,
                'text': 'What is my greatest spiritual strength?',
                'points': 2,
                'consequence': 'Affirm a strength you see'
            },
            {
                'number': 20,
                'text': 'What moment awakened my spirituality?',
                'points': 3,
                'consequence': 'Share a moment that changed you'
            },
        ]
        
        created_count = 0
        for q_data in questions:
            question = Question.objects.create(
                category='spiritual_knowing',
                question_number=q_data['number'],
                question_text=q_data['text'],
                points=q_data['points'],
                consequence=q_data['consequence']
            )
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created Question {q_data["number"]}: {q_data["text"][:50]}...'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} spiritual knowing questions!'
            )
        )
