from django.core.management.base import BaseCommand

from automations.services import bootstrap_default_automations


class Command(BaseCommand):
    help = "Creates or updates the default automation jobs."

    def handle(self, *args, **options):
        jobs = bootstrap_default_automations()
        for job in jobs:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Automation ready: {job.name} [{job.template_slug}] next_run_at={job.next_run_at}"
                )
            )
