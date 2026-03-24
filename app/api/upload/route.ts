import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate Google Drive configuration
    const missingVars = [];
    if (!process.env.GOOGLE_CLIENT_EMAIL) missingVars.push('GOOGLE_CLIENT_EMAIL');
    if (!process.env.GOOGLE_PRIVATE_KEY) missingVars.push('GOOGLE_PRIVATE_KEY');
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) missingVars.push('GOOGLE_DRIVE_FOLDER_ID');

    if (missingVars.length > 0) {
      console.error('❌ Google Drive not configured. Missing:', missingVars.join(', '));
      return NextResponse.json({
        error: `Google Drive is not configured properly. Missing: ${missingVars.join(', ')}. See FIREBASE_SETUP.md for setup instructions.`,
      }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const media = {
      mimeType: file.type,
      body: ReadableStreamFromBuffer(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    const fileId = response.data.id;

    if (!fileId) {
      return NextResponse.json({ error: "Failed to upload to Google Drive" }, { status: 500 });
    }

    // Make file public
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const url = `https://drive.google.com/uc?id=${fileId}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Google Drive Upload Error:", error);
    
    // Provide helpful error messages for common errors
    let errorMessage = error.message || "Failed to upload";
    
    if (error.message?.includes('invalid_grant')) {
      errorMessage = 'Google Drive authentication failed. Please verify GOOGLE_PRIVATE_KEY format in .env.local or Vercel settings.';
    } else if (error.message?.includes('Permission denied')) {
      errorMessage = 'Permission denied. Check that GOOGLE_DRIVE_FOLDER_ID is correct and service account has access.';
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Helper to convert Buffer to ReadableStream which Googleapis expects
function ReadableStreamFromBuffer(buffer: Buffer) {
  const { Readable } = require("stream");
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}
