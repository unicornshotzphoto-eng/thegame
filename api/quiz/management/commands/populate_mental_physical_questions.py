from django.core.management.base import BaseCommand
from quiz.models import Question

class Command(BaseCommand):
    help = 'Populate Mental Knowing and Physical Knowing questions'

    def handle(self, *args, **kwargs):
        # Mental Knowing Questions (21-40)
        mental_questions = [
            {
                'number': 21,
                'text': 'What thought pattern am I breaking?',
                'points': 2,
                'consequence': 'Share a mindset you\'re working on'
            },
            {
                'number': 22,
                'text': 'What makes me overthink fastest?',
                'points': 1,
                'consequence': 'Compliment me'
            },
            {
                'number': 23,
                'text': 'What excites my mind more: mystery or clarity?',
                'points': 1,
                'consequence': 'Compliment my mind'
            },
            {
                'number': 24,
                'text': 'What conversations stimulate me most?',
                'points': 2,
                'consequence': 'Start one now'
            },
            {
                'number': 25,
                'text': 'What do I analyze more: actions or intentions?',
                'points': 2,
                'consequence': 'Share how you analyze love'
            },
            {
                'number': 26,
                'text': 'What belief do I defend strongly?',
                'points': 2,
                'consequence': 'Share a strong belief'
            },
            {
                'number': 27,
                'text': 'What mentally shuts me down?',
                'points': 2,
                'consequence': 'Admit something that shuts you down'
            },
            {
                'number': 28,
                'text': 'What mentally turns me on?',
                'points': 3,
                'consequence': 'Describe how you\'d seduce me mentally'
            },
            {
                'number': 29,
                'text': 'What do I avoid thinking about?',
                'points': 2,
                'consequence': 'Share something you avoid'
            },
            {
                'number': 30,
                'text': 'What decision style do I use most?',
                'points': 1,
                'consequence': 'Affirm my decision-making'
            },
            {
                'number': 31,
                'text': 'What mentally calms me?',
                'points': 1,
                'consequence': 'Say something calming'
            },
            {
                'number': 32,
                'text': 'What idea do I revisit often?',
                'points': 2,
                'consequence': 'Share a recurring thought'
            },
            {
                'number': 33,
                'text': 'What makes me mentally curious?',
                'points': 1,
                'consequence': 'Ask me a curious question'
            },
            {
                'number': 34,
                'text': 'What mentally exhausts me?',
                'points': 2,
                'consequence': 'Admit something draining'
            },
            {
                'number': 35,
                'text': 'What emotion do I intellectualize?',
                'points': 3,
                'consequence': 'Share one you intellectualize'
            },
            {
                'number': 36,
                'text': 'What helps me focus best?',
                'points': 1,
                'consequence': 'Compliment my focus'
            },
            {
                'number': 37,
                'text': 'What do I mentally romanticize?',
                'points': 2,
                'consequence': 'Share what you romanticize'
            },
            {
                'number': 38,
                'text': 'What mental boundary do I protect?',
                'points': 2,
                'consequence': 'Share one you protect'
            },
            {
                'number': 39,
                'text': 'What mental habit am I proud of?',
                'points': 1,
                'consequence': 'Affirm a habit of mine'
            },
            {
                'number': 40,
                'text': 'What does my mind crave most?',
                'points': 3,
                'consequence': 'Reveal what your mind craves'
            },
        ]

        # Physical Knowing Questions (41-60)
        physical_questions = [
            {
                'number': 41,
                'text': 'What physical affection melts me first?',
                'points': 2,
                'consequence': 'Describe how you\'d give it'
            },
            {
                'number': 42,
                'text': 'What do I do when physically exhausted?',
                'points': 1,
                'consequence': 'Offer care verbally'
            },
            {
                'number': 43,
                'text': 'What part of my routine grounds me?',
                'points': 1,
                'consequence': 'Compliment my discipline'
            },
            {
                'number': 44,
                'text': 'What does my body reveal when I\'m comfortable?',
                'points': 2,
                'consequence': 'Share what you notice'
            },
            {
                'number': 45,
                'text': 'Where does tension show up first for me?',
                'points': 2,
                'consequence': 'Share where yours does'
            },
            {
                'number': 46,
                'text': 'What physical gesture makes me feel protected?',
                'points': 2,
                'consequence': 'Describe giving it'
            },
            {
                'number': 47,
                'text': 'What do I physically crave on slow days?',
                'points': 1,
                'consequence': 'Say how you\'d join me'
            },
            {
                'number': 48,
                'text': 'What part of my body carries emotion?',
                'points': 2,
                'consequence': 'Share what you feel there'
            },
            {
                'number': 49,
                'text': 'What movement do I lean into naturally?',
                'points': 1,
                'consequence': 'Compliment my presence'
            },
            {
                'number': 50,
                'text': 'What physical act makes me feel cared for?',
                'points': 2,
                'consequence': 'Describe doing it'
            },
            {
                'number': 51,
                'text': 'What do I do when hiding desire?',
                'points': 3,
                'consequence': 'Reveal how you show desire'
            },
            {
                'number': 52,
                'text': 'What does my breathing say about my mood?',
                'points': 1,
                'consequence': 'Mirror calm breathing'
            },
            {
                'number': 53,
                'text': 'What environment relaxes my body instantly?',
                'points': 1,
                'consequence': 'Describe creating it'
            },
            {
                'number': 54,
                'text': 'What physical rhythm do we fall into together?',
                'points': 2,
                'consequence': 'Share how it feels'
            },
            {
                'number': 55,
                'text': 'What touch do I give without thinking?',
                'points': 1,
                'consequence': 'Compliment it'
            },
            {
                'number': 56,
                'text': 'What physical sensation distracts me fastest?',
                'points': 1,
                'consequence': 'Tease playfully'
            },
            {
                'number': 57,
                'text': 'What physical need do I ignore?',
                'points': 2,
                'consequence': 'Admit one you ignore'
            },
            {
                'number': 58,
                'text': 'What physical trait am I confident about?',
                'points': 1,
                'consequence': 'Affirm it'
            },
            {
                'number': 59,
                'text': 'What do I seek in physical closeness?',
                'points': 2,
                'consequence': 'Describe offering it'
            },
            {
                'number': 60,
                'text': 'What does my body say before my words?',
                'points': 3,
                'consequence': 'Share what your body says'
            },
        ]

        # Create Mental Knowing questions
        for q_data in mental_questions:
            question, created = Question.objects.get_or_create(
                category='mental_knowing',
                question_number=q_data['number'],
                defaults={
                    'question_text': q_data['text'],
                    'points': q_data['points'],
                    'consequence': q_data['consequence']
                }
            )
            if created:
                self.stdout.write(f"Created Question {q_data['number']}: {q_data['text'][:50]}...")
            else:
                self.stdout.write(f"Question {q_data['number']} already exists")

        # Create Physical Knowing questions
        for q_data in physical_questions:
            question, created = Question.objects.get_or_create(
                category='physical_knowing',
                question_number=q_data['number'],
                defaults={
                    'question_text': q_data['text'],
                    'points': q_data['points'],
                    'consequence': q_data['consequence']
                }
            )
            if created:
                self.stdout.write(f"Created Question {q_data['number']}: {q_data['text'][:50]}...")
            else:
                self.stdout.write(f"Question {q_data['number']} already exists")

        self.stdout.write(self.style.SUCCESS('\nSuccessfully created 40 questions (20 Mental Knowing + 20 Physical Knowing)!'))
