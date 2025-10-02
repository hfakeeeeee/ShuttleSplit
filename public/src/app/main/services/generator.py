import json
import logging
import os
from datetime import datetime
from typing import Optional, Callable
from openai import AzureOpenAI

from app.main.configs.MainConfig import settings
from app.main.services.models import SimpleProjectResult


class SimpleGeneratorService:
    def __init__(self):
        # Azure OpenAI configuration
        self.client = AzureOpenAI(
            api_version=settings.AZURE_API_VERSION,
            azure_endpoint=settings.AZURE_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY
        )
        self.logger = logging.getLogger(__name__)

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

        # Set base directory for prompts
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        self.prompts_dir = os.path.join(self.base_dir, 'prompts')

    def _load_instruction_template(self, framework: str, styling: str, template: str) -> str:
        """
        Load instruction template for the specified framework and styling.
        Falls back to react tailwind if framework-specific template doesn't exist.
        """
        framework_lower = framework.lower()
        styling_lower = styling.lower()
        template_lower = template.lower()

        if template_lower == "azuredashboard":
            if styling_lower == "nucleuscss":
                template_file = f"{framework_lower}_nucleus_azure_portal_instruction.md"
            else:
                template_file = f"{framework_lower}_azure_portal_instruction.md"

        # Determine template file based on styling
        elif styling_lower == "nucleuscss":
            template_file = f"{framework_lower}_nucleus_instruction.md"
        else:
            # Default to tailwind (existing templates)
            template_file = f"{framework_lower}_instruction.md"

        template_path = os.path.join(self.prompts_dir, template_file)
        print(template_path)

        # If framework-specific template doesn't exist, use react as default
        if not os.path.exists(template_path):
            if template_lower == "azuredashboard":
                if styling_lower == "nucleuscss":
                    # Try React nucleus azure portal template
                    template_path = os.path.join(self.prompts_dir, 'react_nucleus_azure_portal_instruction.md')
                    if not os.path.exists(template_path):
                        # Fall back to regular azure portal template
                        template_path = os.path.join(self.prompts_dir, 'react_azure_portal_instruction.md')
                        if not os.path.exists(template_path):
                            # Fall back to nucleus template
                            template_path = os.path.join(self.prompts_dir, 'react_nucleus_instruction.md')
                            if not os.path.exists(template_path):
                                # Final fallback to regular react template
                                template_path = os.path.join(self.prompts_dir, 'react_instruction.md')
                                self.logger.warning(f"No azure-portal nucleus template found for {framework}")
                else:
                    # Try to fall back to react azure portal template
                    template_path = os.path.join(self.prompts_dir, 'react_azure_portal_instruction.md')
                    if not os.path.exists(template_path):
                        # If azure portal template doesn't exist, fall back to regular react template
                        template_path = os.path.join(self.prompts_dir, 'react_instruction.md')
                        self.logger.warning(f"No azure-portal template found for {framework}")
            elif styling_lower == "nucleuscss":
                # Try to fall back to react nucleus template
                template_path = os.path.join(self.prompts_dir, 'react_nucleus_instruction.md')
                if not os.path.exists(template_path):
                    # If nucleus template doesn't exist, fall back to regular react template
                    template_path = os.path.join(self.prompts_dir, 'react_instruction.md')
                    self.logger.warning(f"No nucleus template found for {framework}, using React tailwind as fallback")
            else:
                template_path = os.path.join(self.prompts_dir, 'react_instruction.md')
                self.logger.warning(f"No template found for {framework}, using React template as fallback")

        try:
            with open(template_path, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            self.logger.error(f"Template file not found: {template_path}")
            # Return a basic fallback template
            return self._get_fallback_template()
        except Exception as e:
            self.logger.error(f"Error reading template file: {str(e)}")
            return self._get_fallback_template()

    def _get_fallback_template(self) -> str:
        """Fallback template if file loading fails"""
        return """Create a modern web application for: {instructions}

REQUIREMENTS:
- Framework: {framework} with {language}
- Project name: {project_name}
- Build: 8+ files with proper navigation
- Style: Modern, clean design
- Responsive: Mobile-first approach

OUTPUT FORMAT:
Return ONLY valid JSON with properly escaped strings:
{{
  "project_name": "{project_name}",
  "framework": "{framework}",
  "language": "{language}",
  "instructions": "Brief instructions for the project",
  "files": {{
    "package.json": "Complete package.json with all dependencies",
    "src/App.{main_ext}": "Main application component"
  }}
}}"""

    async def generate_complete_project(
        self,
        instructions: str,
        framework: str = "React",
        language: str = "JavaScript",
        styling: str = "TailwindCSS",
        project_name: str = "My Project",
        template: str = "Dynamic",
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> SimpleProjectResult:
        """
        Generate a complete React project with AI freedom.
        Focused on React with JavaScript or TypeScript.
        """
        try:
            if progress_callback:
                progress_callback(10, "AI is analyzing your request...")

            # Create instruction with specific framework, language, and styling, template
            ultimate_instruction = self._create_ultimate_instruction(instructions,
                                                                     framework,
                                                                     language,
                                                                     styling,
                                                                     project_name,
                                                                     template)

            if progress_callback:
                progress_callback(30, f"AI is designing the complete solution with {styling} styling...")

            # Single AI call to generate everything
            response = await self._call_llm(ultimate_instruction)

            if progress_callback:
                progress_callback(70, "AI is finalizing the project...")

            # Parse the AI's complete response
            project_result = self._parse_project_response(response, project_name)

            if progress_callback:
                progress_callback(90, "Project ready!")

            return project_result

        except Exception as e:
            self.logger.error(f"Failed to generate project: {str(e)}")

    def _create_ultimate_instruction(self,
                                     instructions: str,
                                     framework: str,
                                     language: str,
                                     styling: str,
                                     project_name: str,
                                     template: str) -> str:
        """
        Create framework-specific instruction by loading from template file.
        """

        # Determine file extensions and imports based on language and framework
        if language.lower() in ['typescript', 'ts']:
            file_ext = "ts"
            if framework.lower() == 'vue':
                main_ext = "ts"  # Vue uses .ts for TypeScript, not .tsx
                config_files = '''
    "tsconfig.json": "{\\"compilerOptions\\":
    {\\"target\\": \\"ES2020\\", \\"lib\\": [\\"DOM\\", \\"DOM.Iterable\\", \\"ES6\\"],
    \\"allowJs\\": false, \\"skipLibCheck\\": true, \\"esModuleInterop\\": false,
    \\"allowSyntheticDefaultImports\\": true, \\"strict\\": true, \\"forceConsistentCasingInFileNames\\": true,
    \\"moduleResolution\\": \\"bundler\\", \\"resolveJsonModule\\": true, \\"isolatedModules\\": true,
    \\"noEmit\\": true, \\"jsx\\": \\"preserve\\"}, \\"include\\": [\\"src/**/*.ts\\",
    \\"src/**/*.d.ts\\", \\"src/**/*.tsx\\", \\"src/**/*.vue\\"],
    \\"references\\": [{\\"path\\": \\"./tsconfig.node.json\\"}]}",
    "tsconfig.node.json": "{\\"compilerOptions\\": {\\"composite\\": true, \\"skipLibCheck\\": true,
    \\"module\\": \\"ESNext\\", \\"moduleResolution\\": \\"bundler\\", \\"allowSyntheticDefaultImports\\": true},
    \\"include\\": [\\"vite.config.ts\\"]}",
    "src/vite-env.d.ts": "/// <reference types=\\"vite/client\\" />",'''
            else:
                main_ext = "tsx"  # React uses .tsx for TypeScript
                config_files = '''
    "tsconfig.json": "{\\"compilerOptions\\":
    {\\"target\\": \\"ES2020\\", \\"lib\\": [\\"DOM\\", \\"DOM.Iterable\\", \\"ES6\\"],
    \\"allowJs\\": false, \\"skipLibCheck\\": true, \\"esModuleInterop\\": false,
    \\"allowSyntheticDefaultImports\\": true, \\"strict\\": true, \\"forceConsistentCasingInFileNames\\": true,
    \\"moduleResolution\\": \\"bundler\\", \\"resolveJsonModule\\": true, \\"isolatedModules\\": true,
    \\"noEmit\\": true, \\"jsx\\": \\"react-jsx\\"}, \\"include\\": [\\"src\\"]},'''
        else:
            file_ext = "js"
            if framework.lower() == 'vue':
                main_ext = "js"  # Vue uses .js for JavaScript
            else:
                main_ext = "jsx"  # React uses .jsx for JavaScript - ALWAYS use .jsx for React JS files
            config_files = ""
            
        # Extra validation for React to ensure consistent file extensions
        if framework.lower() == 'react':
            self.logger.info(f"React project with {language} - using .{main_ext} extension for component files")
            # Ensure we always use correct extension - this is critical for project stability
            if language.lower() in ['typescript', 'ts']:
                main_ext = "tsx"  # Always use .tsx for React TypeScript components
            else:
                main_ext = "jsx"  # Always use .jsx for React JavaScript components

        # Load the instruction template with styling parameter
        template_content = self._load_instruction_template(framework, styling, template)

        # Format the template with the provided variables
        try:
            formatted_instruction = template_content.format(
                instructions=instructions,
                framework=framework,
                language=language,
                styling=styling,
                project_name=project_name,
                file_ext=file_ext,
                main_ext=main_ext,
                config_files=config_files
            )
            return formatted_instruction
        except KeyError as e:
            self.logger.error(f"Template formatting error - missing variable: {str(e)}")
            # Return template with basic substitution
            return template_content.replace(
                "{instructions}", instructions).replace(
                    "{framework}", framework).replace(
                        "{language}", language).replace(
                            "{styling}", styling).replace(
                                "{project_name}", project_name)

    async def _call_llm(self, instruction: str) -> str:
        """Call Azure OpenAI with the ultimate instruction"""
        try:
            start_time = datetime.now()
            self.logger.info(f"Calling Azure OpenAI with ultimate instruction ({len(instruction)} chars)")

            response = self.client.chat.completions.create(
                model=settings.AZURE_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a world-class developer with unlimited creative freedom. "
                            "Create amazing web applications. "
                            "IMPORTANT: Always return valid JSON with properly escaped strings."
                        )
                    },
                    {
                        "role": "user",
                        "content": instruction
                    }
                ],
                timeout=600
            )

            elapsed_time = (datetime.now() - start_time).total_seconds()
            response_content = response.choices[0].message.content
            self.logger.info(f"Azure OpenAI call completed in {elapsed_time:.2f} seconds")
            self.logger.info(f"Response length: {len(response_content)} characters")

            # Log the first part of the response for debugging
            self.logger.debug(f"Response preview: {response_content[:500]}...")

            return response_content

        except Exception as e:
            self.logger.error(f"Azure OpenAI API call failed: {str(e)}")
            raise

    def _parse_project_response(self, response: str, project_name: str) -> SimpleProjectResult:
        """Parse the AI's response into a structured project"""
        try:
            # Try to extract JSON from the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1

            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in response")

            json_str = response[json_start:json_end]

            # Log the JSON for debugging
            self.logger.debug(f"Attempting to parse JSON: {json_str[:500]}...")

            # Try to fix common JSON escape issues
            json_str = self._fix_json_escapes(json_str)

            project_data = json.loads(json_str)
            
            # Extract core project data
            framework = project_data.get("framework", "React")
            language = project_data.get("language", "JavaScript")
            instructions = project_data.get("instructions", "AI generated web application")
            files = project_data.get("files", {})
            
            # Normalize file extensions for React projects to ensure consistency
            if framework.lower() == "react":
                files = self._normalize_react_file_extensions(files, language)
                self.logger.info(f"Normalized React file extensions for {language} project")
                
            return SimpleProjectResult(
                project_name=project_name,
                framework=framework,
                language=language,
                instructions=instructions,
                files=files
            )

        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON response: {str(e)}")
            self.logger.error(f"JSON error at position {e.pos}: {str(e)}")

            # Log problematic section for debugging
            start_pos = max(0, e.pos - 100)
            end_pos = min(len(json_str), e.pos + 100)
            problematic_section = json_str[start_pos:end_pos]
            self.logger.error(f"Problematic JSON section: {problematic_section}")

            # Log first 500 characters of the full JSON for context
            self.logger.debug(f"Full JSON preview: {json_str[:500]}...")

            # Try a more aggressive fix and retry
            try:
                fixed_json = self._aggressive_json_fix(json_str, project_name)
                project_data = json.loads(fixed_json)
                self.logger.info("Successfully parsed JSON after aggressive fix")
                
                # Extract core project data
                framework = project_data.get("framework", "React")
                language = project_data.get("language", "JavaScript")
                instructions = project_data.get("instructions", "AI generated web application")
                files = project_data.get("files", {})
                
                # Normalize file extensions for React projects to ensure consistency
                if framework.lower() == "react":
                    files = self._normalize_react_file_extensions(files, language)
                    self.logger.info(f"Normalized React file extensions for {language} project after aggressive fix")
                
                return SimpleProjectResult(
                    project_name=project_name,
                    framework=framework,
                    language=language,
                    instructions=instructions,
                    files=files
                )
            except Exception as e2:
                self.logger.error(f"Aggressive fix also failed: {str(e2)}")
        except Exception as e:
            self.logger.error(f"Failed to parse response: {str(e)}")
            
    def _normalize_react_file_extensions(self, files: dict, language: str) -> dict:
        """
        Ensures consistent file extensions for React components based on the language.
        - .jsx for JavaScript React components
        - .tsx for TypeScript React components
        """
        normalized_files = {}
        expected_ext = "tsx" if language.lower() in ["typescript", "ts"] else "jsx"
        
        for filepath, content in files.items():
            # Process React component files
            if (filepath.endswith('.js') and 'import React' in content) or filepath.endswith('.jsx'):
                if language.lower() not in ["typescript", "ts"]:
                    # For JavaScript, ensure .jsx extension for React components
                    new_filepath = filepath.replace('.js', '.jsx') if filepath.endswith('.js') else filepath
                    normalized_files[new_filepath] = content
                    if new_filepath != filepath:
                        self.logger.info(f"Renamed {filepath} -> {new_filepath} for consistency")
                else:
                    # Skip JS files in TS projects - they'll be handled below
                    normalized_files[filepath] = content
            elif (filepath.endswith('.ts') and 'import React' in content) or filepath.endswith('.tsx'):
                if language.lower() in ["typescript", "ts"]:
                    # For TypeScript, ensure .tsx extension for React components
                    new_filepath = filepath.replace('.ts', '.tsx') if filepath.endswith('.ts') else filepath
                    normalized_files[new_filepath] = content
                    if new_filepath != filepath:
                        self.logger.info(f"Renamed {filepath} -> {new_filepath} for consistency")
                else:
                    # Skip TS files in JS projects - they'll be handled below
                    normalized_files[filepath] = content
            else:
                # Non-React component files remain unchanged
                normalized_files[filepath] = content
        
        return normalized_files

    def _fix_json_escapes(self, json_str: str) -> str:
        """Fix common JSON escape issues that cause parsing errors"""

        # Simple but effective approach: fix the most common issues
        # 1. Replace Windows-style paths with forward slashes in keys
        # 2. Convert multiline string values to single line with proper escaping

        lines = json_str.split('\n')
        result_lines = []
        in_multiline_string = False
        current_multiline_content = []
        current_line_prefix = ""

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                continue

            # Check if this line starts a potential multiline string value
            if '": "' in stripped and not stripped.endswith('",') and not stripped.endswith('"'):
                # This might be starting a multiline string
                parts = stripped.split('": "', 1)
                if len(parts) == 2:
                    key_part = parts[0]
                    value_start = parts[1]

                    # Fix backslashes in the key (file paths)
                    key_part = key_part.replace('\\', '/')

                    # Start collecting multiline content
                    in_multiline_string = True
                    current_line_prefix = key_part + '": "'
                    current_multiline_content = [value_start]
                    continue

            # If we're in a multiline string, collect content until we find the end
            if in_multiline_string:
                if stripped.endswith('",') or stripped.endswith('"'):
                    # End of multiline string
                    if stripped.endswith('",'):
                        current_multiline_content.append(stripped[:-2])
                        suffix = '",'
                    else:
                        current_multiline_content.append(stripped[:-1])
                        suffix = '"'

                    # Join all content and escape it properly
                    full_content = '\n'.join(current_multiline_content)

                    # Escape the content for JSON
                    full_content = full_content.replace('\\', '\\\\')  # Escape backslashes
                    full_content = full_content.replace('"', '\\"')   # Escape quotes
                    full_content = full_content.replace('\n', '\\n')  # Escape newlines
                    full_content = full_content.replace('\r', '\\r')  # Escape carriage returns
                    full_content = full_content.replace('\t', '\\t')  # Escape tabs

                    # Reconstruct the line
                    result_lines.append(current_line_prefix + full_content + suffix)

                    # Reset state
                    in_multiline_string = False
                    current_multiline_content = []
                    current_line_prefix = ""
                else:
                    # Continue collecting multiline content
                    current_multiline_content.append(stripped)
                continue

            # Regular line processing
            if '": "' in stripped and (stripped.endswith('",') or stripped.endswith('"')):
                # Single line key-value pair
                parts = stripped.split('": "', 1)
                if len(parts) == 2:
                    key_part = parts[0]
                    value_part = parts[1]

                    # Fix backslashes in the key
                    key_part = key_part.replace('\\', '/')

                    # The value should already be properly formatted, but fix just in case
                    result_lines.append(key_part + '": "' + value_part)
                else:
                    result_lines.append(stripped)
            else:
                # Fix backslashes in keys that might be object keys
                if stripped.startswith('"') and '": {' in stripped:
                    result_lines.append(stripped.replace('\\', '/'))
                else:
                    result_lines.append(stripped)

        return '\n'.join(result_lines)

    def _aggressive_json_fix(self, json_str: str, project_name: str) -> str:
        """More aggressive JSON fixing for severely malformed JSON"""

        # Last resort: try to extract key-value pairs and reconstruct valid JSON
        try:
            # Look for the basic structure and extract what we can
            import re
            import json

            project_name = project_name,
            framework = "React"
            language = "JavaScript"
            instructions = "AI generated web application"
            files = {}

            # Try to extract project_name
            name_match = re.search(r'"project_name":\s*"([^"]*)"', json_str)
            if name_match:
                project_name = name_match.group(1)

            # Try to extract framework
            framework_match = re.search(r'"framework":\s*"([^"]*)"', json_str)
            if framework_match:
                framework = framework_match.group(1)

            # Try to extract language
            language_match = re.search(r'"language":\s*"([^"]*)"', json_str)
            if language_match:
                language = language_match.group(1)

            # Extract instructions
            desc_match = re.search(r'"instructions":\s*"([^"]*)"', json_str)
            if desc_match:
                instructions = desc_match.group(1)

            # For files, create a simple default structure
            files = {
                "src/App.js": (
                    f"import React from 'react';\n"
                    f"function App() {{\n"
                    f"  return <div><h1>{project_name}</h1></div>;\n"
                    f"}}\n"
                    f"export default App;"
                ),
                "package.json": (
                    f'{{\n'
                    f'  "name": "{project_name.lower().replace(" ", "-")}",\n'
                    f'  "version": "1.0.0",\n'
                    f'  "dependencies": {{\n'
                    f'    "react": "^18.0.0"\n'
                    f'  }}\n'
                    f'}}'
                )
            }

            # Construct valid JSON manually
            result = {
                "project_name": project_name,
                "framework": framework,
                "language": language,
                "instructions": instructions,
                "files": files
            }

            return json.dumps(result)

        except Exception:
            # If even this fails, return minimal valid JSON
            import json
            return json.dumps({
                "project_name": project_name,
                "framework": "React",
                "language": "JavaScript",
                "instructions": "Fallback project due to parsing errors",
                "files": {
                    "src/App.js": "import React from 'react'; function App() { return <div>Fallback App</div>; } "
                    "export default App;"
                }
            })
