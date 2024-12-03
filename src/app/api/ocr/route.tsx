export const POST = async (req: Request) => {
  console.log("HELLO WORLD");

  const { image } = await req.json();

  const response = await fetch(`${process.env.OCR_URL}/api/ocr`, {
    method: "POST",
    body: image,
  });

  const data = await response.json();

  return Response.json({
    data,
  });
};
