import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATIC_SERVICES } from '../data/services'

export function useServices() {
  const [services, setServices] = useState(STATIC_SERVICES)

  useEffect(() => {
    let active = true
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (active && !error && data && data.length > 0) {
          setServices(data)
        }
      } catch {
        // keep static fallback
      }
    }
    fetchServices()
    return () => {
      active = false
    }
  }, [])

  return services
}
