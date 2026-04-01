import type React from 'react';

import type { SwipeDirection, ToasterProps } from './types';

// Visible toasts amount
export const VISIBLE_TOASTS_AMOUNT = 3;

// Viewport padding
export const VIEWPORT_OFFSET = '24px';

// Mobile viewport padding
export const MOBILE_VIEWPORT_OFFSET = '16px';

// Default lifetime of a toasts (in ms)
export const TOAST_LIFETIME = 4000;

// Default toast width
export const TOAST_WIDTH = 356;

// Default gap between toasts
export const GAP = 14;

// Threshold to dismiss a toast
export const SWIPE_THRESHOLD = 45;

// Equal to exit animation duration
export const TIME_BEFORE_UNMOUNT = 200;

export function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getDefaultSwipeDirections(position: string): Array<SwipeDirection> {
  const [y, x] = position.split('-');
  const directions: Array<SwipeDirection> = [];

  if (y) {
    directions.push(y as SwipeDirection);
  }

  if (x) {
    directions.push(x as SwipeDirection);
  }

  return directions;
}

export function getDocumentDirection(): ToasterProps['dir'] {
  if (!canUseDOM()) return 'ltr';

  const dirAttribute = document.documentElement.getAttribute('dir');

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction as ToasterProps['dir'];
  }

  return dirAttribute as ToasterProps['dir'];
}

export function assignOffset(defaultOffset: ToasterProps['offset'], mobileOffset: ToasterProps['mobileOffset']) {
  const styles = {} as React.CSSProperties;

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? '--mobile-offset' : '--offset';
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    function assignAll(value: string | number) {
      ['top', 'right', 'bottom', 'left'].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof value === 'number' ? `${value}px` : value;
      });
    }

    if (typeof offset === 'number' || typeof offset === 'string') {
      assignAll(offset);
    } else if (typeof offset === 'object') {
      ['top', 'right', 'bottom', 'left'].forEach((key) => {
        if (offset[key] === undefined) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof offset[key] === 'number' ? `${offset[key]}px` : offset[key];
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });

  return styles;
}