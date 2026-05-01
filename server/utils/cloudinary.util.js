import { v2 as cloudinary } from "cloudinary";

export const uploadBufferToCloudinary = (
  buffer,
  folder = "nextrain/profiles",
) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

export const destroyFromCloudinary = (publicId) =>
  publicId ? cloudinary.uploader.destroy(publicId) : Promise.resolve();
