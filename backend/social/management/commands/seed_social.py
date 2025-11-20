from django.core.management.base import BaseCommand
from social.models import SocialLink

class Command(BaseCommand):
    help = 'Seeds the database with initial social links.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding social links...')

        links_data = [
            {
                'name': 'Codetickets',
                'url': 'https://entradas.codetickets.com/entradas/aj-cabrera-de-mar',
                'color': '#FFFFFF',
                'icon_class': 'fa-solid fa-ticket', # Assuming ticket icon
                'order': 1
            },
            {
                'name': 'Flickr',
                'url': 'https://www.flickr.com/photos/194905564@N08/page4',
                'color': '#24B5FF',
                'icon_class': 'fa-brands fa-flickr',
                'order': 2
            },
            {
                'name': 'Instagram',
                'url': 'https://www.instagram.com/gaudeixcabrera/',
                'color': '#24B5FF',
                'icon_class': 'fa-brands fa-instagram',
                'order': 3
            },
            {
                'name': 'Facebook',
                'url': 'https://www.facebook.com/gaudeixcabrera/',
                'color': '#24B5FF',
                'icon_class': 'fa-brands fa-facebook',
                'order': 4
            }
        ]

        for data in links_data:
            link, created = SocialLink.objects.get_or_create(
                url=data['url'],
                defaults={
                    'icon_class': data['icon_class'],
                    'color': data['color'],
                    'order': data['order']
                }
            )
            
            # Set translations for name (assuming same name for all languages for now)
            # In a real scenario, we might want specific translations
            for lang in ['ca', 'es', 'en', 'fr']:
                link.set_current_language(lang)
                link.name = data['name']
            
            link.save()
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created {data['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"Updated {data['name']}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded social links.'))
