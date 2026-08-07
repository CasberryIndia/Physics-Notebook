import os
import sys
import subprocess
from html.parser import HTMLParser
import tempfile

class ScriptExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_script = False
        self.script_content = []

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            # Only check inline scripts (no src attribute)
            has_src = any(attr[0] == "src" for attr in attrs)
            if not has_src:
                self.in_script = True

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False

    def handle_data(self, data):
        if self.in_script:
            self.script_content.append(data)

def check_syntax(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found - {file_path}")
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    extractor = ScriptExtractor()
    extractor.feed(content)

    if not extractor.script_content:
        print(f"No inline scripts found in {file_path}")
        return True

    combined_script = "\n".join(extractor.script_content)

    # Use node --check to verify syntax
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.js', delete=False) as temp_js:
        temp_js.write(combined_script)
        temp_js_path = temp_js.name

    try:
        # Run node --check
        result = subprocess.run(
            ['node', '--check', temp_js_path],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print(f"Syntax Error in {file_path}:")
            print(result.stderr)
            return False
        else:
            print(f"Syntax check passed for {file_path}")
            return True

    finally:
        if os.path.exists(temp_js_path):
            os.remove(temp_js_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/check_concept_syntax.py <path_to_html_file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    files_to_check = []

    if os.path.isdir(target):
        for root, _, files in os.walk(target):
            for file in files:
                if file.endswith(".html"):
                    files_to_check.append(os.path.join(root, file))
    elif target.endswith(".html"):
        files_to_check.append(target)
    else:
        print(f"Target {target} must be an .html file or a directory.")
        sys.exit(1)

    all_passed = True
    for file_path in files_to_check:
        if not check_syntax(file_path):
            all_passed = False

    if all_passed:
        print("All files passed syntax check.")
        sys.exit(0)
    else:
        print("Syntax check failed for some files.")
        sys.exit(1)
