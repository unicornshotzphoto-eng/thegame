#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from quiz.models import QuestionCategory

# Create categories
categories_data = [
    {'category': 'spiritual_knowing', 'name': 'Spiritual', 'description': 'Spiritual knowledge questions'},
    {'category': 'mental_knowing', 'name': 'Mental', 'description': 'Mental knowledge questions'},
    {'category': 'physical_knowing', 'name': 'Physical', 'description': 'Physical knowledge questions'},
    {'category': 'disagreeables_truth', 'name': 'Truth Checks', 'description': 'Disagreeable truth questions'},
    {'category': 'romantic_knowing', 'name': 'Romantic', 'description': 'Romantic knowledge questions'},
    {'category': 'erotic_knowing', 'name': 'Erotic', 'description': 'Erotic knowledge questions'},
    {'category': 'creative_fun', 'name': 'Creative', 'description': 'Creative and fun questions'},
]

for cat_data in categories_data:
    cat, created = QuestionCategory.objects.get_or_create(
        category=cat_data['category'],
        defaults={
            'name': cat_data['name'],
            'description': cat_data['description']
        }
    )
    print(f"{'Created' if created else 'Already exists'}: {cat.name}")

print(f"\nTotal categories: {QuestionCategory.objects.count()}")
