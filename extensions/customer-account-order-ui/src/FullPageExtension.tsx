import {
  reactExtension,
  BlockStack,
  Grid,
  GridItem,
  Text,
  View,
  InlineStack,
  Button,
  Link,
  useEmail,
  useApi,
} from '@shopify/ui-extensions-react/customer-account';
import {useEffect, useState} from 'react';
import Sidebar from '../../../components/Sidebar';

export default reactExtension('customer-account.page.render', ({
  authenticatedAccount
}) => <CustomerAccountPage authenticatedAccount={authenticatedAccount} />);

function SectionTitle({ title }: { title: string }) {
  return (
    <BlockStack spacing="tight">
      <InlineStack spacing="tight" inlineAlignment="start" blockAlignment="center">
        <View cornerRadius="none" />
        <Text size="large" emphasis="bold">{title}</Text>
      </InlineStack>
      <View border="base" />
    </BlockStack>
  );
}

function LabelValue({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <Grid columns={['35%', 'fill']} spacing="none">
      <Text size="medium" appearance="subdued">{label}</Text>
      <Text size="medium" emphasis={bold ? 'bold' : undefined}>{value}</Text>
    </Grid>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'critical';
      default:
        return 'subdued';
    }
  };

  return (
    <View border="base" cornerRadius="base" padding="base">
      <BlockStack spacing="loose">
        {/* Order Header */}
        <InlineStack spacing="base" blockAlignment="center">
          <BlockStack spacing="tight">
            <Text size="large" emphasis="bold">{order.name}</Text>
            <Text size="small" appearance="subdued">
              Placed on {formatDate(order.createdAt)}
            </Text>
          </BlockStack>
          <View>
            <BlockStack spacing="tight">
              <Text size="large" emphasis="bold">
                {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
              </Text>
              <Text size="small" appearance={getStatusColor(order.fulfillmentStatus)}>
                {order.fulfillmentStatus}
              </Text>
            </BlockStack>
          </View>
        </InlineStack>

        {/* Order Details */}
        <Grid columns={['50%', '50%']} spacing="base">
          <BlockStack spacing="tight">
            <Text size="small" appearance="subdued">Order Details</Text>
            <LabelValue label="Order Number" value={order.number.toString()} />
            <LabelValue label="Confirmation" value={order.confirmationNumber || 'N/A'} />
            <LabelValue label="Financial Status" value={order.financialStatus || 'N/A'} />
            {order.email && <LabelValue label="Email" value={order.email} />}
          </BlockStack>
          <BlockStack spacing="tight">
            <Text size="small" appearance="subdued">Pricing</Text>
            {order.subtotal && (
              <LabelValue 
                label="Subtotal" 
                value={formatCurrency(order.subtotal.amount, order.subtotal.currencyCode)} 
              />
            )}
            <LabelValue 
              label="Shipping" 
              value={formatCurrency(order.totalShipping.amount, order.totalShipping.currencyCode)} 
            />
            {order.totalTax && (
              <LabelValue 
                label="Tax" 
                value={formatCurrency(order.totalTax.amount, order.totalTax.currencyCode)} 
              />
            )}
            <LabelValue 
              label="Total" 
              value={formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
              bold
            />
          </BlockStack>
        </Grid>

        {/* Line Items */}
        {order.lineItems.edges.length > 0 && (
          <BlockStack spacing="tight">
            <Text size="small" appearance="subdued">Items ({order.lineItems.edges.length})</Text>
            <BlockStack spacing="tight">
              {order.lineItems.edges.slice(0, 3).map(({ node: item }) => (
                <InlineStack key={item.id} spacing="base" blockAlignment="center">
                  <View cornerRadius="base" border="base">
                    <Text size="extraSmall">IMG</Text>
                  </View>
                  <BlockStack spacing="none">
                    <Text size="small" emphasis="bold">{item.title}</Text>
                    <Text size="small">
                      Qty: {item.quantity} × {formatCurrency(
                        (parseFloat(item.totalPrice.amount) / item.quantity).toString(), 
                        item.totalPrice.currencyCode
                      )}
                    </Text>
                  </BlockStack>
                </InlineStack>
              ))}
              {order.lineItems.edges.length > 3 && (
                <Text size="small" appearance="subdued">
                  ... and {order.lineItems.edges.length - 3} more items
                </Text>
              )}
            </BlockStack>
          </BlockStack>
        )}

        {/* Addresses */}
        {(order.shippingAddress || order.billingAddress) && (
          <Grid columns={['50%', '50%']} spacing="base">
            {order.shippingAddress && (
              <BlockStack spacing="tight">
                <Text size="small" appearance="subdued">Shipping Address</Text>
                <BlockStack spacing="none">
                  {order.shippingAddress.name && (
                    <Text size="small">{order.shippingAddress.name}</Text>
                  )}
                  {order.shippingAddress.address1 && (
                    <Text size="small">{order.shippingAddress.address1}</Text>
                  )}
                  {order.shippingAddress.address2 && (
                    <Text size="small">{order.shippingAddress.address2}</Text>
                  )}
                  <Text size="small">
                    {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.zip]
                      .filter(Boolean).join(', ')}
                  </Text>
                  {order.shippingAddress.country && (
                    <Text size="small">{order.shippingAddress.country}</Text>
                  )}
                </BlockStack>
              </BlockStack>
            )}
            {order.billingAddress && (
              <BlockStack spacing="tight">
                <Text size="small" appearance="subdued">Billing Address</Text>
                <BlockStack spacing="none">
                  {order.billingAddress.name && (
                    <Text size="small">{order.billingAddress.name}</Text>
                  )}
                  {order.billingAddress.address1 && (
                    <Text size="small">{order.billingAddress.address1}</Text>
                  )}
                  {order.billingAddress.address2 && (
                    <Text size="small">{order.billingAddress.address2}</Text>
                  )}
                  <Text size="small">
                    {[order.billingAddress.city, order.billingAddress.province, order.billingAddress.zip]
                      .filter(Boolean).join(', ')}
                  </Text>
                  {order.billingAddress.country && (
                    <Text size="small">{order.billingAddress.country}</Text>
                  )}
                </BlockStack>
              </BlockStack>
            )}
          </Grid>
        )}

        {/* Fulfillments */}
        {order.fulfillments.edges.length > 0 && (
          <BlockStack spacing="tight">
            <Text size="small" appearance="subdued">Fulfillments</Text>
            {order.fulfillments.edges.map(({ node: fulfillment }) => (
              <InlineStack key={fulfillment.id} spacing="base" blockAlignment="center">
                <Text size="small">
                  Status: {fulfillment.status}
                </Text>
                <Text size="extraSmall" appearance="subdued">
                  {formatDate(fulfillment.createdAt)}
                </Text>
              </InlineStack>
            ))}
          </BlockStack>
        )}

        {/* Action Buttons */}
        <InlineStack spacing="base">
          <Link to={order.statusPageUrl}>
            <Button kind="secondary">View Order</Button>
          </Link>
        </InlineStack>
      </BlockStack>
    </View>
  );
}
interface Product { 
  id: string;
  title: string;
  onlineStoreUrl: string;
  featuredImage: {
    url: string;
  }
  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: number;
      currencyCode: string;
    };
  };
}

