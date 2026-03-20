import { ApiError, getApiBaseUrl, parseErrorMessage } from "@/lib/api-client";
import { StoredObjectListResponse, StoredObjectResponse } from "@/lib/storage-contract";

export async function listPhotoUploads(accessToken: string): Promise<StoredObjectListResponse> {
  const response = await fetch(`${getApiBaseUrl()}/storage/photo-uploads`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as StoredObjectListResponse;
}

export async function uploadPhoto(accessToken: string, file: File): Promise<StoredObjectResponse> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(`${getApiBaseUrl()}/storage/photo-uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as StoredObjectResponse;
}
