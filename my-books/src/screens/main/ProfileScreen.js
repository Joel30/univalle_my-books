import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image, Modal, ScrollView } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
import { auth, db, storage } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { c_background, c_primary, c_secondary } from '../styles/colors';

// Pantalla de perfil de usuario
export default function ProfileScreen() {
    // Estado para almacenar la información del perfil del usuario
    const [profile, setProfile] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        photoURL: ''
    });

    // Estados para manejar el estado de carga, errores y visibilidad del modal
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Efecto para obtener el perfil del usuario al cargar el componente
    useEffect(() => {
        loadProfile();
    }, []);

    // Cargar perfil desde Firestore
    const loadProfile = async () => {
        setIsLoading(true);
        try {
            // Referencia al documento del usuario en Firestore
            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            // Si el documento existe, actualiza el estado del perfil
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Seleccionar imagen desde la galería o cámara con ImagePicker
    const pickImage = async () => {
        setIsModalVisible(false);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    // Tomar foto con la cámara con ImagePicker
    const takePhoto = async () => {
        setIsModalVisible(false);
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    // Subir imagen a Firebase Storage
    const uploadImage = async (uri) => {
        setIsLoading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profiles/${auth.currentUser.uid}.jpg`);

            // Sube la imagen a Firebase Storage y obtiene la URL de descarga
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                // Si el documento existe, actualiza el estado del perfil en Firestore
                await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: downloadURL });
            } else {
                // Si no existe, crea un nuevo documento con la foto de perfil en Firestore
                await setDoc(doc(db, 'users', auth.currentUser.uid), {nombre: '', apellido: '', edad: '', photoURL: downloadURL});
            }
            setProfile({ ...profile, photoURL: downloadURL });
            alert('Imagen actualizada exitosamente');
        } catch (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir imagen');
        } finally {
            setIsLoading(false);
        }
    };

    // Validar formulario
    const validateForm = () => {
        let errors = {};

        if (!profile.nombre) errors.nombre = 'El Nombre es requerido';
        if (!profile.apellido) errors.apellido = 'El Apellido es requerido';
        if (!profile.edad) errors.edad = 'La Edad es requerida';

        return errors;
    };

    // Actualizar perfil en Firestore
    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const validateErrors = validateForm();
            setErrors(validateErrors);
            if (Object.keys(validateErrors).length > 0) {
                return;
            }

            // Actualiza el documento del usuario en Firestore
            const docRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(docRef, profile);

            alert('Perfil actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert('Error al actualizar perfil');
        } finally {
            setIsLoading(false);
        }
    };

    // Cerrar sesión
    const SignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            alert('Error al cerrar sesión: ', error.message);
        }
    };

    // Confirmación de cierre de sesión
    const handleSignOut = async () => {
        Alert.alert(
            'Confirmar cierre de sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar sesión', onPress: SignOut, style: 'destructive' }
            ]
        );
    };

    return (
        <ScrollView>
        <View style={styles.container}>
            <Image
                source={profile.photoURL ? { uri: profile.photoURL } : require('../../../assets/images/placeholder.jpg' )}
                style={styles.profileImage}
            />
            <Button
                title=" Imagen"
                type="outline"
                titleStyle={{ color: c_primary }}
                onPress={() => setIsModalVisible(true)}
                icon={<Icon name="edit" type="material" color={c_primary} />}
                buttonStyle={styles.editButton}
            />

            {/* Modal para elegir fuente de la imagen */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Button
                            type="outline"
                            onPress={() => setIsModalVisible(false)}
                            icon={<Icon name="close"
                                type="material" color="gray" />}
                            buttonStyle={styles.closeModalButton}
                        />

                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Foto del perfil</Text>

                            <View style={styles.imageButtons}>
                                <Button
                                    type="outline"
                                    onPress={() => takePhoto()}
                                    icon={<Icon name="photo-camera" type="material" color={c_primary} />}
                                    buttonStyle={styles.iconButtons}
                                />
                                <Button
                                    type="outline"
                                    onPress={() => pickImage()}
                                    icon={<Icon name="image" type="material" color={c_primary} />}
                                    buttonStyle={styles.iconButtons}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Formulario del perfil */}
            <Input
                label="Nombre:"
                value={profile.nombre}
                onChangeText={(text) => setProfile({ ...profile, nombre: text })}
                inputContainerStyle={styles.inputContainer}
                labelStyle={styles.label}
                errorMessage={errors.nombre}
            />
            <Input
                label="Apellido:"
                value={profile.apellido}
                onChangeText={(text) => setProfile({ ...profile, apellido: text })}
                inputContainerStyle={styles.inputContainer}
                labelStyle={styles.label}
                errorMessage={errors.apellido}
            />
            <Input
                label="Edad:"
                value={profile.edad}
                onChangeText={(text) => setProfile({ ...profile, edad: text })}
                inputContainerStyle={styles.inputContainer}
                labelStyle={styles.label}
                errorMessage={errors.edad}
            />

            {isLoading ? (
                <Button buttonStyle={styles.button} loading />
            ) : (
                <Button title="Actualizar Perfil" onPress={handleUpdate} buttonStyle={styles.button} />
            )}

            <Button
                title="Cerrar Sesión"
                type="outline"
                onPress={handleSignOut}
                titleStyle={{ color: c_secondary }}
                buttonStyle={styles.buttonOutline}
            />
        </View>
        </ScrollView>
    );
}

// Estilos personalizados de ProfileScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: c_background,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignSelf: 'center',
        marginBottom: 5,
        borderWidth: 1,
        //gray
        borderColor: '#D3D3D3bb', 
    },
    editButton: {
        width: "auto",
        height: 30,
        padding: 0,
        marginBottom: 30,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: c_primary,
    },
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        minWidth: 200,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalContent: {
        paddingHorizontal: 25,
    },
    
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    iconButtons: {
        borderWidth: 1,
        borderColor: c_primary,
        borderRadius: 10,
    },
    closeModalButton: {
        alignSelf: 'flex-end',
        borderWidth: 0,
        margin: 0,
    },
    iconButtonsCancel: {
        marginVertical: 5,
    },
    button: {
        marginVertical: 10,
        backgroundColor: c_primary,
    },
    buttonOutline: {
        borderWidth: 1,
        borderColor: c_secondary,
    },
    inputContainer: {
        borderBottomWidth: 1,
    },
    label: {
        fontWeight: 'normal',
        fontSize: 14,
    },
});