import { describe, expect, it } from 'vitest';
import {
  createBusinessProfileForm,
  getBusinessProfileFieldErrors,
  getBusinessProfileUpdatePayload,
  isBusinessProfileReady,
} from './businessProfile';

describe('businessProfile helpers', () => {
  it('clears placeholder business names derived from email', () => {
    const form = createBusinessProfileForm(
      {
        business_name: 'demo.business',
        category: null,
        city: null,
        state: null,
        country: null,
        google_maps_url: null,
        logo_url: null,
        description: null,
        instagram_handle: null,
        instagram_verified: false,
        tiktok_handle: null,
        tiktok_verified: false,
        verified: false,
        subscription_status: 'free',
        created_at: '',
        user_id: '1',
      },
      'demo.business@example.com',
    );

    expect(form.business_name).toBe('');
  });

  it('reports missing required fields and invalid map urls', () => {
    const errors = getBusinessProfileFieldErrors(
      {
        business_name: '',
        category: '',
        city: '',
        state: '',
        country: 'Mexico',
        google_maps_url: 'maps.google.com/place',
        description: '',
        instagram_handle: '',
        tiktok_handle: '',
      },
      'demo.business@example.com',
    );

    expect(errors.business_name).toBeTruthy();
    expect(errors.category).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.google_maps_url).toBeTruthy();
  });

  it('marks the profile as ready when the minimum required data exists', () => {
    expect(
      isBusinessProfileReady(
        {
          business_name: 'Tacos del Mar',
          category: 'restaurant',
          city: 'Cancun',
          state: '',
          country: 'Mexico',
          google_maps_url: '',
          description: '',
          instagram_handle: '',
          tiktok_handle: '',
        },
        'demo.business@example.com',
      ),
    ).toBe(true);
  });

  it('trims fields and strips @ from social handles in the payload', () => {
    const payload = getBusinessProfileUpdatePayload({
      business_name: '  Tacos del Mar ',
      category: 'restaurant',
      city: ' Cancun ',
      state: '',
      country: ' Mexico ',
      google_maps_url: '',
      description: '  Mariscos frente al mar ',
      instagram_handle: '@tacosdelmar',
      tiktok_handle: ' @tacosdelmar.mx ',
    });

    expect(payload.business_name).toBe('Tacos del Mar');
    expect(payload.city).toBe('Cancun');
    expect(payload.country).toBe('Mexico');
    expect(payload.description).toBe('Mariscos frente al mar');
    expect(payload.instagram_handle).toBe('tacosdelmar');
    expect(payload.tiktok_handle).toBe('tacosdelmar.mx');
  });
});