interface CustomerOrder {
  id: string;
  name: string;
  number: number;
  confirmationNumber: string | null;
  createdAt: string;
  processedAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  currencyCode: string;
  email: string | null;
  phone: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  note: string | null;
  poNumber: string | null;
  requiresShipping: boolean;
  taxesIncluded: boolean;
  dutiesIncluded: boolean;
  edited: boolean;
  locationName: string | null;
  customerLocale: string | null;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  subtotal: {
    amount: string;
    currencyCode: string;
  } | null;
  totalTax: {
    amount: string;
    currencyCode: string;
  } | null;
  totalShipping: {
    amount: string;
    currencyCode: string;
  };
  totalRefunded: {
    amount: string;
    currencyCode: string;
  };
  totalDuties: {
    amount: string;
    currencyCode: string;
  } | null;
  totalTip: {
    amount: string;
    currencyCode: string;
  } | null;
  billingAddress: CustomerAddress | null;
  shippingAddress: CustomerAddress | null;
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        quantity: number;
        totalPrice: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
  fulfillments: {
    edges: Array<{
      node: {
        id: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      };
    }>;
  };
}

interface CustomerAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  name: string | null;
}

function CustomerAccountPage({
  authenticatedAccount,
}) {
  console.log("Authenticated Account:", authenticatedAccount); // Debugging line to check the authenticated account
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerAccountNumber, setCustomerAccountNumber] = useState<string | null>(null);
  const { i18n, query } = useApi<"customer-account.page.render">();


  const getCustomerNameQuery = {
    query: `query {
      customer {
        firstName
        displayName
        emailAddress {
              emailAddress
              marketingState
        }
        metafield(namespace: "custom", key: "accountnumber") {
          namespace
          key
          value
          type
        }  
      }
    }`
  };

  // Customer Orders GraphQL Query
  const getCustomerOrdersQuery = {
    query: `query CustomerOrders($first: Int, $after: String, $sortKey: OrderSortKeys, $reverse: Boolean) {
      customer {
        id
        orders(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
          edges {
            cursor
            node {
              id
              name
              number
              confirmationNumber
              createdAt
              processedAt
              updatedAt
              cancelledAt
              cancelReason
              currencyCode
              email
              phone
              financialStatus
              fulfillmentStatus
              statusPageUrl
              note
              poNumber
              requiresShipping
              taxesIncluded
              dutiesIncluded
              edited
              locationName
              customerLocale
              totalPrice {
                amount
                currencyCode
              }
              subtotal {
                amount
                currencyCode
              }
              totalTax {
                amount
                currencyCode
              }
              totalShipping {
                amount
                currencyCode
              }
              totalRefunded {
                amount
                currencyCode
              }
              totalDuties {
                amount
                currencyCode
              }
              totalTip {
                amount
                currencyCode
              }
              billingAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                name
              }
              shippingAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                name
              }
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    totalPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              fulfillments(first: 10) {
                edges {
                  node {
                    id
                    status
                    createdAt
                    updatedAt
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }`,
    variables: {
      first: 25,
      sortKey: "CREATED_AT",
      reverse: true
    }
  };

  useEffect(() => {
    // Fetch customer basic info
    fetch("shopify://customer-account/api/unstable/graphql.json",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getCustomerNameQuery),
      }).then((response) => response.json())
      .then(({data: { customer: {firstName,displayName,emailAddress,metafield,companyContacts}}}) => {
        setCustomerEmail(emailAddress?.emailAddress)
        setCustomerAccountNumber(metafield?.value || null);
        console.log("Customer Name:", firstName,displayName,emailAddress,metafield,companyContacts); // Debugging line to check the customer name
      }).catch(console.error);

    // Fetch customer orders
    setOrdersLoading(true);
    fetch("shopify://customer-account/api/unstable/graphql.json",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getCustomerOrdersQuery),
      }).then((response) => response.json())
      .then(({data}) => {
        if (data?.customer?.orders?.edges) {
          const ordersList = data.customer.orders.edges.map((edge: any) => edge.node);
          setOrders(ordersList);
          console.log("Customer Orders:", ordersList);
        }
        setOrdersLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setOrdersLoading(false);
      });
  },[]);


  console.log("Wishlist:", wishlist); // Debugging line to check the wishlist value


  return (
    <Grid columns={['30%', 'fill']} spacing="extraLoose">
      {/* LEFT COLUMN - Sidebar */}  
      <Sidebar
        customerAccountNumber={customerAccountNumber}
        customerEmail={customerEmail}
      />

      {/* RIGHT COLUMN - Content */}
      <GridItem>
        <BlockStack spacing="extraLoose">
          {/* Page Header */}
          <Grid columns={['fill', 'auto']} spacing="base">
            <Text size="extraLarge" emphasis="bold">Order History</Text>
            <InlineStack spacing="tight" blockAlignment="center">
              <Text size="small" appearance="subdued">Showing {orders.length} orders</Text>
              <Text size="small" appearance="subdued">|</Text>
              <Text size="small" appearance="subdued">Sort by: Date: recent first</Text>
              <Text size="small">▼</Text>
            </InlineStack>
          </Grid>

          {ordersLoading ? (
            <Text>Loading orders...</Text>
          ) : (
            <OrderHistoryContent orders={orders} />
          )}
        </BlockStack>
      </GridItem>
    </Grid>
  );
}

