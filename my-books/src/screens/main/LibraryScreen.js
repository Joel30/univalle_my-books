import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ListItem, SearchBar } from '@rneui/themed';
import { Rating } from 'react-native-ratings';
import { Icon } from '@rneui/base';
import { debounce } from 'lodash';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getBooks, searchBooks } from '../../api/books';
import { auth, db } from '../../config/firebase';
import {c_background, c_primary, c_secondary, c_void} from '../styles/colors';

// Pantalla de la librería
export default function LibraryScreen({ navigation }) {
    // Estados para almacenar los libros, los libros del usuario, el estado de carga y la búsqueda
    const [books, setBooks] = useState([]);
    const [userBooks, setUserBooks] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    let unsubscribe = () => {};

    // Cargar los libros y escuchar cambios en los libros del usuario
    useEffect(() => {
        loadBooks();
        unsubscribe = listenToUserBooks();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Función para cargar los libros
    const loadBooks = async () => {
        const dataBooks = await getBooks();
        setBooks(dataBooks.books || []);
        setLoading(false);
    };

    // Función para escuchar los cambios en los libros del usuario
    const listenToUserBooks = () => {
        const userBooksRef = collection(db, 'books_user', auth.currentUser.uid, 'mybooks');
        
        // Escuchar cambios en tiempo real en la colección mybooks
        return onSnapshot(userBooksRef, (snapshot) => {
            const myBooks = new Set(snapshot.docs.map(doc => doc.id));
            setUserBooks(myBooks);
        });
    };

    // Función para agregar o quitar un libro de los libros del usuario
    const toggleUserBooks = async (book) => {
        const bookRef = doc(db, 'books_user', auth.currentUser.uid, 'mybooks', book.id);
        
        if (userBooks.has(book.id)) {
            // Si el libro ya está en la lista, se elimina de Mis Libros de Firestore
            await deleteDoc(bookRef);
            Alert.alert('Removido', 'Libro removido de Mis Libros');
        } else {
            // Si el libro no está en la lista, se agrega a Mis Libros en Firestore
            await setDoc(bookRef, {
                title: book.title || '',
                author: book.author || '',
                image: book.imageLinks?.thumbnail || '',
                addedAt: serverTimestamp(),
            });
            Alert.alert('Añadido', 'Libro agregado a Mis Libros');
        }
    };

    // Función para buscar libros con un retraso de 500ms
    const debouncedSearch = useCallback(
        debounce(async (text) => {
            try {
                if (text) {
                    const dataBooks = await searchBooks(text, 2);
                    setBooks(Array.isArray(dataBooks.books) ? dataBooks.books : []);
                } else {
                    await loadBooks();
                }
                setLoading(false);
            } catch (error) {
                Alert.alert('Error', 'Error en la búsqueda de libros');
                setLoading(false);
            }
        }, 500),
        []
    );

    // Función para realizar la búsqueda de libros
    const updateSearch = async (text) => {
        setLoading(true);
        setSearch(text);
        debouncedSearch(text);
    };

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <SearchBar
                placeholder="Buscar libros..."
                onChangeText={updateSearch}
                value={search}
                round
                searchIcon={{ size: 24, color: c_primary }}
                containerStyle={{ backgroundColor: 'transparent', borderBottomWidth: 0, borderTopWidth: 0 }}
                inputContainerStyle={{ backgroundColor: '#fff', elevation: 1 }}
            />
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
                                    <TouchableOpacity onPress={() => toggleUserBooks(item)}>
                                        {userBooks.has(item.id) ? (
                                            <Text style={styles.buttonRemove}>Quitar de mis libros</Text>

                                        ) : (
                                            <Text style={styles.buttonAdd}>Agregar a mis libros</Text>
                                        )}
                                    </TouchableOpacity>
                                </ListItem.Content>
                            </ListItem>
                        )}
                    />
                ) : (
                    <Text style= {{ textAlign: 'center', marginTop: 40, fontSize: 16,  paddingHorizontal: 40, color: 'gray', fontStyle: 'italic' }}>
                        No se encontraron libros para la búsqueda: {search}
                    </Text>
                )
            )}
        </View>
    );
}

// Estilos personalizados para LibraryScreen
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
        elevation: 3, // Adds shadow effect
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