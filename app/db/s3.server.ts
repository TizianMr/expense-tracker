import { Readable } from 'stream';

import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
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

export async function uploadAvatar(request: Request) {
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get('profile-pic')?.toString() || '';

  return file;
}
