/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../session/session';
import {testConfig, queueMockResponse} from '../../../../__tests__/test-helper';
import {ApiVersion, Shopify} from '../../../../base-types';
import {shopifyApi} from '../../../..';

import {restResources} from '../../2022-10';

let shopify: Shopify<typeof restResources>;

beforeEach(() => {
  shopify = shopifyApi({
    ...testConfig,
    apiVersion: ApiVersion.October22,
    restResources,
  });
});

describe('Currency resource', () => {
  const domain = 'test-shop.myshopify.io';
  const headers = {'X-Shopify-Access-Token': 'this_is_a_test_token'};
  const session = new Session({
    id: '1234',
    shop: domain,
    state: '1234',
    isOnline: true,
  });
  session.accessToken = 'this_is_a_test_token';

  it('test_1', async () => {
    queueMockResponse(JSON.stringify({"currencies": [{"currency": "CAD", "rate_updated_at": "2018-01-23T19:01:01-05:00", "enabled": true}, {"currency": "EUR", "rate_updated_at": "2018-01-23T19:01:01-05:00", "enabled": true}, {"currency": "JPY", "rate_updated_at": "2018-01-23T19:01:01-05:00", "enabled": true}]}));

    await shopify.rest.Currency.all({
      session: session,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2022-10/currencies.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

});
