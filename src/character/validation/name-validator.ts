export class NameValidator {
  private static readonly NAME_REGEX = /^[A-Za-z_]{4,15}$/;

  static ensureValid(name: string): void {
    if (!NameValidator.NAME_REGEX.test(name)) {
      throw new Error('Name must be 4-15 characters and contain only letters or underscores.');
    }
  }
}
