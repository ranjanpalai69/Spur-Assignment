import OpenAI from 'openai';
import { config } from '../config/env';
import type { Message } from '../types';

const client = new OpenAI({ apiKey: config.openaiApiKey });

// --------------------------------------------------------------------------
// Store knowledge base — injected as the system message on every request
// --------------------------------------------------------------------------
const STORE_KNOWLEDGE = `
## About ShopEase
ShopEase is a premium online lifestyle store selling electronics, clothing, home goods, and accessories. We ship worldwide and pride ourselves on fast, reliable customer service.

## Shipping Policy
- Free standard shipping on orders $50+ (USA, Canada, UK, Australia)
- Standard shipping (5–7 business days): $4.99 for orders under $50
- Express shipping (2–3 business days): $12.99
- Overnight shipping (next business day): $24.99
- International (40+ countries): rates calculated at checkout
- Orders placed before 2 PM EST ship same day (Mon–Fri)
- Shipping confirmation with tracking sent via email automatically

## Return & Refund Policy
- 30-day hassle-free returns from the date of delivery
- Items must be unused, unwashed, in original packaging with all tags attached
- Electronics: original sealed packaging if unopened, or within 15 days if opened
- To initiate: email returns@shopease.com or use shopease.com/returns
- Refunds processed within 5–7 business days after we receive the item
- Shipping costs non-refundable unless item arrived damaged or defective
- Free exchanges; processed within 3–5 business days

## Payment Methods
- Cards: Visa, Mastercard, American Express, Discover
- Digital wallets: PayPal, Apple Pay, Google Pay
- Buy Now Pay Later: Affirm, Afterpay (orders $35+)
- Gift cards and store credit accepted

## Order Management
- Cancellations accepted within 1 hour of placement (before processing)
- Track orders at shopease.com/track or via the confirmation email
- Size/color/quantity changes: within 30 minutes of placing the order
- Delivery issues (missing, damaged): contact us within 48 hours of expected delivery

## Product & Inventory
- Real-time stock shown on each listing ("Only X left" for low-stock items)
- Out-of-stock items can be saved to wishlist for restock notifications
- All reviews are from verified purchasers only

## Support Hours & Contacts
- Live Chat: Mon–Fri 9 AM–8 PM EST, Sat 10 AM–6 PM EST
- Email: support@shopease.com (response within 24 hours)
- Phone: 1-800-SHOPEASE (Mon–Fri 9 AM–6 PM EST)
- Urgent order issues: 24/7 via chat

## SpurPoints Loyalty Program
- Earn 1 point per $1 spent; 100 points = $1 discount
- Birthday month: 2× points
- Refer a friend: both earn 200 bonus points after the referred friend's first purchase
- Points never expire as long as the account is active

## Promotions & Discounts
- Newsletter signup: 15% off first order
- Student discount: 10% off with valid .edu email (verify at shopease.com/students)
- Military discount: 15% off with ID.me verification
- Major sales: January clearance, July summer sale, Black Friday (November), December holiday
`.trim();

const SYSTEM_PROMPT = `You are a knowledgeable, warm, and efficient customer support agent for ShopEase, a premium e-commerce store. Your goal is to resolve customer issues accurately and quickly.

${STORE_KNOWLEDGE}

## Guidelines
- Be conversational and friendly — never robotic or overly formal
- Use bullet points for lists (shipping options, steps to follow, etc.)
- Keep responses concise; expand only when the question genuinely requires detail
- If a question falls outside the knowledge base, acknowledge it honestly and offer to connect the customer with a human agent via support@shopease.com or 1-800-SHOPEASE
- Never fabricate information not in the knowledge base
- For complaints or frustrated customers, lead with empathy before jumping to solutions

Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;

// --------------------------------------------------------------------------

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export async function generateReply(
  history: Message[],
  userMessage: string,
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(msg => ({
      role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await client.chat.completions.create({
      model: config.llmModel,
      messages,
      max_tokens: config.maxTokens,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new LLMError('Empty response from model', 'NO_CONTENT');
    }

    return text;
  } catch (err: unknown) {
    if (err instanceof LLMError) throw err;

    // OpenAI SDK throws structured APIError objects
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) throw new LLMError('Invalid API key', 'AUTH_ERROR');
      if (err.status === 429) throw new LLMError('Rate limit exceeded', 'RATE_LIMIT');
      if (err.status === 503 || err.status === 529) throw new LLMError('Service overloaded', 'OVERLOADED');
      if (err.code === 'ETIMEDOUT' || err.message.toLowerCase().includes('timeout')) {
        throw new LLMError('Request timed out', 'TIMEOUT');
      }
    }

    throw new LLMError('LLM request failed', 'UNKNOWN');
  }
}

// Human-readable error messages surfaced to the customer
export function friendlyErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    AUTH_ERROR:
      "I'm having trouble connecting right now. Please try again shortly or reach us at support@shopease.com.",
    RATE_LIMIT:
      "Our agent is handling a lot of requests at the moment. Please wait a few seconds and try again.",
    TIMEOUT:
      "My response took too long to arrive. Please try again — I'm usually much faster!",
    OVERLOADED:
      "We're experiencing high demand right now. Please try again in a moment.",
    NO_CONTENT:
      "I wasn't able to generate a response. Please try rephrasing your question.",
    UNKNOWN:
      "Something went wrong on my end. Please try again or email support@shopease.com for immediate help.",
  };
  return messages[code] ?? messages.UNKNOWN;
}
