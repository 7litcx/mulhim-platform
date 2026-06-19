import Link from 'next/link';
import { ArrowLeftIcon } from '@sanity/icons';
import { Card, Flex, Text, Button } from '@sanity/ui';

export function StudioNavbar(props: any) {
  return (
    <Card>
      <Flex align="center" justify="space-between" padding={3} style={{ borderBottom: '1px solid #e0e0e0' }}>
        <Flex align="center" gap={3}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button
              icon={ArrowLeftIcon}
              mode="bleed"
              text="العودة للموقع"
              style={{ cursor: 'pointer' }}
            />
          </Link>
        </Flex>
      </Flex>
      {/* Render the default navbar below our custom header */}
      <>{props.renderDefault(props)}</>
    </Card>
  );
}
