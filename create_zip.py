import zipfile
import os

def zip_project(output_filename, source_dir):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude folders
            if 'node_modules' in dirs: dirs.remove('node_modules')
            if '.git' in dirs: dirs.remove('.git')
            if 'android/app/build' in dirs: dirs.remove('android/app/build')
            if 'dist' in dirs: dirs.remove('dist')
            
            for file in files:
                # Also exclude specific files if needed
                if file.endswith('.tar.gz') or file.endswith('.zip'): continue
                
                # Exclude hidden files
                if file.startswith('.'): continue
                
                zipf.write(os.path.join(root, file), 
                           os.path.relpath(os.path.join(root, file), 
                           source_dir))

zip_project('project_source.zip', '.')
