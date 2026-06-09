#!/usr/bin/env python3
import os
import re
import sys
import json
import urllib.request
import urllib.parse
import subprocess

def log(msg):
    print(f"[*] {msg}")

def find_first_unchecked():
    checklist_path = os.path.join(os.path.dirname(__file__), "..", "CONCEPTS_CHECKLIST.md")
    if not os.path.exists(checklist_path):
        print(f"Error: Checklist not found at {checklist_path}")
        sys.exit(1)
        
    with open(checklist_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Match lines like - [ ] Concept Name
    matches = re.findall(r"-\s*\[\s*\]\s*(.*)", content)
    if not matches:
        return None, None
        
    concept = matches[0].strip()
    # Find the domain
    lines = content.splitlines()
    domain = "General"
    current_header = "General"
    for line in lines:
        if line.startswith("## "):
            current_header = line[3:].strip()
        if concept in line and "- [ ]" in line:
            domain = current_header
            break
            
    return concept, domain

def slugify(name):
    # Convert to lowercase, replace spaces/special chars with hyphens
    slug = name.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug).strip("-")
    return slug

def mark_as_checked(concept_name):
    checklist_path = os.path.join(os.path.dirname(__file__), "..", "CONCEPTS_CHECKLIST.md")
    with open(checklist_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Match the specific concept line and change [ ] to [x]
    pattern = re.compile(rf"-\s*\[\s*\]\s*{re.escape(concept_name)}")
    if pattern.search(content):
        new_content = pattern.sub(f"- [x] {concept_name}", content, count=1)
        with open(checklist_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        log(f"Marked '{concept_name}' as checked in CONCEPTS_CHECKLIST.md")
    else:
        log(f"Warning: Could not check off '{concept_name}' automatically")

def generate_agent_prompt(concept, domain, slug):
    prompt = f"""Please add the concept "{concept}" (under domain: "{domain}") to the Physics Notebook.

Follow these strict instructions:
1. Research the mathematical equations, physical constants, real-world analogies, and variables of "{concept}" using web search to ensure accuracy.
2. Create the file `Concepts/{slug}.html` based on the template in `CONCEPT_PATTERN.md`. Ensure:
   - Minimalist academic aesthetics: use vector-like shapes, paths, lines on canvas; no cartoon drawings.
   - Canvas colors are fully synchronized with theme CSS variables (accent, accent-secondary, text-main, bg-color).
   - Horizontal status/dashboard bar on top of the canvas (from y=20 to y=70).
   - Interactive controls are placed above the canvas on small screens, and controls and canvas fit within the device viewport together.
   - Dynamic font scaling is used for canvas text labels.
   - Accessible names / aria attributes are defined for sliders and buttons.
   - All links opening in new tabs have rel="noopener noreferrer".
3. Update `index.html`:
   - Add the concept metadata to the `DATA` array.
   - Add a class `{concept.replace(' ', '')}Visual` extending `BaseVisual` containing a clean, engaging mini-simulation card loop.
   - Integrate the class in the `renderGrid` method's switch-case block.
4. Run accessibility checks by executing `python3 scripts/check_static_accessibility.py` and ensure they pass.
5. Mark the concept "{concept}" as checked off (`- [x] {concept}`) in `CONCEPTS_CHECKLIST.md`.
"""
    return prompt

def generate_with_gemini(concept, domain, slug, api_key):
    model = os.environ.get("GEMINI_MODEL", "gemini-1.5-pro")
    log(f"Using model: {model} to generate '{concept}'...")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    prompt = f"""You are a senior frontend developer and physicist. Your task is to generate the code assets to add the physics concept "{concept}" (domain: "{domain}") to a physics notebook website.

Verify the mathematical and physical accuracy of this concept using web search. Then, produce a JSON object containing the files and edits needed.

The response must be a valid JSON object matching the following structure:
{{
  "concept_html": "FULL HTML contents of the new concept file to be written to Concepts/{slug}.html conforming to CONCEPT_PATTERN.md.",
  "index_data_entry": {{
    "id": "{slug}",
    "title": "{concept}",
    "domain": "{domain}",
    "desc": "A concise, engaging 1-sentence description.",
    "type": "{slug}",
    "href": "Concepts/{slug}.html"
  }},
  "index_visual_class": "JavaScript class code (extending BaseVisual) for the mini-simulation card to be inserted into index.html.",
  "index_switch_case": "switch case statement code to insert into index.html's renderGrid, mapping the type '{slug}' to the visual class."
}}

Guidelines for the generated HTML ('concept_html'):
1. Follow the template and instructions in CONCEPT_PATTERN.md.
2. Structure the HTML with standard links to static CSS and JS relative paths.
3. Incorporate MathJax script setup for LaTeX math block parsing.
4. Implement a responsive canvas animation that demonstrates the physical properties of the concept.
5. Extend the BaseVisual class for drawing logic.
6. Retrieve drawing colors dynamically from the CSS theme custom properties. Do not use hardcoded hex colors on the canvas.
7. Standardize on clean, minimalist academic aesthetics (e.g. vector lines, simple circles, vector paths). No cartoon illustrations.
8. Place all sliders/controls above the canvas for mobile screens, and ensure they fit within the viewport together.
9. Implement a full-width horizontal status bar at the top of the canvas to display live physics variables.
10. Ensure text labels are legible, and utilize responsive canvas font scaling based on canvas width.
11. Implement SVGs in the AI buttons with accessible labels.
12. Use rel="noopener noreferrer" on all external links.

Guidelines for the card mini-sim ('index_visual_class'):
1. Extend BaseVisual.
2. Animate a simple, eye-catching representation of the concept.
3. Synchronize canvas colors with theme variables (`this.accent`, `this.accentSecondary`, `this.color`).
"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "tools": [{"googleSearch": {}}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
            
        text_response = response_data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(text_response)
        return result
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        if 'response_data' in locals():
            print(f"Raw response: {response_data}")
        sys.exit(1)

def apply_changes(slug, result):
    # 1. Write the new concept HTML file
    concept_dir = os.path.join(os.path.dirname(__file__), "..", "Concepts")
    os.makedirs(concept_dir, exist_ok=True)
    concept_path = os.path.join(concept_dir, f"{slug}.html")
    
    with open(concept_path, "w", encoding="utf-8") as f:
        f.write(result["concept_html"])
    log(f"Created concept page at Concepts/{slug}.html")
    
    # 2. Update index.html
    index_path = os.path.join(os.path.dirname(__file__), "..", "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        index_content = f.read()
        
    # Append to DATA array
    data_entry_str = json.dumps(result["index_data_entry"], indent=12)
    # Strip opening curly brace and closing for neat embedding, or format custom
    data_match = re.search(r"const DATA = \[(.*?)\];", index_content, re.DOTALL)
    if data_match:
        data_body = data_match.group(1)
        # Find the last closing brace and insert the new data item before the closing bracket
        last_brace_idx = data_body.rfind("}")
        if last_brace_idx != -1:
            insertion = data_body[:last_brace_idx+1] + ",\n            " + data_entry_str.strip() + data_body[last_brace_idx+1:]
            index_content = index_content.replace(data_body, insertion)
            log("Injected metadata into index.html DATA array")
        else:
            print("Error: Could not parse DATA array format in index.html")
            sys.exit(1)
    else:
        print("Error: Could not find DATA array in index.html")
        sys.exit(1)
        
    # Insert visual class before the SpecialRelativityVisual class or end of class block
    # Let's locate class SpecialRelativityVisual and insert right after it
    rel_visual_match = re.search(r"class SpecialRelativityVisual extends BaseVisual \{.*?^\s*\}\s*^\s*\}", index_content, re.DOTALL | re.MULTILINE)
    if rel_visual_match:
        class_block = rel_visual_match.group(0)
        index_content = index_content.replace(class_block, class_block + "\n\n        " + result["index_visual_class"].strip())
        log("Injected card visualization class into index.html")
    else:
        # Fallback to inserting before BaseVisual or another common class
        print("Warning: Could not locate SpecialRelativityVisual in index.html to insert next class. Trying alternative injection points...")
        # Let's try locating any Visual class
        match_any = re.search(r"class MomentumVisual extends BaseVisual \{.*?^\s*\}\s*^\s*\}", index_content, re.DOTALL | re.MULTILINE)
        if match_any:
            class_block = match_any.group(0)
            index_content = index_content.replace(class_block, class_block + "\n\n        " + result["index_visual_class"].strip())
            log("Injected card visualization class into index.html (fallback momentum)")
        else:
            print("Error: Could not find insert location for visualization class in index.html")
            sys.exit(1)
            
    # Insert switch-case in renderGrid method
    switch_match = re.search(r"switch\s*\(item\.type\)\s*\{(.*?)\}", index_content, re.DOTALL)
    if switch_match:
        switch_body = switch_match.group(1)
        # Append the new switch-case right before the default case
        default_idx = switch_body.find("default:")
        if default_idx != -1:
            new_switch_body = switch_body[:default_idx] + result["index_switch_case"].strip() + "\n                            " + switch_body[default_idx:]
            index_content = index_content.replace(switch_body, new_switch_body)
            log("Injected switch case into index.html renderGrid")
        else:
            print("Error: Could not find default case in renderGrid switch statement")
            sys.exit(1)
    else:
        print("Error: Could not find switch statement in index.html")
        sys.exit(1)
        
    # Save index.html
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_content)
    log("Successfully updated index.html")

def run_verifications():
    log("Running static accessibility checks...")
    script_path = os.path.join(os.path.dirname(__file__), "check_static_accessibility.py")
    res = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
    if res.returncode == 0:
        log("Static accessibility check passed.")
        return True
    else:
        print(f"Accessibility check failed:\n{res.stdout}\n{res.stderr}")
        return False

def main():
    concept, domain = find_first_unchecked()
    if not concept:
        log("No unchecked concepts found in CONCEPTS_CHECKLIST.md! All concepts are complete.")
        return
        
    slug = slugify(concept)
    log(f"Found next unchecked concept: '{concept}' in domain '{domain}' (slug: {slug})")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        log("GEMINI_API_KEY is not set in environment.")
        log("Displaying the instructions and prompt for your AI agent to add this concept:")
        print("="*80)
        print(generate_agent_prompt(concept, domain, slug))
        print("="*80)
    else:
        log("GEMINI_API_KEY is set. Running generation workflow autonomously...")
        res_json = generate_with_gemini(concept, domain, slug, api_key)
        apply_changes(slug, res_json)
        
        # Verify the generated changes
        if run_verifications():
            mark_as_checked(concept)
            log(f"Workflow complete! Successfully added '{concept}' automatically.")
        else:
            log("Error: Verifications failed. Changes have been written but the concept was not marked as checked off.")
            sys.exit(1)

if __name__ == "__main__":
    main()
