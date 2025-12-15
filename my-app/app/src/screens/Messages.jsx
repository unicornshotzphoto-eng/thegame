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
    Platform 
} from "react-native";
import { ChatWebSocket } from '../core/websocket';
import useStore from '../core/global';

function Messages() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
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
                id: Date.now().toString(),
                username: data.username,
                message: data.message,
                timestamp: new Date().toLocaleTimeString(),
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

    const sendMessage = () => {
        if (inputMessage.trim() && wsRef.current && wsRef.current.isConnected()) {
            wsRef.current.sendMessage(inputMessage, username);
            setInputMessage('');
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
            <Text style={styles.messageText}>{item.message}</Text>
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
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputMessage}
                        onChangeText={setInputMessage}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputMessage.trim() || !isConnected) && styles.sendButtonDisabled
                        ]}
                        onPress={sendMessage}
                        disabled={!inputMessage.trim() || !isConnected}
                    >
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    connectedDot: {
        backgroundColor: '#4CAF50',
    },
    disconnectedDot: {
        backgroundColor: '#F44336',
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
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
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    timestamp: {
        color: '#aaa',
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#000',
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
});

export default Messages;