import logging
import os
from collections import defaultdict
from io import BytesIO

from django.template.loader import render_to_string
from site_settings.models import SiteSettings
from django.conf import settings
from django.utils import timezone
from xhtml2pdf import pisa

logger = logging.getLogger(__name__)

def generate_events_pdf(events, request, start_date=None, end_date=None, categories=None, format="A4"):
    """
    Generates a PDF using xhtml2pdf from a queryset of events.
    """
    events_by_date = defaultdict(list)
    sorted_events = sorted(
        events,
        key=lambda event: (
            event.start_at or timezone.datetime.max.replace(tzinfo=timezone.utc),
            getattr(event, "id", 0) or 0,
        ),
    )
    for event in sorted_events:
        if event.start_at:
            events_by_date[event.start_at.date()].append(event)
            
    events_by_date_sorted = sorted(events_by_date.items())
    
    num_cols = 5 if str(format).upper() == "A4" else 7
    cells = []
    palette = ["#fadbd8", "#A3E4D7", "#F9E79F", "#e59866", "#aed6f1", "#e5e7e9"]
    
    for i, (date, day_events) in enumerate(events_by_date_sorted):
        cells.append({
            'type': 'date',
            'date': date,
            'color': palette[i % len(palette)]
        })
        for event in day_events:
            cells.append({
                'type': 'event',
                'event': event,
            })
            
    grid_rows = []
    for i in range(0, len(cells), num_cols):
        row = cells[i:i + num_cols]
        while len(row) < num_cols:
            row.append({'type': 'empty'})
        grid_rows.append(row)
        
    cell_width = round(100.0 / num_cols, 2)
    
    base_url = request.build_absolute_uri('/') if request else getattr(settings, 'SITE_URL', 'http://localhost:8000/')
    
    css_path = os.path.join(settings.BASE_DIR, 'static', 'events', 'pdf', 'style.css')
    css_content = ""
    if os.path.exists(css_path):
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
            
    site_settings = SiteSettings.get_solo()
    site_name = site_settings.site_name if site_settings.site_name else "Mataró"

    # Include CSS directly in context to render in head
    context = {
        'grid_rows': grid_rows,
        'cell_width': cell_width,
        'start_date': start_date,
        'end_date': end_date,
        'categories': categories,
        'format': format,
        'generated_at': timezone.now(),
        'base_url': base_url,
        'site_name': site_name,
        'style_block': f'<style>\n{css_content}\n</style>' if css_content else '',
    }
    
    html_string = render_to_string('events/pdf/program.html', context)
    
    def link_callback(uri, rel):
        # Allow absolute URLs to just pass through
        if uri.startswith('http://') or uri.startswith('https://'):
            return uri
            
        # Resolve local paths
        sUrl = settings.STATIC_URL
        sRoot = settings.STATIC_ROOT or os.path.join(settings.BASE_DIR, 'static')
        mUrl = settings.MEDIA_URL
        mRoot = settings.MEDIA_ROOT

        if mUrl and uri.startswith(mUrl):
            path = os.path.join(mRoot, uri.replace(mUrl, "", 1))
        elif sUrl and uri.startswith(sUrl):
            path = os.path.join(sRoot, uri.replace(sUrl, "", 1))
        else:
            return uri
            
        if not os.path.isfile(str(path)):
            return uri
        return str(path)

    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html_string.encode("utf-8")), result, link_callback=link_callback)
    
    if not pdf.err:
        return result.getvalue()
    
    raise Exception(f"Error generating PDF with xhtml2pdf: {pdf.err}")
