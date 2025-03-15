import json

# Input and output file names
input_file = "timezones_TZDB_2025a.json"
output_file = "timezones.js"

# Load the JSON file
def load_json(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

# Extract time zone IDs and aliases
def extract_timezones(data):
    timezones = set()
    for zone in data["zones"]:
        timezones.add(zone["id"])
        timezones.update(zone.get("aliases", []))
    return sorted(timezones)

# Generate JavaScript file
def generate_js_file(timezones, filename):
    with open(filename, "w", encoding="utf-8") as f:
        f.write("// List of all IANA timezones\n")
        f.write("const timezones = [\n")
        for tz in timezones:
            f.write(f'    "{tz}",\n')
        f.write("];")

# Main execution
if __name__ == "__main__":
    data = load_json(input_file)
    timezones = extract_timezones(data)
    generate_js_file(timezones, output_file)
    print(f"JavaScript file '{output_file}' generated successfully.")

