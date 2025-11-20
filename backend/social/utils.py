"""
Utility functions for the Social app.
"""

import re

def validate_hex_color(value):
    """
    Validates if the provided string is a valid hex color code.
    Accepts 3 or 6 digit hex codes, with or without '#'.
    
    Args:
        value (str): The color string.
        
    Returns:
        bool: True if valid, False otherwise.
    """
    if not value:
        return False
    # Regex for hex color: optional #, followed by 3 or 6 hex digits
    pattern = re.compile(r'^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$')
    return bool(pattern.match(value))

def format_hex_color(value):
    """
    Formats a hex color string to ensure it starts with '#'.
    Assumes input is a valid hex string (or close to it).
    
    Args:
        value (str): The color string.
        
    Returns:
        str: The formatted color string (e.g., "#FFFFFF").
    """
    if not value:
        return ""
    value = value.strip()
    if not value.startswith("#"):
        return f"#{value}"
    return value
