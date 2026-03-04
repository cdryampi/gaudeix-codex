import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ParseError

from rest_framework.exceptions import ValidationError


def parse_track_file(document_file):
    """
    Parse a GPX or KML file and extract a GeoJSON dictionary
    (LineString or MultiLineString).
    
    Returns:
        dict: GeoJSON representation of the track.
        
    Raises:
        ValidationError: If the file is not a valid GPX or KML,
                         exceeds size limits, or has too few points.
    """
    # 1. Validate file size (max 5MB as recommended)
    MAX_SIZE_BYTES = 5 * 1024 * 1024
    if document_file.size_bytes > MAX_SIZE_BYTES:
        raise ValidationError(
            f"El fitxer és massa gran ({document_file.size_bytes / 1024 / 1024:.2f} MB). "
            f"El límit és de 5 MB per parseig automàtic."
        )

    # 2. Check extension
    filename = document_file.original_name.lower()
    is_gpx = filename.endswith(".gpx")
    is_kml = filename.endswith(".kml")
    
    if not (is_gpx or is_kml):
        raise ValidationError("Només s'admeten fitxers GPX o KML per extreure el track.")

    # 3. Read and parse XML
    try:
        # Read the file content
        document_file.file.open('rb')
        content = document_file.file.read()
        document_file.file.close()
        
        root = ET.fromstring(content)
    except ParseError:
        raise ValidationError("El fitxer no és un XML vàlid o està corrupte.")
    except Exception as e:
        raise ValidationError(f"Error llegint el fitxer: {str(e)}")

    # 4. Extract coordinates based on format
    lines = []
    
    if is_gpx:
        # GPX Format
        # default namespace might be stripped or present
        # Find all trkpt elements
        ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
        # Try with namespace
        trksegs = root.findall('.//gpx:trkseg', ns)
        if not trksegs:
            # Try without namespace (if elements just have local names)
            trksegs = root.findall('.//{http://www.topografix.com/GPX/1/0}trkseg') + root.findall('.//trkseg')
            
        for trkseg in trksegs:
            segment_points = []
            trkpts = trkseg.findall('{http://www.topografix.com/GPX/1/1}trkpt') + \
                     trkseg.findall('{http://www.topografix.com/GPX/1/0}trkpt') + \
                     trkseg.findall('trkpt')
            
            for pt in trkpts:
                lat = pt.get('lat')
                lon = pt.get('lon')
                if lat and lon:
                    try:
                        segment_points.append([float(lon), float(lat)])
                    except ValueError:
                        pass
            if segment_points:
                lines.append(segment_points)
                
        # Also check rte (routes) if no trk
        if not lines:
            rtes = root.findall('.//gpx:rte', ns) or root.findall('.//rte')
            for rte in rtes:
                segment_points = []
                rtepts = rte.findall('.//gpx:rtept', ns) or rte.findall('.//rtept')
                for pt in rtepts:
                    lat = pt.get('lat')
                    lon = pt.get('lon')
                    if lat and lon:
                        try:
                            segment_points.append([float(lon), float(lat)])
                        except ValueError:
                            pass
                if segment_points:
                    lines.append(segment_points)

    elif is_kml:
        # KML Format
        # Find all LineString coordinates
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        linestrings = root.findall('.//kml:LineString', ns) + root.findall('.//LineString')
        for ls in linestrings:
            coords_elem = ls.find('kml:coordinates', ns)
            if coords_elem is None:
                coords_elem = ls.find('coordinates')
                
            if coords_elem is not None and coords_elem.text:
                coords_text = coords_elem.text.strip()
                segment_points = []
                # KML coordinates are typically space, newline, or comma separated tuples: lon,lat,alt
                coord_strs = coords_text.replace('\n', ' ').split()
                for c_str in coord_strs:
                    parts = c_str.split(',')
                    if len(parts) >= 2:
                        try:
                            segment_points.append([float(parts[0]), float(parts[1])])
                        except ValueError:
                            pass
                if segment_points:
                    lines.append(segment_points)

    # 5. Build GeoJSON
    if not lines:
        raise ValidationError("No s'han trobat coordenades (track o ruta) al fitxer.")
        
    total_points = sum(len(segment) for segment in lines)
    if total_points < 2:
        raise ValidationError("El fitxer conté menys de 2 punts.")

    # Calculate bbox
    lons = [pt[0] for segment in lines for pt in segment]
    lats = [pt[1] for segment in lines for pt in segment]
    bbox = [min(lons), min(lats), max(lons), max(lats)]
    
    # Calculate approximate length (Haversine)
    import math
    def haversine(lon1, lat1, lon2, lat2):
        R = 6371.0 # Earth radius
        dlon = math.radians(lon2 - lon1)
        dlat = math.radians(lat2 - lat1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c
        
    length_km = 0.0
    for segment in lines:
        for i in range(1, len(segment)):
            length_km += haversine(segment[i-1][0], segment[i-1][1], segment[i][0], segment[i][1])

    if len(lines) == 1:
        return {
            "type": "LineString",
            "coordinates": lines[0],
            "num_points": total_points,
            "bbox": bbox,
            "approx_length_km": round(length_km, 2)
        }
    else:
        return {
            "type": "MultiLineString",
            "coordinates": lines,
            "num_points": total_points,
            "bbox": bbox,
            "approx_length_km": round(length_km, 2)
        }
