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
import api from '../core/api';
import { showAlert } from '../utils/alert';
import useStore from '../core/global';
import TypingIndicator from '../components/TypingIndicator';

function GroupChat({ route, navigation }) {
    const { groupId, groupName } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef(null);
    const user = useStore((state) => state.user);
    const pollInterval = useRef(null);
    const typingTimeoutRef = useRef(null);
    const typingPollInterval = useRef(null);

    const startGame = async () => {
        try {
            const response = await api.post('/quiz/game/create/', {
                session_type: 'group',
                group_id: groupId
            });
            
            navigation.navigate('GamePlay', { sessionId: response.data.id });
        } catch (error) {
            console.error('Start game error:', error);
            showAlert('Error', 'Failed to start game');
        }
    };

    useEffect(() => {
        navigation.setOptions({ 
            title: groupName,
            headerRight: () => (
                <TouchableOpacity onPress={startGame} style={{ marginRight: 10 }}>
                    <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>🎮 Play</Text>
                </TouchableOpacity>
            )
        });
        loadMessages();
        
        // Poll for new messages every 3 seconds
        pollInterval.current = setInterval(() => {
            loadMessages(true);
        }, 3000);

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [groupId]);

    const loadMessages = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get(`/quiz/groups/${groupId}/messages/`);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Load messages error:', error);
            if (!silent) showAlert('Error', 'Failed to load messages');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleTyping = (text) => {
        setInputMessage(text);
        
        // Note: Typing indicator for group chats requires WebSocket implementation
        // Currently using REST API polling, so typing events are not sent to backend
        // This tracks local typing state for UI feedback only
        
        if (!isTyping && text.length > 0) {
            setIsTyping(true);
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

    const sendMessage = async () => {
        if (!inputMessage.trim() && !selectedImage) return;

        // Clear typing state when sending
        setIsTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        const messageContent = inputMessage.trim();
        const imageData = selectedImage;

        setInputMessage('');
        setSelectedImage(null);
        setSending(true);

        try {
            if (imageData) {
                setIsUploading(true);
            }

            await api.post(`/quiz/groups/${groupId}/messages/`, {
                content: messageContent,
                image: imageData
            });

            await loadMessages(true);
            
            // Scroll to bottom after sending
            setTimeout(() => {
                flatListRef.current?.scrollToEnd();
            }, 100);
        } catch (error) {
            console.error('Send message error:', error);
            showAlert('Error', 'Failed to send message');
        } finally {
            setSending(false);
            setIsUploading(false);
        }
    };

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
                const base64Image = `data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`;
                setSelectedImage(base64Image);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    const renderMessage = ({ item }) => {
        const isOwn = item.sender.id === user?.id;
        
        return (
            <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
                {!isOwn && <Text style={styles.username}>{item.sender.username}</Text>}
                {item.content ? <Text style={styles.messageText}>{item.content}</Text> : null}
                {item.image && (
                    <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />
                )}
                <Text style={styles.timestamp}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    ListFooterComponent={
                        typingUsers.length > 0 ? (
                            <View style={styles.typingContainer}>
                                <TypingIndicator visible={true} />
                                <Text style={styles.typingText}>
                                    {typingUsers.length === 1 
                                        ? `${typingUsers[0]} is typing...`
                                        : `${typingUsers.length} people are typing...`
                                    }
                                </Text>
                            </View>
                        ) : null
                    }
                />

                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    username: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginVertical: 4,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typingText: {
        color: '#888',
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default GroupChat;
