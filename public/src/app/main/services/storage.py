from azure.storage.fileshare import ShareFileClient, ShareDirectoryClient
from app.main.configs.MainConfig import settings

import os


class StorageService:
    def __init__(self):
        # Azure Storage configuration
        self.conn_str = settings.SA_CONNECTION
        self.fileshare_name = settings.SA_SHARE_NAME

    def get_fileshare_client(self, file_share_path: str) -> ShareFileClient:
        return ShareFileClient.from_connection_string(
            conn_str=self.conn_str,
            share_name=self.fileshare_name,
            file_path=file_share_path
        )

    def create_directory_fileshare_if_not_exist(self, directory_path: str):
        share_dictory_client = ShareDirectoryClient.from_connection_string(
            conn_str=self.conn_str,
            share_name=self.fileshare_name,
            directory_path=directory_path
        )
        if not share_dictory_client.exists():
            share_dictory_client.create_directory()

    def upload_zip_file(self, local_zip_path: str):
        print("Uploading zip file...")
        dic_name = "web-builder-projects"
        file_share_path = dic_name + "/" + os.path.basename(local_zip_path)

        self.create_directory_fileshare_if_not_exist(dic_name)
        file_client = self.get_fileshare_client(file_share_path)

        with open(local_zip_path, "rb") as f:
            file_client.upload_file(f)
        print("Zip file uploaded.")
