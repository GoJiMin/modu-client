import {RequestCookie} from 'next/dist/compiled/@edge-runtime/cookies';
import {z} from 'zod';

const SearchLimitSchema = z.object({
  usage: z.number().int().min(0),
  lastSearchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SearchLimitData = z.infer<typeof SearchLimitSchema>;

const createDefaultLimitData = (today: string): SearchLimitData => ({
  usage: 0,
  lastSearchDate: today,
});

function parseLimitCookie(cookieValue: string | undefined, today: string): SearchLimitData {
  if (!cookieValue) return createDefaultLimitData(today);

  try {
    const json = JSON.parse(cookieValue);
    const result = SearchLimitSchema.safeParse(json);

    if (!result.success) {
      return createDefaultLimitData(today);
    }

    if (result.data.lastSearchDate !== today) {
      return createDefaultLimitData(today);
    }

    return result.data;
  } catch {
    return createDefaultLimitData(today);
  }
}

export function getSearchLimitStatus(maxLimit: number, cookie?: RequestCookie) {
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Seoul',
  });

  const data = parseLimitCookie(cookie?.value, today);

  return {
    isBlocked: data.usage >= maxLimit,
    remaining: Math.max(0, maxLimit - data.usage),
    currentUsage: data.usage,
    lastSearchDate: data.lastSearchDate,
    today,
  };
}
