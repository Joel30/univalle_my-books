import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { c_primary } from '../styles/colors';

// Pantalla de registro de usuarios
export default function RegisterScreen({ navigation }) {
    // Estados para manejar los datos del formulario, errores y estado de carga
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Validar que la contraseña cumpla con los requisitos de seguridad
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };

    // Validar los campos del formulario
    const validateForm = () => {
        let errors = {};

        // Validar el campo de email
        if (!email) errors.email = 'El email es requerido';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email inválido';
        
        // Validar el campo de contraseña
        if (!password) errors.password = 'La contraseña es requerida';
        else if (!validatePassword(password)) {
            errors.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
        }

        // Verificar que las contraseñas coincidan
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        return errors;
    };

    // Manejar el proceso de registro del usuario
    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const validateErrors = validateForm();
            setErrors(validateErrors);

            // Si hay errores, no continúa con el registro
            if (Object.keys(validateErrors).length > 0) {
                return;
            }

            // Intenta crear una nueva cuenta con Firebase Authentication
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError('Error al registrarse: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ScrollView>
        <View style={styles.container}>
            <Text h3 style={styles.title}>Registro</Text>
            <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                errorMessage={errors.email} // Muestra mensaje de error si existe
                inputContainerStyle={styles.inputContainer}
            />
            <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                errorMessage={errors.password} // Muestra mensaje de error si existe
                inputContainerStyle={styles.inputContainer}
            />
            <Input
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                errorMessage={errors.confirmPassword} // Muestra mensaje de error si existe
                inputContainerStyle={styles.inputContainer}
            />
            {/* Muestra un error general si existe */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isLoading ? (
                // Muestra un botón de carga mientras se procesa una acción
                <Button
                    buttonStyle={styles.button}
                    loading
                />
            ) : (
                <Button
                    title="Registrarse"
                    onPress={handleRegister}
                    buttonStyle={styles.button}
                />
            )}
            
            <Button
                title="Volver al Login"
                titleStyle={{ color: c_primary }}
                type="clear"
                onPress={() => navigation.navigate('Login')}
                containerStyle={styles.buttonClear}
            />
        </View>
        </ScrollView>
    );
}

// Estilos personalizados para la pantalla de registro
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
        paddingTop: 20,
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