# pyrefly: ignore [missing-import]
import eel
import os
import frontmatter
import sys
import argparse
import json
import tkinter as tk
from tkinter import filedialog

def get_settings_path():
    if getattr(sys, 'frozen', False):
        base_dir = os.path.dirname(sys.executable)
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, 'settings.json')

def load_settings():
    path = get_settings_path()
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_settings(settings):
    path = get_settings_path()
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(settings, f, indent=4)

def prompt_for_vault():
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)
    print("Prompting user to select Obsidian vault...")
    folder_path = filedialog.askdirectory(title="Select your Obsidian Vault folder")
    return folder_path

@eel.expose
def get_vault_statuses():
    """Returns a dictionary of problem statuses loaded from Obsidian Markdown files."""
    statuses = {}
    settings = load_settings()
    vault_dir = settings.get('vault_path', '')
    
    if not os.path.exists(vault_dir):
        return statuses
        
    for root, dirs, files in os.walk(vault_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for filename in files:
            if filename.endswith('.md'):
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                        title = post.get('title', filename.replace('.md', ''))
                        status = post.get('status', 'Incomplete')
                        statuses[title] = status
                except Exception:
                    pass
                
    return statuses

@eel.expose
def toggle_question_status(title, topic, current_status):
    """Toggles status of a question and updates/creates the .md file in the Obsidian vault."""
    settings = load_settings()
    vault_dir = settings.get('vault_path', '')
    
    if not os.path.exists(vault_dir):
        return current_status

    new_status = 'Completed' if current_status != 'Completed' else 'Incomplete'
    
    # Try to find an existing file for this title
    target_file = None
    for root, dirs, files in os.walk(vault_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for filename in files:
            if filename.endswith('.md'):
                fp = os.path.join(root, filename)
                try:
                    with open(fp, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                        if post.get('title') == title or filename.replace('.md', '') == title:
                            target_file = fp
                            break
                except Exception:
                    pass
        if target_file:
            break

    # If not found, create a new .md file in the vault
    if not target_file:
        # Create a topic folder inside vault if it doesn't exist
        topic_folder = os.path.join(vault_dir, topic.replace('/', '_'))
        os.makedirs(topic_folder, exist_ok=True)
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '_', '-')).rstrip()
        target_file = os.path.join(topic_folder, f"{safe_title}.md")

    try:
        if os.path.exists(target_file):
            with open(target_file, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
        else:
            post = frontmatter.Post("")

        post['title'] = title
        post['topic'] = topic
        post['status'] = new_status

        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(frontmatter.dumps(post))

        return new_status
    except Exception as e:
        print(f"Error saving {title}: {e}")
        return current_status

@eel.expose
def get_roadmap_data():
    """Legacy backward-compatibility endpoint."""
    return []

def start_app():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dev', action='store_true', help='Run in development mode')
    args = parser.parse_args()

    settings = load_settings()
    if 'vault_path' not in settings or not os.path.exists(settings['vault_path']):
        vault_path = prompt_for_vault()
        if vault_path:
            settings['vault_path'] = vault_path
            save_settings(settings)
        else:
            print("No vault selected. Exiting.")
            sys.exit(0)

    if args.dev:
        print("Starting in dev mode. Ensure Vite is running on port 5173.")
        eel.init('frontend') 
        try:
            eel.start({'port': 5173}, host='localhost', port=8000, mode='chrome')
        except EnvironmentError:
            eel.start({'port': 5173}, host='localhost', port=8000, mode='edge')
    else:
        if getattr(sys, 'frozen', False):
            web_dir = os.path.join(sys._MEIPASS, 'web')
        else:
            web_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')
            
        eel.init(web_dir)
        try:
            eel.start('index.html', mode='chrome', port=0)
        except EnvironmentError:
            try:
                eel.start('index.html', mode='edge', port=0)
            except EnvironmentError:
                eel.start('index.html', mode='default', port=0)

if __name__ == '__main__':
    start_app()
