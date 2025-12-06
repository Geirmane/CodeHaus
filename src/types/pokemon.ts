export type PokemonSummary = {
  name: string;
  url: string;
};

export type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      ['official-artwork']?: {
        front_default: string | null;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

export type PokemonListResponse = {
  results: PokemonSummary[];
  next: string | null;
};

export type PokemonSpecies = {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  evolution_chain: {
    url: string;
  };
  genera: { genus: string; language: { name: string } }[];
};

export type EvolutionChainLink = {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
};

export type PokemonDetailBundle = {
  detail: PokemonDetail;
  flavorText: string;
  genera: string;
  evolutions: { name: string; id: number }[];
};

