import Groq from 'groq-sdk';

type Props = {
  keyword: string;
  category: string;
  TIMEOUT_MS: number;
};

type ValidationResult = {
  isValid: boolean;
  message: string | null;
};

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

async function _fetchGroqValidation(keyword: string, category: string): Promise<ValidationResult> {
  const prompt = `
      Role: Search Intent Classifier for "Everyone's Review".
      Input: Keyword="""${keyword}""", Category="""${category}"""

      [Logic]
      1. **REJECT (Category Mismatch):** If keyword is CLEARLY unrelated to "${category}" (e.g., "iPhone" in "Food", "Pizza" in "Shopping").
      2. **ACCEPT (Ambiguity Rule):** If keyword is a Proper Noun (Title, Brand) that *could* be in "${category}", ACCEPT it (e.g., "Housemaid" in "Book"). Give benefit of the doubt.
      3. **REJECT (Invalid Types):**
         - Person/History (Founders, CEO) -> "인물이나 기업 정보는 알 수 없어요."
         - Navigation/Facts (Where to buy, Stock, Weather) -> "단순 정보나 구매처는 알 수 없어요."
         - Mixed Intent ("Pizza and iPhone") -> "한 번에 하나의 주제만 검색해 주세요!"

      [Examples]
      - "Fred Pizza" (Food) -> {"isValid": true, "message": null}
      - "iPhone 15" (Food) -> {"isValid": false, "message": "음식 카테고리와 맞지 않아요."}
      - "The Housemaid" (Book) -> {"isValid": true, "message": null} (Title assumption)
      - "Galaxy S24" (Book) -> {"isValid": false, "message": "책 카테고리와 맞지 않아요."}
      - "Fred Pizza owner" (Food) -> {"isValid": false, "message": "인물 정보는 알 수 없어요."}

      Output JSON ONLY: { "isValid": boolean, "message": string | null }
    `;

  const completion = await groq.chat.completions.create({
    messages: [
      {role: 'system', content: 'You are a helpful assistant that outputs JSON only.'},
      {role: 'user', content: prompt},
    ],

    model: 'qwen/qwen3-32b',

    response_format: {type: 'json_object'},
    temperature: 0,
  });

  const responseText = completion.choices[0].message.content;

  if (!responseText) {
    throw new Error('Groq returned empty response');
  }

  return JSON.parse(responseText);
}

export async function validateQueryWithGroq({category, keyword, TIMEOUT_MS}: Props): Promise<ValidationResult> {
  const timeoutPromise = new Promise<ValidationResult>((_resolve, reject) => {
    setTimeout(() => reject(new Error('Validate Timeout')), TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([_fetchGroqValidation(keyword, category), timeoutPromise]);

    return result;
  } catch (error) {
    console.error('Groq GateKeeper Error:', error);

    return {
      isValid: false,
      message: '현재 서비스가 원할하지 않아요. 잠시 후 다시 시도해주세요.',
    };
  }
}
