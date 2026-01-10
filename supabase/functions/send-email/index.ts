import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
    type: "contact" | "pre-approval" | "sell-request";
    data: any;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { type, data }: EmailRequest = await req.json();

        // Default to the provided "to" address or a fallback admin email
        // ideally stored in env var, but for now we'll send to a configured admin email
        const adminEmail = Deno.env.get("ADMIN_EMAIL") || "info@carstreet.ca";

        let subject = "";
        let html = "";

        switch (type) {
            case "contact":
                subject = `New Contact Form Submission from ${data.firstName} ${data.lastName}`;
                html = `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
        `;
                break;

            case "pre-approval":
                subject = `New Pre-Approval Application from ${data.firstName} ${data.lastName}`;
                html = `
          <h2>New Finance Application</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Date of Birth:</strong> ${data.dateOfBirth} (Age: ${data.age})</p>
          
          <hr />
          <h3>Address</h3>
          <p>${data.address}</p>
          <p><strong>Time at Address:</strong> ${data.timeAtAddress?.years} years, ${data.timeAtAddress?.months} months</p>
          <p><strong>Housing:</strong> ${data.housing?.rentOrOwn} ($${data.housing?.monthlyPayment}/month)</p>

          <hr />
          <h3>Employment & Income</h3>
          <p><strong>Status:</strong> ${data.employmentStatus}</p>
          <p><strong>Employer:</strong> ${data.employerDetails?.name || "N/A"}</p>
          <p><strong>Job Title:</strong> ${data.employerDetails?.jobTitle || "N/A"}</p>
          <p><strong>Duration:</strong> ${data.employerDetails?.yearsEmployed} years</p>
          <p><strong>Income Source:</strong> ${data.incomeDetails?.type}</p>
          <p><strong>Gross Income:</strong> ${data.incomeDetails?.annualIncome || data.incomeDetails?.monthlyIncome || (data.incomeDetails?.hourlyWage ? `${data.incomeDetails.hourlyWage}/hr (${data.incomeDetails.hoursPerWeek} hrs/wk)` : "N/A")}</p>

          <hr />
          <h3>Vehicle Interest</h3>
          <p><strong>Type:</strong> ${data.vehicleType}</p>
          <p><strong>Budget:</strong> ${data.budget}</p>
          <p><strong>Trade-In:</strong> ${data.tradeIn}</p>
          <p><strong>Credit Rating:</strong> ${data.creditRating}</p>
          
          <hr />
          <p><a href="https://carstreet.ca/admin/leads">View Full Application in Admin Portal</a></p>
        `;
                break;

            case "sell-request":
                subject = `New Sell Your Car Request: ${data.year} ${data.make} ${data.model}`;
                html = `
          <h2>Sell Your Car Request</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <hr />
          <h3>Vehicle Details</h3>
          <p><strong>Vehicle:</strong> ${data.year} ${data.make} ${data.model}</p>
          <p><strong>VIN:</strong> ${data.vin}</p>
          <p><strong>Location:</strong> ${data.city}, ${data.province}</p>
          <p><strong>Odometer:</strong> ${data.odometer} km</p>
          <p><strong>Transmission:</strong> ${data.transmission}</p>
          <p><strong>Colors:</strong> Exterior: ${data.exteriorColor}, Interior: ${data.interiorColor}</p>
          <hr />
          <h3>Condition & History</h3>
          <p><strong>Keys:</strong> ${data.keys}</p>
          <p><strong>Exterior Damage:</strong> ${data.exteriorDamage === "true" ? "Yes" : "No"}</p>
          <p><strong>Interior Damage:</strong> ${data.interiorDamage === "true" ? "Yes" : "No"}</p>
          <p><strong>Accident Claims:</strong> ${data.accidentClaims === "true" ? "Yes" : "No"}</p>
          <p><strong>Smoked In:</strong> ${data.smokedIn === "true" ? "Yes" : "No"}</p>
          <p><strong>Windshield Crack:</strong> ${data.windshieldCrack === "true" ? "Yes" : "No"}</p>
          <hr />
          <p><a href="https://carstreet.ca/admin/sell-requests">View Full Details in Admin Portal</a></p>
        `;
                break;

            default:
                throw new Error("Invalid email type");
        }

        const emailResponse = await resend.emails.send({
            from: "Car Street <onboarding@resend.dev>", // Update this when you have a custom domain
            to: [adminEmail],
            subject: subject,
            html: html,
        });

        return new Response(JSON.stringify(emailResponse), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
};

serve(handler);
