import crypto from 'crypto';

export const generateLineSignature = (body: string, channelSecret: string) => {
  return crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
};
