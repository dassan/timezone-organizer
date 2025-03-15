import sys
import re
from xml.dom import minidom

def extract_colors_from_svg(svg_file_path):
    # Parse the SVG file
    try:
        svg_dom = minidom.parse(svg_file_path)
        
        # Get all rectangle elements (skip the first one as it's the background)
        rects = svg_dom.getElementsByTagName('rect')
        
        # Skip the first rectangle (background)
        hour_rects = rects[1:25]  # Get the 24 hour rectangles
        
        # Extract fill colors
        colors = []
        for rect in hour_rects:
            color = rect.getAttribute('fill')
            colors.append(color)
        
        return colors
    except Exception as e:
        print(f"Error parsing SVG: {e}", file=sys.stderr)
        return None

def generate_js_dict(colors):
    if not colors or len(colors) != 24:
        print("Error: Expected 24 colors, but got", len(colors) if colors else 0, file=sys.stderr)
        return None
    
    # Generate JavaScript dictionary
    js_dict = "const hourColors = {\n"
    
    for hour, color in enumerate(colors):
        js_dict += f"  {hour}: '{color}',\n"
    
    js_dict += "};"
    
    return js_dict

def main():
    if len(sys.argv) < 2:
        print("Usage: python svg_to_hours.py <svg_file_path> [output_file_path]")
        return
    
    svg_file_path = sys.argv[1]
    
    # Extract colors from SVG
    colors = extract_colors_from_svg(svg_file_path)
    if not colors:
        return
    
    # Generate JavaScript dictionary
    js_dict = generate_js_dict(colors)
    if not js_dict:
        return
    
    # Output to file or stdout
    if len(sys.argv) > 2:
        output_file_path = sys.argv[2]
        try:
            with open(output_file_path, 'w') as f:
                f.write(js_dict)
            print(f"JavaScript dictionary written to {output_file_path}")
        except Exception as e:
            print(f"Error writing to file: {e}", file=sys.stderr)
    else:
        print(js_dict)

if __name__ == "__main__":
    main()