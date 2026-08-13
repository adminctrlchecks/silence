'use client';

import { RoxyDoshaCard as Element } from '@roxyapi/ui-react';
import type { RoxyDoshaCardProps } from '@roxyapi/ui-react';

export type { RoxyDoshaCardProps };

export function RoxyDoshaCard(props: RoxyDoshaCardProps) {
  return <Element {...props} />;
}
