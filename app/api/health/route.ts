export async function GET() {
  return Response.json({
    ok: true,
    service: "vini-ro-services",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
