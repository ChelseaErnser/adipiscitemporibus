import {
  queueMockResponse,
  queueMockResponses,
  shopify,
} from '../../../__tests__/test-helper';
import {DataType, GetRequestParams} from '../../http_client/types';
import {RestRequestReturn, PageInfo} from '../types';
import * as ShopifyErrors from '../../../error';
import {ShopifyHeader} from '../../../base-types';

const domain = 'test-shop.myshopify.io';
const successResponse = {
  products: [
    {
      title: 'Test title',
      amount: 10,
    },
  ],
};

describe('REST client', () => {
  it('can make GET request', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    await expect(client.get({path: 'products'})).resolves.toEqual(
      buildExpectedResponse(successResponse),
    );
    expect({
      method: 'GET',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json`,
    }).toMatchMadeHttpRequest();
  });

  it('can make GET request with path in query', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));
    const getRequest = {
      path: 'products',
      query: {
        path: 'some_path',
      },
    };

    await expect(client.get(getRequest)).resolves.toEqual(
      buildExpectedResponse(successResponse),
    );
    expect({
      method: 'GET',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json?path=some_path`,
    }).toMatchMadeHttpRequest();
  });

  it('can make POST request with JSON data', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    const postData = {
      title: 'Test product',
      amount: 10,
    };

    await expect(
      client.post({path: 'products', type: DataType.JSON, data: postData}),
    ).resolves.toEqual(buildExpectedResponse(successResponse));

    expect({
      method: 'POST',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json`,
      headers: {'Content-Type': DataType.JSON.toString()},
      data: JSON.stringify(postData),
    }).toMatchMadeHttpRequest();
  });

  it('can make POST request with form data', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    const postData = {
      title: 'Test product + something else',
      amount: 10,
    };

    await expect(
      client.post({
        path: 'products',
        type: DataType.URLEncoded,
        data: postData,
      }),
    ).resolves.toEqual(buildExpectedResponse(successResponse));

    expect({
      method: 'POST',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json`,
      headers: {'Content-Type': DataType.URLEncoded.toString()},
      data: 'title=Test+product+%2B+something+else&amount=10',
    }).toMatchMadeHttpRequest();
  });

  it('can make PUT request with JSON data', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    const putData = {
      title: 'Test product',
      amount: 10,
    };

    await expect(
      client.put({path: 'products/123', type: DataType.JSON, data: putData}),
    ).resolves.toEqual(buildExpectedResponse(successResponse));

    expect({
      method: 'PUT',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products/123.json`,
      headers: {'Content-Type': DataType.JSON.toString()},
      data: JSON.stringify(putData),
    }).toMatchMadeHttpRequest();
  });

  it('can make DELETE request', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    await expect(client.delete({path: 'products/123'})).resolves.toEqual(
      buildExpectedResponse(successResponse),
    );

    expect({
      method: 'DELETE',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products/123.json`,
    }).toMatchMadeHttpRequest();
  });

  it('merges custom headers with the default ones', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    const customHeaders: {[key: string]: string} = {
      'X-Not-A-Real-Header': 'some_value',
    };

    queueMockResponse(JSON.stringify(successResponse));

    await expect(
      client.get({path: 'products', extraHeaders: customHeaders}),
    ).resolves.toEqual(buildExpectedResponse(successResponse));

    customHeaders[ShopifyHeader.AccessToken] = 'dummy-token';
    expect({
      method: 'GET',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json`,
      headers: customHeaders,
    }).toMatchMadeHttpRequest();
  });

  it('includes pageInfo of type PageInfo in the returned object for calls with next or previous pages', async () => {
    const params = getDefaultPageInfo();
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });
    const linkHeaders = [
      `<${params.previousPageUrl}>; rel="previous"`,
      `<${params.nextPageUrl}>; rel="next"`,
      'This invalid info header will be ignored',
    ];

    queueMockResponses([
      JSON.stringify(successResponse),
      {headers: {link: linkHeaders.join(', ')}},
    ]);

    const response = (await client.get({
      path: 'products',
      query: {limit: 10},
    })) as RestRequestReturn;

    expect(response).toHaveProperty('pageInfo');
    expect(response.pageInfo).toEqual(params);
  });

  it('is able to make subsequent get requests to either pageInfo.nextPage or pageInfo.prevPage', async () => {
    const params = getDefaultPageInfo();
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });
    const linkHeaders = [
      `<${params.previousPageUrl}>; rel="previous"`,
      `<${params.nextPageUrl}>; rel="next"`,
    ];

    queueMockResponses(
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
    );

    const initialResponse = (await client.get({
      path: 'products',
      query: {limit: 10},
    })) as RestRequestReturn;

    const pageInfo = initialResponse.pageInfo as PageInfo;
    const nextPageResponse = await client.get(
      pageInfo.nextPage as GetRequestParams,
    );
    expect(nextPageResponse).toBeDefined();
    expect(nextPageResponse).toHaveProperty('pageInfo');

    const prevPageResponse = await client.get(
      pageInfo.prevPage as GetRequestParams,
    );
    expect(prevPageResponse).toBeDefined();
    expect(prevPageResponse).toHaveProperty('pageInfo');
  });

  it('can request next pages until they run out', async () => {
    const params = getDefaultPageInfo();
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });
    const linkHeaders = [
      `<${params.previousPageUrl}>; rel="previous"`,
      `<${params.nextPageUrl}>; rel="next"`,
    ];

    queueMockResponses(
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
      [
        JSON.stringify(successResponse),
        {headers: {link: `<${params.previousPageUrl}>; rel="previous"`}},
      ],
    );

    const initialResponse = (await client.get({
      path: 'products',
      query: {limit: 10},
    })) as RestRequestReturn;
    expect(initialResponse.pageInfo!.nextPageUrl).toBe(params.nextPageUrl);
    const secondResponse = (await client.get(
      initialResponse.pageInfo!.nextPage!,
    )) as RestRequestReturn;
    expect(secondResponse.pageInfo!.nextPageUrl).toBe(params.nextPageUrl);
    const thirdResponse = (await client.get(
      secondResponse.pageInfo!.nextPage!,
    )) as RestRequestReturn;
    expect(thirdResponse.pageInfo!.nextPageUrl).toBeUndefined();
    expect(thirdResponse.pageInfo!.nextPage).toBeUndefined();
  });

  it('can request previous pages until they run out', async () => {
    const params = getDefaultPageInfo();
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });
    const linkHeaders = [
      `<${params.previousPageUrl}>; rel="previous"`,
      `<${params.nextPageUrl}>; rel="next"`,
    ];

    queueMockResponses(
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
      [
        JSON.stringify(successResponse),
        {headers: {link: linkHeaders.join(', ')}},
      ],
      [
        JSON.stringify(successResponse),
        {headers: {link: `<${params.previousPageUrl}>; rel="next"`}},
      ],
    );

    const initialResponse = (await client.get({
      path: 'products',
      query: {limit: 10},
    })) as RestRequestReturn;
    expect(initialResponse.pageInfo!.previousPageUrl).toBe(
      params.previousPageUrl,
    );
    const secondResponse = (await client.get(
      initialResponse.pageInfo!.prevPage!,
    )) as RestRequestReturn;
    expect(secondResponse.pageInfo!.previousPageUrl).toBe(
      params.previousPageUrl,
    );
    const thirdResponse = (await client.get(
      secondResponse.pageInfo!.prevPage!,
    )) as RestRequestReturn;
    expect(thirdResponse.pageInfo!.previousPageUrl).toBeUndefined();
    expect(thirdResponse.pageInfo!.prevPage).toBeUndefined();
  });

  it('adapts to private app requests', async () => {
    shopify.config.isPrivateApp = true;

    const client = new shopify.clients.Rest({domain});

    queueMockResponse(JSON.stringify(successResponse));

    await expect(client.get({path: 'products'})).resolves.toEqual(
      buildExpectedResponse(successResponse),
    );

    const customHeaders: {[key: string]: string} = {};
    customHeaders[ShopifyHeader.AccessToken] = shopify.config.apiSecretKey;

    expect({
      method: 'GET',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json`,
      headers: customHeaders,
    }).toMatchMadeHttpRequest();

    shopify.config.isPrivateApp = false;
  });

  it('fails to instantiate without access token', () => {
    expect(() => new shopify.clients.Rest({domain})).toThrow(
      ShopifyErrors.MissingRequiredArgument,
    );
  });

  it('allows paths with .json', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    await expect(client.get({path: 'products.json'})).resolves.toEqual(
      buildExpectedResponse(successResponse),
    );
    expect({
      method: 'GET',
      domain,
      path: `/admin/api/${shopify.config.apiVersion}/products.json`,
    }).toMatchMadeHttpRequest();
  });

  it('allows full paths', async () => {
    const client = new shopify.clients.Rest({
      domain,
      accessToken: 'dummy-token',
    });

    queueMockResponse(JSON.stringify(successResponse));

    await expect(client.get({path: '/admin/some-path.json'})).resolves.toEqual(
      buildExpectedResponse(successResponse),
    );
    expect({
      method: 'GET',
      domain,
      path: '/admin/some-path.json',
    }).toMatchMadeHttpRequest();
  });
});