// Order History Content Component
function OrderHistoryContent({ orders }: { orders: CustomerOrder[] }) {
  // Separate orders by status
  const pendingOrders = orders.filter(order => {
    const status = order.fulfillmentStatus?.toLowerCase() || order.financialStatus?.toLowerCase() || '';
    return ['pending', 'unfulfilled', 'partial'].indexOf(status) !== -1;
  });
  
  const completedOrders = orders.filter(order => {
    const status = order.fulfillmentStatus?.toLowerCase() || order.financialStatus?.toLowerCase() || '';
    return ['fulfilled', 'completed', 'paid', 'success'].indexOf(status) !== -1;
  });

  // Orders that don't fit the above categories
  const otherOrders = orders.filter(order => {
    const status = order.fulfillmentStatus?.toLowerCase() || order.financialStatus?.toLowerCase() || '';
    return ['pending', 'unfulfilled', 'partial', 'fulfilled', 'completed', 'paid', 'success'].indexOf(status) === -1;
  });

  // Add other orders to completed for now (can be adjusted based on business logic)
  const allCompletedOrders = [...completedOrders, ...otherOrders];

  return (
    <BlockStack spacing="extraLoose">
      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <BlockStack spacing="base">
          <InlineStack spacing="tight" blockAlignment="center">
            <Text size="small" emphasis="bold" appearance="critical">■</Text>
            <Text size="large" emphasis="bold">PENDING ORDERS</Text>
          </InlineStack>
          
          <View border="base" cornerRadius="base" padding="none">
            <BlockStack spacing="none">
              {/* Table Header - Pending Orders */}
              <View padding="base" border="none">
                <Grid columns={['15%', '15%', '25%', '15%', '15%', '15%']} spacing="base">
                  <Text size="small" emphasis="bold" appearance="subdued">Order ID</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Date</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Order ID - Customer Order</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Status</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Order total</Text>
                  <Text size="small" emphasis="bold" appearance="subdued"></Text>
                </Grid>
              </View>
              
              <View border="base" />
              
              {pendingOrders.map((order, index) => (
                <BlockStack key={order.id} spacing="none">
                  <OrderRow order={order} />
                  {index < pendingOrders.length - 1 && <View border="base" />}
                </BlockStack>
              ))}
            </BlockStack>
          </View>
        </BlockStack>
      )}

      {/* Completed Orders Section */}
      {allCompletedOrders.length > 0 && (
        <BlockStack spacing="base">
          <InlineStack spacing="tight" blockAlignment="center">
            <Text size="small" emphasis="bold" appearance="critical">■</Text>
            <Text size="large" emphasis="bold">COMPLETED ORDERS</Text>
          </InlineStack>
          
          <View border="base" cornerRadius="base" padding="none">
            <BlockStack spacing="none">
              {/* Table Header - Completed Orders */}
              <View padding="base" border="none">
                <Grid columns={['15%', '15%', '25%', '15%', '15%', '15%']} spacing="base">
                  <Text size="small" emphasis="bold" appearance="subdued">Order ID</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Date</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Order ID - Customer Order</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Status</Text>
                  <Text size="small" emphasis="bold" appearance="subdued">Order total</Text>
                  <Text size="small" emphasis="bold" appearance="subdued"></Text>
                </Grid>
              </View>
              
              <View border="base" />
              
              {allCompletedOrders.map((order, index) => (
                <BlockStack key={order.id} spacing="none">
                  <OrderRow order={order} />
                  {index < allCompletedOrders.length - 1 && <View border="base" />}
                </BlockStack>
              ))}
            </BlockStack>
          </View>
        </BlockStack>
      )}

      {/* Load More Button */}
      {orders.length > 0 && (
        <InlineStack inlineAlignment="center">
          <Button kind="secondary">Load more</Button>
        </InlineStack>
      )}

      {/* No Orders Message */}
      {orders.length === 0 && (
        <View padding="extraLoose">
          <InlineStack inlineAlignment="center">
            <Text size="large" appearance="subdued">No orders found</Text>
          </InlineStack>
        </View>
      )}
    </BlockStack>
  );
}

