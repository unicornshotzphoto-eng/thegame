from django.core.management.base import BaseCommand
from django.db import transaction

from quiz.models import QuestionCategory, Question


class Command(BaseCommand):
    help = "Replace the quiz question bank with the provided 160-question set"

    @transaction.atomic
    def handle(self, *args, **options):
        categories_config = {
            'spiritual': 'Spiritual Knowing (1-20)',
            'mental': 'Mental Knowing (21-40)',
            'physical': 'Physical Knowing (41-60)',
            'disagreeables': 'Disagreeables & Truth Checks (61-80)',
            'romantic': 'Romantic Knowing (81-100)',
            'erotic': 'Desirable Knowing (101-160)',  # map "Desirable" to existing 'erotic' code
        }

        # Ensure categories exist with correct names
        cat_map = {}
        for code, name in categories_config.items():
            cat_obj, created = QuestionCategory.objects.get_or_create(
                category=code,
                defaults={
                    'name': name,
                    'description': f'{name} questions',
                },
            )
            if not created and cat_obj.name != name:
                cat_obj.name = name
                cat_obj.description = f'{name} questions'
                cat_obj.save(update_fields=['name', 'description'])
            cat_map[code] = cat_obj

        # New question bank
        questions_by_category = {
            'spiritual': [
                "What brings me back to myself when the world pulls at me?",
                "What emotion do I protect because it’s sacred to me?",
                "What part of my purpose do I guard with devotion?",
                "What do I believe love is here to teach us?",
                "What shared ritual would deepen our bond?",
                "What season of becoming am I currently in?",
                "What does sacred intimacy mean in my world?",
                "What energetic signature do I lead with in love?",
                "What fear have I already outgrown without noticing?",
                "What do I need spiritually when I feel overwhelmed?",
                "What part of my healing do I allow only the worthy to see?",
                "What spiritual quality in you draws me closer?",
                "What do I believe about soul-level connections?",
                "What makes me feel spiritually safe with someone?",
                "What intention do I unconsciously set in love?",
                "What spiritual red flag quietly turns me away?",
                "What prayer do I hope never leaves my lips?",
                "What gesture makes me feel divinely seen?",
                "What is my quiet spiritual strength?",
                "What moment first awakened me to something greater?",
            ],
            'mental': [
                "What thought pattern am I actively unlearning?",
                "What makes my mind spiral fastest?",
                "What excites me more—mystery or understanding?",
                "What conversations make me lose track of time?",
                "Do I study actions or intentions more closely?",
                "What belief do I defend with my whole chest?",
                "What mentally shuts me down without warning?",
                "What mentally turns me on before anything else?",
                "What topic do I avoid thinking too deeply about?",
                "How do I decide when my heart and mind disagree?",
                "What mentally calms me faster than logic?",
                "What idea do I revisit when I’m alone?",
                "What makes me mentally curious about someone?",
                "What drains me mentally even if I enjoy it?",
                "What emotion do I analyze instead of feel?",
                "What helps me focus effortlessly?",
                "What do I mentally romanticize?",
                "What mental boundary do I guard closely?",
                "What mental habit am I proud of?",
                "What does my mind crave more of lately?",
            ],
            'physical': [
                "What kind of physical affection softens me first?",
                "What do I do when my body is exhausted?",
                "What part of my routine grounds me physically?",
                "What does my body reveal when I’m comfortable?",
                "Where does tension show up in me first?",
                "What physical gesture makes me feel protected?",
                "What do I physically crave on slow days?",
                "What part of my body holds emotion?",
                "What movement do I lean into naturally?",
                "What physical act makes me feel cared for?",
                "What do I do when I’m hiding desire?",
                "What does my breathing reveal about my mood?",
                "What environment relaxes my body instantly?",
                "What physical rhythm do we fall into together?",
                "What touch do I give without thinking?",
                "What physical sensation distracts me fastest?",
                "What physical need do I tend to ignore?",
                "What physical trait am I quietly confident about?",
                "What do I seek most in physical closeness?",
                "What does my body say before my words do?",
            ],
            'disagreeables': [
                "What habit of mine causes misunderstanding?",
                "What apology style do I expect?",
                "What triggers my irritation fastest?",
                "What behavior shuts me down emotionally?",
                "What bothers me that I tend to downplay?",
                "What do I do when I silently disagree?",
                "What tone makes me feel defensive?",
                "What pattern do I repeat unintentionally?",
                "What mistake do I forgive easily?",
                "What makes me walk away instead of argue?",
                "What feedback do I take personally?",
                "What do I avoid to keep the peace?",
                "What truth am I slow to admit?",
                "What helps me soften after conflict?",
                "What do I blame myself for unnecessarily?",
                "What shifts me from irritated to calm?",
                "What boundary is non-negotiable for me?",
                "What emotional contradiction do I carry?",
                "What behavior would disappoint me instantly?",
                "What do I value most during conflict?",
            ],
            'romantic': [
                "What romantic gesture makes me soften instantly?",
                "What kind of date would surprise my heart?",
                "What rhythm do I fall into when I feel adored?",
                "What small detail do I always notice about you?",
                "What consistency makes me feel deeply chosen?",
                "What version of us do I quietly romanticize?",
                "How does my love show up when I feel safe?",
                "What small act makes me feel treasured?",
                "What do I cherish most in relationships?",
                "What moment with you replayed in my mind longer than expected?",
                "What romance trope secretly pulls at me?",
                "What kind of intimacy makes me emotional?",
                "What do I need to feel wanted?",
                "What makes me feel soft?",
                "What romance feels unrealistic to me?",
                "What romantic insecurity do I hide?",
                "What makes me feel adored effortlessly?",
                "What does love look like to me when it’s real?",
                "What moment would I call cinematic?",
                "What romantic memory would I never forget?",
            ],
            'erotic': [
                "What part of me reveals desire before I say a word?",
                "What seduces me more—your words, your presence, or the waiting?",
                "What desire do I hold quietly, hoping to be seen?",
                "What role do I soften into when I feel wanted?",
                "What kind of kiss pulls me out of my head?",
                "What ignites my imagination before my body reacts?",
                "What subtle act turns me on unexpectedly?",
                "What power dynamic feels natural to me in intimacy?",
                "What rhythm brings me closer instead of rushing me?",
                "What sound do I make when I let go emotionally?",
                "What makes me feel powerful while being desired?",
                "What kind of mental foreplay works best on me?",
                "What desire have I hinted at more than stated?",
                "What kind of closeness do I crave after a long day?",
                "What kind of attention opens me slowly?",
                "What intimacy fear do I hold beneath desire?",
                "What scent, tone, or sensation pulls me closer?",
                "What position of trust makes me most vulnerable?",
                "What pressure—emotional or energetic—do I prefer?",
                "What do I imagine when I miss you quietly?",
                "What unexpected setting heightens my desire?",
                "What playful role would I actually enjoy exploring?",
                "What kind of reassurance melts me afterward?",
                "What instantly disconnects me from desire?",
                "What touch pulls sound from me without asking?",
                "What phrase makes me feel claimed emotionally?",
                "What kind of slow intimacy do I crave most?",
                "What kind of urgency secretly excites me?",
                "What memory could awaken desire if revisited?",
                "What do I wish you would initiate more often?",
                "What pleasure do I keep private even from myself?",
                "What experience makes me lose awareness of time?",
                "What curiosity have I never voiced but carried?",
                "What kind of surprise feels intimate, not shocking?",
                "What makes me feel adored instead of pursued?",
                "What makes intimacy feel sacred to me?",
                "What emotional risk would I take if trust felt solid?",
                "What desire grows only when safety is present?",
                "What mental invitation works every time?",
                "What kiss do I linger on the longest?",
                "What body language do I show when desire is present?",
                "What fantasy only works when surrender feels safe?",
                "What private desire do I hope you’ll discover gently?",
                "What teasing keeps me engaged without overwhelming me?",
                "What intimate truth about me surprises most people?",
                "What sensation overwhelms me emotionally?",
                "What kind of surprise would impress me deeply?",
                "What erotic energy do I hide behind composure?",
                "What slow burn do I prefer over instant heat?",
                "What kind of passion feels nourishing to me?",
                "What first touch feels most respectful and electric?",
                "What unspoken gesture do I love being noticed?",
                "What desire do I express without words?",
                "What turn-on surprises even me?",
                "What pattern do I fall into when I want you?",
                "What desire do I intellectualize instead of feel?",
                "What fantasy only unfolds with deep trust?",
                "What cue do I give when I’m open to closeness?",
                "What do I imagine you doing when I grow quiet?",
                "What intensity level allows me to fully arrive?",
            ],
        }

        # Clear existing questions in these categories
        total_deleted = 0
        for code in questions_by_category.keys():
            cat = cat_map[code]
            deleted, _ = Question.objects.filter(category=cat).delete()
            total_deleted += deleted

        # Insert new questions
        total_created = 0
        default_consequence = "Skip loses 1 point."
        default_points = 1

        for code, items in questions_by_category.items():
            cat = cat_map[code]
            for idx, text in enumerate(items, start=1):
                Question.objects.create(
                    category=cat,
                    question_text=text,
                    points=default_points,
                    consequence=default_consequence,
                    order=idx,
                )
                total_created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Replaced question bank: deleted {total_deleted} existing, created {total_created} new questions."
        ))
