import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: Request) {
    const formData = await req.formData();
    const rawCustomerID = formData.get("customerID");
    if (typeof rawCustomerID !== "string") {
      return NextResponse.json(
        { error: "Invalid customer ID." },
        { status: 400 }
      );
    }
    const customerID = rawCustomerID;
    
    const urls = await sql`
    SELECT imageurl
    FROM images
    WHERE customerid = ${customerID} AND isactive = 'true';
    `;
const response = urls.rows
    

  return NextResponse.json( response );
}
