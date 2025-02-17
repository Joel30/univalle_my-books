import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { c_primary } from '../styles/colors';

// Pantalla de inicio de sesión
export default function LoginScreen({ navigation }) {
    // Estados para almacenar el correo, contraseña, errores y el estado de carga
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    
    // Función para manejar el inicio de sesión del usuario
    const handleLogin = async () => {
        setIsLoading(true); 
        try {
            // Intenta iniciar sesión con Firebase Authentication
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError('Error al iniciar sesión: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para validar los campos del formulario de inicio de sesión
    const validateLoginForm = () => {
        // Valida que el correo tenga un formato válido
        const isEmailValid = /\S+@\S+\.\S+/.test(email);

        const isPasswordValid = password.length > 0;
        return isEmailValid && isPasswordValid;
    };

    return (
        <View style={styles.container}>
            <Text h3 style={styles.title}>My Books</Text>
            <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                inputContainerStyle={styles.inputContainer}
            />
            <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                inputContainerStyle={styles.inputContainer}
            />
            {/* Muestra un error si existe */}
            {error ? <Text style={styles.error}>{error}</Text> : null} 

            {isLoading ? (
                // Muestra un botón de carga mientras se procesa una acción
                <Button
                    buttonStyle={styles.button}
                    loading
                />
            ) : (
                <Button
                    title="Iniciar Sesión"
                    onPress={handleLogin}
                    disabled={!validateLoginForm()}
                    buttonStyle={styles.button}
                />
            )}
            <Button
                title="¿Nuevo usuario? Registrate"
                titleStyle={{ color: c_primary }}
                onPress={() => navigation.navigate('Register')}
                containerStyle={styles.buttonClear}
                type="clear"
            />
        </View>
    );
}

// Estilos personalizados de LoginScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 50,
    },
    button: {
        marginVertical: 10,
        backgroundColor: c_primary
    },
    buttonClear: {
        marginVertical: 10,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderColor: c_primary,
    },
});