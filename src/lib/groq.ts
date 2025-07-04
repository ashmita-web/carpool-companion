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
  
  if (!apiKey) {
    throw new Error('Groq API key not configured')
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data: GroqResponse = await response.json()
    return data.choices[0]?.message?.content || 'No response from AI'
  } catch (error) {
    console.error('Groq API call failed:', error)
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
  - Pickup: ${rideRequest.pickup_location} (${rideRequest.pickup_lat}, ${rideRequest.pickup_lng})
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