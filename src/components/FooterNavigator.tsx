import type { ComponentProps } from 'react'
import type { Tabs } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { theme } from '../theme'

type FooterNavigatorProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0]

export function FooterNavigator({
  descriptors,
  navigation,
  state,
}: FooterNavigatorProps) {
  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}
    >
      <View
        style={[styles.container, { borderTopColor: theme.colors.divider }]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index
          const options = descriptors[route.key].options
          const color = isFocused
            ? theme.colors.primary
            : theme.colors.textSecondary
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options.title ?? route.name)

          function handlePress() {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          return (
            <Pressable
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              key={route.key}
              onPress={handlePress}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              {options.tabBarIcon?.({
                color,
                focused: isFocused,
                size: 24,
              })}
              <Text style={[theme.typography.caption, { color }]}>{label}</Text>
            </Pressable>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 48,
    paddingVertical: 8,
  },
  itemPressed: {
    opacity: 0.7,
  },
})
