"""
Complete Template Setup Script - Creates all templates and categories

Usage:
    cd backend/scrollvite
    python manage.py shell < setup_all_templates.py

Or interactively:
    python manage.py shell
    exec(open('setup_all_templates.py').read())

Or as standalone script:
    cd backend/scrollvite
    python setup_all_templates.py
"""

import os
import sys
import django

# Setup Django environment (needed when running as standalone script)
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scrollvite.settings')
    django.setup()

from templates_app.models import Category, Template
from django.db import transaction

print("🚀 Starting Template Setup...")
print("="*60)

# ============================================================================
# SCHEMAS
# ============================================================================

royal_wedding_schema = {
    "hero": {
        "bride_name": "Priya",
        "groom_name": "Rahul",
        "couple_photo": "",
        "greeting": "Together Forever",
        "tagline": "Two hearts, one soul",
        "wedding_date": "2024-12-25"
    },
    "couple_story": {
        "enabled": True,
        "title": "How We Met",
        "content": "Our story began on a beautiful spring day when fate brought us together at a friend's gathering. From that moment, we knew we had found something special."
    },
    "venue": {
        "name": "Grand Palace Hotel",
        "city": "Jaipur",
        "address": "MG Road, Jaipur, Rajasthan",
        "google_maps_link": ""
    },
    "events": [
        {
            "name": "Mehendi Ceremony",
            "date": "2024-12-23",
            "time": "04:00 PM",
            "venue": "Grand Palace Lawns",
            "dress_code": "Traditional Attire",
            "description": "Join us for a colorful evening of music, dance and henna art"
        },
        {
            "name": "Sangeet Night",
            "date": "2024-12-24",
            "time": "07:00 PM",
            "venue": "Grand Ballroom",
            "dress_code": "Festive Wear",
            "description": "An evening filled with songs, performances and celebrations"
        },
        {
            "name": "Wedding Ceremony",
            "date": "2024-12-25",
            "time": "10:00 AM",
            "venue": "Grand Palace Mandap",
            "dress_code": "Traditional Formal",
            "description": "The sacred union ceremony"
        },
        {
            "name": "Reception",
            "date": "2024-12-25",
            "time": "07:00 PM",
            "venue": "Grand Ballroom",
            "dress_code": "Formal Attire",
            "description": "Dinner and celebrations"
        }
    ],
    "closing": {
        "message": "We look forward to celebrating with you!",
        "signature": "With love and blessings"
    }
}

photo_story_schema = {
    "hero": {
        "bride_name": "Sarah",
        "groom_name": "Michael",
        "tagline": "Two hearts, one beautiful journey",
        "wedding_date": "2024-06-15",
        "couple_photo": ""
    },
    "our_story": {
        "timeline": [
            {
                "season": "Spring 2018",
                "title": "First Meet",
                "description": "We met at a cozy coffee shop on a rainy afternoon. Little did we know it was the beginning of something beautiful."
            },
            {
                "season": "Summer 2018",
                "title": "First Date",
                "description": "Our first official date was at a concert in the park. The music was lovely, but we only had eyes for each other."
            },
            {
                "season": "Winter 2023",
                "title": "The Proposal",
                "description": "Under the golden sunset on a beach, surrounded by our favorite memories, the question was popped. Of course, the answer was yes!"
            },
            {
                "season": "Summer 2024",
                "title": "The Big Day",
                "description": "And now, we invite you to celebrate our love story as we begin this new chapter together."
            }
        ]
    },
    "wedding_details": {
        "date": "2024-06-15",
        "time": "4:00 PM",
        "venue_name": "Grand Ballroom",
        "venue_address": "123 Main Street, City",
        "dress_code": "Formal Attire"
    },
    "photo_gallery": {
        "photos": []
    },
    "rsvp": {
        "message": "We would be honored to have you celebrate with us on our special day.",
        "deadline": "2024-05-15",
        "contact_email": "rsvp@ourwedding.com",
        "contact_phone": "+1 (555) 123-4567",
        "additional_info": "Please let us know of any dietary restrictions."
    }
}

