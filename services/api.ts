import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product, Category, User, UserRole, UserStatus, CategoryStatus, Order, OrderStatus, OrderDetails, OrderItem, ShippingAddress, PaymentInfo, AuthUser, AppwriteUser, mapAppwriteUserToUser } from '../types';
import { account, databases, usersApi, APPWRITE_CONFIG } from './appwrite';
import { ID, Query } from 'appwrite';

// Helper to delay for realistic loading effect
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Products', 'Categories', 'User', 'Users', 'Orders'],
  endpoints: (builder) => ({
    
    // Auth Endpoints
    login: builder.mutation<AuthUser, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        try {
          // Create session with Appwrite (SDK v21+ object syntax)
          await account.createEmailPasswordSession({ email, password });
          // Fetch user data
          const user = await account.get();
          const authUser: AuthUser = { 
            $id: user.$id, 
            name: user.name, 
            email: user.email, 
            prefs: user.prefs 
          };
          return { data: authUser };
        } catch (error: any) {
          // Handle Appwrite-specific errors
          const message = error.message || 'פרטי התחברות שגויים';
          return { error: message };
        }
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
            await account.deleteSession({ sessionId: 'current' });
            return { data: true };
        } catch (error: any) {
            return { error: error.message };
        }
      },
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query<AuthUser | null, void>({
      queryFn: async () => {
        try {
          // Check if user has an active session
          const user = await account.get();
          const authUser: AuthUser = { 
            $id: user.$id, 
            name: user.name, 
            email: user.email, 
            prefs: user.prefs 
          };
          return { data: authUser };
        } catch (error: any) {
          // No active session - return null (not an error)
          return { data: null };
        }
      },
      providesTags: ['User'],
    }),

    // Products Endpoints
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(100)]
          });
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      queryFn: async (newProduct) => {
        try {
          const response = await databases.createDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            documentId: ID.unique(),
            data: {
              // Required fields
              productName: newProduct.productName || '',
              price: newProduct.price || 0,
              quantityInStock: newProduct.quantityInStock || 0,
              sku: newProduct.sku || '',
              category: newProduct.category || 'electronics',
              // Optional fields
              description: newProduct.description || null,
              shortDescription: newProduct.shortDescription || null,
              salePrice: newProduct.salePrice || null,
              onSale: newProduct.onSale || false,
              tags: newProduct.tags || [],
              relatedProducts: newProduct.relatedProducts || [],
              isFeatured: newProduct.isFeatured || false,
              featuredImage: newProduct.featuredImage || null,
              dateAdded: newProduct.dateAdded || new Date().toISOString(),
            }
          });
          return { data: response as unknown as Product };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation<Product, { id: string } & Partial<Product>>({
        queryFn: async ({ id, ...updates }) => {
            try {
                // Remove $id and status (UI-only) from updates
                const { $id, status, stockStatus, ...cleanUpdates } = updates as any;
                const response = await databases.updateDocument({
                    databaseId: APPWRITE_CONFIG.DATABASE_ID,
                    collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
                    documentId: id,
                    data: cleanUpdates
                });
                return { data: response as unknown as Product };
            } catch (error: any) {
                return { error: error.message };
            }
        },
        invalidatesTags: ['Products']
    }),

    deleteProduct: builder.mutation<boolean, string>({
        queryFn: async (productId) => {
            try {
                await databases.deleteDocument({
                    databaseId: APPWRITE_CONFIG.DATABASE_ID,
                    collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
                    documentId: productId
                });
                return { data: true };
            } catch (error: any) {
                return { error: error.message };
            }
        },
        invalidatesTags: ['Products']
    }),

    // Users Endpoints
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          // Fetch users from Appwrite Users API
          const response = await usersApi.list();
          const appwriteUsers: AppwriteUser[] = response.users || [];
          
          // Map Appwrite users to our User type
          const users: User[] = appwriteUsers.map(mapAppwriteUserToUser);
          
          return { data: users };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת משתמשים' };
        }
      },
      providesTags: ['Users'],
    }),

    createUser: builder.mutation<User, { email: string; password: string; name: string; role?: UserRole }>({
      queryFn: async ({ email, password, name, role = UserRole.VIEWER }) => {
        try {
          // Create user with Appwrite Users API via Cloud Function
          const userId = ID.unique();
          const appwriteUser = await usersApi.create(userId, email, password, name, role);
          
          // Map to our User type
          const user = mapAppwriteUserToUser(appwriteUser as AppwriteUser);
          
          return { data: user };
        } catch (error: any) {
          return { error: error.message || 'שגיאה ביצירת משתמש' };
        }
      },
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<User, { id: string; name?: string; email?: string; role?: UserRole; status?: UserStatus; avatar?: string }>({
      queryFn: async ({ id, name, email, role, status, avatar }) => {
        try {
          // Update each field that was provided
          if (name !== undefined) {
            await usersApi.updateName(id, name);
          }
          
          if (email !== undefined) {
            await usersApi.updateEmail(id, email);
          }
          
          if (role !== undefined) {
            // Update role via labels (replace existing role labels)
            await usersApi.updateLabels(id, [role]);
          }
          
          if (status !== undefined) {
            // Map UserStatus to boolean (ACTIVE = true, SUSPENDED/INACTIVE = false)
            const statusBool = status === UserStatus.ACTIVE;
            await usersApi.updateStatus(id, statusBool);
          }
          
          if (avatar !== undefined) {
            // Get current prefs and update avatar
            const currentUser = await usersApi.get(id);
            const updatedPrefs = { ...currentUser.prefs, avatar };
            await usersApi.updatePrefs(id, updatedPrefs);
          }
          
          // Fetch updated user
          const appwriteUser = await usersApi.get(id);
          const user = mapAppwriteUserToUser(appwriteUser as AppwriteUser);
          
          return { data: user };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון משתמש' };
        }
      },
      invalidatesTags: ['Users']
    }),

    deleteUser: builder.mutation<boolean, string>({
      queryFn: async (userId: string) => {
        try {
          await usersApi.delete(userId);
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה במחיקת משתמש' };
        }
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
    getStats: builder.query<{
      totalRevenue: number;
      revenueChange: number;
      totalUsers: number;
      usersChange: number;
      newOrders: number;
      cancelledOrders: number;
      pendingOrders: number;
      ordersChange: number;
      totalProducts: number;
      conversionRate: number;
    }, void>({
      queryFn: async () => {
        try {
          // Get current date info for filtering
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          
          // Fetch all orders
          const ordersResponse = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            queries: [Query.limit(1000)]
          });
          const allOrders = ordersResponse.documents;
          
          // Calculate total revenue (from completed orders)
          const completedOrders = allOrders.filter((o: any) => o.status === 'completed');
          const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          
          // Revenue this month vs last month (from completed orders)
          const thisMonthCompletedOrders = completedOrders.filter((o: any) => 
            new Date(o.$createdAt) >= startOfMonth
          );
          const lastMonthCompletedOrders = completedOrders.filter((o: any) => {
            const date = new Date(o.$createdAt);
            return date >= startOfLastMonth && date < startOfMonth;
          });
          
          // All orders this month (for order count stat)
          const thisMonthAllOrders = allOrders.filter((o: any) => 
            new Date(o.$createdAt) >= startOfMonth
          );
          
          // Count cancelled and pending orders this month
          const thisMonthCancelled = thisMonthAllOrders.filter((o: any) => o.status === 'cancelled').length;
          const thisMonthPending = thisMonthAllOrders.filter((o: any) => o.status === 'pending').length;
          
          const thisMonthRevenue = thisMonthCompletedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          const lastMonthRevenue = lastMonthCompletedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          const revenueChange = lastMonthRevenue > 0 
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
            : 0;
          
          // Fetch users count
          let totalUsers = 0;
          try {
            const usersResponse = await usersApi.list();
            totalUsers = usersResponse.users?.length || 0;
          } catch {
            totalUsers = 0;
          }
          
          // Orders today vs yesterday
          const todayOrders = allOrders.filter((o: any) => 
            new Date(o.$createdAt) >= startOfToday
          );
          const yesterdayOrders = allOrders.filter((o: any) => {
            const date = new Date(o.$createdAt);
            return date >= startOfYesterday && date < startOfToday;
          });
          const ordersChange = yesterdayOrders.length > 0 
            ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 
            : 0;
          
          // Fetch products count
          const productsResponse = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            queries: [Query.limit(1)]
          });
          const totalProducts = productsResponse.total;
          
          // Calculate conversion rate (orders / users)
          const conversionRate = totalUsers > 0 
            ? (allOrders.length / totalUsers) * 100 
            : 0;
          
          return {
            data: {
              totalRevenue,
              revenueChange: Math.round(revenueChange * 10) / 10,
              totalUsers,
              usersChange: 5.2, // Would need historical user data to calculate
              newOrders: thisMonthAllOrders.length,
              cancelledOrders: thisMonthCancelled,
              pendingOrders: thisMonthPending,
              ordersChange: Math.round(ordersChange * 10) / 10,
              totalProducts,
              conversionRate: Math.round(conversionRate * 100) / 100,
            }
          };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני דאשבורד' };
        }
      },
    }),

    // Dashboard Recent Orders (for dashboard widget)
    getRecentOrders: builder.query<Order[], number | void>({
      queryFn: async (limit = 5) => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(limit || 5)]
          });
          
          const orders: Order[] = response.documents.map((doc: any) => ({
            $id: doc.$id,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerAvatar: doc.customerAvatar || undefined,
            total: doc.total,
            status: doc.status as OrderStatus,
            createdAt: doc.$createdAt,
          }));
          
          return { data: orders };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת הזמנות אחרונות' };
        }
      },
      providesTags: ['Orders'],
    }),

    // Dashboard Monthly Sales (for chart)
    getMonthlySales: builder.query<{ name: string; value: number }[], void>({
      queryFn: async () => {
        try {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          
          // Fetch all orders from current year
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            queries: [
              Query.greaterThanEqual('$createdAt', startOfYear.toISOString()),
              Query.limit(1000)
            ]
          });
          
          // Hebrew month names
          const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
          
          // Initialize all months with 0
          const monthlyData: Record<number, number> = {};
          for (let i = 0; i <= now.getMonth(); i++) {
            monthlyData[i] = 0;
          }
          
          // Aggregate completed orders by month
          response.documents.forEach((doc: any) => {
            if (doc.status === 'completed') {
              const orderDate = new Date(doc.$createdAt);
              const month = orderDate.getMonth();
              monthlyData[month] = (monthlyData[month] || 0) + (doc.total || 0);
            }
          });
          
          // Convert to chart data format
          const chartData = Object.entries(monthlyData).map(([month, value]) => ({
            name: monthNames[parseInt(month)],
            value: Math.round(value),
          }));
          
          return { data: chartData };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני מכירות' };
        }
      },
    }),

    // Orders Endpoints
    getOrders: builder.query<Order[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(100)]
          });
          
          // Map Appwrite documents to Order type
          const orders: Order[] = response.documents.map((doc: any) => ({
            $id: doc.$id,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerAvatar: doc.customerAvatar || undefined,
            total: doc.total,
            status: doc.status as OrderStatus,
            createdAt: doc.$createdAt,
          }));
          
          return { data: orders };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת הזמנות' };
        }
      },
      providesTags: ['Orders'],
    }),

    deleteOrder: builder.mutation<boolean, string>({
      queryFn: async (orderId: string) => {
        try {
          // First, delete all order items associated with this order
          const itemsResponse = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
            queries: [Query.equal('orderId', orderId)]
          });
          
          // Delete each order item
          for (const item of itemsResponse.documents) {
            await databases.deleteDocument({
              databaseId: APPWRITE_CONFIG.DATABASE_ID,
              collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
              documentId: item.$id
            });
          }
          
          // Then delete the order itself
          await databases.deleteDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: orderId
          });
          
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה במחיקת הזמנה' };
        }
      },
      invalidatesTags: ['Orders']
    }),

    getOrderById: builder.query<OrderDetails, string>({
      queryFn: async (orderId: string) => {
        try {
          // Fetch the order document
          const orderDoc = await databases.getDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: orderId
          });
          
          // Fetch related order items
          const itemsResponse = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
            queries: [Query.equal('orderId', orderId)]
          });
          
          // Map order items
          const items: OrderItem[] = itemsResponse.documents.map((doc: any) => ({
            $id: doc.$id,
            productName: doc.productName,
            productImage: doc.productImage || undefined,
            variant: doc.variant || undefined,
            quantity: doc.quantity,
            price: doc.price,
            total: doc.total,
          }));
          
          // Map flat Appwrite fields to nested OrderDetails structure
          const orderDetails: OrderDetails = {
            $id: orderDoc.$id,
            customerName: orderDoc.customerName,
            customerEmail: orderDoc.customerEmail,
            customerPhone: orderDoc.customerPhone || undefined,
            customerAvatar: orderDoc.customerAvatar || undefined,
            total: orderDoc.total,
            status: orderDoc.status as OrderStatus,
            createdAt: orderDoc.$createdAt,
            shippingAddress: {
              street: orderDoc.shippingStreet,
              apartment: orderDoc.shippingApartment || undefined,
              city: orderDoc.shippingCity,
              postalCode: orderDoc.shippingPostalCode,
              country: orderDoc.shippingCountry,
            },
            items,
            payment: {
              method: orderDoc.paymentMethod,
              cardExpiry: orderDoc.paymentCardExpiry || undefined,
              transactionId: orderDoc.paymentTransactionId,
              chargeDate: orderDoc.paymentChargeDate,
            },
            subtotal: orderDoc.subtotal,
            shippingCost: orderDoc.shippingCost || 0,
            tax: orderDoc.tax || 0,
          };
          
          return { data: orderDetails };
        } catch (error: any) {
          return { error: error.message || 'הזמנה לא נמצאה' };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      queryFn: async ({ id, status }) => {
        try {
          const response = await databases.updateDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: id,
            data: { status }
          });
          
          // Return the updated order (basic fields)
          const updatedOrder: Order = {
            $id: response.$id,
            customerName: response.customerName,
            customerEmail: response.customerEmail,
            customerAvatar: response.customerAvatar || undefined,
            total: response.total,
            status: response.status as OrderStatus,
            createdAt: response.$createdAt,
          };
          
          return { data: updatedOrder };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון סטטוס הזמנה' };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }, 'Orders'],
    }),

    createOrder: builder.mutation<Order, {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      customerAvatar?: string;
      shippingAddress: ShippingAddress;
      payment: PaymentInfo;
      items: Omit<OrderItem, '$id'>[];
      status?: OrderStatus;
    }>({
      queryFn: async (orderData) => {
        try {
          // Calculate totals from items
          const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0);
          const shippingCost = 0; // Can be calculated based on business logic
          const tax = 0; // Can be calculated based on business logic
          const total = subtotal + shippingCost + tax;
          
          // Create the order document with flattened fields
          const orderResponse = await databases.createDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: ID.unique(),
            data: {
              customerName: orderData.customerName,
              customerEmail: orderData.customerEmail,
              customerPhone: orderData.customerPhone || null,
              customerAvatar: orderData.customerAvatar || null,
              total,
              subtotal,
              shippingCost,
              tax,
              status: orderData.status || OrderStatus.PENDING,
              // Flattened shipping address
              shippingStreet: orderData.shippingAddress.street,
              shippingApartment: orderData.shippingAddress.apartment || null,
              shippingCity: orderData.shippingAddress.city,
              shippingPostalCode: orderData.shippingAddress.postalCode,
              shippingCountry: orderData.shippingAddress.country,
              // Flattened payment info
              paymentMethod: orderData.payment.method,
              paymentCardExpiry: orderData.payment.cardExpiry || null,
              paymentTransactionId: orderData.payment.transactionId,
              paymentChargeDate: orderData.payment.chargeDate,
            }
          });
          
          // Create order items
          for (const item of orderData.items) {
            await databases.createDocument({
              databaseId: APPWRITE_CONFIG.DATABASE_ID,
              collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
              documentId: ID.unique(),
              data: {
                orderId: orderResponse.$id,
                productName: item.productName,
                productImage: item.productImage || null,
                variant: item.variant || null,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              }
            });
          }
          
          // Return the created order
          const order: Order = {
            $id: orderResponse.$id,
            customerName: orderResponse.customerName,
            customerEmail: orderResponse.customerEmail,
            customerAvatar: orderResponse.customerAvatar || undefined,
            total: orderResponse.total,
            status: orderResponse.status as OrderStatus,
            createdAt: orderResponse.$createdAt,
          };
          
          return { data: order };
        } catch (error: any) {
          return { error: error.message || 'שגיאה ביצירת הזמנה' };
        }
      },
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { 
    useLoginMutation, 
    useLogoutMutation,
    useGetCurrentUserQuery,
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
    useGetRecentOrdersQuery,
    useGetMonthlySalesQuery,
    useGetOrdersQuery,
    useCreateOrderMutation,
    useDeleteOrderMutation,
    useGetOrderByIdQuery,
    useUpdateOrderStatusMutation,
} = api;