import { Tabs } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'

import { FooterNavigator } from '../../components/FooterNavigator'

import { theme } from '../../theme'

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.primaryDark,
                },
                headerTintColor: theme.colors.surface,
                headerTitleStyle: {
                    ...theme.typography.display,
                    color: theme.colors.surface,
                },
                headerTitleAlign: 'left',
                headerShadowVisible: false,
            }}
            tabBar={(props) => <FooterNavigator {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Nexum',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pessoas"
                options={{
                    title: 'Pessoas',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="people"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="ativos"
                options={{
                    title: 'Ativos',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="attach-money"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="quitados"
                options={{
                    title: 'Quitados',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="check" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
