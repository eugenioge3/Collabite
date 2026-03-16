import type { BusinessCategory, BusinessProfile } from './types';

export type BusinessProfileForm = {
  business_name: string;
  category: BusinessCategory | '';
  city: string;
  state: string;
  country: string;
  google_maps_url: string;
  description: string;
  instagram_handle: string;
  tiktok_handle: string;
};

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  restaurant: 'Restaurante',
  bar: 'Bar',
  hotel: 'Hotel',
  cafe: 'Cafe',
};

export function getEmailLocalPart(email?: string | null) {
  return (email ?? '').split('@')[0].trim().toLowerCase();
}

export function isPlaceholderBusinessName(name?: string | null, email?: string | null) {
  const normalizedName = (name ?? '').trim().toLowerCase();
  const localPart = getEmailLocalPart(email);
  return Boolean(normalizedName) && Boolean(localPart) && normalizedName === localPart;
}

export function normalizeHandle(value: string) {
  return value.trim().replace(/^@+/, '');
}

export function createBusinessProfileForm(
  profile?: Partial<BusinessProfile>,
  email?: string | null,
): BusinessProfileForm {
  return {
    business_name: isPlaceholderBusinessName(profile?.business_name, email)
      ? ''
      : profile?.business_name ?? '',
    category: profile?.category ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    country: profile?.country ?? 'Mexico',
    google_maps_url: profile?.google_maps_url ?? '',
    description: profile?.description ?? '',
    instagram_handle: profile?.instagram_handle ?? '',
    tiktok_handle: profile?.tiktok_handle ?? '',
  };
}

export function getBusinessProfileFieldErrors(
  form: BusinessProfileForm,
  email?: string | null,
) {
  const errors: Partial<Record<keyof BusinessProfileForm, string>> = {};
  const businessName = form.business_name.trim();
  const city = form.city.trim();
  const localPart = getEmailLocalPart(email);
  const googleMapsUrl = form.google_maps_url.trim();

  if (!businessName) {
    errors.business_name = 'Escribe el nombre real de tu negocio.';
  } else if (businessName.toLowerCase() === localPart) {
    errors.business_name = 'Usa el nombre real del negocio, no el alias del correo.';
  }

  if (!form.category) {
    errors.category = 'Selecciona la categoria principal de tu negocio.';
  }

  if (!city) {
    errors.city = 'Indica la ciudad donde operas.';
  }

  if (googleMapsUrl && !/^https?:\/\//i.test(googleMapsUrl)) {
    errors.google_maps_url = 'Usa una URL valida que empiece con http:// o https://.';
  }

  return errors;
}

export function getBusinessProfileChecklist(
  profile: Partial<BusinessProfile> | BusinessProfileForm,
  email?: string | null,
) {
  const businessName = (profile.business_name ?? '').trim();
  const category = profile.category ?? '';
  const city = (profile.city ?? '').trim();

  return [
    {
      key: 'business_name',
      label: 'Nombre del negocio',
      complete: Boolean(businessName) && !isPlaceholderBusinessName(businessName, email),
    },
    {
      key: 'category',
      label: 'Categoria',
      complete: Boolean(category),
    },
    {
      key: 'city',
      label: 'Ciudad',
      complete: Boolean(city),
    },
  ] as const;
}

export function isBusinessProfileReady(
  profile: Partial<BusinessProfile> | BusinessProfileForm,
  email?: string | null,
) {
  return getBusinessProfileChecklist(profile, email).every((item) => item.complete);
}

export function getBusinessProfileUpdatePayload(form: BusinessProfileForm) {
  return {
    business_name: form.business_name.trim(),
    category: form.category || null,
    city: form.city.trim() || null,
    state: form.state.trim() || null,
    country: form.country.trim() || null,
    google_maps_url: form.google_maps_url.trim() || null,
    description: form.description.trim() || null,
    instagram_handle: normalizeHandle(form.instagram_handle) || null,
    tiktok_handle: normalizeHandle(form.tiktok_handle) || null,
  };
}