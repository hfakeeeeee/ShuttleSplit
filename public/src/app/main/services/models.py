from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class SimpleGenerationRequest(BaseModel):
    instructions: str = Field(..., description="Description of what you want to build")
    framework: str = Field(default="React", description="Frontend framework (React or Vue)")
    language: str = Field(default="JavaScript", description="Programming language (JS or TS)")
    styling: str = Field(default="TailwindCSS", description="Styling framework (TailwindCSS or NucleusCSS)")
    project_name: str = Field(..., description="Name of the project")
    template: str = Field(default="Dynamic", description="Template to use for the project")

    class Config:
        use_enum_values = True
        extra = "ignore"


class SimpleProjectResult(BaseModel):
    project_name: str
    framework: str
    language: str
    files: dict  # filename -> content mapping
    instructions: str


class Framework(str, Enum):
    REACT = "React"
    VUE = "Vue"


class Language(str, Enum):
    JS = "JS"
    TS = "TS"


class GenerationStatus(BaseModel):
    id: str
    # starting, planning, generating, routing, packaging, completed, failed
    status: str
    progress: int = Field(default=0, ge=0, le=100)
    message: str = ""
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    project_info: Optional['ProjectInfo'] = None


class ProjectInfo(BaseModel):
    id: str
    name: str
    framework: str
    language: str
    pages_count: int
    created_at: datetime
    download_path: str
    size_mb: Optional[float] = None


# Update forward reference
GenerationStatus.model_rebuild()