// Individual Order Row Component
function OrderRow({ order }: { order: CustomerOrder }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode
    }).format(parseFloat(amount));
  };

  const getDisplayStatus = (order: CustomerOrder) => {
    if (order.fulfillmentStatus?.toLowerCase() === 'fulfilled') return 'Completed';
    if (order.fulfillmentStatus?.toLowerCase() === 'pending') return 'Pending';
    if (order.financialStatus?.toLowerCase() === 'paid') return 'Completed';
    if (order.financialStatus?.toLowerCase() === 'pending') return 'Pending';
    if (order.financialStatus?.toLowerCase() === 'refunded') return 'Everything Rejected';
    return order.fulfillmentStatus || 'Pending';
  };

  return (
    <View padding="base" border="none">
      <Grid columns={['15%', '15%', '25%', '15%', '15%', '15%']} spacing="base">
        <Text size="medium" emphasis="bold">{order.number}</Text>
        <Text size="medium">{formatDate(order.createdAt)}</Text>
        <Text size="medium">{order.confirmationNumber || order.name}</Text>
        <Text size="medium">{getDisplayStatus(order)}</Text>
        <Text size="medium" emphasis="bold">
          {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
        </Text>
        <InlineStack inlineAlignment="end" blockAlignment="center">
          <Link to={order.statusPageUrl}>
            <Text size="medium">{'>'}</Text>
          </Link>
        </InlineStack>
      </Grid>
    </View>
  );
}