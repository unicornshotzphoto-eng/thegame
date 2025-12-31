from django.core.management.base import BaseCommand

from quiz.models import QuestionCategory

class Command(BaseCommand):
    help = "Rename category label from 'Erotic Knowing' to 'Desirable Knowing' for code 'erotic'"

    def handle(self, *args, **options):
        try:
            cat = QuestionCategory.objects.get(category='erotic')
            old_name = cat.name
            cat.name = 'Desirable Knowing (101-160)'
            if not cat.description or 'Erotic' in cat.description:
                cat.description = 'Desirable Knowing questions (101-160)'
            cat.save(update_fields=['name', 'description'])
            self.stdout.write(self.style.SUCCESS(
                f"Updated category 'erotic': '{old_name}' -> '{cat.name}'"
            ))
        except QuestionCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR("Category with code 'erotic' does not exist."))
