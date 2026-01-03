from django.core.management.base import BaseCommand
from gardens.models import Plant


class Command(BaseCommand):
    help = 'Create initial plant seed templates'

    def handle(self, *args, **options):
        plants_data = [
            {
                'id': 'sunflower',
                'name': 'Sunflower',
                'emoji': '🌻',
                'description': 'A bright yellow sunflower that loves the sun. Perfect for beginners.',
                'duration_days': 7,
                'base_growth_rate': 0.14,  # 14% per day
                'difficulty': 'easy',
            },
            {
                'id': 'rose',
                'name': 'Rose',
                'emoji': '🌹',
                'description': 'A classic red rose representing love and care. Moderate difficulty.',
                'duration_days': 12,
                'base_growth_rate': 0.08,  # 8% per day
                'difficulty': 'medium',
            },
            {
                'id': 'orchid',
                'name': 'Orchid',
                'emoji': '🌸',
                'description': 'An exotic orchid that requires consistent care. Challenging.',
                'duration_days': 14,
                'base_growth_rate': 0.07,  # 7% per day
                'difficulty': 'hard',
            },
            {
                'id': 'cherry_blossom',
                'name': 'Cherry Blossom',
                'emoji': '🌸',
                'description': 'Delicate pink cherry blossoms. Medium difficulty.',
                'duration_days': 10,
                'base_growth_rate': 0.10,  # 10% per day
                'difficulty': 'medium',
            },
            {
                'id': 'lily',
                'name': 'Lily',
                'emoji': '🥀',
                'description': 'An elegant white lily. Easy to moderate difficulty.',
                'duration_days': 9,
                'base_growth_rate': 0.11,  # 11% per day
                'difficulty': 'easy',
            },
            {
                'id': 'tulip',
                'name': 'Tulip',
                'emoji': '🌷',
                'description': 'A vibrant spring tulip in your chosen color. Easy to grow.',
                'duration_days': 7,
                'base_growth_rate': 0.14,  # 14% per day
                'difficulty': 'easy',
            },
            {
                'id': 'lotus',
                'name': 'Lotus',
                'emoji': '🪷',
                'description': 'A sacred lotus flower. Represents growth and purity.',
                'duration_days': 15,
                'base_growth_rate': 0.067,  # 6.7% per day
                'difficulty': 'hard',
            },
            {
                'id': 'daisy',
                'name': 'Daisy',
                'emoji': '🌼',
                'description': 'A cheerful yellow and white daisy. Great for beginners.',
                'duration_days': 6,
                'base_growth_rate': 0.167,  # 16.7% per day
                'difficulty': 'easy',
            },
        ]

        for plant_data in plants_data:
            plant, created = Plant.objects.get_or_create(
                id=plant_data['id'],
                defaults={
                    'name': plant_data['name'],
                    'emoji': plant_data['emoji'],
                    'description': plant_data['description'],
                    'duration_days': plant_data['duration_days'],
                    'base_growth_rate': plant_data['base_growth_rate'],
                    'difficulty': plant_data['difficulty'],
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created plant: {plant.name}')
                )
            else:
                self.stdout.write(f'Plant {plant.name} already exists')

        self.stdout.write(
            self.style.SUCCESS('Successfully created all plant templates')
        )
