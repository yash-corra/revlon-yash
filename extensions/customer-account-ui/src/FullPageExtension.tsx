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

export default reactExtension('customer-account.page.render', ({
  authenticatedAccount
}) => <CustomerAccountPage authenticatedAccount={authenticatedAccount} />);

function SectionTitle({ title }: { title: string }) {
  return (
    <BlockStack spacing="tight">
      <InlineStack spacing="tight" inlineAlignment="start" blockAlignment="center">
        <View width="6" height="6" background="critical" cornerRadius="none" />
        <Text size="large" emphasis="bold">{title}</Text>
      </InlineStack>
      <View border="base" borderColor="text" borderWidth="1" />
    </BlockStack>
  );
}

function LabelValue({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <Grid columns={['35%', 'fill']} spacing="none">
      <Text size="medium" appearance="subdued">{label}</Text>
      <Text size="medium" emphasis={bold ? 'bold' : 'default'}>{value}</Text>
    </Grid>
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

function CustomerAccountPage({
  authenticatedAccount,
}) {
  console.log("Authenticated Account:", authenticatedAccount); // Debugging line to check the authenticated account
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerAccountNumber, setCustomerAccountNumber] = useState<string | null>(null);
  const { i18n, query } = useApi<"customer-account.page.render">();

  async function fetchWishlist() {
    setLoading(true);

    try {
      // Implement a server request to retrieve the wishlist for this customer
      // Then call the Storefront API to retrieve the details of the wishlisted products
      const data = await query<{ products: { nodes: Product[] }}>(
        `query ($first: Int!) {
          products(first: $first) {
            nodes {
              id
              title
              onlineStoreUrl
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
              }
            }
          }
        }`,
        {
          variables: {first: 10},
        },
      );
      setLoading(false);
      setWishlist(data.data?.products?.nodes || [])
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  }

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

  useEffect(() => {
    fetch("shopify://customer-account/api/unstable/graphql.json",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getCustomerNameQuery),
      }).then((response) => response.json())
      .then(({data: { customer: {firstName,displayName,emailAddress,metafield}}}) => {
        setCustomerEmail(emailAddress?.emailAddress)
        setCustomerAccountNumber(metafield?.value || null);
        console.log("Customer Name:", firstName,displayName,emailAddress,metafield); // Debugging line to check the customer name
      }).catch(console.error);
  },[]);
  useEffect(() => {
    fetchWishlist();
  }, []);



  console.log("Wishlist:", wishlist); // Debugging line to check the wishlist value


  return (
    <Grid columns={['30%', 'fill']} spacing="extraLoose">
      {/* LEFT COLUMN - Sidebar */}
      <GridItem>
        <View padding="base" border="base" background="bg-surface" cornerRadius="base">
          <BlockStack spacing="extraLoose">
            <SectionTitle title="MY AREA" />

            <BlockStack spacing="loose">
              <LabelValue label="Customer:" value="CLASSICS" bold />
              <LabelValue label="Account Nr:" value={customerAccountNumber} bold />
              <LabelValue label="Your account manager:" value="Rachael Cole" bold />
              <LabelValue label="Email Address:" value={customerEmail} bold />
              <Grid columns={['50%', '50%']} spacing="tight">
                <LabelValue label="Loyalty points:" value="0" bold />
                <LabelValue label="Expire this month:" value="0" bold />
              </Grid>
            </BlockStack>

            <View border="base" borderColor="border" borderWidth="1" />

            <BlockStack spacing="loose">
              {[
                ['Personal data', '/account/personal'],
                ['Order history', '/account/orders'],
                ['Documents', '/account/documents'],
                ['Open items (1)', '/account/open-items'],
                ['Order form', '/account/order-form'],
                ['Purchased products', '/account/purchased-products'],
                ['Favorites', '/account/favorites'],
                ['Change password', '/account/change-password'],
              ].map(([label, url]) => (
                <Link key={label} to={url}>
                  <Text size="medium" appearance="default">{label}</Text>
                </Link>
              ))}
            </BlockStack>
          </BlockStack>
        </View>
      </GridItem>

      {/* RIGHT COLUMN - Content */}
      <GridItem>
        <BlockStack spacing="extraLoose">

          {/* SALON DETAILS */}
          <BlockStack spacing="loose">
            <SectionTitle title="SALON DETAILS" />
            <Grid columns={['50%', '50%']} spacing="loose">
              <BlockStack spacing="tight">
                <LabelValue label="Company name" value="CLASSICS" bold />
                <LabelValue label="Trade name" value="-" />
                <LabelValue label="Customer type" value="Salon" bold />
              </BlockStack>
              <BlockStack spacing="tight">
                <LabelValue label="Company House Register Number" value="-" />
                <LabelValue label="Employees" value="10" bold />
              </BlockStack>
            </Grid>
          </BlockStack>

          {/* PERSONAL DATA */}
          <BlockStack spacing="loose">
            <SectionTitle title="PERSONAL DATA" />
            <Grid columns={['50%', '50%']} spacing="loose">
              <BlockStack spacing="tight">
                <LabelValue label="Treat" value="-" />
                <LabelValue label="First name" value="-" />
                <LabelValue label="Mobile phone" value="01926511246" bold />
                <LabelValue label="Date of birth" value="-" />
              </BlockStack>
              <BlockStack spacing="tight">
                <LabelValue label="Last name" value="-" />
                <LabelValue label="Role" value="-" />
                <LabelValue label="Landline telephone" value="-" />
                <LabelValue label="Email Address" value="SALON@CLASSICSHAIRANDBEAUTY.CO.UK" bold />
              </BlockStack>
            </Grid>
          </BlockStack>

          {/* ACCESS DETAILS */}
          <BlockStack spacing="loose">
            <SectionTitle title="ACCESS DETAILS" />
            <BlockStack spacing="tight">
              <LabelValue label="Access mail" value="SALON@CLASSICSHAIRANDBEAUTY.CO.UK" bold />
              <LabelValue label="Password" value="******************" />
              <LabelValue label="Account Nr" value="0002185961" bold />
              <Button kind="primary" appearance="monochrome">Reset password</Button>
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </GridItem>
    </Grid>
  );
}