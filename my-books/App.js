import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import BookDetailScreen from './src/screens/main/BookDetailScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user); // Si hay un usuario autenticado, cambia a true
        });
        return unsubscribe;
    }, []);

    return (
        <>
            <StatusBar 
                barStyle="light-content"
                backgroundColor={"#41dc8e"}
                translucent={false}
            />
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }} s>
                    {isAuthenticated ? (
                        <>
                            <Stack.Screen name="Main" component={TabNavigator} />
                            <Stack.Screen name="BookDetail"  component={BookDetailScreen} options={{ headerShown: true, title: "Detalle del Libro" }}/>
                        </>
                    ) : (
                        <Stack.Screen name="Auth" component={AuthNavigator} />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
