import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChatWebSocket } from '../core/websocket';
import useStore from '../core/global';
import TypingIndicator from '../components/TypingIndicator';

function DirectChat({ route, navigation }) {
    const { friendId, friendName, friendThumbnail } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const wsRef = useRef(null);
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const user = useStore((state) => state.user);
    const username = user?.username || 'Anonymous';
    
    // Create a unique room name for this conversation
    const roomName = `dm_${Math.min(user?.id, friendId)}_${Math.max(user?.id, friendId)}`;

    useEffect(() => {
        navigation.setOptions({ title: friendName });
        
        // Initialize WebSocket connection
        wsRef.current = new ChatWebSocket(roomName);
        
        wsRef.current.connect({
            onOpen: () => {
                console.log('Direct chat connected');
                setIsConnected(true);
            },
            onClose: () => {
                console.log('Direct chat disconnected');
                setIsConnected(false);
            },
            onError: (error) => {
                console.error('Direct chat error:', error);
            },
        });

        // Listen for chat messages
        wsRef.current.on('chat_message', (data) => {
            const newMessage = {
                id: Date.now().toString() + Math.random(),
                username: data.username,
                message: data.message,
                image: data.image,
                timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: data.username === username,
            };
            setMessages(prev => [...prev, newMessage]);
            
            // Scroll to bottom after new message
            setTimeout(() => {
                flatListRef.current?.scrollToEnd();
            }, 100);
        });

        // Listen for typing events
        wsRef.current.on('user_typing', (data) => {
            if (data.username !== username) {
                setOtherUserTyping(true);
                // Clear any existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                // Hide typing indicator after 3 seconds
                typingTimeoutRef.current = setTimeout(() => {
                    setOtherUserTyping(false);
                }, 3000);
            }
        });

        wsRef.current.on('connection_established', (data) => {
            console.log('Connection established:', data.message);
        });

        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [roomName, username, friendName]);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need permission to access your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const base64Image = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
                setSelectedImage(base64Image);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
    };

    const handleTyping = (text) => {
        setInputMessage(text);
        
        // Send typing event when user starts typing
        if (!isTyping && text.length > 0 && wsRef.current) {
            setIsTyping(true);
            wsRef.current.send({
                type: 'user_typing',
                username: username
            });
        }
        
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to stop typing after 2 seconds of inactivity
        if (text.length > 0) {
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 2000);
        } else {
            setIsTyping(false);
        }
    };

    const sendMessage = () => {
        if (!wsRef.current || !wsRef.current.isConnected()) {
            Alert.alert('Not Connected', 'Please wait for connection to establish');
            return;
        }

        if (!inputMessage.trim() && !selectedImage) {
            return;
        }

        try {
            // Clear typing state when sending
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            if (selectedImage) {
                setIsUploading(true);
                wsRef.current.sendMessage(inputMessage.trim(), username, selectedImage);
                setSelectedImage(null);
                setInputMessage('');
                setIsUploading(false);
            } else if (inputMessage.trim()) {
                wsRef.current.sendMessage(inputMessage.trim(), username);
                setInputMessage('');
            }
        } catch (error) {
            console.error('Send message error:', error);
            Alert.alert('Error', 'Failed to send message');
            setIsUploading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.isOwn ? styles.ownMessage : styles.otherMessage
        ]}>
            {item.image && (
                <Image 
                    source={{ uri: item.image }} 
                    style={styles.messageImage}
                    resizeMode="cover"
                />
            )}
            {item.message ? (
                <Text style={styles.messageText}>{item.message}</Text>
            ) : null}
            <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.statusBar}>
                    <View style={[
                        styles.statusDot,
                        isConnected ? styles.connectedDot : styles.disconnectedDot
                    ]} />
                    <Text style={styles.statusText}>
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    ListFooterComponent={
                        otherUserTyping ? (
                            <View style={styles.typingContainer}>
                                <TypingIndicator visible={otherUserTyping} />
                            </View>
                        ) : null
                    }
                />

                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={removeSelectedImage}>
                            <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                        <Text style={styles.imageButtonText}>📷</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={inputMessage}
                        onChangeText={handleTyping}
                        placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
                        placeholderTextColor="#888"
                        multiline
                        maxLength={1000}
                    />
                    {isUploading ? (
                        <ActivityIndicator size="small" color="#1a73e8" style={{ marginLeft: 8 }} />
                    ) : (
                        <TouchableOpacity
                            style={[styles.sendButton, (!inputMessage.trim() && !selectedImage) && styles.sendButtonDisabled]}
                            onPress={sendMessage}
                            disabled={!inputMessage.trim() && !selectedImage}
                        >
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    connectedDot: {
        backgroundColor: '#28a745',
    },
    disconnectedDot: {
        backgroundColor: '#dc3545',
    },
    statusText: {
        color: '#888',
        fontSize: 12,
    },
    messagesContainer: {
        padding: 16,
    },
    messageContainer: {
        maxWidth: '80%',
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
    },
    ownMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#1a73e8',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#333',
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 4,
    },
    timestamp: {
        color: '#aaa',
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    imagePreviewContainer: {
        position: 'relative',
        padding: 12,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#000',
        alignItems: 'center',
    },
    imageButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        justifyContent: 'center',
    },
    imageButtonText: {
        fontSize: 24,
    },
    input: {
        flex: 1,
        backgroundColor: '#111',
        color: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#1a73e8',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#555',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    typingContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-start',
    },
});

export default DirectChat;
