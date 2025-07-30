// import { NextResponse } from "next/server";
// import { put } from "@vercel/blob";

// export async function POST(req: Request) {
//   const formData = await req.formData();
//   const file = formData.get("file");

//   if (!(file instanceof Blob)) {
//     return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
//   }

//   const { url } = await put("map-drawing.png", file, {
//     access: "public",
//   });

//   return NextResponse.json({ url });
// }

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@vercel/postgres";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");
  const rawCustomerID = formData.get("customerID");
  if (typeof rawCustomerID !== "string") {
    return NextResponse.json(
      { error: "Invalid customer ID." },
      { status: 400 }
    );
  }
  const customerID = rawCustomerID; // now it’s properly typed as string

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
  }

  const { url } = await put("map-drawing.png", file, {
    access: "public",
    addRandomSuffix: true
  });

  await sql`
    INSERT INTO images (customerID, imageURL, isActive)
    VALUES (${customerID}, ${url}, ${true});
  `;

  return NextResponse.json({ url });
}
