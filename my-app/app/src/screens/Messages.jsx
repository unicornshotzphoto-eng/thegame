import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    ActivityIndicator
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { ChatWebSocket } from '../core/websocket';
import useStore from '../core/global';
import { THEME } from '../constants/appTheme';

function Messages() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const wsRef = useRef(null);
    const user = useStore((state) => state.user);
    const username = user?.username || 'Anonymous';
    
    // Room name - could be dynamic based on conversation
    const roomName = 'general';

    useEffect(() => {
        // Initialize WebSocket connection
        wsRef.current = new ChatWebSocket(roomName);
        
        wsRef.current.connect({
            onOpen: () => {
                console.log('Chat connected');
                setIsConnected(true);
            },
            onClose: () => {
                console.log('Chat disconnected');
                setIsConnected(false);
            },
            onError: (error) => {
                console.error('Chat error:', error);
            },
        });

        // Listen for chat messages
        wsRef.current.on('chat_message', (data) => {
            const newMessage = {
                id: Date.now().toString() + Math.random(),
                username: data.username,
                message: data.message,
                image: data.image,
                timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
                isOwn: data.username === username,
            };
            setMessages(prev => [...prev, newMessage]);
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
    }, [roomName, username]);

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
                aspect: [4, 3],
                quality: 0.6,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
    };

    const sendMessage = () => {
        if (wsRef.current && wsRef.current.isConnected()) {
            if (selectedImage) {
                setIsUploading(true);
                const imageBase64 = `data:image/jpeg;base64,${selectedImage.base64}`;
                wsRef.current.sendMessage(inputMessage.trim() || '', username, imageBase64);
                setSelectedImage(null);
                setInputMessage('');
                setIsUploading(false);
            } else if (inputMessage.trim()) {
                wsRef.current.sendMessage(inputMessage, username);
                setInputMessage('');
            }
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.isOwn ? styles.ownMessage : styles.otherMessage
        ]}>
            {!item.isOwn && (
                <Text style={styles.username}>{item.username}</Text>
            )}
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
            <View style={styles.header}>
                <Text style={styles.headerText}>Chat Room: {roomName}</Text>
                <View style={[
                    styles.statusDot,
                    isConnected ? styles.connectedDot : styles.disconnectedDot
                ]} />
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image 
                            source={{ uri: selectedImage.uri }} 
                            style={styles.imagePreview}
                            resizeMode="cover"
                        />
                        <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={removeSelectedImage}
                        >
                            <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={pickImage}
                        disabled={!isConnected || isUploading}
                    >
                        <Text style={styles.imageButtonText}>📷</Text>
                    </TouchableOpacity>
                    
                    <TextInput
                        style={styles.input}
                        value={inputMessage}
                        onChangeText={setInputMessage}
                        placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
                        placeholderTextColor={THEME.text.secondary}
                        multiline
                        maxLength={500}
                    />
                    
                    {isUploading ? (
                        <ActivityIndicator size="small" color={THEME.primary} style={styles.sendButton} />
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                ((!inputMessage.trim() && !selectedImage) || !isConnected) && styles.sendButtonDisabled
                            ]}
                            onPress={sendMessage}
                            disabled={(!inputMessage.trim() && !selectedImage) || !isConnected}
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
        backgroundColor: THEME.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: THEME.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderLight,
    },
    headerText: {
        color: THEME.text.primary,
        fontSize: 18,
        fontWeight: '600',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    connectedDot: {
        backgroundColor: THEME.primary,
    },
    disconnectedDot: {
        backgroundColor: THEME.button.danger,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: THEME.spacing.lg,
        backgroundColor: THEME.background,
    },
    messageContainer: {
        maxWidth: '80%',
        marginBottom: THEME.spacing.md,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
    },
    ownMessage: {
        alignSelf: 'flex-end',
        backgroundColor: THEME.primary,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: THEME.surfaceDark,
    },
    username: {
        color: THEME.text.secondary,
        fontSize: 12,
        marginBottom: THEME.spacing.sm,
    },
    messageText: {
        color: THEME.text.primary,
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: THEME.borderRadius.md,
        marginVertical: THEME.spacing.md,
    },
    timestamp: {
        color: THEME.text.secondary,
        fontSize: 10,
        marginTop: THEME.spacing.sm,
        alignSelf: 'flex-end',
    },
    imagePreviewContainer: {
        position: 'relative',
        padding: THEME.spacing.md,
        backgroundColor: THEME.surfaceDark,
        borderTopWidth: 1,
        borderTopColor: THEME.borderLight,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: THEME.borderRadius.md,
    },
    removeImageButton: {
        position: 'absolute',
        top: THEME.spacing.md,
        right: THEME.spacing.md,
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
        padding: THEME.spacing.md,
        borderTopWidth: 1,
        borderTopColor: THEME.borderLight,
        backgroundColor: THEME.background,
    },
    imageButton: {
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        marginRight: THEME.spacing.md,
        justifyContent: 'center',
    },
    imageButtonText: {
        fontSize: 24,
    },
    input: {
        flex: 1,
        backgroundColor: THEME.surfaceDark,
        color: THEME.text.primary,
        borderRadius: 20,
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.md,
        marginRight: THEME.spacing.md,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: THEME.primary,
        borderRadius: 20,
        paddingHorizontal: THEME.spacing.xl,
        paddingVertical: THEME.spacing.md,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: THEME.text.muted,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default Messages;