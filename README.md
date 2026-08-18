# Pa`Donde

An AI-powered local discovery platform that helps users find restaurants, bars, and cafés based on what they actually want, using natural-language search instead of traditional filters alone.

## Overview

Local Discovery AI allows users to describe what they are looking for in their own words. For example:

> "I want a quiet and affordable restaurant for a date."

The application uses Google Gemini to understand the user's request and transform it into structured search criteria. The backend then uses those criteria to search a PostgreSQL database and rank places based on relevance, price, and distance.

The application also supports location-aware recommendations by using the user's current location when available, with a fallback to the center of Santo Domingo when location access is unavailable.

## Features

- Natural-language search powered by Google Gemini
- AI-powered intent and preference extraction
- Restaurant, bar, and café discovery
- Tag-based place matching
- Price-based filtering
- Location-aware recommendations
- Distance calculation between users and places
- Relevance-based ranking system
- Fallback location for users who do not provide their location
- REST API backend
- Responsive web interface

## How It Works

The application follows a simple pipeline:

```text
User Query
    ↓
Google Gemini
    ↓
Structured Search Filters
    ↓
PostgreSQL Query
    ↓
Relevance & Distance Ranking
    ↓
Recommended Places
