export function assertValidMongoUpdate(update: any) {
  Object.keys(update).forEach((key: string) => {
    if (!key.startsWith('$')) {
      throw new Error('Expecting mongo update to contain update modifiers.');
    }
  });
}
