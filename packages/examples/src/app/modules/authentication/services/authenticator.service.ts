import { AbstractEmailAuthenticator } from '@foal/password';
import { Service } from '@foal/core';

import { User } from '../../../models';

@Service()
export class AuthenticatorService extends AbstractEmailAuthenticator<User> {
  UserClass = User;
}
