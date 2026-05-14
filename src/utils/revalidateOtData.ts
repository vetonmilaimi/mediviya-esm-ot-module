import { baseApiUrl } from './constants';

export const revalidateOtData = async (mutate: (matcher: any) => Promise<any>) => {
  await mutate((key: unknown) => typeof key === 'string' && key.startsWith(`${baseApiUrl}/surgicalBlock`));
};
