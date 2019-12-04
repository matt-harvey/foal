// std
import { URL } from 'url';

// 3p
import * as fetch from 'node-fetch';

// FoalTS
import { AbstractProvider, SocialTokens } from './abstract-provider.service';

export interface FacebookAuthParams {
  auth_type?: 'rerequest';
}

export interface FacebookUserInfoParams {
  fields?: string[];
}

export class UserInfoError extends Error {
  readonly name = 'UserInfoError';

  constructor(readonly error: any) {
    super(
      'The resource server returned an error. Impossible to access the user\'s information.\n'
      + JSON.stringify(error, null, 2)
    );
  }
}

/**
 * Facebook social provider.
 *
 * @export
 * @class FacebookProvider
 * @extends {AbstractProvider<FacebookAuthParams, FacebookUserInfoParams>}
 */
export class FacebookProvider extends AbstractProvider<FacebookAuthParams, FacebookUserInfoParams> {
  protected configPaths = {
    clientId: 'settings.social.facebook.clientId',
    clientSecret: 'settings.social.facebook.clientSecret',
    redirectUri: 'settings.social.facebook.redirectUri',
  };

  protected authEndpoint = 'https://www.facebook.com/v5.0/dialog/oauth';
  protected tokenEndpoint = 'https://graph.facebook.com/v5.0/oauth/access_token';
  protected userInfoEndpoint = 'https://graph.facebook.com/v5.0/me';

  protected fields: string[] = [ 'id', 'name', 'email' ];

  protected defaultScopes: string[] = [ 'email' ];

  async getUserInfoFromTokens(tokens: SocialTokens, params?: FacebookUserInfoParams) {
    const url = new URL(this.userInfoEndpoint);
    url.searchParams.set('access_token', tokens.access_token);
    const fields = params && params.fields ? params.fields : this.fields;
    url.searchParams.set('fields', fields.join(','));

    const response = await fetch(url.href);
    const body = await response.json();

    if (!response.ok) {
      throw new UserInfoError(body);
    }

    return body;
  }

}
