import { google } from "googleapis";

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Get or create the master log spreadsheet.
 * Checks SystemConfig for an existing sheet ID first.
 * If none exists, creates one in the Drive folder and stores the ID.
 */
async function getOrCreateLogSheet(): Promise<string> {
  // Dynamic import to avoid circular deps
  const { prisma } = await import("@/lib/db");

  // Check SystemConfig for existing sheet
  const existing = await prisma.systemConfig.findUnique({
    where: { key: "log_spreadsheet_id" },
  });

  if (existing?.value) {
    return existing.value;
  }

  // Create a new spreadsheet
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: "Clever Poppy — Ad Generation Log" },
      sheets: [{ properties: { title: "Generated Ads" } }],
    },
  });

  const spreadsheetId = response.data.spreadsheetId!;

  // Add header row
  const headers = [
    "Timestamp", "Run ID", "File Name", "Sequence", "Ad Type", "Type Number",
    "Persona", "Persona Code", "Category", "Image Ratio", "Headline", "CTA",
    "Status", "Drive File URL", "Drive Folder URL",
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Generated Ads!A1",
    valueInputOption: "RAW",
    requestBody: { values: [headers] },
  });

  // Share with service account's Drive folder if possible
  try {
    const drive = google.drive({
      version: "v3",
      auth: new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/drive"],
      }),
    });

    // Move to the Drive folder
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      await drive.files.update({
        fileId: spreadsheetId,
        addParents: process.env.GOOGLE_DRIVE_FOLDER_ID,
        supportsAllDrives: true,
      });
    }

    // Make it accessible
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: { role: "writer", type: "anyone" },
      supportsAllDrives: true,
    });
  } catch (err: any) {
    console.warn("Could not move/share log sheet:", err.message);
  }

  // Store the ID in SystemConfig
  await prisma.systemConfig.upsert({
    where: { key: "log_spreadsheet_id" },
    update: { value: spreadsheetId },
    create: { key: "log_spreadsheet_id", value: spreadsheetId },
  });

  console.log(`Created log spreadsheet: ${spreadsheetId}`);
  return spreadsheetId;
}

/**
 * Append rows to the master log sheet.
 */
export async function appendToLogSheet(
  rows: {
    timestamp: string;
    runId: string;
    fileName: string;
    sequence: number;
    adTypeName: string;
    typeNumber: number;
    personaName: string;
    personaCode: string;
    category: string;
    imageRatio: string;
    headline: string;
    cta: string;
    status: string;
    driveFileUrl: string;
    driveFolderUrl: string;
  }[]
): Promise<void> {
  if (rows.length === 0) return;

  try {
    const spreadsheetId = await getOrCreateLogSheet();
    const sheets = getSheetsClient();

    const values = rows.map((r) => [
      r.timestamp,
      r.runId,
      r.fileName,
      String(r.sequence),
      r.adTypeName,
      String(r.typeNumber),
      r.personaName,
      r.personaCode,
      r.category,
      r.imageRatio,
      r.headline,
      r.cta,
      r.status,
      r.driveFileUrl,
      r.driveFolderUrl,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Generated Ads!A:O",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    console.log(`Logged ${rows.length} rows to spreadsheet ${spreadsheetId}`);
  } catch (err: any) {
    console.error("Failed to log to Google Sheet:", err.message);
    // Don't throw — sheet logging should not break the pipeline
  }
}
