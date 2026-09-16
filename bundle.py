import base64
import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
scratch_dir = r"C:\Users\gupta\.gemini\antigravity\scratch\jewellery-rate-display"

logo_path = os.path.join(base_dir, "assets", "sks_logo.png")
if not os.path.exists(logo_path):
    logo_path = os.path.join(scratch_dir, "assets", "sks_logo.png")

css_path = os.path.join(base_dir, "css", "style.css")
js_path = os.path.join(base_dir, "js", "app.js")
html_path = os.path.join(base_dir, "index.html")

with open(logo_path, "rb") as f:
    b64_logo = base64.b64encode(f.read()).decode("utf-8")

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Replace css link with inline style
html_content = re.sub(
    r'<link rel="stylesheet" href="css/style\.css[^"]*">',
    "<style>\n" + css_content.replace("\\", "\\\\") + "\n</style>",
    html_content
)

# Remove manifest link
html_content = html_content.replace(
    '<link rel="manifest" href="manifest.json">',
    "<!-- Standalone Mobile Offline Single File -->"
)

# Replace sks_logo.png src with base64 data URI
html_content = html_content.replace(
    'src="assets/sks_logo.png"',
    'src="data:image/png;base64,' + b64_logo + '"'
)

# Replace app.js script tag with inline script
html_content = re.sub(
    r'<script src="js/app\.js[^"]*"></script>',
    "<script>\n" + js_content.replace("\\", "\\\\") + "\n</script>",
    html_content
)

# Add inputmode="numeric" for mobile keypad
html_content = html_content.replace('type="number"', 'type="number" inputmode="numeric"')

# Ensure mobile has a clear tap-to-edit hint or floating edit button
mobile_edit_btn_html = """
  <!-- Mobile Quick Edit Button -->
  <button id="mobileQuickEditBtn" class="mobile-quick-edit-btn" onclick="document.getElementById('adminModal').classList.add('active')">
    ✏️ Edit Rates
  </button>
"""

# Insert mobile quick edit button before </body>
html_content = html_content.replace("</body>", mobile_edit_btn_html + "\n</body>")

# Add styling for mobile-quick-edit-btn
mobile_btn_style = """
<style>
.mobile-quick-edit-btn {
  display: none;
}
@media screen and (max-width: 768px), screen and (orientation: portrait) {
  .mobile-quick-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 12px auto 6px auto;
    padding: 10px 20px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #0b1320;
    font-size: 0.95rem;
    font-weight: 800;
    border: 2px solid #fbbf24;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    cursor: pointer;
    z-index: 10;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .mobile-quick-edit-btn:active {
    transform: scale(0.96);
    background: #b45309;
  }
}
</style>
"""
html_content = html_content.replace("</head>", mobile_btn_style + "\n</head>")

output_desktop = r"C:\Users\gupta\Desktop\jewellery_rate_mobile.html"
output_scratch = os.path.join(base_dir, "jewellery_rate_mobile.html")

with open(output_desktop, "w", encoding="utf-8") as f:
    f.write(html_content)

with open(output_scratch, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Successfully generated single-file mobile version! File size: {len(html_content)} bytes")
