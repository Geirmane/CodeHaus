export const capitalize = (value: string) => {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatPokemonId = (id: number) => `#${id.toString().padStart(3, '0')}`;

export const getSpriteUri = (sprites: {
  front_default: string | null;
  other?: {
    ['official-artwork']?: {
      front_default: string | null;
    };
  };
}) => sprites.other?.['official-artwork']?.front_default ?? sprites.front_default ?? '';

export const sanitizeFlavorText = (text: string) =>
  text.replace(/\f|\n|\r/g, ' ').replace(/\s+/g, ' ').trim();

export const extractIdFromUrl = (url: string) => {
  const parts = url.split('/').filter(Boolean);
  const id = Number(parts[parts.length - 1]);
  return Number.isNaN(id) ? -1 : id;
};

