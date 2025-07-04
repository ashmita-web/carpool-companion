import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Search } from 'lucide-react'

interface LocationInputProps {
  label: string
  value: string
  onChange: (location: string, lat: number, lng: number) => void
  placeholder?: string
  error?: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

export default function LocationInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "Enter a location",
  error 
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      
      if (response.ok) {
        const data: NominatimResult[] = await response.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      }
    } catch (error) {
      console.error('Error searching locations:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Debounce search requests
    debounceRef.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    setInputValue(suggestion.display_name)
    setShowSuggestions(false)
    onChange(
      suggestion.display_name,
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon)
    )
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="space-y-1 relative">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start">
                  <Search className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-900 truncate">
                      {suggestion.display_name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}