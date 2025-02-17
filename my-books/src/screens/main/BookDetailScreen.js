import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Rating } from 'react-native-ratings';
import { Icon } from '@rneui/themed';
import { doc, setDoc, collection, getDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { c_primary, c_secondary, c_void } from '../styles/colors';

// Pantalla para ver los detalles de un libro y sus reseñas
export default function BookDetailScreen({ route }) {
    const { book } = route.params;

    // Estados para manejar el modal de reseñas
    const [modalVisible, setModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null); // Guarda la reseña del usuario actual
    const [visibleReviews, setVisibleReviews] = useState(5);

    // Cargar reseñas en tiempo real
    useEffect(() => {
        // Referencia a la colección de reseñas del libro de Firestore
        const reviewsRef = collection(db, 'books', book.id, 'reviews');
        const q = query(reviewsRef, orderBy('timestamp', 'desc'));

        // Escuchar cambios en la colección de reseñas
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Obtener los detalles del usuario para cada reseña
            const reviewsWithUser = await Promise.all(
                reviewsData.map(async (review) => {
                    if (review.userId) {
                        try {
                            // Obtener el documento del usuario de Firestore
                            const userDoc = await getDoc(doc(db, 'users', review.userId));
                            if (userDoc.exists()) {
                                const { nombre, apellido } = userDoc.data();
                                return { ...review, userName: `${nombre} ${apellido}` };
                            }
                        } catch (error) {
                            console.error('Error al obtener usuario:', error);
                        }
                    }
                    return { ...review, userName: 'Usuario desconocido' };
                })
            );

            setReviews(reviewsWithUser);

            // Buscar si el usuario actual ya tiene una reseña
            const existingReview = reviewsWithUser.find(r => r.userId === auth.currentUser.uid);
            setUserReview(existingReview || null);
        });

        return () => unsubscribe();
    }, [book.id]);

    // Cargar más reseñas
    const loadMoreReviews = () => {
        setVisibleReviews((prev) => prev + 10);
    };

    // Precargar datos en el modal de reseñas si el usuario ya ha dejado una
    const openReviewModal = () => {
        if (userReview) {
            setRating(userReview.rating);
            setComment(userReview.comment);
        } else {
            setRating(0);
            setComment('');
        }
        setModalVisible(true);
    };

    // Guardar o actualizar la reseña del usuario
    const submitReview = async () => {
        if (comment.trim() === '' || rating === 0) return;

        const reviewRef = doc(db, 'books', book.id, 'reviews', auth.currentUser.uid);
        try {
            // Guardar la reseña en Firestore
            await setDoc(reviewRef, {
                userId: auth.currentUser.uid,
                rating,
                comment: comment.trim(),
                timestamp: serverTimestamp(),
            });

            setModalVisible(false);
            setUserReview({ userId: auth.currentUser.uid, rating, comment });
        } catch (error) {
            console.error('Error al guardar reseña:', error);
            alert('Error al guardar la reseña');
        }
    };

    return (
        <>
            {/* Listado donde se muestran los detalles del libro y las reseñas */}
            <FlatList
            style={{ backgroundColor: "white" }}
                data={reviews.slice(0, visibleReviews)}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={(
                    <View style={styles.headerContainer}>
                        <Image source={{ uri: book.imageLinks?.thumbnail }} style={styles.bookImage} />
                        <Text style={styles.title}>{book.title}</Text>
                        <Text style={styles.authors}>Autor(es): {book.authors?.join(', ')}</Text>
                        <Text style={styles.publisher}>Editorial: {book.publisher}</Text>
                        <Text style={styles.description}>{book.description || 'Sin descripción disponible'}</Text>

                        <View style={styles.ratingSection}>
                            <Text style={styles.averageRating}>
                                {book.averageRating || 0}/5
                            </Text>
                            <View style={styles.ratingInfo}>
                                <Rating
                                    type='custom'
                                    ratingColor={c_secondary}
                                    ratingBackgroundColor={c_void}
                                    tintColor='#fff'
                                    imageSize={20}
                                    readonly
                                    startingValue={book.averageRating || 0} 
                                />
                                <Text style={styles.ratingCount}>{book.ratingsCount || 0} opiniones</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Calificaciones y Opiniones</Text>

                            {/* Botón para agregar o editar opinión */}
                            <TouchableOpacity style={styles.addReviewButton} onPress={openReviewModal}>
                                <Icon name="edit" type="material" color="#fff" size={20} />
                                <Text style={styles.addReviewText}>
                                    {userReview ? 'Editar mi opinión' : 'Añadir Opinión'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                // Renderizar cada reseña en la lista
                renderItem={({ item }) => (
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewUser}>{item.userName}</Text>
                        <View style={{flexDirection: "row", alignItems: "center", paddingTop: 5}}>
                            <Rating
                                type='custom'
                                ratingColor="gray"
                                ratingBackgroundColor={c_void}
                                tintColor='#fff'
                                imageSize={15} 
                                readonly 
                                startingValue={item.rating}
                                style={{ alignSelf: 'flex-start', paddingVertical: 4, paddingEnd: 10 }}
                            />
                            <Text style={{fontSize: 12, color: "gray"}}> {item.timestamp?.toDate().toLocaleDateString("es-ES")} </Text>
                        </View>
                        <Text style={styles.reviewText}>{item.comment}</Text>
                    </View>
                )}
                // Botón para cargar más reseñas
                ListFooterComponent={() => (
                    visibleReviews < reviews.length && (
                        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreReviews}>
                            <Text style={styles.loadMoreText}>Cargar más opiniones</Text>
                        </TouchableOpacity>
                    )
                )}
            />

            {/* Modal para añadir/editar reseña */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {userReview ? 'Editar Calificación' : 'Añadir Calificación'}
                        </Text>
                        <Rating 
                            type='custom'
                            imageSize={30} 
                            startingValue={rating} 
                            onFinishRating={setRating} 

                            ratingColor={c_secondary}
                            ratingBackgroundColor={c_void}
                            tintColor='#fff'
                            style={{ paddingVertical: 2, paddingEnd: 10 }}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe tu opinión..."
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
                            <Text style={styles.submitButtonText}>Guardar Opinión</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// Estilos de BookDetailScreen
const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
     },
    bookImage: {
        width: 120,
        height: 180,
        alignSelf: "center",
        borderRadius: 10,
        marginBottom: 15,
    },
    title: { fontSize: 20,
        fontWeight: "bold",
        textAlign: "center"
    },
    authors: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginBottom: 5,
    },
    publisher: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        marginBottom: 15,
    },

    ratingSection: {
        marginTop: 10
    },
    sectionTitle: { 
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },
    ratingInfo: { 
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15
    },
    ratingCount: { 
        marginLeft: 10,
        fontSize: 14,
        color: "gray"
    },

    addReviewButton: {
        flexDirection: "row",
        backgroundColor: c_primary,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    addReviewText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 5,
    },

    reviewItem: {
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: c_void,
    },
    reviewUser: { fontWeight: "bold",
        fontSize: 14 
    },
    reviewText: { 
        fontSize: 14,
        color: "#555",
    },

    loadMoreButton: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 20,
        alignItems: "center",
        marginBottom: 10,
    },
    loadMoreText: { color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: { fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10 },
    input: {
        width: "100%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        textAlignVertical: "top",
        height: 80,
    },
    submitButton: {
        backgroundColor: c_primary,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "100%",
        alignItems: "center",
    },
    submitButtonText: { color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    closeButton: { marginTop: 10 },
    closeButtonText: {
        color: c_primary,
        fontSize: 16,
        fontWeight: "bold"
    },
    averageRating: { 
        fontSize: 30,
        color: c_secondary,
    },
});