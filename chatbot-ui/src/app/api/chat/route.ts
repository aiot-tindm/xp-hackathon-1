import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------

const CHATBOT_API_URL = 'http://localhost:3000';

// ----------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Forward the request to our chatbot backend
    const response = await fetch(`${CHATBOT_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Chatbot API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Analytics chatbot proxy error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Analytics chatbot service is not available. Please ensure the chatbot server is running on port 3000.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process analytics request. Please try again.' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------

export async function GET() {
  return NextResponse.json(
    { message: 'Analytics Chatbot API is running' },
    { status: 200 }
  );
}