import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { createRng } from '../../logic/random';
import { useTheme } from '../../theme/ThemeProvider';

type Star = { x: number; y: number; size: number; delay: number; base: number };

function makeStars(count: number, seed: number): Star[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => ({
    x: rng() * 100,
    y: rng() * 100,
    size: 1 + rng() * 2.2,
    delay: Math.floor(rng() * 4000),
    base: 0.25 + rng() * 0.45,
  }));
}

function TwinkleStar({ star, color, animate }: { star: Star; color: string; animate: boolean }) {
  const opacity = useSharedValue(star.base);
  useEffect(() => {
    if (!animate) return;
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withSequence(
          withTiming(Math.min(1, star.base + 0.45), { duration: 2200, easing: Easing.inOut(Easing.quad) }),
          withTiming(star.base, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [animate, opacity, star]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        styles.star,
        style,
        {
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size,
          backgroundColor: color,
        },
      ]}
    />
  );
}

/** Dezenter, ruhig funkelnder Sternenhimmel als Hintergrund. */
export function Starfield({ count = 40, seed = 7 }: { count?: number; seed?: number }) {
  const p = useTheme();
  const reduceMotion = useReducedMotion();
  const stars = useMemo(() => makeStars(count, seed), [count, seed]);
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {stars.map((s, i) => (
        <TwinkleStar key={i} star={s} color={p.star} animate={!reduceMotion && i % 3 === 0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: { position: 'absolute' },
});
