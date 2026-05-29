import { useRef, useCallback } from 'react';

// Simple spring physics: F = -k(x - target) - d*v
export function createSpring(stiffness = 100, damping = 14) {
  let value = 0, velocity = 0, target = 0;
  return {
    setTarget(t) { target = t; },
    step(dt) {
      const force = -stiffness * (value - target) - damping * velocity;
      velocity += force * dt;
      value += velocity * dt;
      return value;
    },
    get() { return value; },
    set(v) { value = v; velocity = 0; },
    isSettled() { return Math.abs(value - target) < 0.01 && Math.abs(velocity) < 0.01; },
  };
}

export default function useSprings(keys, stiffness = 100, damping = 14) {
  const springs = useRef({});
  keys.forEach(k => {
    if (!springs.current[k]) springs.current[k] = createSpring(stiffness, damping);
  });
  const set = useCallback((targets) => {
    Object.entries(targets).forEach(([k, v]) => {
      if (springs.current[k]) springs.current[k].setTarget(v);
    });
  }, []);
  const step = useCallback((dt) => {
    const vals = {};
    Object.entries(springs.current).forEach(([k, s]) => { vals[k] = s.step(dt); });
    return vals;
  }, []);
  return { set, step, springs: springs.current };
}
