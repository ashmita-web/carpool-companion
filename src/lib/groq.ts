interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function callGroqAPI(messages: GroqMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  console.log(' GROQ KEY:', apiKey)

  if (!apiKey) {
    throw new Error('Groq API key not configured')
  }

  messages.forEach((m, i) => {
    if (!m.role || typeof m.content !== 'string') {
      console.warn(`⚠️ Invalid message at index ${i}:`, m)
    }
  })

  const payload = {
    model: 'llama3-70b-8192',
    messages,
    temperature: 0.7,
    max_tokens: 1000
  }

  console.log(' Sending to Groq:', JSON.stringify(payload, null, 2))

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) 
    })

    const text = await response.text()

    if (!response.ok) {
      console.error(' Groq API raw error:', text)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data: GroqResponse = JSON.parse(text)
    console.log(' Groq response parsed:', data)

    return data.choices[0]?.message?.content || '⚠️ No AI response'
  } catch (error) {
    console.error(' Groq API call failed:', error)
    throw error
  }
}

export async function matchRides(rideRequest: any, availableRides: any[]): Promise<any[]> {
  const systemPrompt = `You are a ride-matching assistant for CarpoolCompanion. 
  Your job is to analyze ride requests and match them with available ride offers based on:
  1. Location proximity (within 5km is ideal)
  2. Time compatibility (±30 minutes window)
  3. Ride preferences and compatibility
  4. Available seats
  
  Return a JSON array of matched rides with compatibility scores (0-100).`

  const userPrompt = `Match this ride request:
  - Pickup: ${rideRequest.pickupLocation} (${rideRequest.pickup_lat}, ${rideRequest.pickup_lng})
  - Dropoff: ${rideRequest.dropoff_location} (${rideRequest.dropoff_lat}, ${rideRequest.dropoff_lng})
  - Time: ${rideRequest.departure_time}
  - Preferences: ${rideRequest.preferences || 'None'}
  
  Available rides:
  ${JSON.stringify(availableRides, null, 2)}
  
  Return only a JSON array of matches with scores.`

  const response = await callGroqAPI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ])

  try {
    return JSON.parse(response)
  } catch {
    return []
  }
}