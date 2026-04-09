import { Hono } from "hono";
import { promises as fs } from "fs";
import path from "path";
const upload = new Hono();
// POST /upload
upload.post("/", async (c) => {
    const formData = await c.req.formData();
    const files = formData.getAll("images");
    if (!files.length) {
        return c.json({ error: "No files uploaded" }, 400);
    }
    const savedPaths = [];
    for (const file of files) {
        if (!(file instanceof File))
            continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name}`;
        const savePath = path.join("uploads", filename);
        await fs.mkdir("uploads", { recursive: true });
        await fs.writeFile(savePath, buffer);
        savedPaths.push(savePath);
    }
    return c.json({ uploaded: savedPaths });
});
export default upload;
