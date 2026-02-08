import axios from "axios";
import FormData from "form-data";
import type { Express } from "express";

const PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

export async function pinFile(file: Express.Multer.File, jwt: string) {
  const form = new FormData();
  form.append("file", file.buffer, { filename: file.originalname });

  const res = await axios.post(PIN_FILE_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${jwt}`,
    },
    maxBodyLength: Infinity,
  });
  return res.data as { IpfsHash: string; PinSize: number; Timestamp: string };
}

export async function pinJSON(json: any, jwt: string) {
  const res = await axios.post(PIN_JSON_URL, json, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    maxBodyLength: Infinity,
  });
  return res.data as { IpfsHash: string; PinSize: number; Timestamp: string };
}
