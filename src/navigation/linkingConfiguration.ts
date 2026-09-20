import {LinkingOptions, getStateFromPath} from '@react-navigation/native';

export const linkingConfiguration: LinkingOptions<any> = {
  prefixes: ['dealszhub://'],
  config: {
    screens: {
      BottomTabStack: {
        screens: {
          HomeTab: {
            screens: {
              VendorStack: {
                screens: {
                  PaymentStatus: 'payment-status',
                  Vendor: {
                    path: 'vendor/:storeId',
                    parse: {
                      storeId: (storeId: string) => storeId,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  /** Deep link handler */
  getStateFromPath: (path, options) => {
    try {
      if (path.startsWith('payment-status')) {
        let linkId = '';
        let orderId = '';
        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
          const queryString = path.slice(queryIndex + 1);
          const pairs = queryString.split('&');
          for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key === 'link_id') linkId = decodeURIComponent(value || '');
            if (key === 'order_id') orderId = decodeURIComponent(value || '');
          }
        }
        return {
          routes: [
            {
              name: 'BottomTabStack',
              state: {
                routes: [
                  {
                    name: 'HomeTab',
                    state: {
                      routes: [
                        {
                          name: 'VendorStack',
                          state: {
                            routes: [
                              {
                                name: 'PaymentStatus',
                                params: {
                                  linkId: linkId || orderId,
                                  orderId: orderId || linkId,
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };
      }

      const parts = path.split('/');
      if (parts[0] === 'vendor' && parts[1]) {
        const storeId = parts[1];
        return {
          routes: [
            {
              name: 'BottomTabStack',
              state: {
                routes: [
                  {
                    name: 'HomeTab',
                    state: {
                      routes: [
                        {
                          name: 'VendorStack',
                          state: {
                            routes: [
                              {
                                name: 'Vendor',
                                params: {
                                  storeId,
                                  isFromProductDetails: false,
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };
      }
    } catch (e) {
      console.warn('Error parsing deep link:', e);
    }

    return getStateFromPath(path, options);
  },
};
