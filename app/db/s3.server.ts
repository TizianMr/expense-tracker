import { Readable } from 'stream';

import { DeleteObjectCommand, GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createId } from '@paralleldrive/cuid2';
import { unstable_parseMultipartFormData, UploadHandler } from '@remix-run/node';

const s3 = new S3({
  region: process.env.BUCKET_REGION || '',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

const uploadHandler: UploadHandler = async ({ name, data, filename }) => {
  if (name !== 'profile-pic') {
    return undefined;
  }

  const { Location } = await new Upload({
    client: s3,
    params: {
      Bucket: process.env.BUCKET_NAME || '',
      Key: `${createId()}.${filename?.split('.').slice(-1)[0] || 'avatar'}`,
      Body: Readable.from(data),
    },
  }).done();

  return Location;
};

export const uploadAvatar = async (request: Request, oldImgKey?: string) => {
  if (oldImgKey) {
    deleteAvatar(oldImgKey);
  }

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get('profile-pic')?.toString() || '';

  return file;
};

export const deleteAvatar = async (imgKey: string) => {
  const command = new DeleteObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: imgKey });
  await s3.send(command);
};

export const getSignedAvatarUrl = async (imgKey: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME || '',
    Key: imgKey,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 * 5 }); // 5 hours

  return url;
};
