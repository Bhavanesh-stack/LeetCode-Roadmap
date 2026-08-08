import os
import shutil
import subprocess
import sys

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(root_dir, 'frontend')
    backend_dir = os.path.join(root_dir, 'backend')
    
    print("Building React Frontend...")
    # Using shell=True for npm commands on Windows
    subprocess.run("npm run build", shell=True, cwd=frontend_dir, check=True)
    
    dist_dir = os.path.join(frontend_dir, 'dist')
    web_dir = os.path.join(backend_dir, 'web')
    
    # Terminate running instances of the executable if open
    try:
        subprocess.run("taskkill /F /IM LeetCodeRoadmap.exe", shell=True, capture_output=True)
    except Exception:
        pass

    if os.path.exists(web_dir):
        print(f"Removing old web directory: {web_dir}")
        shutil.rmtree(web_dir)
        
    print(f"Copying {dist_dir} to {web_dir}")
    shutil.copytree(dist_dir, web_dir)
    
    print("Running PyInstaller...")
    # Assuming the virtualenv is used, or pyinstaller is available in path.
    # We will use sys.executable -m PyInstaller if possible, or just 'pyinstaller'
    sep = ';' if os.name == 'nt' else ':'
    
    pyinstaller_cmd = [
        "pyinstaller",
        "--name", "LeetCodeRoadmap",
        f"--icon={os.path.join(root_dir, 'icon.ico')}",
        "--add-data", f"web{sep}web",
        "--noconsole",
        "--onefile",
        "main.py"
    ]
    
    # We need to run pyinstaller inside the backend directory or activate the venv
    # Since we created venv in root, let's call pyinstaller from the venv
    venv_pyinstaller = os.path.join(root_dir, 'venv', 'Scripts', 'pyinstaller.exe')
    if os.path.exists(venv_pyinstaller):
        pyinstaller_cmd[0] = venv_pyinstaller
    else:
        # Fallback to module execution via venv python
        venv_python = os.path.join(root_dir, 'venv', 'Scripts', 'python.exe')
        if os.path.exists(venv_python):
            pyinstaller_cmd = [venv_python, "-m", "PyInstaller"] + pyinstaller_cmd[1:]
        
    subprocess.run(pyinstaller_cmd, cwd=backend_dir, check=True)
    
    print("Build complete! Executable is located in backend/dist/")

if __name__ == "__main__":
    main()
