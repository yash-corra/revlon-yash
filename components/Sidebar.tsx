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
const Sidebar = ({
    customerAccountNumber = '0002185961',
    customerEmail = 'customer@example.com',
}) => {
  return (
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
  )
}

export default Sidebar