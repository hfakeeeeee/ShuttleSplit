import os
import json
import shutil
import zipfile
from datetime import datetime
from typing import Optional
from pathlib import Path

from app.main.configs.MainConfig import settings
from app.main.services.models import ProjectInfo, SimpleProjectResult
from app.main.services.storage import StorageService


class ProjectManagerService:
    def __init__(self):
        self.output_path = Path(settings.OUTPUT_PATH)
        self.base_projects_path = Path(settings.BASE_PROJECTS_PATH)
        self.storage_service = StorageService()
        # Ensure output directories exist
        self.output_path.mkdir(exist_ok=True)
        (self.output_path / "projects").mkdir(exist_ok=True)
        (self.output_path / "zips").mkdir(exist_ok=True)

    async def get_project_zip(self, project_id: str) -> Optional[str]:
        """Get path to project zip file"""
        zip_path = self.output_path / "zips" / f"{project_id}.zip"
        if zip_path.exists():
            return str(zip_path)
        return None

    async def _create_zip(self, project_dir: Path, project_id: str) -> str:
        """Create a zip file of the project"""
        zip_path = self.output_path / "zips" / f"{project_id}.zip"

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in project_dir.rglob('*'):
                if file_path.is_file():
                    # Skip certain files
                    if file_path.name in ['.DS_Store', 'Thumbs.db', '.git']:
                        continue

                    arcname = file_path.relative_to(project_dir)
                    zipf.write(file_path, arcname)

        return str(zip_path)

    async def package_simple_project(
        self,
        generation_id: str,
        project_result: SimpleProjectResult
    ) -> ProjectInfo:
        """Package a simple AI-generated project"""

        # Create project directory
        project_dir = self.output_path / "projects" / generation_id
        if project_dir.exists():
            shutil.rmtree(project_dir)
        project_dir.mkdir(parents=True)

        # Write all files from the AI response
        for filepath, content in project_result.files.items():
            file_path = project_dir / filepath
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

        # Create project info file
        project_info_data = {
            "id": generation_id,
            "name": project_result.project_name,
            "framework": project_result.framework,
            "language": project_result.language,
            "instructions": project_result.instructions,
            "created_at": datetime.now().isoformat(),
            "type": "simple_generated"
        }

        with open(project_dir / "project-info.json", "w", encoding="utf-8") as f:
            json.dump(project_info_data, f, indent=2)

        # Create zip file
        zip_path = await self._create_zip(project_dir, generation_id)
        print("Created zip file:", zip_path)
        # Calculate size
        size_mb = round(os.path.getsize(zip_path) / (1024 * 1024), 2)
        self.storage_service.upload_zip_file(zip_path)

        return ProjectInfo(
            id=generation_id,
            name=project_result.project_name,
            framework=project_result.framework,
            language=project_result.language,
            pages_count=len([f for f in project_result.files.keys() if f.endswith(('.js',
                                                                                   '.jsx',
                                                                                   '.ts',
                                                                                   '.tsx',
                                                                                   '.vue'))]),
            created_at=datetime.now(),
            download_path=f"web-builder-projects/{generation_id}.zip",
            size_mb=size_mb
        )
