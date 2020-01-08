import * as faker from 'faker';

export function getFakePayload() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    accountId: faker.random.uuid()
  };
}
