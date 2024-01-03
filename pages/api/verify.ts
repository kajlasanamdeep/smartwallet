import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  userId?: number,
  email?: string,
  exp?: any,
  message?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { payload } = req.body;
  if (!payload) return res.status(401).send({ message: "Invalid credentials" });
  console.log(payload, "payload");
  if (payload.userId !== 1) {
    return res.status(401).send({ message: "Invalid credentials" });
  }
  return res.send({
    userId: 1,
    email: "kajlasanamdeep@gmail.com",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  });
}