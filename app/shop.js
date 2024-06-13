import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import shopItems from './src/data/shopItems.json';

const Shop = () => {
    const shopMusic = useRef(new Audio.Sound());
    const buttonSelectSound = useRef(new Audio.Sound());
    const [categorizedItems, setCategorizedItems] = useState({});
    const [gold, setGold] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [boughtItems, setBoughtItems] = useState([]);
    const [dialogueText, setDialogueText] = useState('');

    const dialogues = [
        "Ah, welcome, traveler!",
        "Looking for something special?",
        "Take a look at my wares!",
        "Another fine day for trading, isn't it?",
        "What can I get for you today?",
        "What are ya buyin'?",
        "Sorry Traveller, I don't give credit..",
        "Welcome to Gnobble's Wares! No refunds.",
    ];

    useFocusEffect(
        React.useCallback(() => {
            const playMusic = async () => {
                try {
                    await shopMusic.current.loadAsync(require("../assets/music/shop.mp3"));
                    await shopMusic.current.playAsync();
                    await shopMusic.current.setIsLoopingAsync(true);
                } catch (error) {
                    // console.error("Failed to load the shop music", error);
                }
            };

            const stopMusic = async () => {
                try {
                    await shopMusic.current.stopAsync();
                    await shopMusic.current.unloadAsync();
                } catch (error) {
                   // console.error("Failed to stop the shop music", error);
                }
            };

            playMusic();

            return () => {
                stopMusic();
            };
        }, [])
    );

    useEffect(() => {
        const loadButtonSelectSound = async () => {
            try {
                await buttonSelectSound.current.loadAsync(require("../assets/sfx/buttonSelect.wav"));
            } catch (error) {
                console.error("Failed to load the button select sound", error);
            }
        };
        loadButtonSelectSound();

        const loadGoldFromStorage = async () => {
            try {
                const storedGold = await AsyncStorage.getItem('gold');
                const goldValue = storedGold !== null ? parseInt(storedGold) : 0;
                setGold(goldValue);
            } catch (error) {
                console.error('Failed to load gold from storage:', error);
            }
        };
        loadGoldFromStorage();

        const loadBoughtItemsFromStorage = async () => {
            try {
                const storedBoughtItems = await AsyncStorage.getItem('boughtItems');
                const boughtItemsArray = storedBoughtItems ? JSON.parse(storedBoughtItems) : [];
                setBoughtItems(boughtItemsArray);
            } catch (error) {
                console.error('Failed to load bought items from storage:', error);
            }
        };
        loadBoughtItemsFromStorage();

        const categories = shopItems.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
        setCategorizedItems(categories);
        
        setDialogueText(getRandomDialogue());
    }, []);

    const renderCategory = (category, items) => (
        <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleItemClick(item)}
                        disabled={boughtItems.some(boughtItem => boughtItem.name === item.name)}
                        style={boughtItems.some(boughtItem => boughtItem.name === item.name) ? styles.disabledItem : null}
                    >
                        <View style={styles.itemContainer}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                                {category !== "Exercise" && (
                                    <Text style={styles.itemStackable}>Stackable: {item.stackable ? 'Yes' : 'No'}</Text>
                                )}
                                <View style={styles.priceContainer}>
                                    <Text style={styles.itemPrice}>Price: {item.price} Gold</Text>
                                </View>
                            </View>
                        </View>
                        {boughtItems.some(boughtItem => boughtItem.name === item.name) && (
                            <View style={styles.soldOutOverlay}>
                                <Text style={styles.soldOutText}>Sold Out</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.name}
            />
        </View>
    );

    const handleItemClick = async (item) => {
        setSelectedItem(item);
        setModalVisible(true);
        await buttonSelectSound.current.replayAsync();
    };

    const purchaseItem = async () => {
        await buttonSelectSound.current.replayAsync();
        if (selectedItem && gold >= selectedItem.price) {
            const updatedGold = gold - selectedItem.price;
            setGold(updatedGold);
            await AsyncStorage.setItem('gold', updatedGold.toString());

            const updatedBoughtItems = [...boughtItems, selectedItem];
            setBoughtItems(updatedBoughtItems);
            await AsyncStorage.setItem('boughtItems', JSON.stringify(updatedBoughtItems));

            setModalVisible(false);
        }
    };

    const getRandomDialogue = () => {
        const randomIndex = Math.floor(Math.random() * dialogues.length);
        return dialogues[randomIndex];
    };

    return (
        <View style={styles.container}>
            <View style={styles.shopkeeperContainer}>
                <View style={styles.shopkeeperInfo}>
                    <Image
                        source={require('../assets/images/npc/shopkeeper_portrait.png')}
                        style={styles.shopkeeperImage}
                    />
                    <View style={styles.dialogueBox}>
                        <Text style={styles.dialogueText}>{dialogueText}</Text>
                    </View>
                </View>
                <View style={styles.goldContainer}>
                    <Text style={styles.goldText}>Gold: {gold}</Text>
                </View>
            </View>
            <FlatList
                data={Object.entries(categorizedItems)}
                renderItem={({ item }) => renderCategory(item[0], item[1])}
                keyExtractor={(item) => item[0]}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalBackground}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        {selectedItem && (
                            <>
                                <Image source={{ uri: selectedItem.image }} style={styles.modalItemImage} />
                                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                                <Text style={styles.modalItemDescription}>{selectedItem.description}</Text>
                                <Text style={styles.modalItemPrice}>Price: {selectedItem.price} Gold</Text>
                                <TouchableOpacity onPress={purchaseItem}>
                                    <Text style={styles.purchaseButton}>Purchase</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    shopkeeperContainer: {
        flexDirection: 'column',
        padding: 16,
        backgroundColor: 'black',
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        paddingTop: 40,
    },
    shopkeeperInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopkeeperImage: {
        width: 80,
        height: 80,
        marginRight: 16,
        borderRadius: 40,
    },
    dialogueBox: {
        flex: 1,
        padding: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
    },
    dialogueText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    categoryContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'white',
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemImage: {
        width: 64,
        height: 64,
        marginRight: 16,
        borderRadius: 8,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    itemDescription: {
        fontSize: 14,
        color: 'white',
    },
    itemPrice: {
        fontSize: 14,
        color: 'black',
    },
    priceContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
    },
    itemStackable: {
        paddingBottom: 5,
        fontSize: 14,
        color: 'white',
    },
    goldContainer: {
        backgroundColor: 'orange',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
    },
    goldText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalItemImage: {
        width: 120,
        height: 120,
        marginBottom: 10,
        borderRadius: 8,
    },
    modalItemName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    modalItemDescription: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    purchaseButton: {
        backgroundColor: 'green',
        color: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        color: 'blue',
        fontSize: 16,
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,0,0,1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    soldOutText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 32,
    },
    disabledItem: {
        opacity: 0.5,
    },
});

export default Shop;
