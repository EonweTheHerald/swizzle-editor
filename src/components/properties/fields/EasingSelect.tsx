/**
 * EasingSelect - Dropdown for easing functions
 * Supports all 25+ easing functions from Swizzle
 */

import { SelectInput } from './SelectInput';

interface EasingSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

const EASING_OPTIONS = [
  // Linear
  { value: 'linear', label: 'Linear' },

  // Quadratic
  { value: 'easeInQuad', label: 'Ease In Quad' },
  { value: 'easeOutQuad', label: 'Ease Out Quad' },
  { value: 'easeInOutQuad', label: 'Ease In-Out Quad' },

  // Cubic
  { value: 'easeInCubic', label: 'Ease In Cubic' },
  { value: 'easeOutCubic', label: 'Ease Out Cubic' },
  { value: 'easeInOutCubic', label: 'Ease In-Out Cubic' },

  // Quartic
  { value: 'easeInQuart', label: 'Ease In Quart' },
  { value: 'easeOutQuart', label: 'Ease Out Quart' },
  { value: 'easeInOutQuart', label: 'Ease In-Out Quart' },

  // Quintic
  { value: 'easeInQuint', label: 'Ease In Quint' },
  { value: 'easeOutQuint', label: 'Ease Out Quint' },
  { value: 'easeInOutQuint', label: 'Ease In-Out Quint' },

  // Sine
  { value: 'easeInSine', label: 'Ease In Sine' },
  { value: 'easeOutSine', label: 'Ease Out Sine' },
  { value: 'easeInOutSine', label: 'Ease In-Out Sine' },

  // Exponential
  { value: 'easeInExpo', label: 'Ease In Expo' },
  { value: 'easeOutExpo', label: 'Ease Out Expo' },
  { value: 'easeInOutExpo', label: 'Ease In-Out Expo' },

  // Circular
  { value: 'easeInCirc', label: 'Ease In Circ' },
  { value: 'easeOutCirc', label: 'Ease Out Circ' },
  { value: 'easeInOutCirc', label: 'Ease In-Out Circ' },

  // Elastic
  { value: 'easeInElastic', label: 'Ease In Elastic' },
  { value: 'easeOutElastic', label: 'Ease Out Elastic' },
  { value: 'easeInOutElastic', label: 'Ease In-Out Elastic' },

  // Back
  { value: 'easeInBack', label: 'Ease In Back' },
  { value: 'easeOutBack', label: 'Ease Out Back' },
  { value: 'easeInOutBack', label: 'Ease In-Out Back' },

  // Bounce
  { value: 'easeInBounce', label: 'Ease In Bounce' },
  { value: 'easeOutBounce', label: 'Ease Out Bounce' },
  { value: 'easeInOutBounce', label: 'Ease In-Out Bounce' },
];

export function EasingSelect({
  value,
  onChange,
  label = 'Easing Function',
  description = 'Animation curve for interpolation',
}: EasingSelectProps) {
  return (
    <SelectInput
      label={label}
      value={value}
      onChange={onChange}
      options={EASING_OPTIONS}
      description={description}
    />
  );
}
