from __future__ import annotations

import time
import logging
from django.utils import timezone
from celery import shared_task
from .models import BuildJob, SiteSettings

logger = logging.getLogger(__name__)

@shared_task
def trigger_frontend_build_task(job_id: int) -> None:
    """Tasca asíncrona per simular la compilació i desplegament del frontend."""
    logger.info(f"Starting theme publication build task for Job #{job_id}")
    try:
        job = BuildJob.objects.get(pk=job_id)
    except BuildJob.DoesNotExist:
        logger.error(f"BuildJob #{job_id} does not exist.")
        return

    job.status = "running"
    job.started_at = timezone.now()
    job.save(update_fields=["status", "started_at"])

    try:
        # 1. Simular el temps de compilació dels assets estàtics amb Vite
        time.sleep(5)

        # 2. Publicar els canvis del tema: copiar theme_config a theme_config_published
        settings = SiteSettings.get_solo()
        settings.theme_config_published = job.theme_config
        settings.save(update_fields=["theme_config_published"])

        # 3. Marcar el job com a completat amb èxit
        job.status = "success"
        job.finished_at = timezone.now()
        job.save(update_fields=["status", "finished_at"])
        logger.info(f"BuildJob #{job_id} completed successfully.")

    except Exception as e:
        logger.exception(f"Error during BuildJob #{job_id}: {str(e)}")
        job.status = "failed"
        job.finished_at = timezone.now()
        job.error_message = str(e)
        job.save(update_fields=["status", "finished_at", "error_message"])
