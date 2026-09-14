import requests
import csv
from io import StringIO

# Fetch the CSV file
url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CHAT%20BOOT%20QUESTIONARIO%20PARA%20COTAR%20O%20INCENDIO%20%281%29-l5fBqdAYu6iJaloM7h9trYMWD2eLAC.csv"

try:
    response = requests.get(url)
    response.raise_for_status()
    
    # Parse CSV content
    csv_content = response.text
    print("CSV Content Preview:")
    print("=" * 50)
    print(csv_content[:1000])  # First 1000 characters
    print("=" * 50)
    
    # Parse as CSV
    csv_reader = csv.reader(StringIO(csv_content))
    rows = list(csv_reader)
    
    print(f"\nTotal rows: {len(rows)}")
    print("\nFirst few rows:")
    for i, row in enumerate(rows[:10]):
        print(f"Row {i}: {row}")
        
    # Analyze structure
    print(f"\nColumns in first row: {len(rows[0]) if rows else 0}")
    
except Exception as e:
    print(f"Error fetching or parsing CSV: {e}")
