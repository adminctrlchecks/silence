'use client';

import { useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PlaceResult = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
};

type Props = {
  label: string;
  placeholder?: string;
  initialValue?: string;
  required?: boolean;
  onSelect: (place: PlaceResult) => void;
};

export function PlacesAutocomplete({ label, placeholder, initialValue = '', required, onSelect }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
          setOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function handleSelect(place: PlaceResult) {
    setQuery(`${place.city}, ${place.country}`);
    setResults([]);
    setOpen(false);
    onSelect(place);
  }

  return (
    <div className="relative space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder ?? 'Search for a city…'}
          className="pl-9"
          required={required}
          autoComplete="off"
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {open && results.length > 0 ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card shadow-md"
        >
          {results.map((place, i) => (
            <li
              key={`${place.city}-${place.country}-${i}`}
              role="option"
              aria-selected={false}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
              onMouseDown={() => handleSelect(place)}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{place.city}</span>
              <span className="text-muted-foreground">{place.country}</span>
              <span className="ml-auto text-xs text-muted-foreground">{place.timezone}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
