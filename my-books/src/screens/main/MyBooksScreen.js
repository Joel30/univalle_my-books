import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ListItem } from '@rneui/themed';
import { Rating } from 'react-native-ratings';
import { Icon } from '@rneui/base';
import { getBookById } from '../../api/books';
import { auth, db } from '../../config/firebase';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { c_background, c_primary, c_secondary, c_void } from '../styles/colors';

// Pantalla de Mis Libros
export default function MyBooksScreen({ navigation }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar los libros del usuario al iniciar la pantalla
    useEffect(() => {
        // Crear un listener para la colección de "mybooks" en Firestore
        const bookQuery = query(
            collection(db, 'books_user', auth.currentUser.uid, 'mybooks'),
            orderBy('addedAt', 'desc')
        );
        const unsubscribe = onSnapshot(bookQuery, async (snapshot) => {
            setLoading(true);
            const myBooks = snapshot.docs.map(doc => doc.id);
            
            if (myBooks.length === 0) {
                setBooks([]);
                setLoading(false);
                return;
            }

            // Obtener los datos de los libros
            const bookRequests = myBooks.map(async (bookId) => {
                try {
                    const book = await getBookById(bookId);
                    return book.book;
                } catch (error) {
                    console.error('Error al obtener el libro:', error);
                    return null;
                }
            });

            const booksData = await Promise.all(bookRequests);
            setBooks(booksData.filter(book => book !== null));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Función para remover un libro de la lista de Mis Libros
    const removeFromMyBooks = async (bookId) => {
        try {
            // Eliminar el libro de la colección de "mybooks" en Firestore
            const myBooksRef = doc(db, 'books_user', auth.currentUser.uid, 'mybooks', bookId);
            await deleteDoc(myBooksRef);
            Alert.alert('Removido', 'Libro removido de Mis Libros');
        } catch (error) {
            console.error('Error al eliminar de la mybooks:', error);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={c_primary} />
            ) : ( books.length !== 0 ? (
                    // Mostrar la lista de libros
                    <FlatList
                        data={books}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ListItem 
                                bottomDivider 
                                onPress={() => navigation.navigate('BookDetail', { book: item })}
                                containerStyle={styles.listItemContainer}
                            >
                                <Image 
                                    source={{ uri: item.imageLinks?.thumbnail }} 
                                    style={styles.bookImage} 
                                />
                                <ListItem.Content>
                                    <ListItem.Title style={styles.bookTitle}>{item.title}</ListItem.Title>
                                    <ListItem.Subtitle style={styles.bookAuthors}>
                                        {item.authors?.join(', ')}
                                    </ListItem.Subtitle>
                                    <Text style={styles.bookPublisher}>Editorial: {item.publisher}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
                                        <Rating 
                                            type='custom'
                                            imageSize={15} 
                                            readonly 
                                            ratingColor={c_secondary}
                                            ratingBackgroundColor={c_void}
                                            tintColor='#fff'
                                            startingValue={item.averageRating || 0} 
                                            style={{ alignSelf: 'flex-start', paddingTop: 2, paddingEnd: 10 }}
                                        />
                                        <Text style={{fontSize: 12, color: 'gray', paddingEnd: 2}}>
                                            { item.ratingsCount || 0}
                                        </Text>
                                        <Icon size={14} name="people" type="material" color="#cfcfd7" style={{marginTop:0}}/>
                                    </View>
                                    <TouchableOpacity style={styles.buttonShow} onPress={() => removeFromMyBooks(item.id)}>
                                            <Text style={styles.buttonRemove}>Quitar de mis libros</Text>
                                    </TouchableOpacity>
                                </ListItem.Content>
                            </ListItem>
                        )}
                    />
                ) : (
                    <Text style= {{ textAlign: 'center', marginTop: 40, fontSize: 16,  paddingHorizontal: 40, color: 'gray', fontStyle: 'italic' }}>
                        No se encontraron libros en tu lista de Libros
                    </Text>
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c_background,
    },
    listItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 10,
        marginVertical: 5,
        elevation: 3,
    },
    bookImage: {
        width: 60,
        height: 90,
        borderRadius: 5,
        marginRight: 10,
    },
    bookTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    bookAuthors: {
        fontStyle: 'italic',
        color: '#555',
    },
    bookPublisher: {
        color: '#777',
        fontSize: 12,
    },
    buttonAdd: {
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 2,
        color: c_primary,
        borderColor: c_primary,
        borderRadius: 5,
        borderWidth: 1,
    },
    buttonRemove: {
        marginTop: 10,
        backgroundColor: c_primary,
        paddingHorizontal: 10,
        paddingVertical: 3,
        color: '#fff',
        borderRadius: 5,
    },
});