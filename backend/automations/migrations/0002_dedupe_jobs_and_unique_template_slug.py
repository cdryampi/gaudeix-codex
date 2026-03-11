from django.db import migrations


def dedupe_automation_jobs(apps, schema_editor):
    AutomationJob = apps.get_model("automations", "AutomationJob")
    AutomationRun = apps.get_model("automations", "AutomationRun")

    template_slugs = (
        AutomationJob.objects.values_list("template_slug", flat=True)
        .order_by("template_slug")
        .distinct()
    )

    for template_slug in template_slugs:
        jobs = list(
            AutomationJob.objects.filter(template_slug=template_slug).order_by("id")
        )
        if len(jobs) < 2:
            continue

        keeper = jobs[0]
        for duplicate in jobs[1:]:
            duplicate_runs = AutomationRun.objects.filter(automation=duplicate).order_by(
                "started_at", "id"
            )
            for run in duplicate_runs:
                if (
                    run.window_key
                    and AutomationRun.objects.filter(
                        automation=keeper, window_key=run.window_key
                    ).exists()
                ):
                    run.delete()
                    continue

                run.automation = keeper
                run.save(update_fields=["automation"])

            if duplicate.last_run_at and (
                keeper.last_run_at is None or duplicate.last_run_at > keeper.last_run_at
            ):
                keeper.last_run_at = duplicate.last_run_at
                keeper.last_run_status = duplicate.last_run_status
                keeper.save(update_fields=["last_run_at", "last_run_status"])

            duplicate.delete()


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("automations", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            dedupe_automation_jobs, migrations.RunPython.noop
        ),
    ]
