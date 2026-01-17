import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product, Category, ProductStatus, User, UserRole, UserStatus, CategoryStatus, Order, OrderStatus, OrderDetails } from '../types';
import { account, databases, APPWRITE_CONFIG } from './appwrite';
import { ID, Query } from 'appwrite';

// Helper to delay for realistic loading effect
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Products', 'Categories', 'User', 'Users', 'Orders'],
  endpoints: (builder) => ({
    
    // Auth Endpoints
    login: builder.mutation({
      queryFn: async ({ email, password }) => {
        try {
          // Mock Login for Demo
          await delay(800);
          if (email === 'admin@demo.com' && password === '123456') {
             return { data: { $id: 'user_123', name: 'ישראל ישראלי', email, prefs: {} } };
          }
          
          // Real Appwrite Implementation:
          // await account.createEmailPasswordSession(email, password);
          // const user = await account.get();
          // return { data: user };
          
          throw new Error('פרטי התחברות שגויים');
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation({
      queryFn: async () => {
        try {
            // await account.deleteSession('current');
            await delay(500);
            return { data: true };
        } catch (error: any) {
            return { error: error.message };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Products Endpoints
    getProducts: builder.query({
      queryFn: async () => {
        try {
          // Mock Data
          await delay(600);
          const mockProducts: Product[] = [
            { $id: '1', title: 'חולצת כותנה לבנה', slug: 'white-cotton-shirt', content: 'תיאור המוצר...', status: ProductStatus.PUBLISHED, categoryId: 'cat_1', publishedAt: '2023-10-24T10:00:00Z', views: 120 },
            { $id: '2', title: 'מכנסי ג\'ינס כחולים', slug: 'blue-jeans', content: 'תיאור...', status: ProductStatus.DRAFT, categoryId: 'cat_2', publishedAt: '2023-10-22T10:00:00Z', views: 45 },
            { $id: '3', title: 'נעלי ספורט שחורות', slug: 'black-sneakers', content: '...', status: ProductStatus.PUBLISHED, categoryId: 'cat_3', publishedAt: '2023-10-15T10:00:00Z', views: 300 },
            { $id: '4', title: 'שעון יד קלאסי', slug: 'classic-watch', content: '...', status: ProductStatus.ARCHIVED, categoryId: 'cat_4', publishedAt: '2023-10-12T10:00:00Z', views: 89 },
            { $id: '5', title: 'תיק גב עור', slug: 'leather-backpack', content: '...', status: ProductStatus.PUBLISHED, categoryId: 'cat_1', publishedAt: '2023-10-10T10:00:00Z', views: 234 },
            { $id: '6', title: 'משקפי שמש אופנתיים', slug: 'fashion-sunglasses', content: '...', status: ProductStatus.PUBLISHED, categoryId: 'cat_1', publishedAt: '2023-10-08T10:00:00Z', views: 156 },
            { $id: '7', title: 'כובע צמר חורפי', slug: 'winter-wool-hat', content: '...', status: ProductStatus.DRAFT, categoryId: 'cat_2', publishedAt: '2023-10-05T10:00:00Z', views: 78 },
            { $id: '8', title: 'חגורת עור חומה', slug: 'brown-leather-belt', content: '...', status: ProductStatus.PUBLISHED, categoryId: 'cat_1', publishedAt: '2023-10-01T10:00:00Z', views: 412 },
          ];
          return { data: mockProducts };

          // Real Implementation:
          // const response = await databases.listDocuments(
          //   APPWRITE_CONFIG.DATABASE_ID,
          //   APPWRITE_CONFIG.COLLECTION_PRODUCTS,
          //   [Query.orderDesc('publishedAt')]
          // );
          // return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    createProduct: builder.mutation({
      queryFn: async (newProduct: Partial<Product>) => {
        try {
           await delay(1000);
           const product = { ...newProduct, $id: ID.unique(), views: 0, publishedAt: new Date().toISOString() } as Product;
           return { data: product };
           
           // Real:
           // const response = await databases.createDocument(..., ID.unique(), newProduct);
        } catch (error: any) {
           return { error: error.message };
        }
      },
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation({
        queryFn: async ({ id, ...updates }: { id: string } & Partial<Product>) => {
            await delay(800);
            const updatedProduct = { ...updates, $id: id } as Product;
            return { data: updatedProduct };
            // Real: await databases.updateDocument(..., id, updates);
        },
        invalidatesTags: ['Products']
    }),

    deleteProduct: builder.mutation({
        queryFn: async (productId: string) => {
            await delay(500);
            return { data: true };
            // Real: await databases.deleteDocument(..., productId);
        },
        invalidatesTags: ['Products']
    }),

    // Users Endpoints
    getUsers: builder.query({
      queryFn: async () => {
        try {
          await delay(600);
          const mockUsers: User[] = [
            { 
              $id: '1', 
              name: 'ישראל ישראלי', 
              email: 'israel@example.com', 
              role: UserRole.ADMIN, 
              status: UserStatus.ACTIVE,
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXfUmy5-3XklMyXSZJS9Bu8vWX0OVAxaVSJmKYcd8zGe_1ITX0nq_0opw-ciQmYEDDoamQEtWA230KCDXbN4oBvPRdKlKfMGce7voxJI3lETQi7Vv9k8Qa1SLPJ155ZLDs30iaGDC1vCzbGoPeYY-5pZ7cdul2e12lcYoOBUdXCy0PKMK_uzoasmaLP_Wwi1e-cbKP_GuOJgKGwSuVoN21Vein33qDRaVdlPbMfyWDFSPZufD9R1cNeiwT7PJgHc_E341w2qScow',
              joinedAt: '2024-01-12T10:00:00Z'
            },
            { 
              $id: '2', 
              name: 'שרה כהן', 
              email: 'sarah@example.com', 
              role: UserRole.EDITOR, 
              status: UserStatus.SUSPENDED,
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrdQX2zN6LubkgLjSoWXhw20tiab61ZbYEPm3hztDSCHgSr8pp44JkTcez-vm26TQHe3EAR3cPXv61www2sebx_wd6W2sLlTH6cPFQd8aIEMzQ-JYN7zkLb7_WjsGmDrzst06MvftP97AGkTm1VRI5yniIcznnr1DYroSh8MVttTxWLau5dMfh8glVm8Fd8OHZkqiOrea_m4STERZ2zWjnVEskqsjXqXckG7Ds-qZ3s3CHJDJnUxnrXPWKdwd3agZ_lvHzJLe5vA',
              joinedAt: '2023-11-10T10:00:00Z'
            },
            { 
              $id: '3', 
              name: 'דוד לוי', 
              email: 'david@example.com', 
              role: UserRole.VIEWER, 
              status: UserStatus.ACTIVE,
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOO3jVDvvk8v5dMPIqgI4HamNjXgED6YePsR9j2aFeS6XodbSt_GgFc0fNrGIhkvKXRLtPlIHi6fUGPIgpki5FyzvgzymQTJQJqPYbNmK0QSKbBSEYTQ8ond69sXBm9c5zdLTXAf28GjYigANmRcDf4_kEjc0lupjbM66veaaX-mVbn9lVHYaAkrtlNoo8IkGTtoVuQDoTE23AG8Ji0js3ULEsVJCqxdgkgAHKis-7TmIocjnhZ0sUudDzbD8w_xq2lRfu6ldDw',
              joinedAt: '2024-01-05T10:00:00Z'
            },
            { 
              $id: '4', 
              name: 'מאיה גולן', 
              email: 'maya@example.com', 
              role: UserRole.EDITOR, 
              status: UserStatus.ACTIVE,
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlI1Haq20c1hPgtK7j-8bWoUPxR5fasB2oZrZ00vCDHxkAyrikmQivvQZ7P2Yu2FW1HL2Z3Af1Bam9nwYrjCx0qH-xWRKBBlBZ-3TU0I3fNo5AIvyWXGFUwI5XSgZUs7DgZrky1VgNnQ_aE581F8-FvY5X8CwVQDiMVgXrWYrbCsdaVw7ysJp3-ChSdA9LIgdbzjRkoJx3ZqGkhfANzKih3fgiBXmUQUom34OS04SNi46sQfyV84ZmD1i3MAzBMCOjFib4xOkY0w',
              joinedAt: '2023-12-21T10:00:00Z'
            },
          ];
          return { data: mockUsers };

          // Real Implementation:
          // const response = await databases.listDocuments(
          //   APPWRITE_CONFIG.DATABASE_ID,
          //   APPWRITE_CONFIG.COLLECTION_USERS,
          //   [Query.orderDesc('joinedAt')]
          // );
          // return { data: response.documents as unknown as User[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Users'],
    }),

    createUser: builder.mutation({
      queryFn: async (newUser: Partial<User>) => {
        try {
          await delay(1000);
          const user = { 
            ...newUser, 
            $id: ID.unique(), 
            joinedAt: new Date().toISOString(),
            status: UserStatus.ACTIVE
          } as User;
          return { data: user };
          
          // Real:
          // const response = await databases.createDocument(..., ID.unique(), newUser);
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation({
      queryFn: async ({ id, ...updates }: { id: string } & Partial<User>) => {
        await delay(800);
        const updatedUser = { ...updates, $id: id } as User;
        return { data: updatedUser };
        // Real: await databases.updateDocument(..., id, updates);
      },
      invalidatesTags: ['Users']
    }),

    deleteUser: builder.mutation({
      queryFn: async (userId: string) => {
        await delay(500);
        return { data: true };
        // Real: await databases.deleteDocument(..., userId);
      },
      invalidatesTags: ['Users']
    }),

    // Categories Endpoints
    getCategories: builder.query({
      queryFn: async () => {
        try {
          await delay(600);
          const mockCategories: Category[] = [
            { 
              $id: '1', 
              name: 'ביגוד והנעלה', 
              slug: 'clothing-footwear',
              parentId: null,
              status: CategoryStatus.ACTIVE,
              displayOrder: 1,
              description: 'מגוון ביגוד והנעלה',
              icon: 'checkroom',
              iconColor: 'blue'
            },
            { 
              $id: '2', 
              name: 'חולצות גברים', 
              slug: 'mens-shirts',
              parentId: '1',
              status: CategoryStatus.ACTIVE,
              displayOrder: 1,
              icon: 'checkroom',
              iconColor: 'blue'
            },
            { 
              $id: '3', 
              name: 'מכנסיים', 
              slug: 'pants',
              parentId: '1',
              status: CategoryStatus.ACTIVE,
              displayOrder: 2,
              description: 'מגוון מכנסיים לכל אירוע, ג\'ינסים, מכנסי אלגנט וטרנינגים.',
              icon: 'checkroom',
              iconColor: 'blue'
            },
            { 
              $id: '4', 
              name: 'אלקטרוניקה ומחשבים', 
              slug: 'electronics-computers',
              parentId: null,
              status: CategoryStatus.HIDDEN,
              displayOrder: 2,
              icon: 'devices',
              iconColor: 'purple'
            },
            { 
              $id: '5', 
              name: 'לבית ולגן', 
              slug: 'home-garden',
              parentId: null,
              status: CategoryStatus.ACTIVE,
              displayOrder: 3,
              icon: 'home',
              iconColor: 'orange'
            },
          ];
          return { data: mockCategories };

          // Real Implementation:
          // const response = await databases.listDocuments(
          //   APPWRITE_CONFIG.DATABASE_ID,
          //   APPWRITE_CONFIG.COLLECTION_CATEGORIES,
          //   [Query.orderAsc('displayOrder')]
          // );
          // return { data: response.documents as unknown as Category[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation({
      queryFn: async (newCategory: Partial<Category>) => {
        try {
          await delay(1000);
          const category = { 
            ...newCategory, 
            $id: ID.unique(),
            slug: newCategory.slug || newCategory.name?.toLowerCase().replace(/\s+/g, '-') || '',
            status: newCategory.status || CategoryStatus.ACTIVE,
            displayOrder: newCategory.displayOrder || 0
          } as Category;
          return { data: category };
          
          // Real:
          // const response = await databases.createDocument(..., ID.unique(), newCategory);
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation({
      queryFn: async ({ id, ...updates }: { id: string } & Partial<Category>) => {
        await delay(800);
        const updatedCategory = { ...updates, $id: id } as Category;
        return { data: updatedCategory };
        // Real: await databases.updateDocument(..., id, updates);
      },
      invalidatesTags: ['Categories']
    }),

    deleteCategory: builder.mutation({
      queryFn: async (categoryId: string) => {
        await delay(500);
        return { data: true };
        // Real: await databases.deleteDocument(..., categoryId);
      },
      invalidatesTags: ['Categories']
    }),

    // Dashboard Stats
    getStats: builder.query({
        queryFn: async () => {
            await delay(500);
            return {
                data: {
                    totalPosts: 142,
                    totalViews: 45020,
                    activeUsers: 18,
                    storageUsed: '2.4GB'
                }
            }
        }
    }),

    // Orders Endpoints
    getOrders: builder.query({
      queryFn: async () => {
        try {
          await delay(600);
          const mockOrders: Order[] = [
            {
              $id: '10234',
              customerName: 'ישראל ישראלי',
              customerEmail: 'israel@example.com',
              customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8xg63fA6WRuaaehsAr-mrMw4s69bnmHJj0_SS3s1BLoO8Bz8e6gCVw8Hm9Qao0WTot8pDUwi2xz7a4ttqSWRwYmd62tRaHN-NrLYTI-eARpdtl17vBsoXooMRn2WC4bQsM0OTHligfJa6KigPpjMlsaoz_YZcH_7sF9sCTLAfhRic4cOAksbo2R9D9tsr2nJfm1AsGzh9LfO8t2ZSOiIb_SzYmKgFRkBQapPOu6TiMyfJYRmo_EZjnwOzMUf8xmICxCZ2Um6U1A',
              total: 450.00,
              status: OrderStatus.COMPLETED,
              createdAt: '2023-10-24T10:00:00Z'
            },
            {
              $id: '10235',
              customerName: 'משה כהן',
              customerEmail: 'moshe@example.com',
              total: 120.50,
              status: OrderStatus.PROCESSING,
              createdAt: '2023-10-23T10:00:00Z'
            },
            {
              $id: '10236',
              customerName: 'דני דין',
              customerEmail: 'danny@example.com',
              total: 890.00,
              status: OrderStatus.CANCELLED,
              createdAt: '2023-10-22T10:00:00Z'
            },
            {
              $id: '10237',
              customerName: 'שרה לוי',
              customerEmail: 'sarah@example.com',
              customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeMBBTGnqdMXjFo_xL6-qy13CnkjPQm9fVfgXQnBzzz9w_ahfsvctBnB3e94ct9-KTXcfI6WvutAW9-C1Ew4MPekremT5hGRNfUltJksRitkPsRZk9oiLYq4Ee1fNq7lTpVemZs9BgmCbwT3rdXvBuP6V9dceKp2VyeSAphVU4rbPpg2mBo9oRudRuRWNtOGDSghsFA4rDG1URCFFlAPiaZJmIv3apjOvUSnqwP2PlEnmHAzx8EBHIVohI5_5fe8p7_s9ZvNalSw',
              total: 2450.00,
              status: OrderStatus.COMPLETED,
              createdAt: '2023-10-21T10:00:00Z'
            },
            {
              $id: '10238',
              customerName: 'רועי אברהם',
              customerEmail: 'roi@example.com',
              total: 55.00,
              status: OrderStatus.PROCESSING,
              createdAt: '2023-10-20T10:00:00Z'
            },
            {
              $id: '10239',
              customerName: 'נועה גולן',
              customerEmail: 'noa@example.com',
              total: 320.00,
              status: OrderStatus.PENDING,
              createdAt: '2023-10-19T10:00:00Z'
            },
            {
              $id: '10240',
              customerName: 'אלון מזרחי',
              customerEmail: 'alon@example.com',
              total: 780.00,
              status: OrderStatus.COMPLETED,
              createdAt: '2023-10-18T10:00:00Z'
            },
            {
              $id: '10241',
              customerName: 'מיכל ברק',
              customerEmail: 'michal@example.com',
              total: 165.00,
              status: OrderStatus.PENDING,
              createdAt: '2023-10-17T10:00:00Z'
            },
          ];
          return { data: mockOrders };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Orders'],
    }),

    deleteOrder: builder.mutation({
      queryFn: async (orderId: string) => {
        await delay(500);
        return { data: true };
      },
      invalidatesTags: ['Orders']
    }),

    getOrderById: builder.query<OrderDetails, string>({
      queryFn: async (orderId: string) => {
        try {
          await delay(600);
          
          // Mock order details data
          const mockOrderDetails: Record<string, OrderDetails> = {
            '10234': {
              $id: '10234',
              customerName: 'ישראל ישראלי',
              customerEmail: 'israel@example.com',
              customerPhone: '050-1234567',
              customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8xg63fA6WRuaaehsAr-mrMw4s69bnmHJj0_SS3s1BLoO8Bz8e6gCVw8Hm9Qao0WTot8pDUwi2xz7a4ttqSWRwYmd62tRaHN-NrLYTI-eARpdtl17vBsoXooMRn2WC4bQsM0OTHligfJa6KigPpjMlsaoz_YZcH_7sF9sCTLAfhRic4cOAksbo2R9D9tsr2nJfm1AsGzh9LfO8t2ZSOiIb_SzYmKgFRkBQapPOu6TiMyfJYRmo_EZjnwOzMUf8xmICxCZ2Um6U1A',
              total: 450.00,
              status: OrderStatus.COMPLETED,
              createdAt: '2023-10-12T14:30:00Z',
              shippingAddress: {
                street: 'שדרות רוטשילד 10',
                apartment: 'דירה 4, קומה 2',
                city: 'תל אביב - יפו',
                postalCode: '6688112',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item1',
                  productName: 'נעלי ריצה Nike Air',
                  productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOoKmEQMog5YsfxkUH2J3L50mxVUaflFMQ9nIq-i_MMHZ0_tr2enlyYjallO6RUXEvwK9PBVn6S-qUknIZeFWWXyi05JKmDzOOOT2f1T8ja7x4YddjqO9fB5oWWecnkV3KtnQuUjYHIFJBBzDy51MgYHauy04PSco3OUr5w4ipOBQEQbrJp1OAd7Ucr8O5Wck22rSnCwPvDYGRTyKBHH3oCE3HdQ8SX3SxOH1vGc48lSQypv67fX5cQ2fRI8sRF67TDUOudGOs1w',
                  variant: 'צבע: אדום | מידה: 42',
                  quantity: 1,
                  price: 350.00,
                  total: 350.00
                },
                {
                  $id: 'item2',
                  productName: 'שעון יד אנלוגי',
                  productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvEImJ211EJAPFPvvLA9leKPEQ1ryCSPGGvLIg5rg3LNAkwoURxbD3vZaUdcwvN1ZovBs3ck3xVsBYiVLUQeAvOBCMicB-ItUiZQhlnCICGgR2s1q9uEfD0zUb-mH75FuSesuHk7lT8eBhx1mwYB_Cv_65_EMIgIJpsASQU-I7y3CTNC7PAR5EaAK0zCeRwxZrjR2B7BfwxB681VJs6U_9cAZieFOZQgyfltB2lwIzGX-PfZcnUxKGXnnDEG-VMUJg2hSnbYCFwQ',
                  variant: 'צבע: לבן',
                  quantity: 1,
                  price: 80.00,
                  total: 80.00
                }
              ],
              payment: {
                method: 'Visa מסתיים ב-4242',
                cardExpiry: '12/24',
                transactionId: 'PAY-8832992',
                chargeDate: '2023-10-12'
              },
              subtotal: 430.00,
              shippingCost: 20.00,
              tax: 0.00
            },
            '10235': {
              $id: '10235',
              customerName: 'משה כהן',
              customerEmail: 'moshe@example.com',
              customerPhone: '052-9876543',
              total: 120.50,
              status: OrderStatus.PROCESSING,
              createdAt: '2023-10-23T10:00:00Z',
              shippingAddress: {
                street: 'רחוב הרצל 25',
                city: 'חיפה',
                postalCode: '3301234',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item3',
                  productName: 'חולצת כותנה לבנה',
                  variant: 'צבע: לבן | מידה: L',
                  quantity: 2,
                  price: 60.25,
                  total: 120.50
                }
              ],
              payment: {
                method: 'Mastercard מסתיים ב-1234',
                cardExpiry: '06/25',
                transactionId: 'PAY-8832993',
                chargeDate: '2023-10-23'
              },
              subtotal: 120.50,
              shippingCost: 0.00,
              tax: 0.00
            },
            '10236': {
              $id: '10236',
              customerName: 'דני דין',
              customerEmail: 'danny@example.com',
              customerPhone: '054-1112233',
              total: 890.00,
              status: OrderStatus.CANCELLED,
              createdAt: '2023-10-22T10:00:00Z',
              shippingAddress: {
                street: 'רחוב דיזנגוף 100',
                apartment: 'קומה 5',
                city: 'תל אביב',
                postalCode: '6433222',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item4',
                  productName: 'תיק גב עור',
                  variant: 'צבע: חום',
                  quantity: 1,
                  price: 450.00,
                  total: 450.00
                },
                {
                  $id: 'item5',
                  productName: 'משקפי שמש אופנתיים',
                  variant: 'צבע: שחור',
                  quantity: 2,
                  price: 220.00,
                  total: 440.00
                }
              ],
              payment: {
                method: 'Visa מסתיים ב-5678',
                cardExpiry: '03/26',
                transactionId: 'PAY-8832994',
                chargeDate: '2023-10-22'
              },
              subtotal: 890.00,
              shippingCost: 0.00,
              tax: 0.00
            },
            '10237': {
              $id: '10237',
              customerName: 'שרה לוי',
              customerEmail: 'sarah@example.com',
              customerPhone: '050-5556677',
              customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeMBBTGnqdMXjFo_xL6-qy13CnkjPQm9fVfgXQnBzzz9w_ahfsvctBnB3e94ct9-KTXcfI6WvutAW9-C1Ew4MPekremT5hGRNfUltJksRitkPsRZk9oiLYq4Ee1fNq7lTpVemZs9BgmCbwT3rdXvBuP6V9dceKp2VyeSAphVU4rbPpg2mBo9oRudRuRWNtOGDSghsFA4rDG1URCFFlAPiaZJmIv3apjOvUSnqwP2PlEnmHAzx8EBHIVohI5_5fe8p7_s9ZvNalSw',
              total: 2450.00,
              status: OrderStatus.COMPLETED,
              createdAt: '2023-10-21T10:00:00Z',
              shippingAddress: {
                street: 'רחוב ביאליק 15',
                city: 'רמת גן',
                postalCode: '5252001',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item6',
                  productName: 'שעון יד קלאסי זהב',
                  variant: 'צבע: זהב',
                  quantity: 1,
                  price: 2450.00,
                  total: 2450.00
                }
              ],
              payment: {
                method: 'American Express מסתיים ב-9999',
                cardExpiry: '09/27',
                transactionId: 'PAY-8832995',
                chargeDate: '2023-10-21'
              },
              subtotal: 2450.00,
              shippingCost: 0.00,
              tax: 0.00
            },
            '10238': {
              $id: '10238',
              customerName: 'רועי אברהם',
              customerEmail: 'roi@example.com',
              customerPhone: '053-4445566',
              total: 55.00,
              status: OrderStatus.PROCESSING,
              createdAt: '2023-10-20T10:00:00Z',
              shippingAddress: {
                street: 'רחוב הנביאים 30',
                city: 'ירושלים',
                postalCode: '9510101',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item7',
                  productName: 'כובע צמר חורפי',
                  variant: 'צבע: אפור',
                  quantity: 1,
                  price: 55.00,
                  total: 55.00
                }
              ],
              payment: {
                method: 'Visa מסתיים ב-3333',
                cardExpiry: '01/25',
                transactionId: 'PAY-8832996',
                chargeDate: '2023-10-20'
              },
              subtotal: 55.00,
              shippingCost: 0.00,
              tax: 0.00
            },
            '10239': {
              $id: '10239',
              customerName: 'נועה גולן',
              customerEmail: 'noa@example.com',
              customerPhone: '058-7778899',
              total: 320.00,
              status: OrderStatus.PENDING,
              createdAt: '2023-10-19T10:00:00Z',
              shippingAddress: {
                street: 'רחוב ויצמן 50',
                apartment: 'דירה 12',
                city: 'כפר סבא',
                postalCode: '4428500',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item8',
                  productName: 'נעלי ספורט שחורות',
                  variant: 'צבע: שחור | מידה: 38',
                  quantity: 1,
                  price: 280.00,
                  total: 280.00
                },
                {
                  $id: 'item9',
                  productName: 'גרביים ספורטיביות',
                  variant: 'צבע: לבן | חבילה של 3',
                  quantity: 1,
                  price: 40.00,
                  total: 40.00
                }
              ],
              payment: {
                method: 'Mastercard מסתיים ב-7777',
                cardExpiry: '11/24',
                transactionId: 'PAY-8832997',
                chargeDate: '2023-10-19'
              },
              subtotal: 320.00,
              shippingCost: 0.00,
              tax: 0.00
            },
            '10240': {
              $id: '10240',
              customerName: 'אלון מזרחי',
              customerEmail: 'alon@example.com',
              customerPhone: '052-1234567',
              total: 780.00,
              status: OrderStatus.COMPLETED,
              createdAt: '2023-10-18T10:00:00Z',
              shippingAddress: {
                street: 'רחוב סוקולוב 20',
                city: 'הרצליה',
                postalCode: '4672520',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item10',
                  productName: 'חגורת עור חומה',
                  variant: 'מידה: M',
                  quantity: 2,
                  price: 150.00,
                  total: 300.00
                },
                {
                  $id: 'item11',
                  productName: 'מכנסי ג\'ינס כחולים',
                  variant: 'צבע: כחול | מידה: 32',
                  quantity: 2,
                  price: 240.00,
                  total: 480.00
                }
              ],
              payment: {
                method: 'Visa מסתיים ב-8888',
                cardExpiry: '08/26',
                transactionId: 'PAY-8832998',
                chargeDate: '2023-10-18'
              },
              subtotal: 780.00,
              shippingCost: 0.00,
              tax: 0.00
            },
            '10241': {
              $id: '10241',
              customerName: 'מיכל ברק',
              customerEmail: 'michal@example.com',
              customerPhone: '054-9998877',
              total: 165.00,
              status: OrderStatus.PENDING,
              createdAt: '2023-10-17T10:00:00Z',
              shippingAddress: {
                street: 'רחוב הגפן 8',
                apartment: 'קומה 3',
                city: 'רעננה',
                postalCode: '4350001',
                country: 'ישראל'
              },
              items: [
                {
                  $id: 'item12',
                  productName: 'חולצת כותנה לבנה',
                  variant: 'צבע: לבן | מידה: S',
                  quantity: 1,
                  price: 85.00,
                  total: 85.00
                },
                {
                  $id: 'item13',
                  productName: 'צעיף משי',
                  variant: 'צבע: ורוד',
                  quantity: 1,
                  price: 80.00,
                  total: 80.00
                }
              ],
              payment: {
                method: 'Visa מסתיים ב-1111',
                cardExpiry: '04/25',
                transactionId: 'PAY-8832999',
                chargeDate: '2023-10-17'
              },
              subtotal: 165.00,
              shippingCost: 0.00,
              tax: 0.00
            }
          };

          const order = mockOrderDetails[orderId];
          if (!order) {
            throw new Error('הזמנה לא נמצאה');
          }
          return { data: order };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    updateOrderStatus: builder.mutation<OrderDetails, { id: string; status: OrderStatus }>({
      queryFn: async ({ id, status }) => {
        try {
          await delay(500);
          // In real implementation, this would update the order in the database
          // For now, we just return a mock updated order
          return { 
            data: { 
              $id: id, 
              status,
              // These would be filled from the actual order data
              customerName: '',
              customerEmail: '',
              total: 0,
              createdAt: '',
              shippingAddress: { street: '', city: '', postalCode: '', country: '' },
              items: [],
              payment: { method: '', transactionId: '', chargeDate: '' },
              subtotal: 0,
              shippingCost: 0,
              tax: 0
            } as OrderDetails 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }, 'Orders'],
    }),
  }),
});

export const { 
    useLoginMutation, 
    useLogoutMutation, 
    useGetProductsQuery, 
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useGetStatsQuery,
    useGetOrdersQuery,
    useDeleteOrderMutation,
    useGetOrderByIdQuery,
    useUpdateOrderStatusMutation,
} = api;