function getDefaultPageInfo(): PageInfo {
  const limit = '10';
  const fields = ['test1', 'test2'];
  const previousUrl = `https://${domain}/admin/api/${
    shopify.config.apiVersion
  }/products.json?limit=${limit}&fields=${fields.join(
    ',',
  )}&page_info=previousToken`;
  const nextUrl = `https://${domain}/admin/api/${
    shopify.config.apiVersion
  }/products.json?limit=${limit}&fields=${fields.join(
    ',',
  )}&page_info=nextToken`;
  const prevPage = {
    path: 'products',
    query: {
      fields: fields.join(','),
      limit: `${limit}`,
      page_info: 'previousToken',
    },
  };
  const nextPage = {
    path: 'products',
    query: {
      fields: fields.join(','),
      limit: `${limit}`,
      page_info: 'nextToken',
    },
  };

  return {
    limit,
    fields,
    previousPageUrl: previousUrl,
    nextPageUrl: nextUrl,
    prevPage,
    nextPage,
  };
}

function buildExpectedResponse(
  obj: unknown,
  pageInfo?: PageInfo,
): RestRequestReturn {
  const expectedResponse: RestRequestReturn = {
    body: obj,
    headers: expect.objectContaining({}),
  };

  if (pageInfo) {
    expectedResponse.pageInfo = pageInfo;
  }

  return expect.objectContaining(expectedResponse);
}
