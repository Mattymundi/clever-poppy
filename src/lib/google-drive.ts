import { google } from "googleapis";
import { Readable } from "stream";

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google Drive credentials not configured. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export async function createDriveFolder(name: string, parentFolderId: string): Promise<{ folderId: string; webViewLink: string }> {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  // Make the folder publicly viewable so all files inside inherit access
  try {
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });
    console.log(`Set folder ${response.data.id} to public`);
  } catch (err: any) {
    console.warn(`Could not set folder public permission: ${err.message}`);
  }

  return {
    folderId: response.data.id!,
    webViewLink: response.data.webViewLink!,
  };
}

export async function uploadFileToDrive(
  fileName: string,
  buffer: Buffer,
  folderId: string,
  mimeType: string = "image/png"
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  // Make the file publicly viewable so thumbnails work
  try {
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });
  } catch (permErr: any) {
    console.warn(`Could not set file public permission for ${response.data.id}: ${permErr.message}`);
  }

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
  };
}

export function formatRunFolderName(
  adTypeNames: string[],
  sequenceStart?: number,
  adCount?: number
): string {
  const typesSummary = adTypeNames.length <= 3
    ? adTypeNames.join(", ")
    : `${adTypeNames.slice(0, 3).join(", ")} +${adTypeNames.length - 3} more`;

  if (sequenceStart != null && adCount != null && adCount > 0) {
    const seqEnd = sequenceStart + adCount - 1;
    return `${sequenceStart} to ${seqEnd} - ${typesSummary}`;
  }

  return typesSummary;
}
