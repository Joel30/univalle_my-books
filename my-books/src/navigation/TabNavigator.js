import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LibraryScreen from '../screens/main/LibraryScreen';
import MyBooksScreen from '../screens/main/MyBooksScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Icon } from '@rneui/themed';
import { c_primary } from '../screens/styles/colors';

const Tab = createBottomTabNavigator();

// Función para crear el navegador de pestañas
export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Library') {
                        iconName = 'book';
                    } else if (route.name === 'MyBooks') {
                        iconName = 'bookmark';
                    } else if (route.name === 'Profile') {
                        iconName = 'person';
                    }
                    return <Icon name={iconName} size={24} color={color} />;
                },
                tabBarActiveTintColor: c_primary,
                tabBarInactiveTintColor: "#cfcfd7",
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen 
                name="Library" 
                component={LibraryScreen} 
                options={{ title: 'Librería' }}
            />
            <Tab.Screen 
                name="MyBooks" 
                component={MyBooksScreen} 
                options={{ title: 'Mis Libros' }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ title: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}