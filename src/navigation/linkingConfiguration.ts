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
  /** When /vendor/:storeId is opened, we need to set isFromProductDetails to true */
  getStateFromPath: (path, options) => {
    const state = getStateFromPath(path, options);

    try {
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
                                  isFromProductDetails: true,
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

    return state;
  },
};