# ============================================================================
# CATEGORIES
# ============================================================================

categories_data = [
    {'name': 'Wedding', 'slug': 'wedding'},
    {'name': 'Birthday', 'slug': 'birthday'},
    {'name': 'Anniversary', 'slug': 'anniversary'},
]

print("\n📁 Setting up categories...")
for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults={
            'name': cat_data['name'],
            'is_active': True
        }
    )
    status = "✅ Created" if created else "📌 Exists"
    print(f"   {status}: {category.name}")

# ============================================================================
# TEMPLATES
# ============================================================================

templates_data = [
    {
        'title': 'Royal Wedding Invitation',
        'category_slug': 'wedding',
        'schema': royal_wedding_schema,
        'price': 1299.00,
        'template_component': 'RoyalWeddingTemplate',
        'is_published': True,
        'is_preview': True,
    },
    {
        'title': 'Photo Story Wedding',
        'category_slug': 'wedding',
        'schema': photo_story_schema,
        'price': 999.00,
        'template_component': 'PhotoStoryTemplate',
        'is_published': True,
        'is_preview': True,
    },
]

print("\n🎨 Setting up templates...")
with transaction.atomic():
    for tpl_data in templates_data:
        category = Category.objects.get(slug=tpl_data['category_slug'])
        
        # Check if template exists by title
        existing = Template.objects.filter(title=tpl_data['title']).first()
        
        if existing:
            print(f"\n   ⚠️  Template exists: {tpl_data['title']}")
            print(f"      Current component: {existing.template_component}")
            print(f"      Updating schema and settings...")
            
            # Update existing template
            existing.schema = tpl_data['schema']
            existing.price = tpl_data['price']
            existing.template_component = tpl_data['template_component']
            existing.is_published = tpl_data['is_published']
            existing.is_preview = tpl_data['is_preview']
            existing.category = category
            existing.save()
            
            print(f"      ✅ Updated successfully (ID: {existing.id})")
        else:
            # Create new template
            template = Template.objects.create(
                title=tpl_data['title'],
                category=category,
                schema=tpl_data['schema'],
                price=tpl_data['price'],
                template_component=tpl_data['template_component'],
                is_published=tpl_data['is_published'],
                is_preview=tpl_data['is_preview'],
                is_active=True,
            )
            print(f"\n   ✅ Created: {template.title}")
            print(f"      ID: {template.id}")
            print(f"      Component: {template.template_component}")
            print(f"      Price: ₹{template.price}")

# ============================================================================
# SUMMARY
# ============================================================================

print("\n" + "="*60)
print("📊 DATABASE SUMMARY")
print("="*60)

print(f"\n📁 Categories: {Category.objects.count()}")
for cat in Category.objects.all():
    template_count = Template.objects.filter(category=cat).count()
    print(f"   • {cat.name}: {template_count} template(s)")

print(f"\n🎨 Templates: {Template.objects.count()}")
for tpl in Template.objects.all():
    status_icons = []
    if tpl.is_published:
        status_icons.append("✅ Published")
    if tpl.is_preview:
        status_icons.append("🏠 Preview")
    if not tpl.is_active:
        status_icons.append("⏸️ Inactive")
    
    status = " | ".join(status_icons) if status_icons else "⏸️ Draft"
    print(f"   • {tpl.title}")
    print(f"     Component: {tpl.template_component} | Price: ₹{tpl.price}")
    print(f"     Status: {status}")

print(f"\n📈 Statistics:")
print(f"   • Published: {Template.objects.filter(is_published=True).count()}")
print(f"   • Preview (Homepage): {Template.objects.filter(is_preview=True).count()}")
print(f"   • Active: {Template.objects.filter(is_active=True).count()}")

print("\n" + "="*60)
print("✨ Setup Complete!")
print("="*60)
print("\n💡 Next Steps:")
print("   1. Visit frontend to see templates in action")
print("   2. Add template preview images in admin panel")
print("   3. Test purchase flow")
print("   4. Customize schemas as needed")
print("="*60)