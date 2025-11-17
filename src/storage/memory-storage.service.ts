import { Injectable } from '@nestjs/common';
import { Character } from '../character/character.entity';
import { CharacterRepository } from './interfaces/character-repository.interface';

@Injectable()
export class MemoryStorageService implements CharacterRepository {
  private readonly characters = new Map<string, Character>();

  saveCharacter(character: Character): Character {
    this.characters.set(character.id, character);
    return character;
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }
}
