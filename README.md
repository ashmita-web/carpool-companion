# Carpool Companion

A ride-sharing web application allowing users to offer, search, and request carpool rides.

---

## Features

- **Ride search & offer**: Users can post ride offers or search available ones filtered by location or date.  
- **Ride matching**: Intelligent ride matching with match scores and user preferences.  
- **Map integration**: Leaflet map showing pickup locations of ride offers.  
- **Premium users**: Advanced filters for premium users (smoking, music, pets, personality).  
- **Eco‑coin & verification badges**: Indicates trusted and eco-conscious drivers.  
- **Request system**: Send ride requests that the driver can accept or reject.

**Demo video**:  
[Watch here](https://drive.google.com/file/d/1ItyXA2zX-JAgXKeTFNc870KlFQp7K1kP/view?usp=sharing)

---

## Tech Stack

| Layer           | Tools / Libraries                                      |
|----------------|--------------------------------------------------------|
| Frontend        | React, TypeScript, Tailwind CSS, Leaflet, lucide-react |
| Backend         | Supabase (Postgres), GROQ (or custom matching logic)  |
| Date Handling   | date-fns                                               |
| Version Control | Git + GitHub                                           |

---

## Setup

1. **Clone the repository**  
   ```bash
    git clone https://github.com/ashmita-web/carpool-companion.git
   cd carpool-companion

2. Install dependencies
    ```bash
    npm install

3. Run locally
    ```bash
    npm run dev

4. Environment Variables

    Create a `.env.local` file in the root with the following:

    ```bash
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_public_key
    VITE_GROQ_API_KEY=your_groq_api_key

## Usage

- Visit /rides to toggle between Find and Offer rides.
- Use the Map panel to view ride pickup locations.
- Click Request Ride on available cards (disabled for your own rides).

## Authentication & Permissions

- Users must sign up and log in via the provided useAuth context.
- Premium-only filters are gated by user role, enforced through usePremiumGuard.

## Contributing

- Fork the repository.
- Create a feature branch:
    ```bash
    git checkout -b feature/your-feature
- Commit your changes.
- Open a pull request describing your improvements.
