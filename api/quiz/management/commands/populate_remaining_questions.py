from django.core.management.base import BaseCommand
from quiz.models import Question

class Command(BaseCommand):
    help = 'Populate Disagreeables & Truth Checks, Romantic Knowing, Erotic Knowing, and Creative & Fun questions'

    def handle(self, *args, **kwargs):
        # Disagreeables & Truth Checks (61-80)
        disagreeables_questions = [
            {'number': 61, 'text': 'What habit of mine causes misunderstanding?', 'points': 2, 'consequence': 'Admit a habit of yours'},
            {'number': 62, 'text': 'What apology style do I expect?', 'points': 2, 'consequence': 'Practice it'},
            {'number': 63, 'text': 'What triggers my irritation fastest?', 'points': 2, 'consequence': 'Admit one trigger'},
            {'number': 64, 'text': 'What behavior shuts me down emotionally?', 'points': 2, 'consequence': 'Promise awareness'},
            {'number': 65, 'text': 'What bothers me that I downplay?', 'points': 2, 'consequence': 'Admit something you downplay'},
            {'number': 66, 'text': 'What do I do when I silently disagree?', 'points': 2, 'consequence': 'Share how you disagree'},
            {'number': 67, 'text': 'What tone makes me defensive?', 'points': 2, 'consequence': 'Adjust your tone now'},
            {'number': 68, 'text': 'What pattern do I repeat unintentionally?', 'points': 2, 'consequence': 'Admit one you repeat'},
            {'number': 69, 'text': 'What mistake do I forgive easily?', 'points': 1, 'consequence': 'Thank me'},
            {'number': 70, 'text': 'What makes me walk away instead of argue?', 'points': 2, 'consequence': 'Share your response style'},
            {'number': 71, 'text': 'What feedback do I take personally?', 'points': 2, 'consequence': 'Offer gentle feedback'},
            {'number': 72, 'text': 'What do I avoid to keep peace?', 'points': 2, 'consequence': 'Admit what you avoid'},
            {'number': 73, 'text': 'What truth am I slow to admit?', 'points': 3, 'consequence': 'Admit a hard truth'},
            {'number': 74, 'text': 'What helps me soften after conflict?', 'points': 2, 'consequence': 'Do it verbally'},
            {'number': 75, 'text': 'What do I blame myself for unnecessarily?', 'points': 2, 'consequence': 'Reassure me'},
            {'number': 76, 'text': 'What shifts me from irritated to calm?', 'points': 1, 'consequence': 'Say it now'},
            {'number': 77, 'text': 'What boundary is non-negotiable for me?', 'points': 2, 'consequence': 'Name one of yours'},
            {'number': 78, 'text': 'What emotional contradiction do I carry?', 'points': 3, 'consequence': 'Share one you carry'},
            {'number': 79, 'text': 'What behavior would disappoint me instantly?', 'points': 2, 'consequence': 'Commit to avoiding it'},
            {'number': 80, 'text': 'What do I value most during conflict?', 'points': 2, 'consequence': 'Reflect it back'},
        ]

        # Romantic Knowing (81-100)
        romantic_questions = [
            {'number': 81, 'text': 'What romantic gesture moves me every time?', 'points': 2, 'consequence': 'Describe doing it'},
            {'number': 82, 'text': 'What date would surprise me best?', 'points': 2, 'consequence': 'Plan it verbally'},
            {'number': 83, 'text': 'What rhythm do I fall into when adored?', 'points': 2, 'consequence': 'Match it'},
            {'number': 84, 'text': 'What detail do I always notice about you?', 'points': 1, 'consequence': 'Compliment my noticing'},
            {'number': 85, 'text': 'What consistency makes me feel chosen?', 'points': 2, 'consequence': 'Promise it'},
            {'number': 86, 'text': 'What do I romanticize about us?', 'points': 2, 'consequence': 'Share what you romanticize'},
            {'number': 87, 'text': 'What does my love look like when open?', 'points': 2, 'consequence': 'Describe it'},
            {'number': 88, 'text': 'What small act makes me feel valued?', 'points': 1, 'consequence': 'Do it verbally'},
            {'number': 89, 'text': 'What do I cherish most in relationships?', 'points': 2, 'consequence': 'Affirm it'},
            {'number': 90, 'text': 'What moment with you replayed in my mind?', 'points': 3, 'consequence': 'Share your replay moment'},
            {'number': 91, 'text': 'What romance trope do I secretly love?', 'points': 1, 'consequence': 'Tease playfully'},
            {'number': 92, 'text': 'What intimacy makes me emotional?', 'points': 2, 'consequence': 'Speak tenderly'},
            {'number': 93, 'text': 'What do I need to feel wanted?', 'points': 2, 'consequence': 'Express it'},
            {'number': 94, 'text': 'What makes me feel soft?', 'points': 1, 'consequence': 'Say something soft'},
            {'number': 95, 'text': 'What romance feels unrealistic to me?', 'points': 2, 'consequence': 'Ground it'},
            {'number': 96, 'text': 'What romantic insecurity do I hide?', 'points': 3, 'consequence': 'Offer reassurance'},
            {'number': 97, 'text': 'What makes me feel adored effortlessly?', 'points': 2, 'consequence': 'Do it now'},
            {'number': 98, 'text': 'What does love look like to me?', 'points': 2, 'consequence': 'Reflect it back'},
            {'number': 99, 'text': 'What moment would I call cinematic?', 'points': 2, 'consequence': 'Describe it'},
            {'number': 100, 'text': 'What romantic memory would I never forget?', 'points': 3, 'consequence': 'Share yours'},
        ]

        # Erotic Knowing (101-160) - All 3 points
        erotic_questions = [
            {'number': 101, 'text': 'What part of my body reveals desire first?', 'points': 3, 'consequence': 'Reveal a desire'},
            {'number': 102, 'text': 'What seduces me more: words, touch, or anticipation?', 'points': 3, 'consequence': 'Seduce verbally'},
            {'number': 103, 'text': 'What fantasy do I rarely admit?', 'points': 3, 'consequence': 'Share a fantasy'},
            {'number': 104, 'text': 'What role do I want you to play?', 'points': 3, 'consequence': 'Step into it verbally'},
            {'number': 105, 'text': 'What kiss pulls desire from me instantly?', 'points': 3, 'consequence': 'Describe it'},
            {'number': 106, 'text': 'What ignites my imagination first?', 'points': 3, 'consequence': 'Paint a scene'},
            {'number': 107, 'text': 'What unexpected act turns me on fastest?', 'points': 3, 'consequence': 'Admit a turn-on'},
            {'number': 108, 'text': 'What power dynamic attracts me?', 'points': 3, 'consequence': 'Declare your role'},
            {'number': 109, 'text': 'What rhythm matches my pleasure?', 'points': 3, 'consequence': 'Describe matching it'},
            {'number': 110, 'text': 'What sound do I make when losing control?', 'points': 3, 'consequence': 'Mimic desire verbally'},
            {'number': 111, 'text': 'What makes me feel powerful in intimacy?', 'points': 3, 'consequence': 'Affirm it'},
            {'number': 112, 'text': 'What fantasy requires mental stimulation?', 'points': 3, 'consequence': 'Start mental foreplay'},
            {'number': 113, 'text': 'What detail have I hinted at?', 'points': 3, 'consequence': 'Reveal curiosity'},
            {'number': 114, 'text': 'What do I crave after a long day?', 'points': 3, 'consequence': 'Offer it verbally'},
            {'number': 115, 'text': 'What foreplay is essential to me?', 'points': 3, 'consequence': 'Describe it'},
            {'number': 116, 'text': 'What intimate fear do I carry?', 'points': 3, 'consequence': 'Offer reassurance'},
            {'number': 117, 'text': 'What scent or sensation arouses me?', 'points': 3, 'consequence': 'Describe using it'},
            {'number': 118, 'text': 'What angle reveals my vulnerability?', 'points': 3, 'consequence': 'Speak tenderly'},
            {'number': 119, 'text': 'What pressure level do I prefer?', 'points': 3, 'consequence': 'Describe matching it'},
            {'number': 120, 'text': 'What do I imagine when I miss you?', 'points': 3, 'consequence': 'Share your imagining'},
            {'number': 121, 'text': 'What unexpected place excites me?', 'points': 3, 'consequence': 'Set the scene'},
            {'number': 122, 'text': 'What roleplay would I actually try?', 'points': 3, 'consequence': 'Initiate verbally'},
            {'number': 123, 'text': 'What aftercare makes me melt?', 'points': 3, 'consequence': 'Promise it'},
            {'number': 124, 'text': 'What turns me off instantly?', 'points': 3, 'consequence': 'Commit to avoiding it'},
            {'number': 125, 'text': 'What touch makes me gasp?', 'points': 3, 'consequence': 'Describe it'},
            {'number': 126, 'text': 'What phrase pulls me deeper?', 'points': 3, 'consequence': 'Say one'},
            {'number': 127, 'text': 'What slow intimacy do I crave?', 'points': 3, 'consequence': 'Slow it down verbally'},
            {'number': 128, 'text': 'What fast intimacy do I fantasize about?', 'points': 3, 'consequence': 'Admit it'},
            {'number': 129, 'text': 'What memory would arouse me if revisited?', 'points': 3, 'consequence': 'Revisit it verbally'},
            {'number': 130, 'text': 'What do I wish you initiated more?', 'points': 3, 'consequence': 'Commit to it'},
            {'number': 131, 'text': 'What pleasure do I hide?', 'points': 3, 'consequence': 'Reveal curiosity'},
            {'number': 132, 'text': 'What makes me lose time?', 'points': 3, 'consequence': 'Describe doing it'},
            {'number': 133, 'text': 'What erotic curiosity have I never voiced?', 'points': 3, 'consequence': 'Share yours'},
            {'number': 134, 'text': 'What surprises me best in intimacy?', 'points': 3, 'consequence': 'Surprise verbally'},
            {'number': 135, 'text': 'What makes me feel worshipped?', 'points': 3, 'consequence': 'Worship verbally'},
            {'number': 136, 'text': 'What makes intimacy sacred to me?', 'points': 3, 'consequence': 'Honor it'},
            {'number': 137, 'text': 'What risk would I take with trust?', 'points': 3, 'consequence': 'Admit one'},
            {'number': 138, 'text': 'What desire grows with trust?', 'points': 3, 'consequence': 'Name it'},
            {'number': 139, 'text': 'What mental foreplay works every time?', 'points': 3, 'consequence': 'Begin it'},
            {'number': 140, 'text': 'What kiss do I crave most?', 'points': 3, 'consequence': 'Describe it'},
            {'number': 141, 'text': 'What body language do I show aroused?', 'points': 3, 'consequence': 'Mirror desire'},
            {'number': 142, 'text': 'What fantasy requires surrender?', 'points': 3, 'consequence': 'Offer safety'},
            {'number': 143, 'text': 'What private desire do I hope you discover?', 'points': 3, 'consequence': 'Promise exploration'},
            {'number': 144, 'text': 'What teasing do I enjoy most?', 'points': 3, 'consequence': 'Tease verbally'},
            {'number': 145, 'text': 'What intimate truth haven\'t you guessed?', 'points': 3, 'consequence': 'Reveal one'},
            {'number': 146, 'text': 'What sensation overwhelms me?', 'points': 3, 'consequence': 'Describe it'},
            {'number': 147, 'text': 'What surprise would impress me erotically?', 'points': 3, 'consequence': 'Plan it'},
            {'number': 148, 'text': 'What erotic energy do I hide?', 'points': 3, 'consequence': 'Invite it out'},
            {'number': 149, 'text': 'What slow burn do I prefer?', 'points': 3, 'consequence': 'Slow build verbally'},
            {'number': 150, 'text': 'What passionate break do I want?', 'points': 3, 'consequence': 'Claim desire'},
            {'number': 151, 'text': 'What is my ideal first touch?', 'points': 3, 'consequence': 'Describe it'},
            {'number': 152, 'text': 'What unspoken gesture do I love?', 'points': 3, 'consequence': 'Promise awareness'},
            {'number': 153, 'text': 'What desire do I show without words?', 'points': 3, 'consequence': 'Name it'},
            {'number': 154, 'text': 'What secret turn-on do I never announce?', 'points': 3, 'consequence': 'Guess creatively'},
            {'number': 155, 'text': 'What pattern do I fall into when I want you?', 'points': 3, 'consequence': 'Reflect it'},
            {'number': 156, 'text': 'What desire do I intellectualize?', 'points': 3, 'consequence': 'Admit one'},
            {'number': 157, 'text': 'What fantasy only works with trust?', 'points': 3, 'consequence': 'Build trust verbally'},
            {'number': 158, 'text': 'What cue do I give when aroused?', 'points': 3, 'consequence': 'Acknowledge it'},
            {'number': 159, 'text': 'What do I imagine you doing when I\'m silent?', 'points': 3, 'consequence': 'Say it'},
            {'number': 160, 'text': 'What intensity level do I thrive in?', 'points': 3, 'consequence': 'Match it verbally'},
        ]

        # Creative & Fun (161-200)
        creative_questions = [
            {'number': 161, 'text': 'Describe us as a book title.', 'points': 1, 'consequence': 'Compliment me'},
            {'number': 162, 'text': 'Create a one-sentence vow I\'d agree with.', 'points': 2, 'consequence': 'Create one anyway'},
            {'number': 163, 'text': 'Predict my reaction to a surprise.', 'points': 1, 'consequence': 'Tease playfully'},
            {'number': 164, 'text': 'Imitate my laugh.', 'points': 1, 'consequence': 'Laugh with me'},
            {'number': 165, 'text': 'Describe me from my perspective.', 'points': 2, 'consequence': 'Affirm me'},
            {'number': 166, 'text': 'Tell our story as destiny.', 'points': 2, 'consequence': 'Rewrite it sweeter'},
            {'number': 167, 'text': 'Recreate my expression accurately.', 'points': 1, 'consequence': 'Compliment me'},
            {'number': 168, 'text': 'Rewrite an argument softly.', 'points': 2, 'consequence': 'Apologize playfully'},
            {'number': 169, 'text': 'Name a song that fits my love style.', 'points': 1, 'consequence': 'Sing a line'},
            {'number': 170, 'text': 'Create our perfect day.', 'points': 2, 'consequence': 'Plan one detail'},
            {'number': 171, 'text': 'Describe me using senses only.', 'points': 2, 'consequence': 'Compliment me'},
            {'number': 172, 'text': 'Write a line I\'d say in love.', 'points': 2, 'consequence': 'Say it to me'},
            {'number': 173, 'text': 'Predict my reaction to bold romance.', 'points': 2, 'consequence': 'Try it verbally'},
            {'number': 174, 'text': 'Reenact my serious vs flirty voice.', 'points': 1, 'consequence': 'Make me laugh'},
            {'number': 175, 'text': 'Guess my hidden talent.', 'points': 1, 'consequence': 'Praise me'},
            {'number': 176, 'text': 'Describe my presence poetically.', 'points': 2, 'consequence': 'Read it aloud'},
            {'number': 177, 'text': 'Title our next chapter.', 'points': 2, 'consequence': 'Commit to it'},
            {'number': 178, 'text': 'Predict a secret I\'ll tell you soon.', 'points': 3, 'consequence': 'Share one of yours'},
            {'number': 179, 'text': 'Give my energy a color.', 'points': 1, 'consequence': 'Explain lovingly'},
            {'number': 180, 'text': 'Describe me without physical traits.', 'points': 2, 'consequence': 'Affirm essence'},
            {'number': 181, 'text': 'What nickname would I enjoy secretly?', 'points': 1, 'consequence': 'Say it'},
            {'number': 182, 'text': 'What inside joke would I create?', 'points': 1, 'consequence': 'Make one now'},
            {'number': 183, 'text': 'What game would I play in bed?', 'points': 3, 'consequence': 'Describe how'},
            {'number': 184, 'text': 'What dare would I accept easily?', 'points': 1, 'consequence': 'Dare me verbally'},
            {'number': 185, 'text': 'What teasing would I start?', 'points': 1, 'consequence': 'Tease gently'},
            {'number': 186, 'text': 'What trouble would I get us into?', 'points': 1, 'consequence': 'Laugh together'},
            {'number': 187, 'text': 'What challenge would I win?', 'points': 1, 'consequence': 'Cheer me on'},
            {'number': 188, 'text': 'What would make me blush?', 'points': 2, 'consequence': 'Say it'},
            {'number': 189, 'text': 'What childish joy do I hide?', 'points': 1, 'consequence': 'Celebrate it'},
            {'number': 190, 'text': 'What prank would I pull?', 'points': 1, 'consequence': 'Pretend one'},
            {'number': 191, 'text': 'What song would I sing dramatically?', 'points': 1, 'consequence': 'Sing a line'},
            {'number': 192, 'text': 'What silly gesture makes me laugh?', 'points': 1, 'consequence': 'Do it'},
            {'number': 193, 'text': 'What compliment do I want most?', 'points': 2, 'consequence': 'Say it'},
            {'number': 194, 'text': 'What pet name would I give you?', 'points': 1, 'consequence': 'Accept it'},
            {'number': 195, 'text': 'What playful argument would I start?', 'points': 1, 'consequence': 'Play along'},
            {'number': 196, 'text': 'What flirt habit would I develop?', 'points': 1, 'consequence': 'Flirt now'},
            {'number': 197, 'text': 'What habit would surprise you later?', 'points': 1, 'consequence': 'Admit one'},
            {'number': 198, 'text': 'What game-night energy do I bring?', 'points': 1, 'consequence': 'Match it'},
            {'number': 199, 'text': 'What spontaneous act would I initiate?', 'points': 2, 'consequence': 'Describe it'},
            {'number': 200, 'text': 'What part of me is secretly mischievous?', 'points': 2, 'consequence': 'Celebrate it'},
        ]

        # Create Disagreeables & Truth Checks questions
        for q_data in disagreeables_questions:
            question, created = Question.objects.get_or_create(
                category='disagreeables_truth',
                question_number=q_data['number'],
                defaults={
                    'question_text': q_data['text'],
                    'points': q_data['points'],
                    'consequence': q_data['consequence']
                }
            )
            if created:
                self.stdout.write(f"Created Question {q_data['number']}: {q_data['text'][:50]}...")

        # Create Romantic Knowing questions
        for q_data in romantic_questions:
            question, created = Question.objects.get_or_create(
                category='romantic_knowing',
                question_number=q_data['number'],
                defaults={
                    'question_text': q_data['text'],
                    'points': q_data['points'],
                    'consequence': q_data['consequence']
                }
            )
            if created:
                self.stdout.write(f"Created Question {q_data['number']}: {q_data['text'][:50]}...")

        # Create Erotic Knowing questions
        for q_data in erotic_questions:
            question, created = Question.objects.get_or_create(
                category='erotic_knowing',
                question_number=q_data['number'],
                defaults={
                    'question_text': q_data['text'],
                    'points': q_data['points'],
                    'consequence': q_data['consequence']
                }
            )
            if created:
                self.stdout.write(f"Created Question {q_data['number']}: {q_data['text'][:50]}...")

        # Create Creative & Fun questions
        for q_data in creative_questions:
            question, created = Question.objects.get_or_create(
                category='creative_fun',
                question_number=q_data['number'],
                defaults={
                    'question_text': q_data['text'],
                    'points': q_data['points'],
                    'consequence': q_data['consequence']
                }
            )
            if created:
                self.stdout.write(f"Created Question {q_data['number']}: {q_data['text'][:50]}...")

        self.stdout.write(self.style.SUCCESS('\nSuccessfully created 140 questions!'))
        self.stdout.write(self.style.SUCCESS('- Disagreeables & Truth Checks: 20 questions (61-80)'))
        self.stdout.write(self.style.SUCCESS('- Romantic Knowing: 20 questions (81-100)'))
        self.stdout.write(self.style.SUCCESS('- Erotic Knowing: 60 questions (101-160)'))
        self.stdout.write(self.style.SUCCESS('- Creative & Fun: 40 questions (161-200)'))
