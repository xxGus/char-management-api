import { Character } from '../../character/character.entity';

export interface CharacterRepository {
  saveCharacter(character: Character): Character;
  getCharacter(id: string): Character | undefined;
  getAllCharacters(): Character[];
}

export const CHARACTER_REPOSITORY = Symbol('CHARACTER_REPOSITORY');
